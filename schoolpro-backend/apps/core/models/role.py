import uuid
from django.db import models


class Role(models.Model):
    """
    Role Model.

    Database Table: "core"."roles"
    Description: Dynamic role definitions allowing new administrative or student roles at any time
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, )
    name = models.CharField(max_length=150, )
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

    def __str__(self) -> str:
        return str(self.name)


class UserRole(models.Model):
    """
    UserRole Model.

    Database Table: "core"."user_roles"
    Description: User-to-role assignment with primary role flag and expiration dates
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="+",
        db_comment="user_id foreign key",
    )
    role = models.ForeignKey(
        "core.Role",
        on_delete=models.CASCADE,
        db_column="role_id",
        related_name="+",
        db_comment="role_id foreign key",
    )
    is_primary = models.BooleanField(default=False)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."user_roles"'
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"

    def __str__(self) -> str:
        return f"UserRole ({self.pk})"
