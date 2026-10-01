from django.db import models

from common.models.base import UUIDModel


class CustomFieldDefinition(UUIDModel):
    """
    CustomFieldDefinition Model.

    Database Table: "core"."custom_field_definitions"
    Description: Registry for dynamic entity custom fields without altering relational table schemas
    """

    entity_type = models.CharField(
        max_length=50,
    )
    field_code = models.CharField(
        max_length=60,
    )
    field_label = models.CharField(
        max_length=150,
    )
    data_type = models.CharField(
        max_length=30,
    )
    options = models.JSONField(null=True, blank=True)
    is_required = models.BooleanField(default=False)
    default_value = models.TextField(null=True, blank=True)
    display_order = models.SmallIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."custom_field_definitions"'
        verbose_name = "Custom Field Definition"
        verbose_name_plural = "Custom Field Definitions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"CustomFieldDefinition ({self.pk})"

    def __repr__(self) -> str:
        return f"<CustomFieldDefinition {self.pk}>"


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
        related_name="+",
        db_comment="field_id foreign key",
    )
    entity_id = models.UUIDField()
    field_value = models.TextField(null=True, blank=True)
    json_value = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."custom_field_values"'
        verbose_name = "Custom Field Value"
        verbose_name_plural = "Custom Field Values"

    def __str__(self) -> str:
        return f"CustomFieldValue ({self.pk})"

    def __repr__(self) -> str:
        return f"<CustomFieldValue {self.pk}>"
