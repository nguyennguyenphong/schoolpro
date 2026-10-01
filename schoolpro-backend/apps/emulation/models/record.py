import uuid
from django.db import models


class EmulationRecord(models.Model):
    """
    EmulationRecord Model.

    Database Table: "emulation"."records"
    Description: Granular point journal for commendations and violations across all scopes
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    period = models.ForeignKey(
        "emulation.EmulationPeriod",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="+",
        db_comment="period_id foreign key",
    )
    criteria = models.ForeignKey(
        "emulation.Criteria",
        on_delete=models.SET_NULL,
        db_column="criteria_id",
        related_name="+",
        null=True, blank=True, db_comment="criteria_id foreign key",
    )
    class_criteria = models.ForeignKey(
        "emulation.ClassCustomCriteria",
        on_delete=models.SET_NULL,
        db_column="class_criteria_id",
        related_name="+",
        null=True, blank=True, db_comment="class_criteria_id foreign key",
    )
    scope_type = models.CharField(max_length=50, )
    student_id = models.UUIDField(null=True, blank=True)
    class_group_id = models.UUIDField(null=True, blank=True)
    class_id = models.UUIDField(null=True, blank=True)
    grade_id = models.UUIDField(null=True, blank=True)
    school_id = models.UUIDField(null=True, blank=True)
    points = models.DecimalField(max_digits=6, decimal_places=2, )
    evidence_url = models.TextField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    recorded_by = models.UUIDField()
    recorded_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."records"'
        verbose_name = "Emulation Record"
        verbose_name_plural = "Emulation Records"

    def __str__(self) -> str:
        return f"EmulationRecord ({self.pk})"
