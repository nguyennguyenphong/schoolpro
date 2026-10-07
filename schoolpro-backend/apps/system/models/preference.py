from django.db import models

from common.models.base import UUIDModel


class UserModulePreference(UUIDModel):
    """
    UserModulePreference Model.

    Database Table: "sys"."user_module_preferences"
    Description: User-specific personalized overrides for dashboard card arrangement and visibility
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="module_preferences",
        db_comment="user_id foreign key",
    )
    module = models.ForeignKey(
        "system.Module",
        on_delete=models.CASCADE,
        db_column="module_id",
        related_name="user_preferences",
        db_comment="module_id foreign key",
    )
    custom_title = models.CharField(max_length=150, null=True, blank=True)
    custom_color = models.CharField(max_length=30, null=True, blank=True)
    custom_col_span = models.SmallIntegerField(null=True, blank=True)
    custom_row_span = models.SmallIntegerField(null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    order_no = models.SmallIntegerField(null=True, blank=True)
    custom_config = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."user_module_preferences"'
        verbose_name = "User Module Preference"
        verbose_name_plural = "User Module Preferences"
        ordering = ["order_no"]
        unique_together = (("user", "module"),)

    def __str__(self) -> str:
        return f"UserModulePreference {self.user_id} - {self.module_id}"

    def __repr__(self) -> str:
        return f"<UserModulePreference {self.pk}>"
