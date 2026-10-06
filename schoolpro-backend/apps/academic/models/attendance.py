from django.db import models

from common.models.base import UUIDModel


class Attendance(UUIDModel):
    """
    Attendance Model.

    Database Table: "academic"."attendance"
    Description: Daily student attendance roll-call tracking excuses and tardiness
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="attendance_records",
        db_comment="student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="attendance_records",
        db_comment="class_id foreign key",
    )
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
    status = models.CharField(max_length=20, default="PRESENT")
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    method = models.CharField(max_length=30, default="TEACHER_APP")
    device_id = models.CharField(max_length=100, null=True, blank=True)
    excuse_reason = models.TextField(null=True, blank=True)
    excuse_document_url = models.TextField(null=True, blank=True)
    is_parent_notified = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    recorded_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="recorded_by",
        related_name="+",
    )
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"academic"."attendance"'
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"
        ordering = ["-attendance_date", "period"]

    def __str__(self) -> str:
        return f"Attendance ({self.student_id}: {self.status} on {self.attendance_date})"

    def __repr__(self) -> str:
        return f"<Attendance {self.pk}>"
