"""
Management command to seed Semesters.
Table: "core"."semesters"
Usage:
    python manage.py seed_semesters
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.academic_year import AcademicYear
from apps.master.models.semester import Semester
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard Semesters for current academic year."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Semesters (core.semesters)..."))
        ay = AcademicYear.objects.filter(is_current=True).first() or AcademicYear.objects.first()
        if not ay:
            self.stdout.write(
                self.style.ERROR("Error: Academic Year not found. Run seed_academic_years first.")
            )
            return

        semesters_data = [
            {
                "name": "Học kỳ 1 (2026 - 2027)",
                "order_no": 1,
                "weeks_count": 18,
                "start_date": date(2026, 9, 5),
                "end_date": date(2027, 1, 15),
                "gradebook_lock_date": date(2027, 1, 20),
                "is_current": True,
            },
            {
                "name": "Học kỳ 2 (2026 - 2027)",
                "order_no": 2,
                "weeks_count": 18,
                "start_date": date(2027, 1, 16),
                "end_date": date(2027, 5, 31),
                "gradebook_lock_date": date(2027, 6, 5),
                "is_current": False,
            },
        ]

        with transaction.atomic():
            for item in semesters_data:
                sem = Semester.objects.filter(academic_year=ay, order_no=item["order_no"]).first()
                created = False
                if not sem:
                    sem = Semester.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(Semester, "code"),
                        academic_year=ay,
                        name=item["name"],
                        order_no=item["order_no"],
                        weeks_count=item["weeks_count"],
                        start_date=item["start_date"],
                        end_date=item["end_date"],
                        gradebook_lock_date=item["gradebook_lock_date"],
                        is_current=item["is_current"],
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Semester: {sem.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Semesters!"))
