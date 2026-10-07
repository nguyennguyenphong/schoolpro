from django.db import models

from common.models.base import UUIDModel


class SupervisorDutyLog(UUIDModel):
    """
    SupervisorDutyLog Model.

    Database Table: "emulation"."supervisor_duty_logs"
    Description: Daily supervisor and red-flag brigade inspection evaluation checklists
    """

    period = models.ForeignKey(
        "emulation.EmulationPeriod",
        on_delete=models.CASCADE,
        db_column="period_id",
        null=True,
        blank=True,
        related_name="supervisor_duty_logs",
        db_comment="period_id foreign key",
    )
    duty_date = models.DateField()
    shift = models.CharField(max_length=10)
    supervisor = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="supervisor_id",
        related_name="supervisor_duty_logs",
        db_comment="supervisor_id foreign key",
    )
    red_flag_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="red_flag_student_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="red_flag_student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="duty_logs",
        db_comment="class_id foreign key",
    )
    cleanliness_score = models.DecimalField(
        max_digits=4, decimal_places=2, default=10.0, null=True, blank=True
    )
    orderliness_score = models.DecimalField(
        max_digits=4, decimal_places=2, default=10.0, null=True, blank=True
    )
    uniform_score = models.DecimalField(
        max_digits=4, decimal_places=2, default=10.0, null=True, blank=True
    )
    line_up_score = models.DecimalField(
        max_digits=4, decimal_places=2, default=10.0, null=True, blank=True
    )
    attendance_score = models.DecimalField(
        max_digits=4, decimal_places=2, default=10.0, null=True, blank=True
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=50.0, null=True, blank=True
    )
    evidence_urls = models.JSONField(null=True, blank=True)
    class_representative_signature = models.CharField(max_length=100, null=True, blank=True)
    disputed = models.BooleanField(default=False)
    dispute_reason = models.TextField(null=True, blank=True)
    general_feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."supervisor_duty_logs"'
        verbose_name = "Supervisor Duty Log"
        verbose_name_plural = "Supervisor Duty Logs"
        ordering = ["-duty_date", "shift"]

    def __str__(self) -> str:
        return f"DutyLog {self.duty_date} ({self.shift})"

    def __repr__(self) -> str:
        return f"<SupervisorDutyLog {self.pk}: {self.duty_date}>"
