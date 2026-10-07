"""
Management command to create or update the default SchoolPro Superadmin account.
Defaults to:
  Email/Username: admin@schoolpro.edu.vn
  Password: admin
"""

import uuid

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models.permission import Permission, RolePermission
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User


class Command(BaseCommand):
    help = (
        "Creates or resets default superadmin user for SchoolPro (admin@schoolpro.edu.vn / admin)"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            default="admin@schoolpro.edu.vn",
            help="Superadmin email address (default: admin@schoolpro.edu.vn)",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="admin",
            help="Superadmin password (default: admin)",
        )
        parser.add_argument(
            "--username",
            type=str,
            default="admin@schoolpro.edu.vn",
            help="Superadmin username (default: admin@schoolpro.edu.vn)",
        )

    def handle(self, *args, **options):
        email = options["email"].strip()
        username = options["username"].strip()
        raw_password = options["password"]

        self.stdout.write(self.style.NOTICE(f"Provisioning Superadmin: {email}..."))

        # 1. Ensure Superadmin Role exists
        admin_role, _ = Role.objects.get_or_create(
            code="R_ADMIN_839201",
            defaults={
                "id": uuid.UUID("d96c271e-0b8d-4727-b2e9-a4f164a7c8d5"),
                "name": "Quản trị viên hệ thống",
                "description": "Toàn quyền cấu hình, vận hành và quản trị kỹ thuật",
                "badge_color": "#1E293B",
                "icon": "shield-check",
                "is_system": True,
                "is_active": True,
                "created_at": timezone.now(),
                "updated_at": timezone.now(),
            },
        )

        # 2. Grant all existing permissions to this role
        all_perms = Permission.objects.all()
        for perm in all_perms:
            RolePermission.objects.get_or_create(role=admin_role, permission=perm)

        # 3. Create or update User
        user = (
            User.objects.filter(username=username).first()
            or User.objects.filter(email=email).first()
        )

        password_hash = make_password(raw_password)

        if not user:
            user = User.objects.create(
                id=uuid.UUID("a31148cb-1471-4c5e-aa66-0848fae24853"),
                school=None,
                username=username,
                email=email,
                phone="0901234567",
                password_hash=password_hash,
                full_name="Quản trị viên Hệ thống (Super Admin)",
                status_code="ACTIVE",
                is_verified=True,
                created_at=timezone.now(),
                updated_at=timezone.now(),
            )
            self.stdout.write(self.style.SUCCESS(f"Created new Superadmin account: {email}"))
        else:
            user.username = username
            user.email = email
            user.password_hash = password_hash
            user.status_code = "ACTIVE"
            user.failed_login_attempts = 0
            user.locked_at = None
            user.locked_until = None
            user.save(
                update_fields=[
                    "username",
                    "email",
                    "password_hash",
                    "status_code",
                    "failed_login_attempts",
                    "locked_at",
                    "locked_until",
                ]
            )
            self.stdout.write(
                self.style.SUCCESS(f"Updated password and reset lock for Superadmin: {email}")
            )

        # 4. Bind User to Role
        ur, _ = UserRole.objects.get_or_create(
            user=user,
            role=admin_role,
            defaults={
                "is_primary": True,
                "effective_from": timezone.now().date(),
                "status": "ACTIVE",
                "created_at": timezone.now(),
            },
        )
        if not ur.is_primary or ur.status != "ACTIVE":
            ur.is_primary = True
            ur.status = "ACTIVE"
            ur.save(update_fields=["is_primary", "status"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully set up superadmin account:\n"
                f"  Username/Email: {email}\n"
                f"  Password:       {raw_password}\n"
                f"  Role:           {admin_role.code} ({admin_role.name})\n"
            )
        )
