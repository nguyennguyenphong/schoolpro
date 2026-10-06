from django.db import models

from common.models.base import UUIDModel


class Announcement(UUIDModel):
    """
    Announcement Model.

    Database Table: "notification"."announcements"
    Description: Official school news bulletins, grade circulars, and class notices
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="announcements",
        db_comment="school_id foreign key",
    )
    title = models.CharField(max_length=255)
    summary = models.TextField(null=True, blank=True)
    content = models.TextField()
    category = models.CharField(max_length=50, default="ACADEMIC")
    status = models.CharField(max_length=20, default="PUBLISHED")
    target_type = models.CharField(max_length=20)
    target_grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="target_grade_id",
        null=True,
        blank=True,
        related_name="announcements",
    )
    target_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="target_class_id",
        null=True,
        blank=True,
        related_name="announcements",
    )
    target_role = models.ForeignKey(
        "core.Role",
        on_delete=models.CASCADE,
        db_column="target_role_id",
        null=True,
        blank=True,
        related_name="announcements",
    )
    target_user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="target_user_id",
        null=True,
        blank=True,
        related_name="received_announcements",
    )
    priority = models.CharField(max_length=10, default="NORMAL")
    is_pinned = models.BooleanField(default=False)
    pinned_until = models.DateTimeField(null=True, blank=True)
    channels = models.JSONField(default=list, blank=True)
    send_push = models.BooleanField(default=True)
    send_email = models.BooleanField(default=False)
    send_sms = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    department = models.CharField(max_length=100, null=True, blank=True)
    attachments = models.JSONField(null=True, blank=True)
    export_template_code = models.CharField(max_length=100, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    published_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="published_by",
        related_name="published_announcements",
    )
    published_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"notification"."announcements"'
        verbose_name = "Announcement"
        verbose_name_plural = "Announcements"
        ordering = ["-is_pinned", "-published_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<Announcement {self.pk}: {self.title}>"


class AnnouncementRead(models.Model):
    """
    AnnouncementRead Model.

    Database Table: "notification"."announcement_reads"
    Description: Proof-of-read receipt log for official school notifications
    """

    announcement = models.ForeignKey(
        "notification.Announcement",
        on_delete=models.CASCADE,
        db_column="announcement_id",
        related_name="read_receipts",
        db_comment="announcement_id foreign key",
    )
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="announcement_reads",
        db_comment="user_id foreign key",
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"notification"."announcement_reads"'
        verbose_name = "Announcement Read Receipt"
        verbose_name_plural = "Announcement Read Receipts"
        unique_together = (("announcement", "user"),)

    def __str__(self) -> str:
        return f"Read receipt for announcement {self.announcement_id} by {self.user_id}"
