from django.db import models

from common.models.base import UUIDModel


class ParentTeacherMessage(UUIDModel):
    """
    ParentTeacherMessage Model.

    Database Table: "notification"."parent_teacher_messages"
    Description: Encrypted home-school communication thread between parents and subject/homeroom teachers
    """

    student_id = models.UUIDField()
    guardian_id = models.UUIDField()
    teacher_id = models.UUIDField()
    sender_user_id = models.UUIDField()
    message_content = models.TextField()
    attachments = models.JSONField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"notification"."parent_teacher_messages"'
        verbose_name = "Parent Teacher Message"
        verbose_name_plural = "Parent Teacher Messages"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ParentTeacherMessage ({self.pk})"

    def __repr__(self) -> str:
        return f"<ParentTeacherMessage {self.pk}>"
