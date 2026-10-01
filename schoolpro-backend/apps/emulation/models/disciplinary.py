from django.db import models

from common.models.base import UUIDModel


class DisciplinaryRecord(UUIDModel):
    """
    DisciplinaryRecord Model.

    Database Table: "emulation"."disciplinary_records"
    Description: Formal disciplinary decisions and honorary citations
    """

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
        ordering = ["-incident_date"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<DisciplinaryRecord {self.pk}>"
