from django.db import models

from common.models.base import UUIDModel


class Role(UUIDModel):
    """
    Role Model.

    Database Table: "core"."roles"
    Description: Dynamic role definitions allowing new administrative or student roles at any time
    """

    code = models.CharField(
        max_length=50,
    )
    name = models.CharField(
        max_length=150,
    )
    description = models.TextField(null=True, blank=True)
    badge_color = models.CharField(max_length=30, null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)
    is_system = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."roles"'
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Role {self.pk}>"


class UserRole(UUIDModel):
    """
    UserRole Model.

    Database Table: "core"."user_roles"
    Description: User-to-role assignment with primary role flag and expiration dates
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="user_roles",
        db_comment="user_id foreign key",
    )
    role = models.ForeignKey(
        "core.Role",
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="user_roles",
        db_comment="role_id foreign key",
    )
    is_primary = models.BooleanField(default=False)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."user_roles"'
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"UserRole ({self.pk})"

    def __repr__(self) -> str:
        return f"<UserRole {self.pk}>"
