from django.db import models

from common.models.base import UUIDModel


class AcademicYear(UUIDModel):
    """
    AcademicYear Model.

    Database Table: "core"."academic_years"
    Description: Master academic school years with active term indicators and audit locks
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="academic_years",
        db_comment="school_id foreign key",
    )
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    enrollment_target = models.IntegerField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="locked_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="locked_by foreign key",
    )
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."academic_years"'
        verbose_name = "Academic Year"
        verbose_name_plural = "Academic Years"
        ordering = ["-start_date", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<AcademicYear {self.code}: {self.name}>"
