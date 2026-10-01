import uuid
from django.db import models


class EvaluationForm(models.Model):
    """
    EvaluationForm Model.

    Database Table: "evaluation"."forms"
    Description: Survey questionnaires for confidential pedagogical reviews and campus satisfaction
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=60, )
    name = models.CharField(max_length=255, )
    target_type = models.CharField(max_length=30, )
    description = models.TextField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"evaluation"."forms"'
        verbose_name = "Evaluation Form"
        verbose_name_plural = "Evaluation Forms"

    def __str__(self) -> str:
        return str(self.name)
