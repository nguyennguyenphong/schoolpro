import uuid
from django.db import models


class Reminder(models.Model):
    """
    Reminder Model.

    Database Table: "notification"."reminders"
    Description: Personal task reminders for upcoming homework deadlines, exam dates, and cleaning duty
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()
    title = models.CharField(max_length=255, )
    content = models.TextField(null=True, blank=True)
    remind_at = models.DateTimeField()
    related_entity = models.CharField(max_length=80, null=True, blank=True)
    related_id = models.UUIDField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"notification"."reminders"'
        verbose_name = "Student Reminder"
        verbose_name_plural = "Student Reminders"

    def __str__(self) -> str:
        return str(self.title)
