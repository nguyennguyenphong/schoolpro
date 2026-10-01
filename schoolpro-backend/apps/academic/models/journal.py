import uuid
from django.db import models


class ClassJournalEntry(models.Model):
    """
    ClassJournalEntry Model.

    Database Table: "academic"."class_journal_entries"
    Description: Official electronic class journal recording syllabus progress, attendance, and period rating
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_id = models.UUIDField()
    class_subject_teacher_id = models.UUIDField()
    session_date = models.DateField()
    period_no = models.SmallIntegerField()
    lesson_title = models.CharField(max_length=255, )
    present_count = models.SmallIntegerField()
    absent_count = models.SmallIntegerField()
    absent_names = models.TextField(null=True, blank=True)
    lesson_rating = models.CharField(max_length=5, )
    teacher_feedback = models.TextField(null=True, blank=True)
    teacher_signature_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."class_journal_entries"'
        verbose_name = "Class Journal Entry"
        verbose_name_plural = "Class Journal Entrys"

    def __str__(self) -> str:
        return f"ClassJournalEntry ({self.pk})"
