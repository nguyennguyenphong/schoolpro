from django.db import models

from common.models.base import UUIDModel


class EmulationPeriod(UUIDModel):
    """
    EmulationPeriod Model.

    Database Table: "emulation"."periods"
    Description: Configured tracking intervals for point accumulation and leaderboard calculation
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="emulation_periods",
        db_comment="school_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="emulation_periods",
        db_comment="academic_year_id foreign key",
    )
    code = models.CharField(max_length=60)
    name = models.CharField(max_length=150)
    week_number = models.SmallIntegerField(null=True, blank=True)
    theme_title = models.CharField(max_length=255, null=True, blank=True)
    period_type = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()
    is_closed = models.BooleanField(default=False)
    closed_at = models.DateTimeField(null=True, blank=True)
    closed_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="closed_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="closed_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."periods"'
        verbose_name = "Emulation Period"
        verbose_name_plural = "Emulation Periods"
        ordering = ["start_date"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<EmulationPeriod {self.code}: {self.name}>"
