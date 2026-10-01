import uuid
from django.db import models


class EvaluationAnswer(models.Model):
    """
    EvaluationAnswer Model.

    Database Table: "evaluation"."answers"
    Description: Atomic answers provided for survey questions
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        "evaluation.EvaluationSubmission",
        on_delete=models.CASCADE,
        db_column="submission_id",
        related_name="+",
        db_comment="submission_id foreign key",
    )
    question = models.ForeignKey(
        "evaluation.EvaluationQuestion",
        on_delete=models.CASCADE,
        db_column="question_id",
        related_name="+",
        db_comment="question_id foreign key",
    )
    answer_value = models.JSONField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."answers"'
        verbose_name = "Evaluation Answer"
        verbose_name_plural = "Evaluation Answers"

    def __str__(self) -> str:
        return f"EvaluationAnswer ({self.pk})"
