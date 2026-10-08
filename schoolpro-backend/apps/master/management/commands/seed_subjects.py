"""
Management command to seed Subjects.
Table: "core"."subjects"
Usage:
    python manage.py seed_subjects
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.master.models.department import Department
from apps.master.models.school import School
from apps.master.models.subject import Subject
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard high school Subjects."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Subjects (core.subjects)..."))
        school = School.objects.first()
        dept_math = Department.objects.filter(name__iexact="Tổ Toán - Tin học").first()
        dept_lit = Department.objects.filter(name__iexact="Tổ Ngữ văn").first()
        dept_foreign = Department.objects.filter(name__iexact="Tổ Ngoại ngữ").first()
        dept_history_geo = Department.objects.filter(name__iexact="Tổ Lịch sử - Địa lý").first()
        dept_pe_qpan = Department.objects.filter(
            name__iexact="Tổ Giáo dục thể chất - Giáo dục quốc phòng và an ninh"
        ).first()
        dept_experience = Department.objects.filter(
            name__iexact="Tổ Hoạt động trải nghiệm - Hướng nghiệp"
        ).first()
        dept_economics_law = Department.objects.filter(
            name__iexact="Tổ Giáo dục kinh tế và pháp luật"
        ).first()
        dept_physics_technology = Department.objects.filter(
            name__iexact="Tổ Vật lý - Công nghệ"
        ).first()
        dept_chemistry_biology = Department.objects.filter(
            name__iexact="Tổ Hóa học - Sinh học"
        ).first()
        dept_art = Department.objects.filter(name__iexact="Tổ Nghệ thuật").first()

        subjects_data = [
            {
                "name": "Toán",
                "short_name": "Toán",
                "dept": dept_math,
                "grade_level": None,
                "periods_per_year": 105,
                "evaluation_type": "SCORE",
                "is_compulsory": True,
                "color_code": "#2563EB",
                "icon": "calculator",
                "order_no": 1,
                "metadata": {
                    "curriculum_type": "COMPULSORY",
                    "subject_group": "MATHEMATICS",
                },
            },
            {
                "name": "Ngữ văn",
                "short_name": "Văn",
                "dept": dept_lit,
                "grade_level": None,
                "periods_per_year": 105,
                "evaluation_type": "SCORE",
                "is_compulsory": True,
                "color_code": "#DC2626",
                "icon": "book-open",
                "order_no": 2,
                "metadata": {
                    "curriculum_type": "COMPULSORY",
                    "subject_group": "LANGUAGE",
                },
            },
            {
                "name": "Ngoại ngữ 1",
                "short_name": "NN1",
                "dept": dept_foreign,
                "grade_level": None,
                "periods_per_year": 105,
                "evaluation_type": "SCORE",
                "is_compulsory": True,
                "color_code": "#059669",
                "icon": "globe",
                "order_no": 3,
                "metadata": {
                    "curriculum_type": "COMPULSORY",
                    "subject_group": "FOREIGN_LANGUAGE",
                    "language_code": "EN",
                    "language_name": "Tiếng Anh",
                },
            },
            {
                "name": "Lịch sử",
                "short_name": "Sử",
                "dept": dept_history_geo,
                "grade_level": None,
                "periods_per_year": 52,
                "evaluation_type": "SCORE",
                "is_compulsory": True,
                "color_code": "#CA8A04",
                "icon": "landmark",
                "order_no": 4,
                "metadata": {
                    "curriculum_type": "COMPULSORY",
                    "subject_group": "SOCIAL_SCIENCES",
                },
            },
            {
                "name": "Giáo dục thể chất",
                "short_name": "GDTC",
                "dept": dept_pe_qpan,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "COMMENT",
                "is_compulsory": True,
                "color_code": "#E11D48",
                "icon": "activity",
                "order_no": 5,
                "metadata": {
                    "curriculum_type": "COMPULSORY",
                    "subject_group": "PHYSICAL_EDUCATION",
                },
            },
            {
                "name": "Giáo dục quốc phòng và an ninh",
                "short_name": "GDQP-AN",
                "dept": dept_pe_qpan,
                "grade_level": None,
                "periods_per_year": 35,
                "evaluation_type": "COMMENT",
                "is_compulsory": True,
                "color_code": "#15803D",
                "icon": "shield",
                "order_no": 6,
                "metadata": {
                    "curriculum_type": "COMPULSORY",
                    "subject_group": "NATIONAL_DEFENSE",
                },
            },
            {
                "name": "Hoạt động trải nghiệm, hướng nghiệp",
                "short_name": "HĐTN-HN",
                "dept": dept_experience,
                "grade_level": None,
                "periods_per_year": 105,
                "evaluation_type": "COMMENT",
                "is_compulsory": True,
                "color_code": "#9333EA",
                "icon": "compass",
                "order_no": 7,
                "metadata": {
                    "curriculum_type": "EDUCATIONAL_ACTIVITY",
                    "subject_group": "EXPERIENCE_CAREER",
                },
            },
            {
                "name": "Địa lí",
                "short_name": "Địa",
                "dept": dept_history_geo,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#0284C7",
                "icon": "map",
                "order_no": 8,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "SOCIAL_SCIENCES",
                },
            },
            {
                "name": "Giáo dục kinh tế và pháp luật",
                "short_name": "GDKT&PL",
                "dept": dept_economics_law,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#4F46E5",
                "icon": "scale",
                "order_no": 9,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "ECONOMICS_LAW",
                },
            },
            {
                "name": "Vật lí",
                "short_name": "Lý",
                "dept": dept_physics_technology,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#7C3AED",
                "icon": "atom",
                "order_no": 10,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "NATURAL_SCIENCES",
                },
            },
            {
                "name": "Hóa học",
                "short_name": "Hóa",
                "dept": dept_chemistry_biology,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#EA580C",
                "icon": "flask",
                "order_no": 11,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "NATURAL_SCIENCES",
                },
            },
            {
                "name": "Sinh học",
                "short_name": "Sinh",
                "dept": dept_chemistry_biology,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#16A34A",
                "icon": "dna",
                "order_no": 12,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "NATURAL_SCIENCES",
                },
            },
            {
                "name": "Công nghệ",
                "short_name": "CN",
                "dept": dept_physics_technology,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#F97316",
                "icon": "settings",
                "order_no": 13,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "TECHNOLOGY",
                },
            },
            {
                "name": "Tin học",
                "short_name": "Tin",
                "dept": dept_math,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "SCORE",
                "is_compulsory": False,
                "color_code": "#0891B2",
                "icon": "cpu",
                "order_no": 14,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "INFORMATICS",
                },
            },
            {
                "name": "Âm nhạc",
                "short_name": "Âm nhạc",
                "dept": dept_art,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "COMMENT",
                "is_compulsory": False,
                "color_code": "#DB2777",
                "icon": "music",
                "order_no": 15,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "ARTS",
                },
            },
            {
                "name": "Mĩ thuật",
                "short_name": "Mĩ thuật",
                "dept": dept_art,
                "grade_level": None,
                "periods_per_year": 70,
                "evaluation_type": "COMMENT",
                "is_compulsory": False,
                "color_code": "#C026D3",
                "icon": "palette",
                "order_no": 16,
                "metadata": {
                    "curriculum_type": "ELECTIVE",
                    "subject_group": "ARTS",
                },
            },
        ]

        with transaction.atomic():
            for s in subjects_data:
                subj_obj = Subject.objects.filter(school=school, name=s["name"]).first()
                created = False
                if not subj_obj:
                    subj_obj = Subject.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(Subject, "code"),
                        school=school,
                        department=s.get("dept"),
                        name=s["name"],
                        short_name=s["short_name"],
                        periods_per_year=s["periods_per_year"],
                        evaluation_type=s["evaluation_type"],
                        is_compulsory=s["is_compulsory"],
                        color_code=s["color_code"],
                        icon=s["icon"],
                        order_no=s["order_no"],
                        is_active=True,
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Subject: {subj_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Subjects!"))
