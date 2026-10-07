from django.db import models

from common.models.base import UUIDModel


class SettingsDefinition(UUIDModel):
    """
    SettingsDefinition Model.

    Database Table: "sys"."settings_definitions"
    Description: Master registry of customizable application settings and appearance parameters
    """

    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=150)
    data_type = models.CharField(max_length=20)
    default_value = models.TextField()
    allowed_values = models.JSONField(null=True, blank=True)
    scope = models.CharField(max_length=20, default="USER")
    category = models.CharField(max_length=50, default="APPEARANCE", null=True, blank=True)
    ui_component = models.CharField(max_length=50, default="INPUT")
    display_order = models.SmallIntegerField(default=0)
    validation_rule = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."settings_definitions"'
        verbose_name = "Settings Definition"
        verbose_name_plural = "Settings Definitions"
        ordering = ["display_order", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<SettingsDefinition {self.pk}: {self.code}>"


class SystemSetting(UUIDModel):
    """
    SystemSetting Model.

    Database Table: "sys"."system_settings"
    Description: Campus and system-wide setting configurations
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="system_settings",
        null=True,
        blank=True,
        db_comment="school_id foreign key",
    )
    setting = models.ForeignKey(
        "system.SettingsDefinition",
        on_delete=models.CASCADE,
        db_column="setting_id",
        related_name="system_settings",
        db_comment="setting_id foreign key",
    )
    value = models.TextField()
    is_public = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)
    updated_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="updated_by",
        related_name="+",
        null=True,
        blank=True,
        db_comment="updated_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."system_settings"'
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"
        unique_together = (("school", "setting"),)

    def __str__(self) -> str:
        return f"SystemSetting {self.setting_id} = {self.value[:30]}"

    def __repr__(self) -> str:
        return f"<SystemSetting {self.pk}>"


class RoleSettingsDefault(UUIDModel):
    """
    RoleSettingsDefault Model.

    Database Table: "sys"."role_settings_defaults"
    Description: Default setting overrides defined at the role level
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="role_settings_defaults",
        null=True,
        blank=True,
        db_comment="school_id foreign key",
    )
    role = models.ForeignKey(
        "core.Role",
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="role_settings_defaults",
        db_comment="role_id foreign key",
    )
    setting = models.ForeignKey(
        "system.SettingsDefinition",
        on_delete=models.CASCADE,
        db_column="setting_id",
        related_name="role_settings_defaults",
        db_comment="setting_id foreign key",
    )
    value = models.TextField()
    is_enforced = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."role_settings_defaults"'
        verbose_name = "Role Settings Default"
        verbose_name_plural = "Role Settings Defaults"
        unique_together = (("school", "role", "setting"),)

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

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="user_settings",
        db_comment="user_id foreign key",
    )
    setting = models.ForeignKey(
        "system.SettingsDefinition",
        on_delete=models.CASCADE,
        db_column="setting_id",
        related_name="user_settings",
        db_comment="setting_id foreign key",
    )
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."user_settings"'
        verbose_name = "User Setting"
        verbose_name_plural = "User Settings"
        unique_together = (("user", "setting"),)

    def __str__(self) -> str:
        return f"UserSetting {self.user_id} - {self.setting_id}"

    def __repr__(self) -> str:
        return f"<UserSetting {self.pk}>"
