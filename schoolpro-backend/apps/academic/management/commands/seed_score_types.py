"""
Management command to seed Score Types.
Table: "academic"."score_types"
Usage:
    python manage.py seed_score_types
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.grading import ScoreType
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds standard Score Types per MOET Circular 22."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Score Types (academic.score_types)..."))
        school = School.objects.first()

        score_types_data = [
            {"name": "Kiểm tra miệng (ĐĐGtx)", "weight": 1.0, "min_scores": 1},
            {"name": "Kiểm tra 15 phút (ĐĐGtx)", "weight": 1.0, "min_scores": 2},
            {"name": "Kiểm tra 1 tiết (ĐĐGtx)", "weight": 1.0, "min_scores": 1},
            {"name": "Kiểm tra giữa kỳ (ĐĐGgk)", "weight": 2.0, "min_scores": 1},
            {"name": "Kiểm tra cuối kỳ (ĐĐGck)", "weight": 3.0, "min_scores": 1},
        ]

        with transaction.atomic():
            for st in score_types_data:
                st_obj = ScoreType.objects.filter(school=school, name=st["name"]).first()
                created = False
                if not st_obj:
                    st_obj = ScoreType.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(ScoreType, "code"),
                        school=school,
                        name=st["name"],
                        weight=st["weight"],
                        min_scores=st["min_scores"],
                        is_active=True,
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed ScoreType: {st_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Score Types!"))
