from django.db import models

from common.models.base import UUIDModel


class Position(UUIDModel):
    """
    Position Model.

    Database Table: "core"."positions"
    Description: Master catalog of positions held by teachers, staff, or students across organizational scopes
    """

    code = models.CharField(
        max_length=60,
    )
    name = models.CharField(
        max_length=150,
    )
    scope_type = models.CharField(
        max_length=50,
    )
    applicable_role = models.ForeignKey(
        "core.Role",
        on_delete=models.SET_NULL,
        db_column="applicable_role_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="applicable_role_id foreign key",
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
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Position {self.pk}>"
