from django.db import models

from common.models.base import UUIDModel


class EvaluationSubmission(UUIDModel):
    """
    EvaluationSubmission Model.

    Database Table: "evaluation"."submissions"
    Description: Form submission header linking student response to target teacher/facility
    """

    form = models.ForeignKey(
        "evaluation.EvaluationForm",
        on_delete=models.CASCADE,
        db_column="form_id",
        related_name="submissions",
        db_comment="form_id foreign key",
    )
    submitted_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="submitted_by",
        related_name="evaluation_submissions",
        db_comment="submitted_by foreign key",
    )
    target_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="target_teacher_id",
        null=True,
        blank=True,
        related_name="evaluations_received",
        db_comment="target_teacher_id foreign key",
    )
    target_facility = models.ForeignKey(
        "evaluation.Facility",
        on_delete=models.SET_NULL,
        db_column="target_facility_id",
        related_name="evaluations",
        null=True,
        blank=True,
        db_comment="target_facility_id foreign key",
    )
    target_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="target_class_id",
        null=True,
        blank=True,
        related_name="evaluations",
        db_comment="target_class_id foreign key",
    )
    target_service = models.CharField(max_length=100, null=True, blank=True)
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="evaluation_submissions",
        db_comment="semester_id foreign key",
    )
    total_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback_summary = models.TextField(null=True, blank=True)
    ip_hash = models.CharField(max_length=64, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."submissions"'
        verbose_name = "Evaluation Submission"
        verbose_name_plural = "Evaluation Submissions"
        ordering = ["-submitted_at"]

    def __str__(self) -> str:
        return f"EvaluationSubmission ({self.pk})"

    def __repr__(self) -> str:
        return f"<EvaluationSubmission {self.pk}>"
