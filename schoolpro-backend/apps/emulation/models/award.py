from django.db import models

from common.models.base import UUIDModel


class EmulationAward(UUIDModel):
    """
    EmulationAward Model.

    Database Table: "emulation"."awards"
    Description: Golden book of student accolades, Olympiad laureates, and state honors
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="emulation_awards",
        db_comment="student_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="emulation_awards",
        db_comment="academic_year_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="emulation_awards",
        db_comment="semester_id foreign key",
    )
    award_category = models.CharField(max_length=30, default="ACADEMIC")
    level = models.CharField(max_length=20, default="SCHOOL")
    prize = models.CharField(max_length=30, default="FIRST_PRIZE")
    contest_name = models.CharField(max_length=255, null=True, blank=True)
    organizer_name = models.CharField(max_length=200, null=True, blank=True)
    coach_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="coach_teacher_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="coach_teacher_id foreign key",
    )
    title = models.CharField(max_length=255)
    decision_number = models.CharField(max_length=100, null=True, blank=True)
    decision_date = models.DateField()
    certificate_code = models.CharField(max_length=100, null=True, blank=True)
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bonus_points = models.SmallIntegerField(default=10)
    signed_by = models.CharField(max_length=150, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    certificate_url = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."awards"'
        verbose_name = "Emulation Award"
        verbose_name_plural = "Emulation Awards"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<EmulationAward {self.pk}: {self.title}>"
