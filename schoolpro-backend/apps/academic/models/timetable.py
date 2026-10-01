from django.db import models

from common.models.base import UUIDModel


class Timetable(UUIDModel):
    """
    Timetable Model.

    Database Table: "academic"."timetables"
    Description: Weekly recurring timetable schedule slots by class, day of week, period, and venue
    """

    class_id = models.UUIDField()
    semester_id = models.UUIDField()
    day_of_week = models.SmallIntegerField()
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="+",
        db_comment="period_id foreign key",
    )
    class_subject_teacher_id = models.UUIDField()
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="room_id foreign key",
    )
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"academic"."timetables"'
        verbose_name = "Timetable"
        verbose_name_plural = "Timetables"
        ordering = ["day_of_week", "period"]

    def __str__(self) -> str:
        return f"Timetable ({self.pk})"

    def __repr__(self) -> str:
        return f"<Timetable {self.pk}>"


class TimetableChange(UUIDModel):
    """
    TimetableChange Model.

    Database Table: "academic"."timetable_changes"
    Description: Daily operational substitutions and room change logs
    """

    timetable = models.ForeignKey(
        "academic.Timetable",
        on_delete=models.CASCADE,
        db_column="timetable_id",
        related_name="+",
        db_comment="timetable_id foreign key",
    )
    change_date = models.DateField()
    change_type = models.CharField(
        max_length=20,
    )
    new_teacher_id = models.UUIDField(null=True, blank=True)
    new_room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="new_room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="new_room_id foreign key",
    )
    reason = models.TextField(null=True, blank=True)
    approved_by = models.UUIDField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."timetable_changes"'
        verbose_name = "Timetable Change"
        verbose_name_plural = "Timetable Changes"
        ordering = ["-change_date"]

    def __str__(self) -> str:
        return f"TimetableChange ({self.pk})"

    def __repr__(self) -> str:
        return f"<TimetableChange {self.pk}>"
