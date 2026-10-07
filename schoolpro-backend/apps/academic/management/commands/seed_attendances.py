"""
Management command to seed Attendance and Attendance Logs.
Tables: "academic"."attendance", "academic"."attendance_logs"
Usage:
    python manage.py seed_attendances
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.attendance import Attendance, AttendanceLog
from apps.academic.models.infrastructure import Period
from apps.core.models.organization import ClassSubjectTeacher, SchoolClass
from apps.core.models.profile import Student
from apps.core.models.user import User


class Command(BaseCommand):
    help = "Seeds Attendance records and Attendance audit logs."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Attendance (academic.attendance & attendance_logs)...")
        )
        cls_10a1 = SchoolClass.objects.filter(name="10A1").first()
        student_nam = Student.objects.filter(user__username="hs_nam").first()
        period_1 = Period.objects.filter(period_no=1, shift="MORNING").first()
        cst_math = ClassSubjectTeacher.objects.filter(
            school_class=cls_10a1, subject__name="Toán học"
        ).first()
        admin_user = User.objects.first()

        if not (cls_10a1 and student_nam and period_1 and cst_math and admin_user):
            self.stdout.write(self.style.ERROR("Error: Prerequisites for Attendance not found."))
            return

        with transaction.atomic():
            att, created = Attendance.objects.get_or_create(
                student=student_nam,
                date=date.today(),
                period=period_1,
                defaults={
                    "id": uuid6.uuid7(),
                    "school_class": cls_10a1,
                    "class_subject_teacher": cst_math,
                    "status": "PRESENT",
                    "recorded_by": admin_user,
                    "method": "MANUAL",
                    "remarks": "Có mặt đúng giờ",
                },
            )
            status_msg = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(
                    f"  Processed Attendance: {student_nam.user.full_name} ({status_msg})"
                )
            )

            log_obj, log_created = AttendanceLog.objects.get_or_create(
                attendance=att,
                new_status="PRESENT",
                defaults={
                    "id": uuid6.uuid7(),
                    "changed_by": admin_user,
                    "old_status": "PRESENT",
                    "reason": "Khởi tạo điểm danh đầu giờ",
                },
            )
            log_msg = "Created" if log_created else "Already exists"
            self.stdout.write(self.style.SUCCESS(f"  Processed AttendanceLog ({log_msg})"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded Attendances!"))
