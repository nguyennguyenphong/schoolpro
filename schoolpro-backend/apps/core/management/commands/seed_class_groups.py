"""
Management command to seed Class Groups (Tổ học tập & trực nhật).
Table: "core"."class_groups"

Usage:
    python manage.py seed_class_groups
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.organization import ClassGroup, SchoolClass
from apps.core.models.profile import Student
from apps.core.models.user import User
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds class internal squads/study teams (Tổ 1, 2, 3, 4) for baseline classes."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Class Groups (core.class_groups)..."))

        class_10a1 = SchoolClass.objects.filter(name="10A1").first()
        if not class_10a1:
            self.stdout.write(
                self.style.WARNING("Class 10A1 not found. Skipping class group seeding...")
            )
            return

        leader_user = User.objects.filter(username="totruong_to1_10a1").first()
        deputy_user = User.objects.filter(username="topho_to1_10a1").first()

        leader_student = Student.objects.filter(user=leader_user).first() if leader_user else None
        deputy_student = Student.objects.filter(user=deputy_user).first() if deputy_user else None

        groups_data = [
            {
                "name": "Tổ 1",
                "order_no": 1,
                "color_tag": "#2563EB",  # Blue
                "leader": leader_student,
                "deputy": deputy_student,
                "description": "Tổ 1 - Phụ trách thi đua nề nếp và vệ sinh dãy bàn 1",
            },
            {
                "name": "Tổ 2",
                "order_no": 2,
                "color_tag": "#16A34A",  # Green
                "leader": None,
                "deputy": None,
                "description": "Tổ 2 - Phụ trách học tập bộ môn và chuyên đề dãy bàn 2",
            },
            {
                "name": "Tổ 3",
                "order_no": 3,
                "color_tag": "#D97706",  # Amber
                "leader": None,
                "deputy": None,
                "description": "Tổ 3 - Phụ trách phong trào văn nghệ và thể thao dãy bàn 3",
            },
            {
                "name": "Tổ 4",
                "order_no": 4,
                "color_tag": "#7C3AED",  # Purple
                "leader": None,
                "deputy": None,
                "description": "Tổ 4 - Phụ trách báo tường và hoạt động Đoàn dãy bàn 4",
            },
        ]

        with transaction.atomic():
            for g in groups_data:
                group_obj = ClassGroup.objects.filter(
                    school_class=class_10a1, name=g["name"]
                ).first()
                created = False

                if not group_obj:
                    group_code = generate_unique_code(ClassGroup, "code")
                    group_obj = ClassGroup.objects.create(
                        id=uuid6.uuid7(),
                        school_class=class_10a1,
                        code=group_code,
                        name=g["name"],
                        leader_student=g["leader"],
                        deputy_leader_student=g["deputy"],
                        order_no=g["order_no"],
                        color_tag=g["color_tag"],
                        description=g["description"],
                    )
                    created = True
                else:
                    group_obj.leader_student = g["leader"]
                    group_obj.deputy_leader_student = g["deputy"]
                    group_obj.order_no = g["order_no"]
                    group_obj.color_tag = g["color_tag"]
                    group_obj.description = g["description"]
                    group_obj.save(
                        update_fields=[
                            "leader_student",
                            "deputy_leader_student",
                            "order_no",
                            "color_tag",
                            "description",
                        ]
                    )

                status_msg = f"Created (Code: {group_obj.code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed ClassGroup: {class_10a1.name} - {group_obj.name:<10} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Class Groups!"))
