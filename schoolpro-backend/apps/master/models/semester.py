import uuid
from django.db import models


class Semester(models.Model):
    """
    Semester Model.

    Database Table: "core"."semesters"
    Description: Master academic semesters (Term 1, Term 2, Summer) with date boundaries
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="+",
        db_comment="academic_year_id foreign key",
    )
    code = models.CharField(max_length=20, )
    name = models.CharField(max_length=100, )
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

    def __str__(self) -> str:
        return str(self.name)
