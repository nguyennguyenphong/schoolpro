from django.db import models

from common.models.base import UUIDModel


class ExtracurricularActivity(UUIDModel):
    """
    ExtracurricularActivity Model.

    Database Table: "academic"."extracurricular_activities"
    Description: Experiential and vocational orientation activities under Giáo dục phổ thông 2018
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="activities",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
    )
    title = models.CharField(max_length=255)
    activity_type = models.CharField(max_length=30, default="EXPERIENTIAL")
    status = models.CharField(max_length=20, default="SCHEDULED")
    organizer_unit = models.CharField(max_length=150)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    registration_start = models.DateTimeField(null=True, blank=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    banner_image_url = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    cost_per_student = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    emulation_bonus_points = models.SmallIntegerField(default=0)
    max_participants = models.IntegerField(null=True, blank=True)
    target_grades = models.ForeignKey(
        "master.Grade",
        on_delete=models.SET_NULL,
        db_column="target_grades",
        null=True,
        blank=True,
        related_name="+",
    )
    attachments = models.JSONField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        related_name="participants",
        db_comment="activity_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="activity_participations",
        db_comment="student_id foreign key",
    )
    role = models.CharField(max_length=50, default="PARTICIPANT")
    attendance_status = models.CharField(max_length=20, default="REGISTERED")
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_in_method = models.CharField(max_length=20, null=True, blank=True)
    bonus_points_awarded = models.SmallIntegerField(default=0)
    evaluation_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    student_reflection = models.TextField(null=True, blank=True)
    submission_attachments = models.JSONField(null=True, blank=True)
    achievement_note = models.CharField(max_length=255, null=True, blank=True)
    certificate_url = models.TextField(null=True, blank=True)
    verified_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="verified_by",
        null=True,
        blank=True,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."activity_participations"'
        verbose_name = "Activity Participation"
        verbose_name_plural = "Activity Participations"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ActivityParticipation ({self.activity_id} - {self.student_id})"

    def __repr__(self) -> str:
        return f"<ActivityParticipation {self.pk}>"
