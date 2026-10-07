"""
Management command to seed Student profiles for class leaders, monitors, and pupils.
Table: "core"."students"

Usage:
    python manage.py seed_students
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.organization import SchoolClass
from apps.core.models.profile import Student
from apps.core.models.user import User
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds Student profiles linked to seeded student committee and pupil users."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Students (core.students)..."))
        school = School.objects.first()
        class_10a1 = SchoolClass.objects.filter(name="10A1").first()

        students_data = [
            {"username": "codo_truong", "admission_date": date(2025, 9, 5)},
            {"username": "loptruong_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "loppho_hoctap_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "loppho_laodong_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "loppho_vanthemy_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "bithu_chidoan_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "phobithu_chidoan_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "totruong_to1_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "topho_to1_10a1", "admission_date": date(2026, 9, 5)},
            {"username": "hocsinh_01", "admission_date": date(2026, 9, 5)},
        ]

        with transaction.atomic():
            for s_info in students_data:
                user = User.objects.filter(username=s_info["username"]).first()
                if not user:
                    self.stdout.write(
                        self.style.WARNING(
                            f"User '{s_info['username']}' not found, skipping student profile..."
                        )
                    )
                    continue

                stu_obj = Student.objects.filter(user=user).first()
                created = False

                if not stu_obj:
                    student_code = generate_unique_code(Student, "student_code")
                    stu_obj = Student.objects.create(
                        id=uuid6.uuid7(),
                        student_code=student_code,
                        user=user,
                        school=school,
                        current_class=class_10a1,
                        admission_date=s_info["admission_date"],
                        status="STUDYING",
                    )
                    created = True
                else:
                    stu_obj.current_class = class_10a1
                    stu_obj.status = "STUDYING"
                    stu_obj.save(update_fields=["current_class", "status"])

                status_msg = f"Created (Code: {stu_obj.student_code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Student: {user.full_name:<35} | {stu_obj.student_code} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all Student profiles!"))
