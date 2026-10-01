import uuid
from django.db import models


class Announcement(models.Model):
    """
    Announcement Model.

    Database Table: "notification"."announcements"
    Description: Official school news bulletins, grade circulars, and class notices
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_id = models.UUIDField()
    title = models.CharField(max_length=255, )
    summary = models.TextField(null=True, blank=True)
    content = models.TextField()
    category = models.CharField(max_length=50, )
    target_type = models.CharField(max_length=20, )
    target_grade_id = models.UUIDField(null=True, blank=True)
    target_class_id = models.UUIDField(null=True, blank=True)
    target_role_id = models.UUIDField(null=True, blank=True)
    target_user_id = models.UUIDField(null=True, blank=True)
    priority = models.CharField(max_length=10, )
    attachments = models.JSONField(null=True, blank=True)
    published_by = models.UUIDField()
    published_at = models.DateTimeField()
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"notification"."announcements"'
        verbose_name = "Announcement"
        verbose_name_plural = "Announcements"

    def __str__(self) -> str:
        return str(self.title)


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
        related_name="+",
        primary_key=True, db_comment="announcement_id foreign key",
    )
    user_id = models.UUIDField(db_column="user_id")
    read_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"notification"."announcement_reads"'
        verbose_name = "Announcement Read"
        verbose_name_plural = "Announcement Reads"
        unique_together = (('announcement', 'user_id'),)

    def __str__(self) -> str:
        return f"AnnouncementRead ({self.pk})"
