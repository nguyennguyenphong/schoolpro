"""
Authentication & Authorization Business Logic Service.
Handles credential verification, role-based authentication, and JWT token issuance.
"""

import uuid
from datetime import timedelta
from typing import Any

from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.models.profile import Staff, Student, Teacher
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from common.services.base import BaseService


class AuthService(BaseService):
    """
    Enterprise Authentication Service for SchoolPro identity platform.
    """

    def authenticate(
        self,
        code: str,
        password: str,
        role_identifier: str | None = None,
        remember: bool = True,
    ) -> dict[str, Any]:
        """
        Authenticate user credentials and issue JWT tokens with embedded active role context.
        """
        clean_code = (code or "").strip()
        if not clean_code:
            raise ValidationError({"code": "Mã định danh hoặc tài khoản không được để trống."})

        # 1. Lookup User entity
        user = self._find_user_by_identifier(clean_code)
        if not user:
            raise AuthenticationFailed("Tài khoản hoặc mã định danh không tồn tại trong hệ thống.")

        # 2. Verify account status and lock status
        if user.is_locked:
            if user.locked_until and user.locked_until > timezone.now():
                time_str = user.locked_until.strftime("%H:%M %d/%m/%Y")
                raise AuthenticationFailed(
                    f"Tài khoản của bạn tạm thời bị khóa đến {time_str} do nhập sai mật khẩu quá 5 lần.",
                    code="user_locked",
                )
            raise AuthenticationFailed(
                "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ ban quản trị.",
                code="user_locked",
            )

        if user.status_code and user.status_code.upper() in ["INACTIVE", "SUSPENDED"]:
            raise AuthenticationFailed(
                "Tài khoản của bạn đã ngừng hoạt động. Vui lòng liên hệ ban quản trị.",
                code="user_inactive",
            )

        # 3. Verify Password with brute-force protection
        if not self._verify_password(password, user.password_hash):
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= 5:
                user.locked_at = timezone.now()
                user.locked_until = timezone.now() + timedelta(minutes=15)
                user.lock_reason = "EXCEEDED_LOGIN_ATTEMPTS"
                try:
                    user.save(
                        update_fields=[
                            "failed_login_attempts",
                            "locked_at",
                            "locked_until",
                            "lock_reason",
                        ]
                    )
                except Exception:
                    pass
                raise AuthenticationFailed(
                    "Bạn đã nhập sai mật khẩu 5 lần. Tài khoản tạm thời bị khóa trong 15 phút.",
                    code="user_locked",
                )
            else:
                remaining = 5 - user.failed_login_attempts
                try:
                    user.save(update_fields=["failed_login_attempts"])
                except Exception:
                    pass
                raise AuthenticationFailed(
                    f"Mật khẩu không chính xác. Bạn còn {remaining} lần thử trước khi tài khoản bị khóa tạm thời.",
                    code="invalid_credentials",
                )

        # 4. Resolve User Roles
        user_roles_qs = UserRole.objects.filter(user=user).select_related("role")
        assigned_roles = [ur.role for ur in user_roles_qs if ur.role]

        selected_role = self._resolve_active_role(
            assigned_roles=assigned_roles,
            role_identifier=role_identifier,
            user=user,
        )

        # 5. Issue SimpleJWT Tokens
        refresh = RefreshToken()
        refresh["user_id"] = str(user.id)
        refresh["username"] = user.username
        refresh["full_name"] = user.full_name or ""
        refresh["email"] = user.email or ""

        if selected_role:
            refresh["role_id"] = str(selected_role.id)
            refresh["role_code"] = selected_role.code
            refresh["role_name"] = selected_role.name
        else:
            refresh["role_id"] = None
            refresh["role_code"] = "STUDENT"
            refresh["role_name"] = "Học sinh"

        # Update last_login_at and reset failed attempts
        try:
            update_fields = ["last_login_at"]
            user.last_login_at = timezone.now()
            if (user.failed_login_attempts or 0) > 0 or user.locked_at or user.locked_until:
                user.failed_login_attempts = 0
                user.locked_at = None
                user.locked_until = None
                user.lock_reason = None
                update_fields.extend(
                    ["failed_login_attempts", "locked_at", "locked_until", "lock_reason"]
                )
            user.save(update_fields=update_fields)
        except Exception:
            # Model may be unmanaged or table read-only in some configurations
            pass

        self.logger.info(
            "User '%s' authenticated successfully with role '%s'",
            user.username,
            selected_role.code if selected_role else "UNKNOWN",
        )

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "token_type": "Bearer",
            "expires_in": 7200,
            "user": user,
            "role": selected_role,
            "assigned_roles": assigned_roles,
        }

    def _find_user_by_identifier(self, identifier: str) -> User | None:
        """
        Locates user by username, email, phone, or related student/teacher/staff code.
        """
        # Primary lookup on core.User
        user = (
            User.objects.filter(username__iexact=identifier).first()
            or User.objects.filter(email__iexact=identifier).first()
            or User.objects.filter(phone=identifier).first()
        )
        if user:
            return user

        # Secondary lookup by student profile code
        student = (
            Student.objects.filter(student_code__iexact=identifier).select_related("user").first()
        )
        if student and student.user:
            return student.user

        # Tertiary lookup by teacher profile code
        teacher = (
            Teacher.objects.filter(teacher_code__iexact=identifier).select_related("user").first()
        )
        if teacher and teacher.user:
            return teacher.user

        # Staff profile code
        staff = Staff.objects.filter(staff_code__iexact=identifier).select_related("user").first()
        if staff and staff.user:
            return staff.user

        return None

    def _verify_password(self, raw_password: str, stored_hash: str) -> bool:
        """
        Validates password against hash using:
        1. PostgreSQL pgcrypto crypt() for $2a$ / $2b$ Blowfish hashes (SchoolPro seed DB)
        2. Django password hasher (PBKDF2/BCrypt)
        3. Plain-text comparison fallback for dev seeds
        """
        if not stored_hash or not raw_password:
            return False

        # 1. PostgreSQL pgcrypto Blowfish check ($2a$, $2b$, $2y$)
        if stored_hash.startswith(("$2a$", "$2b$", "$2y$")):
            try:
                from django.db import connection

                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT (crypt(%s, %s) = %s)",
                        [raw_password, stored_hash, stored_hash],
                    )
                    row = cursor.fetchone()
                    if row and row[0] is True:
                        return True
            except Exception as e:
                self.logger.warning("Database crypt password verification failed: %s", e)

        # 2. Standard Django hasher
        try:
            if check_password(raw_password, stored_hash):
                return True
        except Exception:
            pass

        # 3. Fallback for plain-text seed/test accounts
        return raw_password == stored_hash

    def _resolve_active_role(
        self,
        assigned_roles: list[Role],
        role_identifier: str | None,
        user: User,
    ) -> Role | None:
        """
        Determines the active role for the login session based on requested identifier.
        """
        if not role_identifier:
            # If no role explicitly requested, pick primary role or first role
            primary_ur = (
                UserRole.objects.filter(user=user, is_primary=True).select_related("role").first()
            )
            if primary_ur and primary_ur.role:
                return primary_ur.role
            if assigned_roles:
                return assigned_roles[0]
            return Role.objects.filter(is_active=True).first()

        clean_id = role_identifier.strip().lower()

        # Try matching by role UUID or exact role code
        for role in assigned_roles:
            if str(role.id).lower() == clean_id or role.code.lower() == clean_id:
                return role

        # Try matching by role slug semantics (e.g. 'student', 'teacher', 'admin')
        for role in assigned_roles:
            code_upper = (role.code or "").upper()
            if clean_id == "student" and "STU" in code_upper:
                return role
            if clean_id == "teacher" and "TCH" in code_upper:
                return role
            if clean_id == "staff" and "STF" in code_upper:
                return role
            if clean_id == "admin" and "ADMIN" in code_upper:
                return role
            if clean_id == "principal" and "PRIN" in code_upper:
                return role
            if clean_id == "parent" and "PAR" in code_upper:
                return role
            if clean_id == "supervisor" and "SUP" in code_upper:
                return role

        # If user has no roles assigned in database yet (e.g. fresh seed or admin user)
        # Attempt to find the requested role in system roles
        matched_system_role = (
            Role.objects.filter(id=role_identifier).first()
            if self._is_valid_uuid(role_identifier)
            else Role.objects.filter(code__iexact=role_identifier).first()
        )
        if not matched_system_role:
            if clean_id == "student":
                matched_system_role = Role.objects.filter(code__icontains="STU").first()
            elif clean_id == "teacher":
                matched_system_role = Role.objects.filter(code__icontains="TCH").first()
            elif clean_id == "admin":
                matched_system_role = Role.objects.filter(code__icontains="ADMIN").first()
            elif clean_id == "staff":
                matched_system_role = Role.objects.filter(code__icontains="STF").first()

        if matched_system_role:
            return matched_system_role

        # Fallback to first available role or None
        return assigned_roles[0] if assigned_roles else Role.objects.first()

    def _is_valid_uuid(self, val: str) -> bool:
        try:
            uuid.UUID(str(val))
            return True
        except (ValueError, TypeError, AttributeError):
            return False
