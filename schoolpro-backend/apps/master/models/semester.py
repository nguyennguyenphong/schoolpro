from django.db import models

from common.models.base import UUIDModel


class Semester(UUIDModel):
    """
    Semester Model.

    Database Table: "core"."semesters"
    Description: Master academic semesters (Term 1, Term 2, Summer) with date boundaries and gradebook deadlines
    """

    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="semesters",
        db_comment="academic_year_id foreign key",
    )
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    order_no = models.SmallIntegerField(default=1)
    weeks_count = models.SmallIntegerField(default=18)
    start_date = models.DateField()
    end_date = models.DateField()
    gradebook_lock_date = models.DateField(null=True, blank=True)
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."semesters"'
        verbose_name = "Semester"
        verbose_name_plural = "Semesters"
        ordering = ["academic_year", "order_no"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Semester {self.code}: {self.name}>"
