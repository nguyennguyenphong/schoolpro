from django.db import models

from common.models.base import UUIDModel


class PushToken(UUIDModel):
    """
    PushToken Model.

    Database Table: "notification"."push_tokens"
    Description: Mobile and web push notification device registry (FCM / APNs)
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="push_tokens",
        db_comment="user_id foreign key",
    )
    device_token = models.TextField(unique=True)
    device_id = models.CharField(max_length=100, null=True, blank=True)
    device_name = models.CharField(max_length=150, null=True, blank=True)
    os_version = models.CharField(max_length=50, null=True, blank=True)
    app_version = models.CharField(max_length=30, null=True, blank=True)
    platform = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"notification"."push_tokens"'
        verbose_name = "Push Token"
        verbose_name_plural = "Push Tokens"
        ordering = ["-last_used_at"]

    def __str__(self) -> str:
        return f"PushToken ({self.pk})"

    def __repr__(self) -> str:
        return f"<PushToken {self.pk}>"
