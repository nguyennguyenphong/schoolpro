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
            {
                "username": "codo_truong",
                "admission_date": date(2025, 9, 5),
                "national_id": "079208001001",
                "blood_type": "A",
                "is_union_member": True,
                "union_date": date(2025, 3, 26),
            },
            {
                "username": "loptruong_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001002",
                "blood_type": "O",
                "is_union_member": True,
                "union_date": date(2026, 3, 26),
            },
            {
                "username": "loppho_hoctap_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001003",
                "blood_type": "B",
                "is_union_member": True,
                "union_date": date(2026, 3, 26),
            },
            {
                "username": "loppho_laodong_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001004",
                "blood_type": "O",
                "is_union_member": False,
                "union_date": None,
            },
            {
                "username": "loppho_vanthemy_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001005",
                "blood_type": "AB",
                "is_union_member": False,
                "union_date": None,
            },
            {
                "username": "bithu_chidoan_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001006",
                "blood_type": "O",
                "is_union_member": True,
                "union_date": date(2025, 3, 26),
            },
            {
                "username": "phobithu_chidoan_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001007",
                "blood_type": "A",
                "is_union_member": True,
                "union_date": date(2025, 3, 26),
            },
            {
                "username": "totruong_to1_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001008",
                "blood_type": "B",
                "is_union_member": False,
                "union_date": None,
            },
            {
                "username": "topho_to1_10a1",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001009",
                "blood_type": "O",
                "is_union_member": False,
                "union_date": None,
            },
            {
                "username": "hocsinh_01",
                "admission_date": date(2026, 9, 5),
                "national_id": "079208001010",
                "blood_type": "O",
                "is_union_member": False,
                "union_date": None,
            },
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
                        national_id_number=s_info["national_id"],
                        national_id_issued_date=date(2025, 1, 15),
                        national_id_issued_place="Cục Cảnh sát QLHC về TTXH",
                        ethnicity="Kinh",
                        religion="Không",
                        birth_place="TP. Hồ Chí Minh",
                        permanent_address=user.address,
                        temporary_address=user.address,
                        blood_type=s_info["blood_type"],
                        is_boarder=False,
                        is_pioneer=True,
                        pioneer_entry_date=date(2018, 5, 15),
                        is_union_member=s_info["is_union_member"],
                        union_entry_date=s_info["union_date"],
                        status="STUDYING",
                    )
                    created = True
                else:
                    stu_obj.current_class = class_10a1
                    stu_obj.national_id_number = s_info["national_id"]
                    stu_obj.blood_type = s_info["blood_type"]
                    stu_obj.is_union_member = s_info["is_union_member"]
                    stu_obj.union_entry_date = s_info["union_date"]
                    stu_obj.status = "STUDYING"
                    stu_obj.save(
                        update_fields=[
                            "current_class",
                            "national_id_number",
                            "blood_type",
                            "is_union_member",
                            "union_entry_date",
                            "status",
                        ]
                    )

                status_msg = f"Created (Code: {stu_obj.student_code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Student: {user.full_name:<35} | {stu_obj.student_code} ({status_msg})"
                    )
                )

            # Link monitors back to class 10A1
            if class_10a1:
                monitor = Student.objects.filter(user__username="loptruong_10a1").first()
                vice_monitor = Student.objects.filter(user__username="loppho_hoctap_10a1").first()
                if monitor or vice_monitor:
                    class_10a1.monitor_student = monitor
                    class_10a1.vice_monitor_student = vice_monitor
                    class_10a1.save(update_fields=["monitor_student", "vice_monitor_student"])
                    self.stdout.write(
                        self.style.SUCCESS("  Linked monitor & vice-monitor to Class 10A1")
                    )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all Student profiles!"))
