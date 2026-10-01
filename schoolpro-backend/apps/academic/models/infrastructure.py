import uuid
from django.db import models


class Room(models.Model):
    """
    Room Model.

    Database Table: "academic"."rooms"
    Description: Master physical spaces, classrooms, laboratories, and specialized facilities
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_id = models.UUIDField()
    code = models.CharField(max_length=30, )
    name = models.CharField(max_length=100, )
    room_type = models.CharField(max_length=30, )
    capacity = models.SmallIntegerField(null=True, blank=True)
    building = models.CharField(max_length=100, null=True, blank=True)
    floor = models.SmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, )

    class Meta:
        managed = False
        db_table = '"academic"."rooms"'
        verbose_name = "Classroom / Hall"
        verbose_name_plural = "Classroom / Halls"

    def __str__(self) -> str:
        return str(self.name)


class Period(models.Model):
    """
    Period Model.

    Database Table: "academic"."periods"
    Description: Master daily bell schedule periods and shift time intervals for high school
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_id = models.UUIDField()
    period_no = models.SmallIntegerField()
    shift = models.CharField(max_length=10, )
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        managed = False
        db_table = '"academic"."periods"'
        verbose_name = "Class Period / Bell Schedule"
        verbose_name_plural = "Class Period / Bell Schedules"

    def __str__(self) -> str:
        return f"Period ({self.pk})"
