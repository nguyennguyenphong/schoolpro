from django.db import models

from common.models.base import UUIDModel


class ParentTeacherMessage(UUIDModel):
    """
    ParentTeacherMessage Model.

    Database Table: "notification"."parent_teacher_messages"
    Description: Direct bilateral communication channel between parents and teachers
    """

    conversation_id = models.UUIDField(null=True, blank=True)
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="parent_teacher_messages",
        db_comment="student_id foreign key",
    )
    guardian = models.ForeignKey(
        "core.Guardian",
        on_delete=models.CASCADE,
        db_column="guardian_id",
        related_name="messages_sent_received",
        db_comment="guardian_id foreign key",
    )
    teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.CASCADE,
        db_column="teacher_id",
        related_name="messages_sent_received",
        db_comment="teacher_id foreign key",
    )
    sender_user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="sender_user_id",
        related_name="+",
        db_comment="sender_user_id foreign key",
    )
    message_type = models.CharField(max_length=20, default="TEXT")
    message_content = models.TextField()
    leave_request_data = models.JSONField(null=True, blank=True)
    leave_approved_status = models.CharField(max_length=20, default="NONE")
    reply_to_message = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        db_column="reply_to_message_id",
        null=True,
        blank=True,
        related_name="replies",
        db_comment="reply_to_message_id foreign key",
    )
    attachments = models.JSONField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"notification"."parent_teacher_messages"'
        verbose_name = "Parent Teacher Message"
        verbose_name_plural = "Parent Teacher Messages"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"ParentTeacherMessage ({self.pk})"

    def __repr__(self) -> str:
        return f"<ParentTeacherMessage {self.pk}>"
