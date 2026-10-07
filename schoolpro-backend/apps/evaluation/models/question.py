from django.db import models

from common.models.base import UUIDModel


class EvaluationQuestion(UUIDModel):
    """
    EvaluationQuestion Model.

    Database Table: "evaluation"."questions"
    Description: Itemized survey questions for rating teaching methods, fairness, clarity, and facilities
    """

    form = models.ForeignKey(
        "evaluation.EvaluationForm",
        on_delete=models.CASCADE,
        db_column="form_id",
        related_name="questions",
        db_comment="form_id foreign key",
    )
    section_name = models.CharField(max_length=100, null=True, blank=True)
    question_text = models.TextField()
    description = models.TextField(null=True, blank=True)
    question_type = models.CharField(max_length=20, default="RATING_1_5")
    options = models.JSONField(null=True, blank=True)
    weight = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    min_rating = models.SmallIntegerField(default=1, null=True, blank=True)
    max_rating = models.SmallIntegerField(default=5, null=True, blank=True)
    rating_labels = models.JSONField(null=True, blank=True)
    order_no = models.SmallIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."questions"'
        verbose_name = "Evaluation Question"
        verbose_name_plural = "Evaluation Questions"
        ordering = ["order_no"]

    def __str__(self) -> str:
        return f"EvaluationQuestion ({self.pk})"

    def __repr__(self) -> str:
        return f"<EvaluationQuestion {self.pk}>"
