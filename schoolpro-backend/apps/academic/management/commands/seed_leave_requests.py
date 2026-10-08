"""
Management command to seed Leave Requests.
Table: "academic"."leave_requests"
Usage:
    python manage.py seed_leave_requests
"""

from datetime import date, timedelta

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.attendance import LeaveRequest
from apps.core.models.profile import Student
from apps.core.models.user import User


class Command(BaseCommand):
    help = "Seeds Leave Requests (Đơn xin nghỉ phép)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Leave Requests (academic.leave_requests)..."))
        student_anh = Student.objects.filter(user__username="hocsinh_01").first()
        admin_user = User.objects.first()

        if not (student_anh and admin_user):
            self.stdout.write(self.style.ERROR("Error: Student hocsinh_01 or Admin User not found."))
            return

        with transaction.atomic():
            lr, created = LeaveRequest.objects.get_or_create(
                student=student_anh,
                from_date=date.today() + timedelta(days=1),
                to_date=date.today() + timedelta(days=1),
                defaults={
                    "id": uuid6.uuid7(),
                    "leave_type": "SICK",
                    "reason": "Học sinh bị sốt cần nghỉ theo dõi tại nhà",
                    "status": "APPROVED",
                    "reviewed_by": admin_user,
                    "submitted_by": student_anh.user,
                },
            )
            status_msg = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(
                    f"  Processed LeaveRequest: {student_anh.user.full_name} ({status_msg})"
                )
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Leave Requests!"))
