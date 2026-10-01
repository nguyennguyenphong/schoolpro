from django.db import models

from common.models.base import UUIDModel


class AcademicYear(UUIDModel):
    """
    AcademicYear Model.

    Database Table: "core"."academic_years"
    Description: Master academic school years with active term indicators
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="academic_years",
        db_comment="school_id foreign key",
    )
    code = models.CharField(
        max_length=20,
    )
    name = models.CharField(
        max_length=100,
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."academic_years"'
        verbose_name = "Academic Year"
        verbose_name_plural = "Academic Years"
        ordering = ["-start_date"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<AcademicYear {self.pk}>"
