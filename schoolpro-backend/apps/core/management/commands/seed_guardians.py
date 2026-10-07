"""
Management command to seed Guardians.
Tables: "core"."guardians", "core"."users", "core"."user_roles"
Usage:
    python manage.py seed_guardians
"""

from datetime import date

import uuid6
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.profile import Guardian, Student
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from apps.master.models.school import School


class Command(BaseCommand):
    help = "Seeds Guardians (Phụ huynh) and their User accounts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Guardians (core.guardians)..."))
        school = School.objects.first()
        student_nam = Student.objects.filter(user__username="hs_nam").first()
        parent_role = Role.objects.filter(code="R_PARENT").first()

        if not student_nam:
            self.stdout.write(self.style.ERROR("Error: Student hs_nam not found."))
            return

        with transaction.atomic():
            u_parent, _ = User.objects.get_or_create(
                username="ph_nam",
                defaults={
                    "id": uuid6.uuid7(),
                    "school": school,
                    "email": "nam.parent@gmail.com",
                    "phone": "0912345678",
                    "password_hash": make_password("password123"),
                    "full_name": "Lê Văn Tuấn",
                    "status_code": "ACTIVE",
                    "is_verified": True,
                },
            )

            if parent_role:
                UserRole.objects.get_or_create(
                    user=u_parent,
                    role=parent_role,
                    defaults={
                        "id": uuid6.uuid7(),
                        "is_primary": True,
                        "effective_from": date.today(),
                        "status": "ACTIVE",
                    },
                )

            g_obj, created = Guardian.objects.get_or_create(
                user=u_parent,
                defaults={
                    "id": uuid6.uuid7(),
                    "full_name": "Lê Văn Tuấn",
                    "relationship": "FATHER",
                    "phone": "0912345678",
                    "is_emergency_contact": True,
                },
            )
            g_obj.students.add(student_nam)

            status_msg = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(
                    f"  Processed Guardian: {g_obj.full_name} for Student {student_nam.user.full_name} ({status_msg})"
                )
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Guardians!"))
