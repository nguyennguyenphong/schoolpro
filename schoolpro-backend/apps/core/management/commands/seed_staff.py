"""
Management command to seed Staff profiles for administrative and support personnel.
Table: "core"."staff"

Usage:
    python manage.py seed_staff
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.profile import Staff
from apps.core.models.user import User
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = (
        "Seeds Staff profiles for non-teaching administrative, executive, and auxiliary personnel."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Staff Profiles (core.staff)..."))
        school = School.objects.first()

        # Administrative and executive staff mappings based on seeded users
        staff_data = [
            # Executive Board
            {
                "username": "hieutruong",
                "job_title": "Hiệu trưởng",
                "qualification": "Tiến sĩ Quản lý Giáo dục",
                "hire_date": date(2010, 8, 1),
            },
            {
                "username": "pht_chuyenmon",
                "job_title": "Phó Hiệu trưởng Chuyên môn",
                "qualification": "Thạc sĩ Khoa học",
                "hire_date": date(2012, 9, 1),
            },
            {
                "username": "pht_hocsinh",
                "job_title": "Phó Hiệu trưởng Công tác học sinh",
                "qualification": "Thạc sĩ Giáo dục",
                "hire_date": date(2014, 9, 1),
            },
            {
                "username": "thuky_hoidong",
                "job_title": "Thư ký Hội đồng trường",
                "qualification": "Cử nhân Sư phạm",
                "hire_date": date(2016, 9, 1),
            },
            {
                "username": "thanhtra_nhandan",
                "job_title": "Trưởng ban Thanh tra nhân dân",
                "qualification": "Cử nhân Luật / Giáo dục",
                "hire_date": date(2015, 9, 1),
            },
            # Administrative & Specialized Staff
            {
                "username": "giaovu",
                "job_title": "Giáo vụ trường học",
                "qualification": "Cử nhân Quản trị Văn phòng",
                "hire_date": date(2018, 10, 1),
            },
            {
                "username": "yte",
                "job_title": "Cán bộ Y tế học đường",
                "qualification": "Cử nhân Điều dưỡng / Y sĩ",
                "hire_date": date(2019, 3, 15),
            },
            {
                "username": "thuvien",
                "job_title": "Cán bộ Thư viện",
                "qualification": "Cử nhân Thông tin - Thư viện",
                "hire_date": date(2017, 8, 1),
            },
            {
                "username": "ketoan",
                "job_title": "Kế toán trường học",
                "qualification": "Cử nhân Kế toán - Tài chính",
                "hire_date": date(2016, 1, 10),
            },
            {
                "username": "thuquy",
                "job_title": "Thủ quỹ trường học",
                "qualification": "Cử nhân Tài chính - Ngân hàng",
                "hire_date": date(2020, 6, 1),
            },
            {
                "username": "it_admin",
                "job_title": "Quản trị viên CNTT & Kỹ thuật",
                "qualification": "Kỹ sư Công nghệ Thông tin",
                "hire_date": date(2021, 2, 1),
            },
            {
                "username": "quanly_lab",
                "job_title": "Cán bộ Quản lý Thiết bị & Phòng Lab",
                "qualification": "Kỹ sư Thiết bị Giáo dục",
                "hire_date": date(2018, 9, 1),
            },
            {
                "username": "giamthi",
                "job_title": "Giám thị / Quản sinh",
                "qualification": "Cử nhân Quản lý Giáo dục",
                "hire_date": date(2017, 9, 1),
            },
            {
                "username": "tuvan_tamly",
                "job_title": "Chuyên viên Tư vấn tâm lý học đường",
                "qualification": "Thạc sĩ Tâm lý học Giáo dục",
                "hire_date": date(2022, 9, 1),
            },
            {
                "username": "baove",
                "job_title": "Nhân viên Bảo vệ & An ninh",
                "qualification": "Chứng chỉ Nghiệp vụ Bảo vệ",
                "hire_date": date(2015, 5, 1),
            },
            {
                "username": "haucan",
                "job_title": "Nhân viên Hậu cần & Tạp vụ",
                "qualification": "Chứng chỉ Nghiệp vụ Hậu cần",
                "hire_date": date(2016, 7, 1),
            },
        ]

        with transaction.atomic():
            for s_info in staff_data:
                user = User.objects.filter(username=s_info["username"]).first()
                if not user:
                    self.stdout.write(
                        self.style.WARNING(
                            f"User '{s_info['username']}' not found, skipping staff profile..."
                        )
                    )
                    continue

                staff_obj = Staff.objects.filter(user=user).first()
                created = False

                if not staff_obj:
                    # Dynamically generate unique 12-digit staff code using existing utility
                    staff_code = generate_unique_code(Staff, "staff_code")
                    staff_obj = Staff.objects.create(
                        id=uuid6.uuid7(),
                        user=user,
                        school=school,
                        staff_code=staff_code,
                        job_title=s_info["job_title"],
                        qualification=s_info["qualification"],
                        hire_date=s_info["hire_date"],
                        status="ACTIVE",
                    )
                    created = True
                else:
                    staff_obj.job_title = s_info["job_title"]
                    staff_obj.qualification = s_info["qualification"]
                    staff_obj.hire_date = s_info["hire_date"]
                    staff_obj.status = "ACTIVE"
                    staff_obj.save(
                        update_fields=["job_title", "qualification", "hire_date", "status"]
                    )

                status_msg = f"Created (Code: {staff_obj.staff_code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Staff: {user.full_name:<35} | {staff_obj.job_title} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all Staff profiles!"))
