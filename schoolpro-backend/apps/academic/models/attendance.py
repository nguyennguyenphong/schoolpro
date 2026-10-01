import uuid
from django.db import models


class Attendance(models.Model):
    """
    Attendance Model.

    Database Table: "academic"."attendance"
    Description: Daily student attendance roll-call tracking excuses and tardiness
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    class_id = models.UUIDField()
    attendance_date = models.DateField()
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.SET_NULL,
        db_column="period_id",
        related_name="+",
        null=True, blank=True, db_comment="period_id foreign key",
    )
    status = models.CharField(max_length=20, )
    note = models.TextField(null=True, blank=True)
    recorded_by = models.UUIDField()
    recorded_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."attendance"'
        verbose_name = "Attendance"
        verbose_name_plural = "Attendances"

    def __str__(self) -> str:
        return f"Attendance ({self.pk})"
