"""
Management command to seed Assignments and Submissions.
Tables: "academic"."assignments", "academic"."assignment_submissions"
Usage:
    python manage.py seed_assignments
"""

from datetime import date, datetime, timedelta

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.assignment import Assignment, AssignmentSubmission
from apps.core.models.organization import ClassSubjectTeacher, SchoolClass
from apps.core.models.profile import Student


class Command(BaseCommand):
    help = "Seeds Assignments and student Submissions."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Assignments (academic.assignments & submissions)...")
        )
        cls_10a1 = SchoolClass.objects.filter(name="10A1").first()
        cst_math = ClassSubjectTeacher.objects.filter(
            school_class=cls_10a1, subject__name="Toán học"
        ).first()
        student_nam = Student.objects.filter(user__username="hs_nam").first()

        if not (cls_10a1 and cst_math and student_nam):
            self.stdout.write(self.style.ERROR("Error: Prerequisites for Assignments not found."))
            return

        with transaction.atomic():
            assign, created = Assignment.objects.get_or_create(
                class_subject_teacher=cst_math,
                title="Bài tập Phương trình bậc 2 - Sách giáo khoa",
                defaults={
                    "id": uuid6.uuid7(),
                    "assignment_type": "HOMEWORK",
                    "description": "Làm bài 1, 2, 3 trang 45 SGK Toán 10",
                    "assigned_date": date.today(),
                    "due_date": datetime.now() + timedelta(days=3),
                    "max_score": 10.0,
                    "is_published": True,
                },
            )
            status_msg = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(f"  Processed Assignment: {assign.title} ({status_msg})")
            )

            sub, sub_created = AssignmentSubmission.objects.get_or_create(
                assignment=assign,
                student=student_nam,
                defaults={
                    "id": uuid6.uuid7(),
                    "submission_status": "SUBMITTED",
                    "submitted_at": datetime.now(),
                    "content_text": "Em gửi bài làm bài tập SGK trang 45",
                    "status": "PENDING",
                },
            )
            sub_msg = "Created" if sub_created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(
                    f"  Processed Submission for {student_nam.user.full_name} ({sub_msg})"
                )
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Assignments!"))
