from django.db import models

from common.models.base import UUIDModel


class ClassJournalEntry(UUIDModel):
    """
    ClassJournalEntry Model.

    Database Table: "academic"."class_journal_entries"
    Description: Official electronic class journal recording syllabus progress, attendance, and period rating
    """

    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="journal_entries",
        db_comment="class_id foreign key",
    )
    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.CASCADE,
        db_column="class_subject_teacher_id",
        related_name="journal_entries",
        db_comment="class_subject_teacher_id foreign key",
    )
    timetable = models.ForeignKey(
        "academic.Timetable",
        on_delete=models.SET_NULL,
        db_column="timetable_id",
        null=True,
        blank=True,
        related_name="+",
    )
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.SET_NULL,
        db_column="period_id",
        null=True,
        blank=True,
        related_name="+",
    )
    session_date = models.DateField()
    period_no = models.SmallIntegerField()
    lesson_curriculum_number = models.SmallIntegerField(null=True, blank=True)
    lesson_title = models.CharField(max_length=255)
    present_count = models.SmallIntegerField(default=0)
    absent_count = models.SmallIntegerField(default=0)
    absent_names = models.TextField(null=True, blank=True)
    lesson_rating = models.CharField(max_length=5, default="A")
    emulation_score = models.SmallIntegerField(default=10)
    homework_assigned = models.TextField(null=True, blank=True)
    commended_students = models.TextField(null=True, blank=True)
    disciplined_students = models.TextField(null=True, blank=True)
    is_substitute = models.BooleanField(default=False)
    substitute_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="substitute_teacher_id",
        null=True,
        blank=True,
        related_name="+",
    )
    teacher_feedback = models.TextField(null=True, blank=True)
    student_monitor_signature = models.CharField(max_length=100, null=True, blank=True)
    teacher_signature_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="SUBMITTED")
    verified_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="verified_by",
        null=True,
        blank=True,
        related_name="+",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."class_journal_entries"'
        verbose_name = "Class Journal Entry"
        verbose_name_plural = "Class Journal Entries"
        ordering = ["-session_date", "period_no"]

    def __str__(self) -> str:
        return f"Sổ đầu bài ({self.school_class_id}: {self.session_date} tiết {self.period_no})"

    def __repr__(self) -> str:
        return f"<ClassJournalEntry {self.pk}>"
