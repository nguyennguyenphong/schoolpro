from django.db import models

from common.models.base import UUIDModel


class Semester(UUIDModel):
    """
    Semester Model.

    Database Table: "core"."semesters"
    Description: Master academic semesters (Term 1, Term 2, Summer) with date boundaries
    """

    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="semesters",
        db_comment="academic_year_id foreign key",
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
        db_table = '"core"."semesters"'
        verbose_name = "Semester"
        verbose_name_plural = "Semesters"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Semester {self.pk}>"
