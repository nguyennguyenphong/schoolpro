from django.db import models

from common.models.base import UUIDModel


class Position(UUIDModel):
    """
    Position Model.

    Database Table: "core"."positions"
    Description: Master catalog of positions held by teachers, staff, or students across organizational scopes
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="positions",
        db_comment="school_id foreign key (NULL for system positions)",
    )
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=150)
    scope_type = models.CharField(max_length=50)
    applicable_role = models.ForeignKey(
        "core.Role",
        on_delete=models.SET_NULL,
        db_column="applicable_role_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="applicable_role_id foreign key",
    )
    default_allowance_coefficient = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.00, null=True, blank=True
    )
    max_holders = models.SmallIntegerField(null=True, blank=True)
    order_no = models.SmallIntegerField(default=0)
    is_leadership = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."positions"'
        verbose_name = "Position"
        verbose_name_plural = "Positions"
        ordering = ["order_no", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Position {self.code}: {self.name}>"
