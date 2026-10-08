"""
Management command to seed Departments.
Table: "core"."departments"
Usage:
    python manage.py seed_departments
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.department import Department
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds academic Departments (Tổ chuyên môn)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Departments (core.departments)..."))
        school = School.objects.first()

        departments_data = [
            {"name": "Tổ Toán - Tin học"},
            {"name": "Tổ Ngữ văn"},
            {"name": "Tổ Ngoại ngữ"},
            {"name": "Tổ Vật lý - Công nghệ"},
            {"name": "Tổ Hóa học - Sinh học"},
            {"name": "Tổ Lịch sử - Địa lý"},
            {"name": "Tổ Giáo dục kinh tế và pháp luật"},
            {"name": "Tổ Giáo dục thể chất - Giáo dục quốc phòng và an ninh"},
            {"name": "Tổ Nghệ thuật"},
            {"name": "Tổ Hoạt động trải nghiệm - Hướng nghiệp"},
        ]

        with transaction.atomic():
            for d in departments_data:
                dept_obj = Department.objects.filter(school=school, name=d["name"]).first()
                created = False
                if not dept_obj:
                    dept_obj = Department.objects.create(
                        id=uuid6.uuid7(),
                        school=school,
                        code=generate_unique_code(Department, "code"),
                        name=d["name"],
                        department_type="SUBJECT",
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Department: {dept_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Departments!"))
