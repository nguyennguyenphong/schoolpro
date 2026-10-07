from django.db import models

from common.models.base import UUIDModel


class Criteria(UUIDModel):
    """
    Criteria Model.

    Database Table: "emulation"."criteria"
    Description: Master emulation point criteria for weekly discipline, academics, and activities
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="emulation_criteria",
        db_comment="school_id foreign key",
    )
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, default="DISCIPLINE")
    scope_type = models.CharField(max_length=50)
    points = models.DecimalField(max_digits=6, decimal_places=2)
    is_violation = models.BooleanField(default=False)
    severity_level = models.CharField(max_length=20, default="MINOR")
    is_repeated_penalty = models.BooleanField(default=False)
    applicable_role = models.ForeignKey(
        "core.Role",
        on_delete=models.SET_NULL,
        db_column="applicable_role_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="applicable_role_id foreign key",
    )
    icon = models.CharField(max_length=50, default="award")
    order_no = models.SmallIntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."criteria"'
        verbose_name = "Emulation Criterion"
        verbose_name_plural = "Emulation Criteria"
        ordering = ["category", "order_no", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Criteria {self.code}: {self.name}>"


class ClassCustomCriteria(UUIDModel):
    """
    ClassCustomCriteria Model.

    Database Table: "emulation"."class_custom_criteria"
    Description: Custom internal class emulation rules tailored for individual classrooms
    """

    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="custom_criteria",
        db_comment="class_id foreign key",
    )
    code = models.CharField(max_length=60)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, default="BEHAVIOR")
    points = models.DecimalField(max_digits=6, decimal_places=2)
    is_violation = models.BooleanField(default=False)
    max_points_per_week = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    target_scope = models.CharField(max_length=20, default="INDIVIDUAL")
    description = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="created_by",
        related_name="+",
        db_comment="created_by foreign key",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."class_custom_criteria"'
        verbose_name = "Class Custom Criterion"
        verbose_name_plural = "Class Custom Criteria"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<ClassCustomCriteria {self.code}: {self.name}>"
