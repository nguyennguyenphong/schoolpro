from django.db import models

from common.models.base import UUIDModel


class Timetable(UUIDModel):
    """
    Timetable Model.

    Database Table: "academic"."timetables"
    Description: Weekly recurring timetable schedule slots by class, day of week, period, and venue
    """

    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="timetables",
        db_comment="class_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
        db_comment="semester_id foreign key",
    )
    day_of_week = models.SmallIntegerField()
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="+",
        db_comment="period_id foreign key",
    )
    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.CASCADE,
        db_column="class_subject_teacher_id",
        related_name="timetables",
        db_comment="class_subject_teacher_id foreign key",
    )
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="room_id foreign key",
    )
    class_type = models.CharField(
        max_length=20,
        default="THEORY",
    )
    learning_mode = models.CharField(
        max_length=20,
        default="OFFLINE",
    )
    is_online = models.BooleanField(
        default=False,
    )
    online_url = models.CharField(
        max_length=500,
        null=True,
        blank=True,
    )
    meeting_passcode = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )
    lesson_topic = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )
    curriculum_material_ids = models.JSONField(
        default=list,
        blank=True,
    )
    notes = models.TextField(
        null=True,
        blank=True,
    )
    color_theme = models.CharField(
        max_length=30,
        default="blue",
        null=True,
        blank=True,
    )
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    settings = models.JSONField(
        default=dict,
        blank=True,
    )

    class Meta:
        managed = False
        db_table = '"academic"."timetables"'
        verbose_name = "Timetable"
        verbose_name_plural = "Timetables"

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
        related_name="changes",
        db_comment="timetable_id foreign key",
    )
    change_date = models.DateField()
    change_type = models.CharField(
        max_length=20,
    )
    substitute_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="new_teacher_id",
        related_name="timetable_substitutions",
        null=True,
        blank=True,
    )
    new_room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="new_room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="new_room_id foreign key",
    )
    new_period = models.ForeignKey(
        "academic.Period",
        on_delete=models.SET_NULL,
        db_column="new_period_id",
        related_name="+",
        null=True,
        blank=True,
    )
    reason = models.TextField(null=True, blank=True)
    requested_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="requested_by",
        related_name="+",
        null=True,
        blank=True,
    )
    requested_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="approved_by",
        related_name="+",
        null=True,
        blank=True,
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        default="PENDING",
    )
    is_notified_to_class = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."timetable_changes"'
        verbose_name = "Timetable Change"
        verbose_name_plural = "Timetable Changes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"TimetableChange ({self.pk})"

    def __repr__(self) -> str:
        return f"<TimetableChange {self.pk}>"
