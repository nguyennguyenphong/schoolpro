import uuid

from django.db import models


class DisciplinaryRecord(models.Model):
    """
    DisciplinaryRecord Model.

    Database Table: "emulation"."disciplinary_records"
    Description: Formal disciplinary decisions and honorary citations
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    record_type = models.CharField(
        max_length=20,
    )
    level = models.CharField(
        max_length=50,
    )
    title = models.CharField(
        max_length=255,
    )
    decision_no = models.CharField(max_length=100, null=True, blank=True)
    decision_date = models.DateField()
    conduct_impact = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    signed_by = models.UUIDField(null=True, blank=True)
    attachment_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."disciplinary_records"'
        verbose_name = "Disciplinary Record"
        verbose_name_plural = "Disciplinary Records"

    def __str__(self) -> str:
        return str(self.title)
