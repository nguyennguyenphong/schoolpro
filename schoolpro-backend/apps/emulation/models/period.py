import uuid

from django.db import models


class EmulationPeriod(models.Model):
    """
    EmulationPeriod Model.

    Database Table: "emulation"."periods"
    Description: Configured tracking intervals for point accumulation and leaderboard calculation
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year_id = models.UUIDField()
    code = models.CharField(
        max_length=30,
    )
    name = models.CharField(
        max_length=150,
    )
    period_type = models.CharField(
        max_length=20,
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_closed = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"emulation"."periods"'
        verbose_name = "Emulation Period"
        verbose_name_plural = "Emulation Periods"

    def __str__(self) -> str:
        return str(self.name)
