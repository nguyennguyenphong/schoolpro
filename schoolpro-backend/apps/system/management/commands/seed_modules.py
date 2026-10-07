"""
Management command to seed dynamic System Modules and Dashboard Cards.
Tables: "sys"."modules", "sys"."role_modules"
Usage:
    python manage.py seed_modules
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.role import Role
from apps.system.models.module import Module, RoleModule


class Command(BaseCommand):
    help = "Seeds System Modules and RoleModule dashboard cards."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding System Modules (sys.modules & role_modules)...")
        )
        admin_role = Role.objects.filter(code="R_ADMIN_839201").first()

        modules_data = [
            {
                "code": "MOD_TIMETABLE",
                "name": "Thời khóa biểu",
                "category": "ACADEMIC",
                "module_type": "CARD",
                "icon": "calendar",
                "route": "/academic/timetable",
                "order": 1,
            },
            {
                "code": "MOD_ATTENDANCE",
                "name": "Điểm danh chuyên cần",
                "category": "ACADEMIC",
                "module_type": "CARD",
                "icon": "check-circle",
                "route": "/academic/attendance",
                "order": 2,
            },
            {
                "code": "MOD_ASSIGNMENTS",
                "name": "Bài tập & Nhiệm vụ",
                "category": "ACADEMIC",
                "module_type": "CARD",
                "icon": "book-open",
                "route": "/academic/assignments",
                "order": 3,
            },
            {
                "code": "MOD_EXAMS",
                "name": "Kỳ thi & Kiểm tra",
                "category": "ACADEMIC",
                "module_type": "CARD",
                "icon": "award",
                "route": "/academic/exams",
                "order": 4,
            },
            {
                "code": "MOD_GRADEBOOK",
                "name": "Sổ điểm điện tử",
                "category": "ACADEMIC",
                "module_type": "CARD",
                "icon": "clipboard-list",
                "route": "/academic/grades",
                "order": 5,
            },
            {
                "code": "MOD_EMULATION",
                "name": "Thi đua nề nếp",
                "category": "EMULATION",
                "module_type": "CARD",
                "icon": "flag",
                "route": "/emulation",
                "order": 6,
            },
            {
                "code": "MOD_NOTIFICATIONS",
                "name": "Bản tin học đường",
                "category": "COMMUNICATION",
                "module_type": "CARD",
                "icon": "bell",
                "route": "/notifications",
                "order": 7,
            },
            {
                "code": "MOD_SYSTEM_SETTINGS",
                "name": "Cấu hình hệ thống",
                "category": "MANAGEMENT",
                "module_type": "CARD",
                "icon": "settings",
                "route": "/settings",
                "order": 8,
            },
        ]

        with transaction.atomic():
            for m_info in modules_data:
                mod, created = Module.objects.get_or_create(
                    code=m_info["code"],
                    defaults={
                        "id": uuid6.uuid7(),
                        "name": m_info["name"],
                        "category": m_info["category"],
                        "module_type": m_info["module_type"],
                        "icon": m_info["icon"],
                        "route": m_info["route"],
                        "default_order_no": m_info["order"],
                        "is_active": True,
                    },
                )
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Module: {mod.name} ({status_msg})")
                )

                if admin_role:
                    RoleModule.objects.get_or_create(
                        role=admin_role,
                        module=mod,
                        defaults={
                            "id": uuid6.uuid7(),
                            "is_visible": True,
                            "order_no": m_info["order"],
                        },
                    )

        self.stdout.write(self.style.SUCCESS("Successfully seeded System Modules & Role Cards!"))
