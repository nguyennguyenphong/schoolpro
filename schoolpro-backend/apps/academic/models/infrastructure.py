from django.db import models

from common.models.base import UUIDModel


class Room(UUIDModel):
    """
    Room Model.

    Database Table: "academic"."rooms"
    Description: Master physical spaces, classrooms, laboratories, and specialized facilities
    """

    school_id = models.UUIDField()
    code = models.CharField(
        max_length=30,
    )
    name = models.CharField(
        max_length=100,
    )
    room_type = models.CharField(
        max_length=30,
    )
    capacity = models.SmallIntegerField(null=True, blank=True)
    building = models.CharField(max_length=100, null=True, blank=True)
    floor = models.SmallIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )

    class Meta:
        managed = False
        db_table = '"academic"."rooms"'
        verbose_name = "Room"
        verbose_name_plural = "Rooms"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Room {self.pk}>"


class Period(UUIDModel):
    """
    Period Model.

    Database Table: "academic"."periods"
    Description: Master daily bell schedule periods and shift time intervals for high school
    """

    school_id = models.UUIDField()
    period_no = models.SmallIntegerField()
    shift = models.CharField(
        max_length=10,
    )
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        managed = False
        db_table = '"academic"."periods"'
        verbose_name = "Period"
        verbose_name_plural = "Periods"
        ordering = ["period_number"]

    def __str__(self) -> str:
        return f"Period ({self.pk})"

    def __repr__(self) -> str:
        return f"<Period {self.pk}>"
