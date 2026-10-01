from django.db import models

from common.models.base import UUIDModel


class EvaluationSubmission(UUIDModel):
    """
    EvaluationSubmission Model.

    Database Table: "evaluation"."submissions"
    Description: Header record for submitted survey responses
    """

    form = models.ForeignKey(
        "evaluation.EvaluationForm",
        on_delete=models.CASCADE,
        db_column="form_id",
        related_name="+",
        db_comment="form_id foreign key",
    )
    submitted_by = models.UUIDField()
    target_teacher_id = models.UUIDField(null=True, blank=True)
    target_facility = models.ForeignKey(
        "evaluation.Facility",
        on_delete=models.SET_NULL,
        db_column="target_facility_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="target_facility_id foreign key",
    )
    semester_id = models.UUIDField(null=True, blank=True)
    submitted_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"evaluation"."submissions"'
        verbose_name = "Evaluation Submission"
        verbose_name_plural = "Evaluation Submissions"

    def __str__(self) -> str:
        return f"EvaluationSubmission ({self.pk})"

    def __repr__(self) -> str:
        return f"<EvaluationSubmission {self.pk}>"
