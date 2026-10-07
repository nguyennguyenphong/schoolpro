from django.db import models

from common.models.base import UUIDModel


class EvaluationAnswer(UUIDModel):
    """
    EvaluationAnswer Model.

    Database Table: "evaluation"."answers"
    Description: Specific question responses within a survey submission
    """

    submission = models.ForeignKey(
        "evaluation.EvaluationSubmission",
        on_delete=models.CASCADE,
        db_column="submission_id",
        related_name="answers",
        db_comment="submission_id foreign key",
    )
    question = models.ForeignKey(
        "evaluation.EvaluationQuestion",
        on_delete=models.CASCADE,
        db_column="question_id",
        related_name="answers",
        db_comment="question_id foreign key",
    )
    numeric_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    answer_value = models.JSONField()
    text_comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."answers"'
        verbose_name = "Evaluation Answer"
        verbose_name_plural = "Evaluation Answers"

    def __str__(self) -> str:
        return f"EvaluationAnswer ({self.pk})"

    def __repr__(self) -> str:
        return f"<EvaluationAnswer {self.pk}>"
