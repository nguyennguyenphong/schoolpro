"""
Management command to seed Academic Year.
Table: "core"."academic_years"
Usage:
    python manage.py seed_academic_years
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.academic_year import AcademicYear
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard Academic Year."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Academic Year (core.academic_years)..."))
        school = School.objects.first()

        with transaction.atomic():
            ay = AcademicYear.objects.filter(school=school, name="Năm học 2026 - 2027").first()
            created = False
            if not ay:
                ay = AcademicYear.objects.create(
                    id=uuid6.uuid7(),
                    code=generate_unique_code(AcademicYear, "code"),
                    school=school,
                    name="Năm học 2026 - 2027",
                    start_date=date(2026, 9, 5),
                    end_date=date(2027, 5, 31),
                    is_current=True,
                )
                created = True
            else:
                if not ay.is_current:
                    ay.is_current = True
                    ay.save(update_fields=["is_current"])

        status_msg = "Created" if created else "Already exists"
        self.stdout.write(
            self.style.SUCCESS(f"Successfully processed Academic Year: {ay.name} ({status_msg})")
        )
