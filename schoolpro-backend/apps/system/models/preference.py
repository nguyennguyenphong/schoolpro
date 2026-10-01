import uuid
from django.db import models


class UserModulePreference(models.Model):
    """
    UserModulePreference Model.

    Database Table: "sys"."user_module_preferences"
    Description: User-specific personalized overrides for dashboard card arrangement and visibility
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()
    module = models.ForeignKey(
        "system.Module",
        on_delete=models.CASCADE,
        db_column="module_id",
        related_name="+",
        db_comment="module_id foreign key",
    )
    is_pinned = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    order_no = models.SmallIntegerField(null=True, blank=True)
    custom_config = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"sys"."user_module_preferences"'
        verbose_name = "User Module Preference"
        verbose_name_plural = "User Module Preferences"

    def __str__(self) -> str:
        return f"UserModulePreference ({self.pk})"
