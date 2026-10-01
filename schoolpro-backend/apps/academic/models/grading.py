import uuid
from django.db import models


class ScoreType(models.Model):
    """
    ScoreType Model.

    Database Table: "academic"."score_types"
    Description: Master evaluation score columns and calculation coefficients per MOET Circular 22
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=30, )
    name = models.CharField(max_length=100, )
    coefficient = models.SmallIntegerField()
    min_evaluations = models.SmallIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"academic"."score_types"'
        verbose_name = "Score Type"
        verbose_name_plural = "Score Types"

    def __str__(self) -> str:
        return str(self.name)


class ConductEvaluation(models.Model):
    """
    ConductEvaluation Model.

    Database Table: "academic"."conduct_evaluations"
    Description: Official student moral and behavioral conduct evaluation workflow (Tốt, Khá, Đạt, Chưa đạt)
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    semester_id = models.UUIDField()
    self_rating = models.CharField(max_length=20, null=True, blank=True)
    class_vote_rating = models.CharField(max_length=20, null=True, blank=True)
    emulation_demerit_points = models.SmallIntegerField()
    homeroom_teacher_rating = models.CharField(max_length=20, )
    final_rating = models.CharField(max_length=20, )
    homeroom_comments = models.TextField(null=True, blank=True)
    principal_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=20, )
    evaluated_by = models.UUIDField()
    evaluated_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."conduct_evaluations"'
        verbose_name = "Conduct Evaluation"
        verbose_name_plural = "Conduct Evaluations"

    def __str__(self) -> str:
        return f"ConductEvaluation ({self.pk})"


class SubjectExemption(models.Model):
    """
    SubjectExemption Model.

    Database Table: "academic"."subject_exemptions"
    Description: Authorized medical waivers, military drill exemptions, and international certificate conversions
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    subject_id = models.UUIDField()
    semester_id = models.UUIDField()
    exemption_type = models.CharField(max_length=30, )
    reason = models.TextField()
    certificate_name = models.CharField(max_length=100, null=True, blank=True)
    certificate_score = models.CharField(max_length=50, null=True, blank=True)
    converted_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    decision_number = models.CharField(max_length=100, null=True, blank=True)
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    approved_by = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."subject_exemptions"'
        verbose_name = "Subject Exemption"
        verbose_name_plural = "Subject Exemptions"

    def __str__(self) -> str:
        return f"SubjectExemption ({self.pk})"


class StudentScore(models.Model):
    """
    StudentScore Model.

    Database Table: "academic"."student_scores"
    Description: Granular evaluation marks per score category (oral, 15m, mid-term, end-term)
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    class_subject_teacher_id = models.UUIDField()
    score_type = models.ForeignKey(
        "academic.ScoreType",
        on_delete=models.CASCADE,
        db_column="score_type_id",
        related_name="+",
        db_comment="score_type_id foreign key",
    )
    exam = models.ForeignKey(
        "academic.Exam",
        on_delete=models.SET_NULL,
        db_column="exam_id",
        related_name="+",
        null=True, blank=True, db_comment="exam_id foreign key",
    )
    score_value = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    comment_result = models.CharField(max_length=20, null=True, blank=True)
    score_date = models.DateField()
    note = models.TextField(null=True, blank=True)
    entered_by = models.UUIDField()
    entered_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."student_scores"'
        verbose_name = "Student Score"
        verbose_name_plural = "Student Scores"

    def __str__(self) -> str:
        return f"StudentScore ({self.pk})"


class StudentTermSummary(models.Model):
    """
    StudentTermSummary Model.

    Database Table: "academic"."student_term_summaries"
    Description: Comprehensive official student transcript and honor roll summaries per term and school year
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    semester_id = models.UUIDField(null=True, blank=True)
    academic_year_id = models.UUIDField()
    term_type = models.CharField(max_length=20, )
    gpa_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    academic_rating = models.CharField(max_length=20, )
    conduct_rating = models.CharField(max_length=20, )
    honor_title = models.CharField(max_length=50, null=True, blank=True)
    rank_in_class = models.SmallIntegerField(null=True, blank=True)
    rank_in_grade = models.SmallIntegerField(null=True, blank=True)
    excused_absences = models.SmallIntegerField()
    unexcused_absences = models.SmallIntegerField()
    is_promoted = models.BooleanField(default=False)
    requires_summer_retest = models.BooleanField(default=False)
    homeroom_remarks = models.TextField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    certified_by = models.UUIDField(null=True, blank=True)
    certified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."student_term_summaries"'
        verbose_name = "Student Term Summary"
        verbose_name_plural = "Student Term Summarys"

    def __str__(self) -> str:
        return f"StudentTermSummary ({self.pk})"


class ReportCard(models.Model):
    """
    ReportCard Model.

    Database Table: "academic"."report_cards"
    Description: Official academic report transcripts complying with MOET high school grading norms
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.UUIDField()
    subject_id = models.UUIDField()
    semester_id = models.UUIDField()
    average_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    subject_eval = models.CharField(max_length=20, null=True, blank=True)
    conduct_rating = models.CharField(max_length=20, null=True, blank=True)
    academic_rating = models.CharField(max_length=20, null=True, blank=True)
    honor_title = models.CharField(max_length=50, null=True, blank=True)
    rank_in_class = models.SmallIntegerField(null=True, blank=True)
    teacher_comment = models.TextField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    generated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."report_cards"'
        verbose_name = "Report Card"
        verbose_name_plural = "Report Cards"

    def __str__(self) -> str:
        return f"ReportCard ({self.pk})"
