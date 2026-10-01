import uuid
from django.db import models


class Module(models.Model):
    """
    Module Model.

    Database Table: "sys"."modules"
    Description: Master functional card modules available for personalized role-based dashboards
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=80, )
    name = models.CharField(max_length=150, )
    short_name = models.CharField(max_length=80, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=100, )
    route = models.CharField(max_length=255, )
    module_type = models.CharField(max_length=20, )
    category = models.CharField(max_length=50, )
    default_color = models.CharField(max_length=30, null=True, blank=True)
    default_badge = models.CharField(max_length=50, null=True, blank=True)
    component_name = models.CharField(max_length=100, null=True, blank=True)
    parent_module = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        db_column="parent_module_id",
        related_name="+",
        null=True, blank=True, db_comment="parent_module_id foreign key",
    )
    default_order_no = models.SmallIntegerField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"sys"."modules"'
        verbose_name = "System Module"
        verbose_name_plural = "System Modules"

    def __str__(self) -> str:
        return str(self.name)


class RoleModule(models.Model):
    """
    RoleModule Model.

    Database Table: "sys"."role_modules"
    Description: Default dashboard functional card layout and accessibility mapped per user role
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role_id = models.UUIDField()
    module = models.ForeignKey(
        "system.Module",
        on_delete=models.CASCADE,
        db_column="module_id",
        related_name="+",
        db_comment="module_id foreign key",
    )
    is_visible = models.BooleanField(default=False)
    is_pinned_default = models.BooleanField(default=False)
    order_no = models.SmallIntegerField()
    grid_col_span = models.SmallIntegerField(null=True, blank=True)
    custom_badge = models.CharField(max_length=50, null=True, blank=True)
    config = models.JSONField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"sys"."role_modules"'
        verbose_name = "Role Module Access"
        verbose_name_plural = "Role Module Accesss"

    def __str__(self) -> str:
        return f"RoleModule ({self.pk})"
