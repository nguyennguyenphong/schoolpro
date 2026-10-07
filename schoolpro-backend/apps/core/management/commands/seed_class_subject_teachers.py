"""
Management command to seed ClassSubjectTeacher teaching assignments.
Table: "core"."class_subject_teachers"
Usage:
    python manage.py seed_class_subject_teachers
"""

from datetime import date

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.organization import ClassSubjectTeacher, SchoolClass
from apps.core.models.profile import Teacher
from apps.master.models.semester import Semester
from apps.master.models.subject import Subject


class Command(BaseCommand):
    help = "Seeds teaching assignments (ClassSubjectTeacher)."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Teaching Assignments (core.class_subject_teachers)...")
        )
        cls_10a1 = SchoolClass.objects.filter(name="10A1").first()
        sem_1 = Semester.objects.filter(order_no=1).first() or Semester.objects.first()
        subj_math = Subject.objects.filter(name="Toán học").first()
        subj_lit = Subject.objects.filter(name="Ngữ văn").first()
        t_toan = Teacher.objects.filter(user__username="gv_toan").first()
        t_van = Teacher.objects.filter(user__username="gv_van").first()

        if not (cls_10a1 and t_toan and t_van and subj_math and subj_lit):
            self.stdout.write(
                self.style.ERROR("Error: Required Classes, Teachers, or Subjects not found.")
            )
            return

        assignments_data = [
            {"school_class": cls_10a1, "subject": subj_math, "teacher": t_toan, "periods": 4},
            {"school_class": cls_10a1, "subject": subj_lit, "teacher": t_van, "periods": 3},
        ]

        with transaction.atomic():
            for a in assignments_data:
                cst_obj, created = ClassSubjectTeacher.objects.get_or_create(
                    school_class=a["school_class"],
                    subject=a["subject"],
                    teacher=a["teacher"],
                    defaults={
                        "id": uuid6.uuid7(),
                        "semester": sem_1,
                        "periods_per_week": a["periods"],
                        "effective_from": date.today(),
                        "is_active": True,
                    },
                )
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Assignment: {a['school_class'].name} - {a['subject'].name} -> {a['teacher'].user.full_name} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Teaching Assignments!"))
