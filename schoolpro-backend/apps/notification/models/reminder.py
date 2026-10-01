from django.db import models

from common.models.base import UUIDModel


class Reminder(UUIDModel):
    """
    Reminder Model.

    Database Table: "notification"."reminders"
    Description: Personal task reminders for upcoming homework deadlines, exam dates, and cleaning duty
    """

    user_id = models.UUIDField()
    title = models.CharField(
        max_length=255,
    )
    content = models.TextField(null=True, blank=True)
    remind_at = models.DateTimeField()
    related_entity = models.CharField(max_length=80, null=True, blank=True)
    related_id = models.UUIDField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"notification"."reminders"'
        verbose_name = "Reminder"
        verbose_name_plural = "Reminders"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<Reminder {self.pk}>"
