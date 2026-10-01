from django.db import models

from common.models.base import UUIDModel


class LookupType(UUIDModel):
    """
    LookupType Model.

    Database Table: "core"."lookup_types"
    Description: Master definition table for dynamic extensible enum categories
    """

    code = models.CharField(
        max_length=60,
    )
    name = models.CharField(
        max_length=150,
    )
    description = models.TextField(null=True, blank=True)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."lookup_types"'
        verbose_name = "Lookup Type"
        verbose_name_plural = "Lookup Types"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<LookupType {self.pk}>"


class LookupValue(UUIDModel):
    """
    LookupValue Model.

    Database Table: "core"."lookup_values"
    Description: Master dynamic values for lookup dropdowns, badges, and validation rules
    """

    lookup_type = models.ForeignKey(
        "master.LookupType",
        on_delete=models.CASCADE,
        db_column="lookup_type_id",
        related_name="values",
        db_comment="lookup_type_id foreign key",
    )
    code = models.CharField(
        max_length=60,
    )
    name = models.CharField(
        max_length=150,
    )
    order_no = models.SmallIntegerField()
    badge_color = models.CharField(max_length=30, null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."lookup_values"'
        verbose_name = "Lookup Value"
        verbose_name_plural = "Lookup Values"
        ordering = ["order_no"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<LookupValue {self.pk}>"
