from django.db import models

from common.models.base import UUIDModel


class PushToken(UUIDModel):
    """
    PushToken Model.

    Database Table: "notification"."push_tokens"
    Description: Registered FCM/APNs push notification endpoints per device
    """

    user_id = models.UUIDField()
    device_token = models.TextField()
    platform = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"notification"."push_tokens"'
        verbose_name = "Push Token"
        verbose_name_plural = "Push Tokens"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"PushToken ({self.pk})"

    def __repr__(self) -> str:
        return f"<PushToken {self.pk}>"
