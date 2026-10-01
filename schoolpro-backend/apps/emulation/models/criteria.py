import uuid

from django.db import models


class Criteria(models.Model):
    """
    Criteria Model.

    Database Table: "emulation"."criteria"
    Description: Master emulation point criteria for weekly discipline, academics, and activities
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(
        max_length=60,
    )
    name = models.CharField(
        max_length=255,
    )
    category = models.CharField(
        max_length=50,
    )
    scope_type = models.CharField(
        max_length=50,
    )
    points = models.DecimalField(
        max_digits=6,
        decimal_places=2,
    )
    is_violation = models.BooleanField(default=False)
    applicable_role_id = models.UUIDField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."criteria"'
        verbose_name = "Emulation Criteria"
        verbose_name_plural = "Emulation Criterias"

    def __str__(self) -> str:
        return str(self.name)


class ClassCustomCriteria(models.Model):
    """
    ClassCustomCriteria Model.

    Database Table: "emulation"."class_custom_criteria"
    Description: Custom internal class emulation rules tailored for individual classrooms
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_id = models.UUIDField()
    code = models.CharField(
        max_length=50,
    )
    name = models.CharField(
        max_length=255,
    )
    points = models.DecimalField(
        max_digits=6,
        decimal_places=2,
    )
    is_violation = models.BooleanField(default=False)
    target_scope = models.CharField(
        max_length=20,
    )
    created_by = models.UUIDField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."class_custom_criteria"'
        verbose_name = "Class Custom Criteria"
        verbose_name_plural = "Class Custom Criterias"

    def __str__(self) -> str:
        return str(self.name)
