from django.db import models

from common.models.base import UUIDModel


class LookupType(UUIDModel):
    """
    LookupType Model.

    Database Table: "core"."lookup_types"
    Description: Master definition table for dynamic extensible enum categories
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="lookup_types",
        db_comment="school_id foreign key (NULL for system-wide lookup types)",
    )
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    is_hierarchical = models.BooleanField(default=False)
    is_system = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."lookup_types"'
        verbose_name = "Lookup Type"
        verbose_name_plural = "Lookup Types"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<LookupType {self.code}: {self.name}>"


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
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        db_column="parent_id",
        null=True,
        blank=True,
        related_name="children",
        db_comment="parent_id foreign key (hierarchical parent item)",
    )
    code = models.CharField(max_length=60)
    name = models.CharField(max_length=150)
    short_name = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    order_no = models.SmallIntegerField(default=0)
    badge_color = models.CharField(max_length=30, null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."lookup_values"'
        verbose_name = "Lookup Value"
        verbose_name_plural = "Lookup Values"
        ordering = ["lookup_type", "order_no"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<LookupValue {self.code}: {self.name}>"
