import uuid

from django.db import models


class EvaluationQuestion(models.Model):
    """
    EvaluationQuestion Model.

    Database Table: "evaluation"."questions"
    Description: Itemized survey questions for rating teaching methods, fairness, and clarity
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        "evaluation.EvaluationForm",
        on_delete=models.CASCADE,
        db_column="form_id",
        related_name="+",
        db_comment="form_id foreign key",
    )
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
    )
    options = models.JSONField(null=True, blank=True)
    order_no = models.SmallIntegerField()
    is_required = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"evaluation"."questions"'
        verbose_name = "Evaluation Question"
        verbose_name_plural = "Evaluation Questions"

    def __str__(self) -> str:
        return f"EvaluationQuestion ({self.pk})"
