from django.db import models

from common.models.base import UUIDModel


class Role(UUIDModel):
    """
    Role Model.

    Database Table: "core"."roles"
    Description: Dynamic role definitions allowing new administrative or student roles at any time
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="roles",
        db_comment="school_id foreign key (NULL for system-wide roles)",
    )
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    badge_color = models.CharField(max_length=30, default="#2563EB")
    icon = models.CharField(max_length=50, default="user")
    priority = models.SmallIntegerField(default=0)
    is_system = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."roles"'
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ["-priority", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Role {self.code}: {self.name}>"


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
    status = models.CharField(max_length=20, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

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
