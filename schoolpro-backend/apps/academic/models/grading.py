from django.db import models

from common.models.base import UUIDModel


class ScoreType(UUIDModel):
    """
    ScoreType Model.

    Database Table: "academic"."score_types"
    Description: Master evaluation score columns and calculation coefficients per MOET Circular 22
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="score_types",
    )
    code = models.CharField(max_length=60)
    name = models.CharField(max_length=100)
    coefficient = models.SmallIntegerField(default=1)
    weight_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    min_evaluations = models.SmallIntegerField(default=1)
    max_evaluations = models.SmallIntegerField(default=6)
    order_no = models.SmallIntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."score_types"'
        verbose_name = "Score Type"
        verbose_name_plural = "Score Types"
        ordering = ["order_no", "code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<ScoreType {self.code}: {self.name}>"


class ConductEvaluation(UUIDModel):
    """
    ConductEvaluation Model.

    Database Table: "academic"."conduct_evaluations"
    Description: Official student moral and behavioral conduct evaluation workflow (Tốt, Khá, Đạt, Chưa đạt)
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="conduct_evaluations",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
    )
    self_rating = models.CharField(max_length=20, null=True, blank=True)
    class_vote_rating = models.CharField(max_length=20, null=True, blank=True)
    emulation_demerit_points = models.SmallIntegerField(default=0)
    bonus_points = models.SmallIntegerField(default=0)
    discipline_records_count = models.SmallIntegerField(default=0)
    homeroom_teacher_rating = models.CharField(max_length=20)
    final_rating = models.CharField(max_length=20)
    homeroom_comments = models.TextField(null=True, blank=True)
    strengths = models.TextField(null=True, blank=True)
    improvements_needed = models.TextField(null=True, blank=True)
    parent_acknowledgement = models.BooleanField(default=False)
    parent_acknowledged_at = models.DateTimeField(null=True, blank=True)
    parent_feedback = models.TextField(null=True, blank=True)
    principal_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default="PENDING")
    decision_number = models.CharField(max_length=100, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    evaluated_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="evaluated_by",
        related_name="+",
    )
    evaluated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."conduct_evaluations"'
        verbose_name = "Conduct Evaluation"
        verbose_name_plural = "Conduct Evaluations"

    def __str__(self) -> str:
        return f"ConductEvaluation ({self.student_id} - {self.final_rating})"


class SubjectExemption(UUIDModel):
    """
    SubjectExemption Model.

    Database Table: "academic"."subject_exemptions"
    Description: Authorized medical waivers, military drill exemptions, and international certificate conversions
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="subject_exemptions",
    )
    subject = models.ForeignKey(
        "master.Subject",
        on_delete=models.CASCADE,
        db_column="subject_id",
        related_name="+",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="+",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        null=True,
        blank=True,
        related_name="+",
    )
    exemption_type = models.CharField(max_length=30)
    reason = models.TextField()
    certificate_name = models.CharField(max_length=100, null=True, blank=True)
    certificate_score = models.CharField(max_length=50, null=True, blank=True)
    converted_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    certificate_file_url = models.TextField(null=True, blank=True)
    certificate_issued_date = models.DateField(null=True, blank=True)
    certificate_expiry_date = models.DateField(null=True, blank=True)
    verification_url = models.TextField(null=True, blank=True)
    decision_number = models.CharField(max_length=100, null=True, blank=True)
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default="APPROVED")
    rejection_reason = models.TextField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="approved_by",
        null=True,
        blank=True,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."subject_exemptions"'
        verbose_name = "Subject Exemption"
        verbose_name_plural = "Subject Exemptions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"SubjectExemption ({self.student_id} - {self.subject_id})"


class StudentScore(UUIDModel):
    """
    StudentScore Model.

    Database Table: "academic"."student_scores"
    Description: Granular evaluation marks per score category (oral, 15m, mid-term, end-term)
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="scores",
    )
    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.CASCADE,
        db_column="class_subject_teacher_id",
        related_name="student_scores",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="+",
    )
    score_type = models.ForeignKey(
        "academic.ScoreType",
        on_delete=models.CASCADE,
        db_column="score_type_id",
        related_name="+",
    )
    exam = models.ForeignKey(
        "academic.Exam",
        on_delete=models.SET_NULL,
        db_column="exam_id",
        related_name="+",
        null=True,
        blank=True,
    )
    assignment_submission = models.ForeignKey(
        "academic.AssignmentSubmission",
        on_delete=models.SET_NULL,
        db_column="assignment_submission_id",
        related_name="+",
        null=True,
        blank=True,
    )
    score_value = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    previous_score_value = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    comment_result = models.CharField(max_length=20, null=True, blank=True)
    score_date = models.DateField()
    note = models.TextField(null=True, blank=True)
    edit_reason = models.TextField(null=True, blank=True)
    edit_approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="edit_approved_by",
        null=True,
        blank=True,
        related_name="+",
    )
    edit_approved_at = models.DateTimeField(null=True, blank=True)
    entered_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="entered_by",
        related_name="+",
    )
    entered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="locked_by",
        null=True,
        blank=True,
        related_name="+",
    )
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        managed = False
        db_table = '"academic"."student_scores"'
        verbose_name = "Student Score"
        verbose_name_plural = "Student Scores"

    def __str__(self) -> str:
        return f"StudentScore ({self.student_id}: {self.score_value})"


