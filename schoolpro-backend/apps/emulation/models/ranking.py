import uuid

from django.db import models


class EmulationRanking(models.Model):
    """
    EmulationRanking Model.

    Database Table: "emulation"."rankings"
    Description: Periodic leaderboard standings and award flag determinations
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    period = models.ForeignKey(
        "emulation.EmulationPeriod",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="+",
        db_comment="period_id foreign key",
    )
    scope_type = models.CharField(
        max_length=50,
    )
    student_id = models.UUIDField(null=True, blank=True)
    class_group_id = models.UUIDField(null=True, blank=True)
    class_id = models.UUIDField(null=True, blank=True)
    grade_id = models.UUIDField(null=True, blank=True)
    base_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    bonus_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    penalty_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    final_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    rank_position = models.SmallIntegerField(null=True, blank=True)
    awarded_flag = models.CharField(max_length=50, null=True, blank=True)
    computed_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."rankings"'
        verbose_name = "Emulation Ranking"
        verbose_name_plural = "Emulation Rankings"

    def __str__(self) -> str:
        return f"EmulationRanking ({self.pk})"
