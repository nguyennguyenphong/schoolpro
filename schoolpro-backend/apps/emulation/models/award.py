from django.db import models

from common.models.base import UUIDModel


class EmulationAward(UUIDModel):
    """
    EmulationAward Model.

    Database Table: "emulation"."awards"
    Description: Golden book of student accolades, Olympiad laureates, and state honors
    """

    student_id = models.UUIDField()
    academic_year_id = models.UUIDField()
    award_category = models.CharField(
        max_length=30,
    )
    level = models.CharField(
        max_length=20,
    )
    prize = models.CharField(
        max_length=30,
    )
    title = models.CharField(
        max_length=255,
    )
    decision_number = models.CharField(max_length=100, null=True, blank=True)
    decision_date = models.DateField()
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bonus_points = models.SmallIntegerField()
    signed_by = models.CharField(max_length=150, null=True, blank=True)
    certificate_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"emulation"."awards"'
        verbose_name = "Emulation Award"
        verbose_name_plural = "Emulation Awards"
        ordering = ["-awarded_date"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<EmulationAward {self.pk}>"
