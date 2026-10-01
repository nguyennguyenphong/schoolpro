import uuid

from django.db import models


class Permission(models.Model):
    """
    Permission Model.

    Database Table: "core"."permissions"
    Description: Atomic permission privileges for endpoint and UI access control
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(
        max_length=100,
    )
    name = models.CharField(
        max_length=255,
    )
    group_code = models.CharField(
        max_length=50,
    )
    description = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"core"."permissions"'
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self) -> str:
        return str(self.name)


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
        related_name="+",
        primary_key=True,
        db_comment="role_id foreign key",
    )
    permission = models.ForeignKey(
        "core.Permission",
        on_delete=models.CASCADE,
        db_column="permission_id",
        related_name="+",
        db_comment="permission_id foreign key",
    )

    class Meta:
        managed = False
        db_table = '"core"."role_permissions"'
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"
        unique_together = (("role", "permission"),)

    def __str__(self) -> str:
        return f"RolePermission ({self.pk})"
