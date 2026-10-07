"""
Management command to seed dynamic Master Lookup Values.
Table: "core"."lookup_values"
Usage:
    python manage.py seed_lookup_values
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.lookup import LookupType, LookupValue


class Command(BaseCommand):
    help = "Seeds standard reference lookup values."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Master Lookup Values (core.lookup_values)..."))

        values_map = {
            "GENDER": [
                {"code": "MALE", "name": "Nam", "badge_color": "#2563EB", "order_no": 1},
                {"code": "FEMALE", "name": "Nữ", "badge_color": "#EC4899", "order_no": 2},
                {"code": "OTHER", "name": "Khác", "badge_color": "#64748B", "order_no": 3},
            ],
            "USER_STATUS": [
                {
                    "code": "ACTIVE",
                    "name": "Đang hoạt động",
                    "badge_color": "#16A34A",
                    "order_no": 1,
                },
                {"code": "INACTIVE", "name": "Tạm dừng", "badge_color": "#EAB308", "order_no": 2},
                {"code": "LOCKED", "name": "Bị khóa", "badge_color": "#DC2626", "order_no": 3},
            ],
            "STUDENT_STATUS": [
                {"code": "STUDYING", "name": "Đang học", "badge_color": "#16A34A", "order_no": 1},
                {
                    "code": "SUSPENDED",
                    "name": "Bảo lưu / Đình chỉ",
                    "badge_color": "#EAB308",
                    "order_no": 2,
                },
                {
                    "code": "TRANSFERRED",
                    "name": "Chuyển trường",
                    "badge_color": "#3B82F6",
                    "order_no": 3,
                },
                {
                    "code": "GRADUATED",
                    "name": "Đã tốt nghiệp",
                    "badge_color": "#8B5CF6",
                    "order_no": 4,
                },
            ],
            "ROOM_TYPE": [
                {
                    "code": "CLASSROOM",
                    "name": "Phòng học lý thuyết",
                    "badge_color": "#0284C7",
                    "order_no": 1,
                },
                {
                    "code": "LAB",
                    "name": "Phòng thực hành / Thí nghiệm",
                    "badge_color": "#0D9488",
                    "order_no": 2,
                },
                {
                    "code": "HALL",
                    "name": "Hội trường / Nhà đa năng",
                    "badge_color": "#7C3AED",
                    "order_no": 3,
                },
                {
                    "code": "OFFICE",
                    "name": "Phòng làm việc",
                    "badge_color": "#64748B",
                    "order_no": 4,
                },
            ],
            "CLASS_STREAM": [
                {
                    "code": "NATURAL_SCIENCE",
                    "name": "Khoa học Tự nhiên",
                    "badge_color": "#0284C7",
                    "order_no": 1,
                },
                {
                    "code": "SOCIAL_SCIENCE",
                    "name": "Khoa học Xã hội",
                    "badge_color": "#D97706",
                    "order_no": 2,
                },
                {
                    "code": "BASIC",
                    "name": "Cơ bản / Toàn diện",
                    "badge_color": "#059669",
                    "order_no": 3,
                },
            ],
        }

        with transaction.atomic():
            for type_code, values in values_map.items():
                ltype = LookupType.objects.filter(code=type_code).first()
                if not ltype:
                    self.stdout.write(
                        self.style.WARNING(f"LookupType {type_code} not found, skipping...")
                    )
                    continue

                for v in values:
                    val_obj, created = LookupValue.objects.get_or_create(
                        lookup_type=ltype,
                        code=v["code"],
                        defaults={
                            "id": uuid6.uuid7(),
                            "name": v["name"],
                            "badge_color": v.get("badge_color"),
                            "order_no": v.get("order_no", 0),
                            "is_active": True,
                        },
                    )
                    status_msg = "Created" if created else "Already exists"
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  Processed [{type_code}] -> {val_obj.code} ({status_msg})"
                        )
                    )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Lookup Values!"))
