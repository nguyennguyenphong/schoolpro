"""
Authentication Classes for SchoolPro REST API.
Overrides SimpleJWT authentication to resolve against SchoolPro's core.User domain model.
"""

from typing import Any

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

from apps.core.models.user import User


class SchoolProJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication backend for SchoolPro.
    Validates SimpleJWT tokens and resolves against core.User instead of django.contrib.auth.User.
    """

    def get_user(self, validated_token: Any) -> User:
        """
        Attempts to find and return a user using the given validated token.
        """
        user_id = validated_token.get("user_id")
        if not user_id:
            raise InvalidToken("Token contained no recognizable user identification")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed(
                "User not found",
                code="user_not_found",
            ) from None

        # Check account activity and lock status
        if user.is_locked:
            raise AuthenticationFailed(
                "Tài khoản của bạn đang bị khóa. Vui lòng liên hệ ban quản trị.",
                code="user_locked",
            ) from None

        if user.status_code and user.status_code.upper() in ["INACTIVE", "SUSPENDED"]:
            raise AuthenticationFailed(
                "User account is inactive or suspended",
                code="user_inactive",
            ) from None

        # Injected session metadata
        user.is_authenticated = True
        user.active_role_code = validated_token.get("role_code")
        user.active_role_id = validated_token.get("role_id")

        return user


class SchoolProAdminBackend:
    """
    Django Authentication Backend enabling SchoolPro core.User credentials
    to authenticate directly into the Django Admin dashboard (/admin).
    """

    def authenticate(
        self,
        request: Any = None,
        username: str | None = None,
        password: str | None = None,
        **kwargs: Any,
    ) -> User | None:
        if not username or not password:
            return None

        from django.db.models import Q

        user = (
            User.objects.filter(Q(username=username) | Q(email=username))
            .select_related("school")
            .first()
        )
        if not user:
            return None

        if user.is_locked:
            return None

        if user.check_password(password):
            user.is_authenticated = True
            return user

        return None

    def get_user(self, user_id: Any) -> User | None:
        try:
            user = User.objects.get(pk=user_id)
            user.is_authenticated = True
            return user
        except (User.DoesNotExist, ValueError):
            return None
