from django.db import models

from common.models.base import UUIDModel


class ExtracurricularActivity(UUIDModel):
    """
    ExtracurricularActivity Model.

    Database Table: "academic"."extracurricular_activities"
    Description: Experiential and vocational orientation activities under GDPT 2018
    """

    school_id = models.UUIDField()
    semester_id = models.UUIDField()
    title = models.CharField(
        max_length=255,
    )
    activity_type = models.CharField(
        max_length=30,
    )
    organizer_unit = models.CharField(
        max_length=150,
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    emulation_bonus_points = models.SmallIntegerField()
    max_participants = models.IntegerField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."extracurricular_activities"'
        verbose_name = "Extracurricular Activity"
        verbose_name_plural = "Extracurricular Activities"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<ExtracurricularActivity {self.pk}>"


class ActivityParticipation(UUIDModel):
    """
    ActivityParticipation Model.

    Database Table: "academic"."activity_participations"
    Description: Individual student participation logs in experiential and extracurricular activities
    """

    activity = models.ForeignKey(
        "academic.ExtracurricularActivity",
        on_delete=models.CASCADE,
        db_column="activity_id",
        related_name="+",
        db_comment="activity_id foreign key",
    )
    student_id = models.UUIDField()
    role = models.CharField(
        max_length=50,
    )
    attendance_status = models.CharField(
        max_length=20,
    )
    bonus_points_awarded = models.SmallIntegerField()
    achievement_note = models.CharField(max_length=255, null=True, blank=True)
    certificate_url = models.TextField(null=True, blank=True)
    verified_by = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."activity_participations"'
        verbose_name = "Activity Participation"
        verbose_name_plural = "Activity Participations"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ActivityParticipation ({self.pk})"

    def __repr__(self) -> str:
        return f"<ActivityParticipation {self.pk}>"
