"""
Management command to seed Students.
Tables: "core"."students", "core"."users", "core"."user_roles"
Usage:
    python manage.py seed_students
"""

from datetime import date

import uuid6
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.profile import Student
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds Students and their corresponding User accounts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Students (core.students)..."))
        school = School.objects.first()
        student_role = Role.objects.filter(code="R_STUDENT").first()

        students_data = [
            {
                "username": "hs_nam",
                "email": "nam.le@student.schoolpro.edu.vn",
                "phone": "0912345601",
                "full_name": "Lê Hoàng Nam",
                "gender": "MALE",
                "dob": date(2010, 5, 15),
            },
            {
                "username": "hs_anh",
                "email": "anh.pham@student.schoolpro.edu.vn",
                "phone": "0912345602",
                "full_name": "Phạm Quỳnh Anh",
                "gender": "FEMALE",
                "dob": date(2010, 8, 20),
            },
        ]

        with transaction.atomic():
            for s in students_data:
                u, _ = User.objects.get_or_create(
                    username=s["username"],
                    defaults={
                        "id": uuid6.uuid7(),
                        "school": school,
                        "email": s["email"],
                        "phone": s["phone"],
                        "password_hash": make_password("password123"),
                        "full_name": s["full_name"],
                        "status_code": "ACTIVE",
                        "is_verified": True,
                    },
                )

                if student_role:
                    UserRole.objects.get_or_create(
                        user=u,
                        role=student_role,
                        defaults={
                            "id": uuid6.uuid7(),
                            "is_primary": True,
                            "effective_from": date.today(),
                            "status": "ACTIVE",
                        },
                    )

                stu_obj = Student.objects.filter(user=u).first()
                created = False
                if not stu_obj:
                    stu_obj = Student.objects.create(
                        id=uuid6.uuid7(),
                        student_code=generate_unique_code(Student, "student_code"),
                        user=u,
                        school=school,
                        gender=s["gender"],
                        date_of_birth=s["dob"],
                        status="STUDYING",
                        enrollment_date=date(2026, 9, 5),
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Student: {stu_obj.student_code} - {u.full_name} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Students!"))
