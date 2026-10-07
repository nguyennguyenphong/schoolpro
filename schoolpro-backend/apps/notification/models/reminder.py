from django.contrib.postgres.fields import ArrayField
from django.db import models

from common.models.base import UUIDModel


class Reminder(UUIDModel):
    """
    Reminder Model.

    Database Table: "notification"."reminders"
    Description: Personal task reminders for upcoming homework deadlines, exam dates, and cleaning duty
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="reminders",
    )
    title = models.CharField(
        max_length=255,
    )
    content = models.TextField(null=True, blank=True)
    remind_at = models.DateTimeField()
    priority = models.CharField(max_length=10, default="NORMAL")
    repeat_interval = models.CharField(max_length=20, default="NONE")
    channels = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
    )
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    related_entity = models.CharField(max_length=80, null=True, blank=True)
    related_id = models.UUIDField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    done_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
