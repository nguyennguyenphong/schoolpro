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

        if not school:
            self.stdout.write(self.style.ERROR("No school found. Please seed a school first."))
            return

        score_types_data = [
            {
                "name": "Đánh giá thường xuyên",
                "coefficient": 1,
                "weight_percent": None,
                "min_evaluations": 1,
                "max_evaluations": 6,
                "order_no": 1,
                "description": (
                    "Điểm đánh giá thường xuyên trong quá trình học tập, "
                    "có thể thực hiện thông qua hỏi đáp, viết, thuyết trình, "
                    "thực hành, sản phẩm học tập hoặc các hình thức phù hợp."
                ),
            },
            {
                "name": "Đánh giá giữa kỳ",
                "coefficient": 2,
                "weight_percent": None,
                "min_evaluations": 1,
                "max_evaluations": 1,
                "order_no": 2,
                "description": ("Điểm đánh giá định kỳ giữa kỳ của môn học."),
            },
            {
                "name": "Đánh giá cuối kỳ",
                "coefficient": 3,
                "weight_percent": None,
                "min_evaluations": 1,
                "max_evaluations": 1,
                "order_no": 3,
                "description": ("Điểm đánh giá định kỳ cuối kỳ của môn học."),
            },
        ]

        with transaction.atomic():
            created_count = 0
            existing_count = 0

            for data in score_types_data:
                score_type = ScoreType.objects.filter(
                    school=school,
                    name=data["name"],
                ).first()

                created = False

                if not score_type:
                    score_type = ScoreType.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(ScoreType, "code"),
                        school=school,
                        name=data["name"],
                        coefficient=data["coefficient"],
                        weight_percent=data["weight_percent"],
                        min_evaluations=data["min_evaluations"],
                        max_evaluations=data["max_evaluations"],
                        order_no=data["order_no"],
                        description=data["description"],
                        is_active=True,
                    )
                    created = True
                    created_count += 1
                else:
                    existing_count += 1

                status_msg = "Created" if created else "Already exists"

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed ScoreType: "
                        f"{score_type.code} - {score_type.name} ({status_msg})"
                    )
                )

        total_count = ScoreType.objects.filter(school=school).count()

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded Score Types! "
                f"Created: {created_count}, "
                f"Already exists: {existing_count}, "
                f"Total: {total_count}"
            )
        )
