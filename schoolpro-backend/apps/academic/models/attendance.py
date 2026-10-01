from django.db import models

from common.models.base import UUIDModel


class Attendance(UUIDModel):
    """
    Attendance Model.

    Database Table: "academic"."attendance"
    Description: Daily student attendance roll-call tracking excuses and tardiness
    """

    student_id = models.UUIDField()
    class_id = models.UUIDField()
    attendance_date = models.DateField()
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.SET_NULL,
        db_column="period_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="period_id foreign key",
    )
    status = models.CharField(
        max_length=20,
    )
    note = models.TextField(null=True, blank=True)
    recorded_by = models.UUIDField()
    recorded_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."attendance"'
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"

    def __str__(self) -> str:
        return f"Attendance ({self.pk})"

    def __repr__(self) -> str:
        return f"<Attendance {self.pk}>"
