from django.db import models

from common.models.base import UUIDModel


class SupervisorDutyLog(UUIDModel):
    """
    SupervisorDutyLog Model.

    Database Table: "emulation"."supervisor_duty_logs"
    Description: Daily supervisor and red-flag brigade inspection evaluation checklists
    """

    duty_date = models.DateField()
    shift = models.CharField(
        max_length=10,
    )
    supervisor_id = models.UUIDField()
    class_id = models.UUIDField()
    cleanliness_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    orderliness_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    uniform_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    general_feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."supervisor_duty_logs"'
        verbose_name = "Supervisor Duty Log"
        verbose_name_plural = "Supervisor Duty Logs"
        ordering = ["-duty_date"]

    def __str__(self) -> str:
        return f"SupervisorDutyLog ({self.pk})"

    def __repr__(self) -> str:
        return f"<SupervisorDutyLog {self.pk}>"
