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

        dept_math = Department.objects.filter(name__iexact="Tổ Toán - Tin học").first()
        dept_lit = Department.objects.filter(name__iexact="Tổ Ngữ văn").first()
        dept_eng = Department.objects.filter(name__iexact="Tổ Ngoại ngữ").first()
        dept_history_geo = Department.objects.filter(name__iexact="Tổ Lịch sử - Địa lý").first()
        dept_econ_law = Department.objects.filter(
            name__iexact="Tổ Giáo dục kinh tế và pháp luật"
        ).first()

        teachers_data = [
            {
                "username": "totruong_toan",
                "department": dept_math,
                "qualification": "Thạc sĩ Toán học",
                "subject_major": "Toán học",
                "national_id": "001085002001",
                "tax_code": "8001002001",
                "years_exp": 14,
                "certificate": "Chứng chỉ Nghiệp vụ Sư phạm Toán THPT Hạng I",
                "fl_level": "B2 (VSTEP)",
                "it_level": "Nâng cao",
                "is_party": True,
                "is_homeroom": False,
                "hire_date": date(2012, 9, 1),
            },
            {
                "username": "topho_toan",
                "department": dept_math,
                "qualification": "Thạc sĩ Sư phạm Toán",
                "subject_major": "Toán học",
                "national_id": "001085002002",
                "tax_code": "8001002002",
                "years_exp": 11,
                "certificate": "Chứng chỉ Nghiệp vụ Sư phạm Toán THPT Hạng II",
                "fl_level": "B1 (VSTEP)",
                "it_level": "Cơ bản",
                "is_party": True,
                "is_homeroom": False,
                "hire_date": date(2015, 9, 1),
            },
            {
                "username": "gvcn_10a1",
                "department": dept_lit,
                "qualification": "Thạc sĩ Ngữ Văn",
                "subject_major": "Ngữ văn",
                "national_id": "001085002003",
                "tax_code": "8001002003",
                "years_exp": 13,
                "certificate": "Chứng chỉ Giáo viên Chủ nhiệm Giỏi cấp Tỉnh",
                "fl_level": "B2 (VSTEP)",
                "it_level": "Nâng cao",
                "is_party": True,
                "is_homeroom": True,
                "hire_date": date(2013, 9, 1),
            },
            {
                "username": "gvbm_tienganh",
                "department": dept_eng,
                "qualification": "Thạc sĩ Ngôn ngữ Anh (IELTS 8.0)",
                "subject_major": "Tiếng Anh",
                "national_id": "001085002004",
                "tax_code": "8001002004",
                "years_exp": 9,
                "certificate": "Chứng chỉ TESOL Quốc tế & Sư phạm THPT",
                "fl_level": "C1 (IELTS 8.0)",
                "it_level": "Nâng cao",
                "is_party": False,
                "is_homeroom": False,
                "hire_date": date(2017, 9, 1),
            },
            {
                "username": "bithu_doantruong",
                "department": dept_econ_law,
                "qualification": "Thạc sĩ Giáo dục Công dân & Kỹ năng sống",
                "subject_major": "Giáo dục Công dân",
                "national_id": "001085002005",
                "tax_code": "8001002005",
                "years_exp": 12,
                "certificate": "Chứng chỉ Nghiệp vụ Công tác Đoàn - Đội THPT",
                "fl_level": "B1 (VSTEP)",
                "it_level": "Nâng cao",
                "is_party": True,
                "is_homeroom": False,
                "hire_date": date(2014, 9, 1),
            },
            {
                "username": "phobithu_doantruong",
                "department": dept_eng,
                "qualification": "Cử nhân Sư phạm Tiếng Anh",
                "subject_major": "Tiếng Anh",
                "national_id": "001085002006",
                "tax_code": "8001002006",
                "years_exp": 7,
                "certificate": "Chứng chỉ Kỹ năng Hoạt động Thanh niên",
                "fl_level": "C1 (VSTEP)",
                "it_level": "Nâng cao",
                "is_party": True,
                "is_homeroom": False,
                "hire_date": date(2019, 9, 1),
            },
            {
                "username": "bch_doantruong",
                "department": dept_history_geo,
                "qualification": "Cử nhân Lịch sử",
                "subject_major": "Lịch sử",
                "national_id": "001085002007",
                "tax_code": "8001002007",
                "years_exp": 6,
                "certificate": "Chứng chỉ Bồi dưỡng Giáo viên Lịch sử",
                "fl_level": "B1 (VSTEP)",
                "it_level": "Cơ bản",
                "is_party": False,
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
                        national_id_number=t_info["national_id"],
                        tax_code=t_info["tax_code"],
                        years_of_experience=t_info["years_exp"],
                        teaching_certificate=t_info["certificate"],
                        foreign_language_level=t_info["fl_level"],
                        it_level=t_info["it_level"],
                        standard_weekly_periods=17,
                        is_party_member=t_info["is_party"],
                        employment_type="FULL_TIME",
                        hire_date=t_info["hire_date"],
                        is_homeroom=t_info["is_homeroom"],
                        status="ACTIVE",
                    )
                    created = True
                else:
                    tch.department = t_info["department"]
                    tch.qualification = t_info["qualification"]
                    tch.subject_major = t_info["subject_major"]
                    tch.national_id_number = t_info["national_id"]
                    tch.tax_code = t_info["tax_code"]
                    tch.years_of_experience = t_info["years_exp"]
                    tch.teaching_certificate = t_info["certificate"]
                    tch.foreign_language_level = t_info["fl_level"]
                    tch.it_level = t_info["it_level"]
                    tch.is_party_member = t_info["is_party"]
                    tch.is_homeroom = t_info["is_homeroom"]
                    tch.status = "ACTIVE"
                    tch.save(
                        update_fields=[
                            "department",
                            "qualification",
                            "subject_major",
                            "national_id_number",
                            "tax_code",
                            "years_of_experience",
                            "teaching_certificate",
                            "foreign_language_level",
                            "it_level",
                            "is_party_member",
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
