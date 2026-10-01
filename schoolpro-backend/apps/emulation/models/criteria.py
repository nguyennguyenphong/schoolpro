from django.db import models

from common.models.base import UUIDModel


class Criteria(UUIDModel):
    """
    Criteria Model.

    Database Table: "emulation"."criteria"
    Description: Master emulation point criteria for weekly discipline, academics, and activities
    """

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
        verbose_name = "Emulation Criterion"
        verbose_name_plural = "Emulation Criteria"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Criteria {self.pk}>"


class ClassCustomCriteria(UUIDModel):
    """
    ClassCustomCriteria Model.

    Database Table: "emulation"."class_custom_criteria"
    Description: Custom internal class emulation rules tailored for individual classrooms
    """

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
        verbose_name = "Class Custom Criterion"
        verbose_name_plural = "Class Custom Criteria"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<ClassCustomCriteria {self.pk}>"
