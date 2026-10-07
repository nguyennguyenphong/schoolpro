from django.db import models

from common.models.base import UUIDModel


class EvaluationForm(UUIDModel):
    """
    EvaluationForm Model.

    Database Table: "evaluation"."forms"
    Description: Survey questionnaires for confidential pedagogical reviews, student feedback, and campus satisfaction
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="evaluation_forms",
        db_comment="school_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="evaluation_forms",
        db_comment="semester_id foreign key",
    )
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, default="PEDAGOGICAL")
    target_type = models.CharField(max_length=30)
    target_audience = models.CharField(max_length=30, default="STUDENT")
    description = models.TextField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=True)
    allow_multiple_submissions = models.BooleanField(default=False)
    pass_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=80.00, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="created_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="created_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."forms"'
        verbose_name = "Evaluation Form"
        verbose_name_plural = "Evaluation Forms"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<EvaluationForm {self.code}: {self.name}>"
