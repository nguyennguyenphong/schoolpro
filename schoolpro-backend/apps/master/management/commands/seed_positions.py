"""
Management command to seed Master Positions and official pedagogical appointments.
Table: "core"."positions"

Usage:
    python manage.py seed_positions
"""

from decimal import Decimal

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.role import Role
from apps.master.models.position import Position
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard pedagogical, executive, and student council Positions."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Positions (core.positions)..."))
        school = School.objects.first()

        positions_data = [
            # School-wide Executive Leadership
            {
                "name": "Hiệu trưởng",
                "scope_type": "SCHOOL",
                "role_name": "Hiệu trưởng",
                "allowance": Decimal("0.70"),
                "max_holders": 1,
                "order_no": 1,
                "is_leadership": True,
                "description": "Headmaster / Principal - Overall institutional head and legal representative",
            },
            {
                "name": "Phó Hiệu trưởng",
                "scope_type": "SCHOOL",
                "role_name": "Phó Hiệu trưởng",
                "allowance": Decimal("0.55"),
                "max_holders": 3,
                "order_no": 2,
                "is_leadership": True,
                "description": "Vice Principal - Assists the Principal in academic and student affairs oversight",
            },
            {
                "name": "Bí thư Đoàn trường",
                "scope_type": "SCHOOL",
                "role_name": "Bí thư Đoàn trường",
                "allowance": Decimal("0.30"),
                "max_holders": 1,
                "order_no": 3,
                "is_leadership": True,
                "description": "Youth Union Secretary - Heads youth political and extracurricular activities",
            },
            {
                "name": "Phó Bí thư Đoàn trường",
                "scope_type": "SCHOOL",
                "role_name": "Phó Bí thư Đoàn trường",
                "allowance": Decimal("0.20"),
                "max_holders": 2,
                "order_no": 4,
                "is_leadership": False,
                "description": "Deputy Youth Union Secretary - Coordinates school-wide club and youth programs",
            },
            {
                "name": "Thư ký Hội đồng trường",
                "scope_type": "SCHOOL",
                "role_name": "Thư ký Hội đồng trường",
                "allowance": Decimal("0.15"),
                "max_holders": 1,
                "order_no": 5,
                "is_leadership": False,
                "description": "School Council Secretary - Records faculty board meetings and official resolutions",
            },
            {
                "name": "Trưởng ban Thanh tra nhân dân",
                "scope_type": "SCHOOL",
                "role_name": "Trưởng ban Thanh tra nhân dân",
                "allowance": Decimal("0.20"),
                "max_holders": 1,
                "order_no": 6,
                "is_leadership": False,
                "description": "Head of People's Inspection Board - Supervises institutional compliance",
            },
            # Academic Department Positions
            {
                "name": "Tổ trưởng Chuyên môn",
                "scope_type": "DEPARTMENT",
                "role_name": "Tổ trưởng Chuyên môn",
                "allowance": Decimal("0.25"),
                "max_holders": 1,
                "order_no": 10,
                "is_leadership": True,
                "description": "Head of Academic Department - Oversees curriculum delivery and subject teachers",
            },
            {
                "name": "Tổ phó Chuyên môn",
                "scope_type": "DEPARTMENT",
                "role_name": "Tổ phó Chuyên môn",
                "allowance": Decimal("0.15"),
                "max_holders": 2,
                "order_no": 11,
                "is_leadership": False,
                "description": "Deputy Head of Academic Department - Assists in subject pedagogical supervision",
            },
            {
                "name": "Tổ trưởng Văn phòng",
                "scope_type": "DEPARTMENT",
                "role_name": "Trưởng phòng / Tổ trưởng Hành chính",
                "allowance": Decimal("0.20"),
                "max_holders": 1,
                "order_no": 12,
                "is_leadership": True,
                "description": "Head of Administrative Division - Manages auxiliary and clerical personnel",
            },
            # Classroom Pedagogical Positions
            {
                "name": "Giáo viên Chủ nhiệm",
                "scope_type": "CLASS",
                "role_name": "Giáo viên Chủ nhiệm (GVCN)",
                "allowance": Decimal("0.30"),
                "max_holders": 1,
                "order_no": 20,
                "is_leadership": False,
                "description": "Homeroom Teacher - Directly manages class student conduct and family relations",
            },
            # Student Council / Class Committee Positions
            {
                "name": "Lớp trưởng",
                "scope_type": "CLASS",
                "role_name": "Lớp trưởng (Ban Cán sự Lớp)",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 30,
                "is_leadership": True,
                "description": "Class President - Leads class meetings, student activities, and representation",
            },
            {
                "name": "Lớp phó Học tập",
                "scope_type": "CLASS",
                "role_name": "Lớp phó Học tập",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 31,
                "is_leadership": False,
                "description": "Academic Vice Monitor - Tracks homework assignments and study peer groups",
            },
            {
                "name": "Lớp phó Kỷ luật",
                "scope_type": "CLASS",
                "role_name": "Lớp phó Kỷ luật",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 32,
                "is_leadership": False,
                "description": "Discipline Vice Monitor - Records daily student attendance and uniform compliance",
            },
            {
                "name": "Lớp phó Lao động",
                "scope_type": "CLASS",
                "role_name": "Lớp phó Lao động",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 33,
                "is_leadership": False,
                "description": "Facilities & Sanitation Vice Monitor - Manages classroom cleaning duties",
            },
            {
                "name": "Lớp phó Văn thể mỹ",
                "scope_type": "CLASS",
                "role_name": "Lớp phó Văn thể mỹ",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 34,
                "is_leadership": False,
                "description": "Culture, Arts & Sports Vice Monitor - Leads extracurricular competitions",
            },
            {
                "name": "Bí thư Chi đoàn lớp",
                "scope_type": "CLASS",
                "role_name": "Bí thư Chi đoàn lớp",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 35,
                "is_leadership": True,
                "description": "Class Youth Branch Secretary - Organizes communist youth member activities",
            },
            {
                "name": "Tổ trưởng Tổ học tập",
                "scope_type": "CLASS",
                "role_name": "Tổ trưởng Tổ học tập",
                "allowance": Decimal("0.00"),
                "max_holders": 4,
                "order_no": 36,
                "is_leadership": False,
                "description": "Study Squad Leader - Monitors assignment completion and duty roster of squad",
            },
            {
                "name": "Tổ phó Tổ học tập",
                "scope_type": "CLASS",
                "role_name": "Tổ phó Tổ học tập",
                "allowance": Decimal("0.00"),
                "max_holders": 4,
                "order_no": 37,
                "is_leadership": False,
                "description": "Study Squad Deputy Leader - Assists squad leader in internal emulation",
            },
            # Parent Representative Committee
            {
                "name": "Trưởng ban Đại diện Cha mẹ học sinh trường",
                "scope_type": "SCHOOL",
                "role_name": "Trưởng ban Đại diện Cha mẹ Học sinh (Hội Phụ huynh)",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 40,
                "is_leadership": True,
                "description": "Head of School Parent Representative Council - Coordinates school-family partnership",
            },
            {
                "name": "Trưởng ban Đại diện Cha mẹ học sinh lớp",
                "scope_type": "CLASS",
                "role_name": "Trưởng ban Đại diện CMHS Lớp",
                "allowance": Decimal("0.00"),
                "max_holders": 1,
                "order_no": 41,
                "is_leadership": True,
                "description": "Head of Class Parent Committee - Coordinates class-level parent engagement",
            },
        ]

        with transaction.atomic():
            for p in positions_data:
                role_obj = Role.objects.filter(name=p["role_name"]).first()
                pos_obj = Position.objects.filter(school=school, name=p["name"]).first()
                created = False

                if not pos_obj:
                    pos_code = generate_unique_code(Position, "code")
                    pos_obj = Position.objects.create(
                        id=uuid6.uuid7(),
                        school=school,
                        code=pos_code,
                        name=p["name"],
                        scope_type=p["scope_type"],
                        applicable_role=role_obj,
                        default_allowance_coefficient=p["allowance"],
                        max_holders=p["max_holders"],
                        order_no=p["order_no"],
                        is_leadership=p["is_leadership"],
                        description=p["description"],
                        is_active=True,
                    )
                    created = True
                else:
                    pos_obj.scope_type = p["scope_type"]
                    pos_obj.applicable_role = role_obj
                    pos_obj.default_allowance_coefficient = p["allowance"]
                    pos_obj.max_holders = p["max_holders"]
                    pos_obj.order_no = p["order_no"]
                    pos_obj.is_leadership = p["is_leadership"]
                    pos_obj.description = p["description"]
                    pos_obj.is_active = True
                    pos_obj.save(
                        update_fields=[
                            "scope_type",
                            "applicable_role",
                            "default_allowance_coefficient",
                            "max_holders",
                            "order_no",
                            "is_leadership",
                            "description",
                            "is_active",
                        ]
                    )

                status_msg = f"Created (Code: {pos_obj.code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Position: {pos_obj.name:<45} | Allowance: {pos_obj.default_allowance_coefficient} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Master Positions!"))
