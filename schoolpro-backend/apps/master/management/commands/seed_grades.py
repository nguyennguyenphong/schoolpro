"""
Management command to seed Grades.
Table: "core"."grades"
Usage:
    python manage.py seed_grades
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.grade import Grade
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard Grades (Khối 10, 11, 12)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Grades (core.grades)..."))
        school = School.objects.first()

        grades_data = [
            {"name": "Khối 10", "order_no": 10},
            {"name": "Khối 11", "order_no": 11},
            {"name": "Khối 12", "order_no": 12},
        ]

        with transaction.atomic():
            for g in grades_data:
                grade_obj = Grade.objects.filter(school=school, name=g["name"]).first()
                created = False
                if not grade_obj:
                    grade_obj = Grade.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(Grade, "code", length=8),
                        school=school,
                        name=g["name"],
                        order_no=g["order_no"],
                        description=f"Khối lớp {g['order_no']} bậc Trung học Phổ thông",
                    )
                    created = True
                else:
                    grade_obj.order_no = g["order_no"]
                    grade_obj.description = f"Khối lớp {g['order_no']} bậc Trung học Phổ thông"
                    grade_obj.save(update_fields=["order_no", "description"])
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Grade: {grade_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Grades!"))
