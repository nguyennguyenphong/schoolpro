"""
Management command to seed Timetable.
Table: "academic"."timetables"
Usage:
    python manage.py seed_timetables
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.infrastructure import Period, Room
from apps.academic.models.timetable import Timetable
from apps.core.models.organization import ClassSubjectTeacher, SchoolClass
from apps.master.models.semester import Semester


class Command(BaseCommand):
    help = "Seeds Timetable entries (Thời khóa biểu)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Timetables (academic.timetables)..."))
        cls_10a1 = SchoolClass.objects.filter(name="10A1").first()
        sem_1 = Semester.objects.filter(order_no=1).first() or Semester.objects.first()
        cst_math = ClassSubjectTeacher.objects.filter(
            school_class=cls_10a1, subject__name="Toán học"
        ).first()
        period_1 = Period.objects.filter(period_no=1, shift="MORNING").first()
        room_a101 = Room.objects.filter(name="Phòng học A101").first()

        if not (cls_10a1 and sem_1 and cst_math and period_1 and room_a101):
            self.stdout.write(self.style.ERROR("Error: Prerequisites for Timetable not found."))
            return

        with transaction.atomic():
            tt, created = Timetable.objects.get_or_create(
                school_class=cls_10a1,
                day_of_week=1,  # Thứ 2
                period=period_1,
                semester=sem_1,
                defaults={
                    "id": uuid6.uuid7(),
                    "class_subject_teacher": cst_math,
                    "room": room_a101,
                    "effective_from": date.today(),
                    "is_active": True,
                },
            )
            status_msg = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(
                    f"  Processed Timetable: {cls_10a1.name} - Thứ 2 Tiết 1 ({status_msg})"
                )
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Timetables!"))
