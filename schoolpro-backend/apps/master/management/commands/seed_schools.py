"""
Management command to seed School.
Table: "core"."schools"
Usage:
    python manage.py seed_schools
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard School record."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding School (core.schools)..."))

        with transaction.atomic():
            school = School.objects.filter(name="Trường Trung học phổ thông SchoolPro").first()
            created = False
            if not school:
                school = School.objects.create(
                    id=uuid6.uuid7(),
                    code=generate_unique_code(School, "code"),
                    name="Trường Trung học phổ thông SchoolPro",
                    moet_code="88012345",
                    educational_stage="HIGH_SCHOOL",
                    school_type="PUBLIC",
                    established_year=2008,
                    address="Số 110 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh",
                    province_code="01",
                    district_code="01",
                    ward_code="01",
                    phone="02812345678",
                    fax="02812345679",
                    email="thptschoolpro@schoolpro.edu.vn",
                    website="https://schoolpro.edu.vn",
                    tax_id="1234567890",
                    bank_name="Ngân hàng TMCP SchoolPro",
                    bank_account_number="1234567890123456",
                    bank_account_holder="Trường Trung học phổ thông SchoolPro",
                    logo_url="https://schoolpro.edu.vn/logo.png",
                    banner_url="https://schoolpro.edu.vn/banner.png",
                    stamp_image_url="https://schoolpro.edu.vn/stamp.png",
                    slogan="Nơi ươm mầm tài năng",
                    principal_name="Lê Trọng Nghĩa",
                    digital_certificate_info={
                        "certificate_serial_number": "1234567890",
                        "certificate_issuer": "SchoolPro CA",
                        "certificate_valid_from": "2024-01-01",
                        "certificate_valid_to": "2026-01-01",
                    },
                    metadata={
                        "school_motto": "Học tập và rèn luyện",
                        "school_colors": ["#FF0000", "#00FF00", "#0000FF"],
                        "school_mascot": "Eagle",
                        "school_vision": "Trở thành trường học hàng đầu về chất lượng giáo dục",
                        "school_mission": "Cung cấp môi trường học tập tốt nhất cho học sinh",
                    },
                    is_active=True,
                )
                created = True

        status_msg = "Created" if created else "Already exists"
        self.stdout.write(
            self.style.SUCCESS(f"Successfully processed School: {school.name} ({status_msg})")
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Schools!"))
