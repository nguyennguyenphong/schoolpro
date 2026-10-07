from django.db import models

from common.models.base import UUIDModel


class CustomFieldDefinition(UUIDModel):
    """
    CustomFieldDefinition Model.

    Database Table: "core"."custom_field_definitions"
    Description: Registry for dynamic entity custom fields without altering relational table schemas
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="custom_fields",
        db_comment="school_id foreign key (NULL for system-wide)",
    )
    entity_type = models.CharField(max_length=50)
    field_code = models.CharField(max_length=60, blank=True)
    field_label = models.CharField(max_length=150)
    data_type = models.CharField(max_length=30)
    options = models.JSONField(null=True, blank=True)
    validation_regex = models.CharField(max_length=255, null=True, blank=True)
    placeholder = models.CharField(max_length=255, null=True, blank=True)
    tooltip = models.TextField(null=True, blank=True)
    is_required = models.BooleanField(default=False)
    default_value = models.TextField(null=True, blank=True)
    display_order = models.SmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."custom_field_definitions"'
        verbose_name = "Custom Field Definition"
        verbose_name_plural = "Custom Field Definitions"
        ordering = ["entity_type", "display_order"]

    def __str__(self) -> str:
        return f"{self.field_label} ({self.field_code})"

    def __repr__(self) -> str:
        return f"<CustomFieldDefinition {self.field_code}: {self.field_label}>"


class CustomFieldValue(UUIDModel):
    """
    CustomFieldValue Model.

    Database Table: "core"."custom_field_values"
    Description: Values stored for custom dynamic attributes per individual entity record
    """

    field = models.ForeignKey(
        "core.CustomFieldDefinition",
        on_delete=models.CASCADE,
        db_column="field_id",
        related_name="values",
        db_comment="field_id foreign key",
    )
    entity_id = models.UUIDField()
    field_value = models.TextField(null=True, blank=True)
    json_value = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."custom_field_values"'
        verbose_name = "Custom Field Value"
        verbose_name_plural = "Custom Field Values"

    def __str__(self) -> str:
        return f"CustomFieldValue ({self.pk})"

    def __repr__(self) -> str:
        return f"<CustomFieldValue {self.pk}>"
