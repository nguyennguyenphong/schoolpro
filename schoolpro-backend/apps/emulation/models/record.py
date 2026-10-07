from django.db import models

from common.models.base import UUIDModel


class EmulationRecord(UUIDModel):
    """
    EmulationRecord Model.

    Database Table: "emulation"."records"
    Description: Granular point journal for commendations, violations, and dispute lifecycle across all scopes
    """

    period = models.ForeignKey(
        "emulation.EmulationPeriod",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="records",
        db_comment="period_id foreign key",
    )
    criteria = models.ForeignKey(
        "emulation.Criteria",
        on_delete=models.SET_NULL,
        db_column="criteria_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="criteria_id foreign key",
    )
    class_criteria = models.ForeignKey(
        "emulation.ClassCustomCriteria",
        on_delete=models.SET_NULL,
        db_column="class_criteria_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="class_criteria_id foreign key",
    )
    scope_type = models.CharField(max_length=50)
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        null=True,
        blank=True,
        related_name="emulation_records",
        db_comment="student_id foreign key",
    )
    class_group = models.ForeignKey(
        "core.ClassGroup",
        on_delete=models.CASCADE,
        db_column="class_group_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="class_group_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        null=True,
        blank=True,
        related_name="emulation_records",
        db_comment="class_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="grade_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="grade_id foreign key",
    )
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="school_id foreign key",
    )
    points = models.DecimalField(max_digits=6, decimal_places=2)
    incident_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="CONFIRMED")
    evidence_url = models.TextField(null=True, blank=True)
    evidence_urls = models.JSONField(null=True, blank=True)
    dispute_reason = models.TextField(null=True, blank=True)
    disputed_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="disputed_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="disputed_by foreign key",
    )
    disputed_at = models.DateTimeField(null=True, blank=True)
    dispute_resolved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="dispute_resolved_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="dispute_resolved_by foreign key",
    )
    dispute_resolution = models.TextField(null=True, blank=True)
    dispute_resolved_at = models.DateTimeField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    recorded_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="recorded_by",
        related_name="+",
        db_comment="recorded_by foreign key",
    )
    recorded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."records"'
        verbose_name = "Emulation Record"
        verbose_name_plural = "Emulation Records"
        ordering = ["-recorded_at"]

    def __str__(self) -> str:
        return f"Record {self.pk} ({self.points} pts)"

    def __repr__(self) -> str:
        return f"<EmulationRecord {self.pk}: {self.points} pts>"
