"""
Management command to seed Subjects.
Table: "core"."subjects"
Usage:
    python manage.py seed_subjects
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.department import Department
from apps.master.models.school import School
from apps.master.models.subject import Subject
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard high school Subjects."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Subjects (core.subjects)..."))
        school = School.objects.first()
        dept_math = Department.objects.filter(name="Tổ Toán - Tin học").first()
        dept_lit = Department.objects.filter(name="Tổ Ngữ Văn").first()
        dept_eng = Department.objects.filter(name="Tổ Ngoại Ngữ").first()
        dept_nat = Department.objects.filter(name="Tổ Khoa học Tự nhiên (Lý - Hóa - Sinh)").first()
        dept_soc = Department.objects.filter(name="Tổ Khoa học Xã hội (Sử - Địa - GDCD)").first()

        subjects_data = [
            {"name": "Toán học", "short_name": "Toán", "dept": dept_math},
            {"name": "Ngữ văn", "short_name": "Văn", "dept": dept_lit},
            {"name": "Tiếng Anh", "short_name": "Anh", "dept": dept_eng},
            {"name": "Vật lý", "short_name": "Lý", "dept": dept_nat},
            {"name": "Hóa học", "short_name": "Hóa", "dept": dept_nat},
            {"name": "Sinh học", "short_name": "Sinh", "dept": dept_nat},
            {"name": "Lịch sử", "short_name": "Sử", "dept": dept_soc},
            {"name": "Tin học", "short_name": "Tin", "dept": dept_math},
        ]

        with transaction.atomic():
            for s in subjects_data:
                subj_obj = Subject.objects.filter(school=school, name=s["name"]).first()
                created = False
                if not subj_obj:
                    subj_obj = Subject.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(Subject, "code"),
                        school=school,
                        department=s.get("dept"),
                        name=s["name"],
                        short_name=s["short_name"],
                        is_active=True,
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Subject: {subj_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Subjects!"))
