"""
Management command to seed Exams, Submissions and Event Logs.
Tables: "academic"."exams", "academic"."exam_submissions", "academic"."exam_event_logs"
Usage:
    python manage.py seed_exams
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.exam import Exam, ExamEventLog, ExamSubmission
from apps.academic.models.grading import ScoreType
from apps.academic.models.infrastructure import Room
from apps.core.models.organization import ClassSubjectTeacher, SchoolClass
from apps.core.models.profile import Student
from apps.core.models.user import User


class Command(BaseCommand):
    help = "Seeds Exams, Exam Submissions, and Exam Event Logs."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Exams (academic.exams, submissions, event_logs)...")
        )
        cls_10a1 = SchoolClass.objects.filter(name="10A1").first()
        cst_math = ClassSubjectTeacher.objects.filter(
            school_class=cls_10a1, subject__name="Toán học"
        ).first()
        score_type_15m = (
            ScoreType.objects.filter(name="Kiểm tra 15 phút (ĐĐGtx)").first()
            or ScoreType.objects.filter(code="ST_15M").first()
        )
        room_a101 = Room.objects.filter(name="Phòng học A101").first()
        student_nam = Student.objects.filter(user__username="hs_nam").first()
        admin_user = User.objects.first()

        if not (cls_10a1 and cst_math and score_type_15m and student_nam and admin_user):
            self.stdout.write(self.style.ERROR("Error: Prerequisites for Exams not found."))
            return

        with transaction.atomic():
            exam, created = Exam.objects.get_or_create(
                title="Kiểm tra 15 phút: Đại số chương 1",
                exam_date=date.today(),
                score_type=score_type_15m,
                defaults={
                    "id": uuid6.uuid7(),
                    "class_subject_teacher": cst_math,
                    "room": room_a101,
                    "duration_minutes": 15,
                    "format": "MULTIPLE_CHOICE",
                    "status": "COMPLETED",
                    "created_by": admin_user,
                },
            )
            status_msg = "Created" if created else "Already exists"
            self.stdout.write(self.style.SUCCESS(f"  Processed Exam: {exam.title} ({status_msg})"))

            sub, sub_created = ExamSubmission.objects.get_or_create(
                exam=exam,
                student=student_nam,
                defaults={
                    "id": uuid6.uuid7(),
                    "status": "SUBMITTED",
                    "auto_score": 9.0,
                    "total_score": 9.0,
                    "duration_seconds": 840,
                },
            )
            sub_msg = "Created" if sub_created else "Already exists"
            self.stdout.write(self.style.SUCCESS(f"  Processed ExamSubmission ({sub_msg})"))

            log_obj, log_created = ExamEventLog.objects.get_or_create(
                exam=exam,
                submission=sub,
                student=student_nam,
                event_type="EXAM_SUBMITTED",
                defaults={
                    "id": uuid6.uuid7(),
                    "actor": admin_user,
                    "title": "Học sinh nộp bài thi thành công",
                    "severity": "INFO",
                },
            )
            log_msg = "Created" if log_created else "Already exists"
            self.stdout.write(self.style.SUCCESS(f"  Processed ExamEventLog ({log_msg})"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded Exams & Event Logs!"))
