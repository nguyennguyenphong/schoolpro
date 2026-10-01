import uuid
from django.db import models


class Position(models.Model):
    """
    Position Model.

    Database Table: "core"."positions"
    Description: Master catalog of positions held by teachers, staff, or students across organizational scopes
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=60, )
    name = models.CharField(max_length=150, )
    scope_type = models.CharField(max_length=50, )
    applicable_role = models.ForeignKey(
        "core.Role",
        on_delete=models.SET_NULL,
        db_column="applicable_role_id",
        related_name="+",
        null=True, blank=True, db_comment="applicable_role_id foreign key",
    )
    max_holders = models.SmallIntegerField(null=True, blank=True)
    is_leadership = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"core"."positions"'
        verbose_name = "Position"
        verbose_name_plural = "Positions"

    def __str__(self) -> str:
        return str(self.name)