class StudentTermSummary(UUIDModel):
    """
    StudentTermSummary Model.

    Database Table: "academic"."student_term_summaries"
    Description: Comprehensive official student transcript and honor roll summaries per term and school year
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="term_summaries",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="class_id",
        null=True,
        blank=True,
        related_name="+",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="+",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="+",
    )
    term_type = models.CharField(max_length=20)
    gpa_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    academic_rating = models.CharField(max_length=20)
    conduct_rating = models.CharField(max_length=20)
    honor_title = models.CharField(max_length=50, null=True, blank=True)
    rank_in_class = models.SmallIntegerField(null=True, blank=True)
    rank_in_grade = models.SmallIntegerField(null=True, blank=True)
    excused_absences = models.SmallIntegerField(default=0)
    unexcused_absences = models.SmallIntegerField(default=0)
    is_promoted = models.BooleanField(default=False)
    requires_summer_retest = models.BooleanField(default=False)
    summer_retest_subjects = models.JSONField(null=True, blank=True)
    post_summer_gpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    post_summer_academic_rating = models.CharField(max_length=20, null=True, blank=True)
    post_summer_promoted = models.BooleanField(null=True, blank=True)
    homeroom_remarks = models.TextField(null=True, blank=True)
    rewards_record = models.TextField(null=True, blank=True)
    digital_certificate_url = models.TextField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    certified_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="certified_by",
        null=True,
        blank=True,
        related_name="+",
    )
    certified_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."student_term_summaries"'
        verbose_name = "Student Term Summary"
        verbose_name_plural = "Student Term Summaries"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"StudentTermSummary ({self.student_id} - GPA {self.gpa_score})"


class ReportCard(UUIDModel):
    """
    ReportCard Model.

    Database Table: "academic"."report_cards"
    Description: Official academic report transcripts complying with MOET high school grading norms
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="report_cards",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="class_id",
        null=True,
        blank=True,
        related_name="+",
    )
    subject = models.ForeignKey(
        "master.Subject",
        on_delete=models.CASCADE,
        db_column="subject_id",
        related_name="+",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.SET_NULL,
        db_column="academic_year_id",
        null=True,
        blank=True,
        related_name="+",
    )
    average_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    subject_eval = models.CharField(max_length=20, null=True, blank=True)
    conduct_rating = models.CharField(max_length=20, null=True, blank=True)
    academic_rating = models.CharField(max_length=20, null=True, blank=True)
    honor_title = models.CharField(max_length=50, null=True, blank=True)
    rank_in_class = models.SmallIntegerField(null=True, blank=True)
    teacher_comment = models.TextField(null=True, blank=True)
    score_details = models.JSONField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="verified_by",
        null=True,
        blank=True,
        related_name="+",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    principal_signature_time = models.DateTimeField(null=True, blank=True)
    digital_signature_hash = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."report_cards"'
        verbose_name = "Report Card"
        verbose_name_plural = "Report Cards"

    def __str__(self) -> str:
        return f"ReportCard ({self.student_id} - {self.subject_id})"
