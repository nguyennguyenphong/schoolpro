from django.db import models

from common.models.base import UUIDModel


class Module(UUIDModel):
    """
    Module Model.

    Database Table: "sys"."modules"
    Description: Master functional card modules available for personalized role-based dashboards
    """

    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=150)
    short_name = models.CharField(max_length=80, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=100)
    route = models.CharField(max_length=255)
    module_type = models.CharField(max_length=20, default="CARD")
    category = models.CharField(max_length=50, default="ACADEMIC")
    required_permission = models.CharField(max_length=100, null=True, blank=True)
    is_mobile_visible = models.BooleanField(default=True)
    is_desktop_visible = models.BooleanField(default=True)
    badge_count_api = models.CharField(max_length=255, null=True, blank=True)
    default_color = models.CharField(max_length=30, default="#3B82F6", null=True, blank=True)
    default_badge = models.CharField(max_length=50, null=True, blank=True)
    component_name = models.CharField(max_length=100, null=True, blank=True)
    parent_module = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        db_column="parent_module_id",
        related_name="sub_modules",
        null=True,
        blank=True,
        db_comment="parent_module_id foreign key",
    )
    default_order_no = models.SmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."modules"'
        verbose_name = "System Module"
        verbose_name_plural = "System Modules"
        ordering = ["default_order_no", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Module {self.pk}: {self.code}>"


class RoleModule(UUIDModel):
    """
    RoleModule Model.

    Database Table: "sys"."role_modules"
    Description: Default dashboard functional card layout and accessibility mapped per user role
    """

    role = models.ForeignKey(
        "core.Role",
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="role_modules",
        db_comment="role_id foreign key",
    )
    module = models.ForeignKey(
        "system.Module",
        on_delete=models.CASCADE,
        db_column="module_id",
        related_name="role_modules",
        db_comment="module_id foreign key",
    )
    is_visible = models.BooleanField(default=True)
    is_pinned_default = models.BooleanField(default=False)
    order_no = models.SmallIntegerField(default=0)
    grid_col_span = models.SmallIntegerField(default=1)
    grid_row_span = models.SmallIntegerField(default=1)
    min_screen_width = models.CharField(max_length=20, default="ALL")
    can_hide = models.BooleanField(default=True)
    custom_badge = models.CharField(max_length=50, null=True, blank=True)
    config = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"sys"."role_modules"'
        verbose_name = "Role Module Access"
        verbose_name_plural = "Role Module Accesses"
        ordering = ["order_no"]
        unique_together = (("role", "module"),)

    def __str__(self) -> str:
        return f"RoleModule {self.role_id} - {self.module_id}"

    def __repr__(self) -> str:
        return f"<RoleModule {self.pk}>"
