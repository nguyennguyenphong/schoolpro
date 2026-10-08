"""
Management command to seed Periods.
Table: "academic"."periods"
Usage:
    python manage.py seed_periods
"""

from datetime import time

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.infrastructure import Period
from apps.master.models.school import School


class Command(BaseCommand):
    help = "Seeds academic Periods (Tiết học)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Periods (academic.periods)..."))
        school = School.objects.first()

        periods_data = [
            {
                "period_no": 1,
                "name": "Tiết 1",
                "shift": "MORNING",
                "start_time": time(7, 15),
                "end_time": time(8, 0),
            },
            {
                "period_no": 2,
                "name": "Tiết 2",
                "shift": "MORNING",
                "start_time": time(8, 5),
                "end_time": time(8, 50),
            },
            {
                "period_no": 3,
                "name": "Tiết 3",
                "shift": "MORNING",
                "start_time": time(9, 5),
                "end_time": time(9, 50),
            },
            {
                "period_no": 4,
                "name": "Tiết 4",
                "shift": "MORNING",
                "start_time": time(9, 55),
                "end_time": time(10, 40),
            },
            {
                "period_no": 5,
                "name": "Tiết 5",
                "shift": "MORNING",
                "start_time": time(10, 45),
                "end_time": time(11, 30),
            },
            {
                "period_no": 6,
                "name": "Tiết 6",
                "shift": "AFTERNOON",
                "start_time": time(13, 30),
                "end_time": time(14, 15),
            },
            {
                "period_no": 7,
                "name": "Tiết 7",
                "shift": "AFTERNOON",
                "start_time": time(14, 20),
                "end_time": time(15, 5),
            },
            {
                "period_no": 8,
                "name": "Tiết 8",
                "shift": "AFTERNOON",
                "start_time": time(15, 15),
                "end_time": time(16, 0),
            },
        ]

        with transaction.atomic():
            for p in periods_data:
                period_obj, created = Period.objects.get_or_create(
                    school=school,
                    period_no=p["period_no"],
                    shift=p["shift"],
                    defaults={
                        "id": uuid6.uuid7(),
                        "name": p["name"],
                        "start_time": p["start_time"],
                        "end_time": p["end_time"],
                        "is_break": False,
                    },
                )
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Period: {period_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Periods!"))
