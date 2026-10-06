from django.db import models

from common.models.base import UUIDModel


class Room(UUIDModel):
    """
    Room Model.

    Database Table: "academic"."rooms"
    Description: Master physical spaces, classrooms, laboratories, and specialized facilities
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="rooms",
        db_comment="school_id foreign key",
    )
    code = models.CharField(max_length=30)
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=30, default="CLASSROOM")
    capacity = models.SmallIntegerField(null=True, blank=True)
    building = models.CharField(max_length=100, null=True, blank=True)
    floor = models.SmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, default="AVAILABLE")
    area_sqm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    has_projector = models.BooleanField(default=True)
    has_air_conditioner = models.BooleanField(default=False)
    has_camera = models.BooleanField(default=False)
    has_audio_system = models.BooleanField(default=False)
    qr_checkin_code = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."rooms"'
        verbose_name = "Room"
        verbose_name_plural = "Rooms"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Room {self.code}: {self.name}>"


class Period(UUIDModel):
    """
    Period Model.

    Database Table: "academic"."periods"
    Description: Master daily bell schedule periods and shift time intervals for high school
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="periods",
        db_comment="school_id foreign key",
    )
    period_no = models.SmallIntegerField()
    shift = models.CharField(max_length=10, default="MORNING")
    name = models.CharField(max_length=100, null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)
    break_duration_minutes = models.SmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."periods"'
        verbose_name = "Period"
        verbose_name_plural = "Periods"
        ordering = ["shift", "period_no"]

    def __str__(self) -> str:
        return f"Tiết {self.period_no} ({self.shift})"

    def __repr__(self) -> str:
        return f"<Period {self.shift} #{self.period_no}>"
