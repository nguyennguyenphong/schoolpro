from django.db import models

from common.models.base import UUIDModel


class DisciplinaryRecord(UUIDModel):
    """
    DisciplinaryRecord Model.

    Database Table: "emulation"."disciplinary_records"
    Description: Formal disciplinary decisions and honorary citations
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="disciplinary_records",
        db_comment="student_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        null=True,
        blank=True,
        related_name="disciplinary_records",
        db_comment="academic_year_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="disciplinary_records",
        db_comment="semester_id foreign key",
    )
    record_type = models.CharField(max_length=20)
    level = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    decision_no = models.CharField(max_length=100, null=True, blank=True)
    decision_date = models.DateField()
    incident_date = models.DateField(null=True, blank=True)
    council_meeting_date = models.DateField(null=True, blank=True)
    suspension_days = models.SmallIntegerField(default=0, null=True, blank=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    rehabilitation_status = models.CharField(max_length=20, default="IN_PROGRESS")
    rehabilitation_note = models.TextField(null=True, blank=True)
    parent_notified = models.BooleanField(default=False)
    parent_acknowledged_at = models.DateTimeField(null=True, blank=True)
    conduct_impact = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    signed_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="signed_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="signed_by foreign key",
    )
    attachment_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."disciplinary_records"'
        verbose_name = "Disciplinary Record"
        verbose_name_plural = "Disciplinary Records"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<DisciplinaryRecord {self.pk}: {self.title}>"
