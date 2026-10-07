from django.db import models

from common.models.base import UUIDModel


class Permission(UUIDModel):
    """
    Permission Model.

    Database Table: "core"."permissions"
    Description: Atomic permission privileges for endpoint and UI access control
    """

    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    group_code = models.CharField(max_length=50)
    module = models.CharField(max_length=50, default="CORE")
    description = models.TextField(null=True, blank=True)
    is_dangerous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"core"."permissions"'
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        ordering = ["module", "group_code", "code"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"

    def __repr__(self) -> str:
        return f"<Permission {self.code}: {self.name}>"


class RolePermission(models.Model):
    """
    RolePermission Model.

    Database Table: "core"."role_permissions"
    Description: Many-to-many junction assigning permissions to security roles
    """

    role = models.ForeignKey(
        "core.Role",
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="role_permissions",
        primary_key=True,
        db_comment="role_id foreign key",
    )
    permission = models.ForeignKey(
        "core.Permission",
        on_delete=models.CASCADE,
        db_column="permission_id",
        related_name="role_permissions",
        db_comment="permission_id foreign key",
    )

    class Meta:
        managed = False
        db_table = '"core"."role_permissions"'
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"
        unique_together = (("role", "permission"),)

    def __str__(self) -> str:
        return f"RolePermission ({self.role_id} - {self.permission_id})"

    def __repr__(self) -> str:
        return f"<RolePermission {self.role_id}:{self.permission_id}>"
