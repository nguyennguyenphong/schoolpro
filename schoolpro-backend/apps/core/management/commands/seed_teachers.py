"""
Management command to seed Teachers.
Tables: "core"."teachers", "core"."users", "core"."user_roles"
Usage:
    python manage.py seed_teachers
"""

from datetime import date

import uuid6
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.profile import Teacher
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from apps.master.models.department import Department
from apps.master.models.school import School
from apps.master.models.subject import Subject
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds Teachers and their corresponding User accounts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Teachers (core.teachers)..."))
        school = School.objects.first()
        dept_math = Department.objects.filter(name="Tổ Toán - Tin học").first()
        dept_lit = Department.objects.filter(name="Tổ Ngữ Văn").first()
        subj_math = Subject.objects.filter(name="Toán học").first()
        subj_lit = Subject.objects.filter(name="Ngữ văn").first()
        teacher_role = Role.objects.filter(code="R_TEACHER").first()

        teachers_data = [
            {
                "username": "gv_toan",
                "email": "toan.nguyen@schoolpro.edu.vn",
                "phone": "0987654321",
                "full_name": "Nguyễn Văn Toán",
                "department": dept_math,
                "subject": subj_math,
            },
            {
                "username": "gv_van",
                "email": "van.tran@schoolpro.edu.vn",
                "phone": "0987654322",
                "full_name": "Trần Thị Văn",
                "department": dept_lit,
                "subject": subj_lit,
            },
        ]

        with transaction.atomic():
            for t in teachers_data:
                u, _ = User.objects.get_or_create(
                    username=t["username"],
                    defaults={
                        "id": uuid6.uuid7(),
                        "school": school,
                        "email": t["email"],
                        "phone": t["phone"],
                        "password_hash": make_password("password123"),
                        "full_name": t["full_name"],
                        "status_code": "ACTIVE",
                        "is_verified": True,
                    },
                )

                if teacher_role:
                    UserRole.objects.get_or_create(
                        user=u,
                        role=teacher_role,
                        defaults={
                            "id": uuid6.uuid7(),
                            "is_primary": True,
                            "effective_from": date.today(),
                            "status": "ACTIVE",
                        },
                    )

                tch = Teacher.objects.filter(user=u).first()
                created = False
                if not tch:
                    tch = Teacher.objects.create(
                        id=uuid6.uuid7(),
                        teacher_code=generate_unique_code(Teacher, "teacher_code"),
                        user=u,
                        school=school,
                        department=t["department"],
                        qualification="MASTER",
                        subject_major=t["subject"].name if t["subject"] else "",
                        is_homeroom_eligible=True,
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Teacher: {tch.teacher_code} - {u.full_name} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Teachers!"))
