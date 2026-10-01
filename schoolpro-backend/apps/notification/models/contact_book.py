from django.db import models

from common.models.base import UUIDModel


class ContactBookNote(UUIDModel):
    """
    ContactBookNote Model.

    Database Table: "notification"."contact_book_notes"
    Description: Structured electronic communication logbook between homeroom teachers and parents
    """

    student_id = models.UUIDField()
    class_id = models.UUIDField()
    semester_id = models.UUIDField()
    period_type = models.CharField(
        max_length=20,
    )
    period_label = models.CharField(
        max_length=50,
    )
    academic_digest = models.JSONField(null=True, blank=True)
    attendance_digest = models.JSONField(null=True, blank=True)
    emulation_digest = models.JSONField(null=True, blank=True)
    teacher_remarks = models.TextField(null=True, blank=True)
    parent_viewed_at = models.DateTimeField(null=True, blank=True)
    parent_acknowledged = models.BooleanField(default=False)
    parent_feedback = models.TextField(null=True, blank=True)
    created_by = models.UUIDField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"notification"."contact_book_notes"'
        verbose_name = "Contact Book Note"
        verbose_name_plural = "Contact Book Notes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ContactBookNote ({self.pk})"

    def __repr__(self) -> str:
        return f"<ContactBookNote {self.pk}>"
