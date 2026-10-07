"""
Management command to seed Classes.
Table: "core"."classes"
Usage:
    python manage.py seed_classes
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.organization import SchoolClass
from apps.core.models.profile import Teacher
from apps.master.models.academic_year import AcademicYear
from apps.master.models.grade import Grade
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds Classes (Lớp học)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Classes (core.classes)..."))
        school = School.objects.first()
        ay = AcademicYear.objects.filter(is_current=True).first() or AcademicYear.objects.first()
        grade_10 = Grade.objects.filter(level=10).first()
        grade_11 = Grade.objects.filter(level=11).first()
        grade_12 = Grade.objects.filter(level=12).first()
        homeroom_teacher = Teacher.objects.filter(user__username="gv_toan").first()

        classes_data = [
            {
                "name": "10A1",
                "grade": grade_10,
                "teacher": homeroom_teacher,
                "stream": "NATURAL_SCIENCE",
            },
            {"name": "10A2", "grade": grade_10, "teacher": None, "stream": "SOCIAL_SCIENCE"},
            {"name": "11A1", "grade": grade_11, "teacher": None, "stream": "NATURAL_SCIENCE"},
            {"name": "12A1", "grade": grade_12, "teacher": None, "stream": "BASIC"},
        ]

        with transaction.atomic():
            for c in classes_data:
                cls_obj = SchoolClass.objects.filter(
                    school=school, academic_year=ay, name=c["name"]
                ).first()
                created = False
                if not cls_obj:
                    cls_obj = SchoolClass.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(SchoolClass, "code"),
                        school=school,
                        academic_year=ay,
                        grade=c["grade"],
                        name=c["name"],
                        homeroom_teacher=c["teacher"],
                        class_stream_code=c["stream"],
                        max_students=45,
                        is_active=True,
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Class: {cls_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Classes!"))
