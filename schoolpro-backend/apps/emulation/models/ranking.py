from django.db import models

from common.models.base import UUIDModel


class EmulationRanking(UUIDModel):
    """
    EmulationRanking Model.

    Database Table: "emulation"."rankings"
    Description: Periodic leaderboard standings and award flag determinations
    """

    period = models.ForeignKey(
        "emulation.EmulationPeriod",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="rankings",
        db_comment="period_id foreign key",
    )
    scope_type = models.CharField(max_length=50)
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        null=True,
        blank=True,
        related_name="emulation_rankings",
        db_comment="student_id foreign key",
    )
    class_group = models.ForeignKey(
        "core.ClassGroup",
        on_delete=models.CASCADE,
        db_column="class_group_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="class_group_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        null=True,
        blank=True,
        related_name="emulation_rankings",
        db_comment="class_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="grade_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="grade_id foreign key",
    )
    base_score = models.DecimalField(max_digits=8, decimal_places=2, default=100.0)
    bonus_score = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    penalty_score = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    final_score = models.DecimalField(max_digits=8, decimal_places=2)
    rank_position = models.SmallIntegerField(null=True, blank=True)
    previous_rank = models.SmallIntegerField(null=True, blank=True)
    rank_change = models.SmallIntegerField(default=0)
    awarded_flag = models.CharField(max_length=50, null=True, blank=True)
    reward_title = models.CharField(max_length=100, null=True, blank=True)
    reward_cash = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, null=True, blank=True
    )
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    computed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"emulation"."rankings"'
        verbose_name = "Emulation Ranking"
        verbose_name_plural = "Emulation Rankings"
        ordering = ["period", "rank_position"]

    def __str__(self) -> str:
        return f"Ranking #{self.rank_position} ({self.final_score})"

    def __repr__(self) -> str:
        return f"<EmulationRanking {self.pk}: #{self.rank_position}>"
