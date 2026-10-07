"""
Management command to seed Teacher profiles for pedagogical and youth union faculty.
Table: "core"."teachers"

Usage:
    python manage.py seed_teachers
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.profile import Teacher
from apps.core.models.user import User
from apps.master.models.department import Department
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds Teacher profiles linked to seeded educational faculty users."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Teachers (core.teachers)..."))
        school = School.objects.first()

        dept_math = Department.objects.filter(name="Tổ Toán - Tin học").first()
        dept_lit = Department.objects.filter(name="Tổ Ngữ Văn").first()
        dept_eng = Department.objects.filter(name="Tổ Ngoại Ngữ").first()
        dept_social = Department.objects.filter(name="Tổ Khoa học Xã hội (Sử - Địa - GDCD)").first()

        teachers_data = [
            {
                "username": "totruong_toan",
                "department": dept_math,
                "qualification": "Thạc sĩ Toán học",
                "subject_major": "Toán học",
                "is_homeroom": False,
                "hire_date": date(2012, 9, 1),
            },
            {
                "username": "topho_toan",
                "department": dept_math,
                "qualification": "Thạc sĩ Sư phạm Toán",
                "subject_major": "Toán học",
                "is_homeroom": False,
                "hire_date": date(2015, 9, 1),
            },
            {
                "username": "gvcn_10a1",
                "department": dept_lit,
                "qualification": "Thạc sĩ Ngữ Văn",
                "subject_major": "Ngữ văn",
                "is_homeroom": True,
                "hire_date": date(2013, 9, 1),
            },
            {
                "username": "gvbm_tienganh",
                "department": dept_eng,
                "qualification": "Thạc sĩ Ngôn ngữ Anh (IELTS 8.0)",
                "subject_major": "Tiếng Anh",
                "is_homeroom": False,
                "hire_date": date(2017, 9, 1),
            },
            {
                "username": "bithu_doantruong",
                "department": dept_social,
                "qualification": "Thạc sĩ Giáo dục Công dân & Kỹ năng sống",
                "subject_major": "Giáo dục Công dân",
                "is_homeroom": False,
                "hire_date": date(2014, 9, 1),
            },
            {
                "username": "phobithu_doantruong",
                "department": dept_eng,
                "qualification": "Cử nhân Sư phạm Tiếng Anh",
                "subject_major": "Tiếng Anh",
                "is_homeroom": False,
                "hire_date": date(2019, 9, 1),
            },
            {
                "username": "bch_doantruong",
                "department": dept_social,
                "qualification": "Cử nhân Lịch sử",
                "subject_major": "Lịch sử",
                "is_homeroom": False,
                "hire_date": date(2020, 9, 1),
            },
        ]

        with transaction.atomic():
            for t_info in teachers_data:
                user = User.objects.filter(username=t_info["username"]).first()
                if not user:
                    self.stdout.write(
                        self.style.WARNING(
                            f"User '{t_info['username']}' not found, skipping teacher profile..."
                        )
                    )
                    continue

                tch = Teacher.objects.filter(user=user).first()
                created = False

                if not tch:
                    teacher_code = generate_unique_code(Teacher, "teacher_code")
                    tch = Teacher.objects.create(
                        id=uuid6.uuid7(),
                        teacher_code=teacher_code,
                        user=user,
                        school=school,
                        department=t_info["department"],
                        qualification=t_info["qualification"],
                        subject_major=t_info["subject_major"],
                        hire_date=t_info["hire_date"],
                        is_homeroom=t_info["is_homeroom"],
                        status="ACTIVE",
                    )
                    created = True
                else:
                    tch.department = t_info["department"]
                    tch.qualification = t_info["qualification"]
                    tch.subject_major = t_info["subject_major"]
                    tch.is_homeroom = t_info["is_homeroom"]
                    tch.status = "ACTIVE"
                    tch.save(
                        update_fields=[
                            "department",
                            "qualification",
                            "subject_major",
                            "is_homeroom",
                            "status",
                        ]
                    )

                status_msg = f"Created (Code: {tch.teacher_code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Teacher: {user.full_name:<35} | {tch.subject_major} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all Teacher profiles!"))
