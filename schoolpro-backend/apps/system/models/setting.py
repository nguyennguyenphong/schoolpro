from django.db import models

from common.models.base import UUIDModel


class SettingsDefinition(UUIDModel):
    """
    SettingsDefinition Model.

    Database Table: "sys"."settings_definitions"
    Description: Master registry of customizable application settings and appearance parameters
    """

    code = models.CharField(
        max_length=80,
    )
    name = models.CharField(
        max_length=150,
    )
    data_type = models.CharField(
        max_length=20,
    )
    default_value = models.TextField()
    allowed_values = models.JSONField(null=True, blank=True)
    scope = models.CharField(
        max_length=20,
    )
    category = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"sys"."settings_definitions"'
        verbose_name = "Settings Definition"
        verbose_name_plural = "Settings Definitions"
        ordering = ["key"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<SettingsDefinition {self.pk}>"


class SystemSetting(UUIDModel):
    """
    SystemSetting Model.

    Database Table: "sys"."system_settings"
    Description: School-wide default configuration parameters
    """

    school_id = models.UUIDField(null=True, blank=True)
    setting = models.ForeignKey(
        "system.SettingsDefinition",
        on_delete=models.CASCADE,
        db_column="setting_id",
        related_name="+",
        db_comment="setting_id foreign key",
    )
    value = models.TextField()
    updated_by = models.UUIDField(null=True, blank=True)
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"sys"."system_settings"'
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"SystemSetting ({self.pk})"

    def __repr__(self) -> str:
        return f"<SystemSetting {self.pk}>"


class RoleSettingsDefault(UUIDModel):
    """
    RoleSettingsDefault Model.

    Database Table: "sys"."role_settings_defaults"
    Description: Default setting values automatically inherited by members of a specific role
    """

    role_id = models.UUIDField()
    setting = models.ForeignKey(
        "system.SettingsDefinition",
        on_delete=models.CASCADE,
        db_column="setting_id",
        related_name="+",
        db_comment="setting_id foreign key",
    )
    value = models.TextField()

    class Meta:
        managed = False
        db_table = '"sys"."role_settings_defaults"'
        verbose_name = "Role Settings Default"
        verbose_name_plural = "Role Settings Defaults"
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"RoleSettingsDefault ({self.pk})"

    def __repr__(self) -> str:
        return f"<RoleSettingsDefault {self.pk}>"


class UserSetting(UUIDModel):
    """
    UserSetting Model.

    Database Table: "sys"."user_settings"
    Description: Top-priority user personalized setting values (theme, color, date format, notifications)
    """

    user_id = models.UUIDField()
    setting = models.ForeignKey(
        "system.SettingsDefinition",
        on_delete=models.CASCADE,
        db_column="setting_id",
        related_name="+",
        db_comment="setting_id foreign key",
    )
    value = models.TextField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"sys"."user_settings"'
        verbose_name = "User Setting"
        verbose_name_plural = "User Settings"
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"UserSetting ({self.pk})"

    def __repr__(self) -> str:
        return f"<UserSetting {self.pk}>"
