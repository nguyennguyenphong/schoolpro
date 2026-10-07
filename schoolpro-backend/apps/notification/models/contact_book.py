from django.contrib.postgres.fields import ArrayField
from django.db import models

from common.models.base import UUIDModel


class ContactBookNote(UUIDModel):
    """
    ContactBookNote Model.

    Database Table: "notification"."contact_book_notes"
    Description: Structured electronic communication logbook between homeroom teachers and parents
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="contact_book_notes",
        db_comment="school_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="contact_book_notes",
        db_comment="student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="contact_book_notes",
        db_comment="class_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="contact_book_notes",
        db_comment="semester_id foreign key",
    )
    guardian = models.ForeignKey(
        "core.Guardian",
        on_delete=models.SET_NULL,
        db_column="guardian_id",
        null=True,
        blank=True,
        related_name="contact_book_notes",
        db_comment="guardian_id foreign key",
    )
    period_type = models.CharField(max_length=20, default="WEEKLY")
    period_label = models.CharField(max_length=50)
    academic_digest = models.JSONField(null=True, blank=True)
    attendance_digest = models.JSONField(null=True, blank=True)
    emulation_digest = models.JSONField(null=True, blank=True)
    health_digest = models.JSONField(null=True, blank=True)
    extracurricular_digest = models.JSONField(null=True, blank=True)
    upcoming_events = models.JSONField(null=True, blank=True)
    teacher_remarks = models.TextField(null=True, blank=True)
    delivery_channels = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    is_sent_sms = models.BooleanField(default=False)
    is_sent_zalo = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default="PUBLISHED")
    parent_viewed_at = models.DateTimeField(null=True, blank=True)
    parent_acknowledged = models.BooleanField(default=False)
    parent_feedback = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="created_by",
        related_name="+",
        db_comment="created_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"notification"."contact_book_notes"'
        verbose_name = "Contact Book Note"
        verbose_name_plural = "Contact Book Notes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ContactBookNote {self.student_id} - {self.period_label}"

    def __repr__(self) -> str:
        return f"<ContactBookNote {self.pk}: {self.student_id}>"
