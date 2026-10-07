"""
Management command to seed StudentClassEnrollment.
Table: "core"."student_class_enrollments"
Usage:
    python manage.py seed_student_enrollments
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.organization import SchoolClass, StudentClassEnrollment
from apps.core.models.profile import Student


class Command(BaseCommand):
    help = "Seeds student class enrollments (StudentClassEnrollment)."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE(
                "Seeding Student Class Enrollments (core.student_class_enrollments)..."
            )
        )
        cls_10a1 = SchoolClass.objects.filter(name="10A1").first()
        s1 = Student.objects.filter(user__username="hs_nam").first()
        s2 = Student.objects.filter(user__username="hs_anh").first()

        if not (cls_10a1 and s1 and s2):
            self.stdout.write(self.style.ERROR("Error: Class 10A1 or Students not found."))
            return

        enrollments = [
            {"student": s1, "seat_number": 1},
            {"student": s2, "seat_number": 2},
        ]

        with transaction.atomic():
            for e in enrollments:
                enr_obj, created = StudentClassEnrollment.objects.get_or_create(
                    student=e["student"],
                    school_class=cls_10a1,
                    defaults={
                        "id": uuid6.uuid7(),
                        "enrollment_date": date(2026, 9, 5),
                        "seat_number": e["seat_number"],
                        "status": "ACTIVE",
                    },
                )
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Enrolled {e['student'].user.full_name} into {cls_10a1.name} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Student Class Enrollments!"))
