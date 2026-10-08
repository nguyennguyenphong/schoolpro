"""
Management command to seed dynamic Master Lookup Types.
Table: "core"."lookup_types"
Usage:
    python manage.py seed_lookup_types
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.lookup import LookupType
from apps.master.models.school import School


class Command(BaseCommand):
    help = "Seeds standard reference lookup types."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Master Lookup Types (core.lookup_types)..."))
        school = School.objects.first()

        types_data = [
            {
                "code": "GENDER",
                "name": "Giới tính",
                "description": "Danh mục giới tính người dùng",
            },
            {
                "code": "USER_STATUS",
                "name": "Trạng thái người dùng",
                "description": "Tình trạng hoạt động tài khoản",
            },
            {
                "code": "STUDENT_STATUS",
                "name": "Tình trạng học sinh",
                "description": "Trạng thái học vụ của học sinh",
            },
            {
                "code": "ROOM_TYPE",
                "name": "Loại phòng học",
                "description": "Phân loại phòng học và cơ sở vật chất",
            },
            {
                "code": "CLASS_STREAM",
                "name": "Ban học / Định hướng",
                "description": "Phân ban đào tạo THPT",
            },
            {
                "code": "ETHNICITY",
                "name": "Dân tộc",
                "description": "Danh mục thành phần dân tộc Việt Nam theo chuẩn MOET",
            },
            {
                "code": "RELIGION",
                "name": "Tôn giáo",
                "description": "Danh mục tôn giáo công nhận tại Việt Nam",
            },
            {
                "code": "RELATIONSHIP",
                "name": "Mối quan hệ gia đình",
                "description": "Mối quan hệ nhân thân giữa người giám hộ và học sinh",
            },
            {
                "code": "HEALTH_STATUS",
                "name": "Tình trạng sức khỏe",
                "description": "Tình trạng thể chất y tế học đường",
            },
        ]

        with transaction.atomic():
            for t in types_data:
                lt, created = LookupType.objects.get_or_create(
                    code=t["code"],
                    defaults={
                        "id": uuid6.uuid7(),
                        "school": school,
                        "name": t["name"],
                        "description": t["description"],
                        "is_system": True,
                    },
                )
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed LookupType: {lt.code} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Lookup Types!"))
