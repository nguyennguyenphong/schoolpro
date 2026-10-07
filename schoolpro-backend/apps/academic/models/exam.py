from django.contrib.postgres.fields import ArrayField
from django.db import models

from common.models.base import UUIDModel


class Exam(UUIDModel):
    """
    Exam Model.

    Database Table: "academic"."exams"
    Description: Formal examination events (15-min tests, mid-term, final term exams, quizzes)
    """

    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.CASCADE,
        db_column="class_subject_teacher_id",
        null=True,
        blank=True,
        related_name="exams",
        db_comment="class_subject_teacher_id foreign key",
    )
    score_type = models.ForeignKey(
        "academic.ScoreType",
        on_delete=models.CASCADE,
        db_column="score_type_id",
        related_name="exams",
        db_comment="score_type_id foreign key",
    )
    title = models.CharField(max_length=255)
    exam_date = models.DateField()
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.SmallIntegerField(default=45)
    format = models.CharField(max_length=30, default="MIXED")
    status = models.CharField(max_length=20, default="SCHEDULED")
    max_score = models.DecimalField(max_digits=4, decimal_places=2, default=10.00)
    pass_score = models.DecimalField(max_digits=4, decimal_places=2, default=5.00)
    weight_percent = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        related_name="exams",
        null=True,
        blank=True,
        db_comment="room_id foreign key",
    )
    proctor_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="proctor_teacher_id",
        related_name="proctored_exams",
        null=True,
        blank=True,
        db_comment="proctor_teacher_id foreign key",
    )
    shuffle_questions = models.BooleanField(default=False)
    shuffle_answers = models.BooleanField(default=False)
    allow_review = models.BooleanField(default=True)
    max_attempts = models.SmallIntegerField(default=1)
    attachments = models.JSONField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="created_by",
        related_name="+",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."exams"'
        verbose_name = "Exam"
        verbose_name_plural = "Exams"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<Exam {self.pk}: {self.title}>"


class ExamQuestion(UUIDModel):
    """
    ExamQuestion Model.

    Database Table: "academic"."exam_questions"
    Description: Examination paper structure linking tests to question repository items
    """

    exam = models.ForeignKey(
        "academic.Exam",
        on_delete=models.CASCADE,
        db_column="exam_id",
        related_name="exam_questions",
        db_comment="exam_id foreign key",
    )
    question = models.ForeignKey(
        "academic.QuestionBank",
        on_delete=models.CASCADE,
        db_column="question_id",
        related_name="exam_occurrences",
        db_comment="question_id foreign key",
    )
    order_no = models.SmallIntegerField()
    section_name = models.CharField(max_length=100, null=True, blank=True)
    score_weight = models.DecimalField(max_digits=4, decimal_places=2, default=0.25)
    paper_code = models.CharField(max_length=60, default="STANDARD")
    shuffled_options = models.JSONField(null=True, blank=True)
    sub_questions = models.JSONField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"academic"."exam_questions"'
        verbose_name = "Exam Question"
        verbose_name_plural = "Exam Questions"
        ordering = ["order_no"]

    def __str__(self) -> str:
        return f"ExamQuestion ({self.pk})"

    def __repr__(self) -> str:
        return f"<ExamQuestion {self.pk}>"


class ExamSubmission(UUIDModel):
    """
    ExamSubmission Model.

    Database Table: "academic"."exam_submissions"
    Description: Student online test attempts, durations, and aggregate scores
    """

    exam = models.ForeignKey(
        "academic.Exam",
        on_delete=models.CASCADE,
        db_column="exam_id",
        related_name="submissions",
        db_comment="exam_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="exam_submissions",
        db_comment="student_id foreign key",
    )
    paper_code = models.CharField(max_length=60, default="STANDARD")
    attempt_number = models.SmallIntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    auto_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    manual_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    total_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default="IN_PROGRESS")
    submitted_files = models.JSONField(null=True, blank=True)
    proctor_notes = models.TextField(null=True, blank=True)
    violation_count = models.IntegerField(default=0)
    teacher_feedback = models.TextField(null=True, blank=True)
    graded_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="graded_by",
        related_name="+",
        null=True,
        blank=True,
    )
    graded_at = models.DateTimeField(null=True, blank=True)
    appeal_status = models.CharField(max_length=20, default="NONE")
    appeal_reason = models.TextField(null=True, blank=True)
    appealed_at = models.DateTimeField(null=True, blank=True)
    appeal_resolved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="appeal_resolved_by",
        related_name="+",
        null=True,
        blank=True,
    )
    appeal_response = models.TextField(null=True, blank=True)
    appeal_resolved_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."exam_submissions"'
        verbose_name = "Exam Submission"
        verbose_name_plural = "Exam Submissions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ExamSubmission ({self.pk})"

    def __repr__(self) -> str:
        return f"<ExamSubmission {self.pk}>"


class ExamSubmissionAnswer(UUIDModel):
    """
    ExamSubmissionAnswer Model.

    Database Table: "academic"."exam_submission_answers"
    Description: Individual question answers submitted by students with evaluation results
    """

    submission = models.ForeignKey(
        "academic.ExamSubmission",
        on_delete=models.CASCADE,
        db_column="submission_id",
        related_name="answers",
        db_comment="submission_id foreign key",
    )
    exam_question = models.ForeignKey(
        "academic.ExamQuestion",
        on_delete=models.CASCADE,
        db_column="exam_question_id",
        related_name="submitted_answers",
        db_comment="exam_question_id foreign key",
    )
    selected_answers = models.JSONField(null=True, blank=True)
    text_response = models.TextField(null=True, blank=True)
    attached_files = models.JSONField(null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    awarded_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    rubric_detail = models.JSONField(null=True, blank=True)
    teacher_note = models.TextField(null=True, blank=True)
    graded_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="graded_by",
        null=True,
        blank=True,
        related_name="+",
    )
    graded_at = models.DateTimeField(null=True, blank=True)
    time_spent_seconds = models.IntegerField(default=0)
    flagged_for_review = models.BooleanField(default=False)
    appeal_note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."exam_submission_answers"'
        verbose_name = "Exam Submission Answer"
        verbose_name_plural = "Exam Submission Answers"

    def __str__(self) -> str:
        return f"ExamSubmissionAnswer ({self.pk})"


class QuestionBank(UUIDModel):
    """
    QuestionBank Model.

    Database Table: "academic"."question_bank"
    Description: Centralized reusable question pool for exams and tests
    """

    subject = models.ForeignKey(
        "master.Subject",
        on_delete=models.CASCADE,
        db_column="subject_id",
        related_name="questions",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="grade_id",
        related_name="questions",
    )
    code = models.CharField(max_length=60, null=True, blank=True)
    chapter_name = models.CharField(max_length=150, null=True, blank=True)
    difficulty_level = models.CharField(max_length=30, default="RECOGNITION")
    question_type = models.CharField(max_length=30, default="SINGLE_CHOICE")
    content = models.TextField()
    audio_url = models.CharField(max_length=1000, null=True, blank=True)
    image_urls = models.JSONField(null=True, blank=True)
    options = models.JSONField(default=list, blank=True)
    correct_answers = models.JSONField(default=list, blank=True)
    solution_explanation = models.TextField(null=True, blank=True)
    default_score = models.DecimalField(max_digits=4, decimal_places=2, default=0.25)
    author = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="author_id",
        null=True,
        blank=True,
        related_name="+",
    )
    status = models.CharField(max_length=20, default="APPROVED")
    reviewed_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="reviewed_by",
        null=True,
        blank=True,
        related_name="+",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    usage_count = models.IntegerField(default=0)
    discrimination_index = models.DecimalField(
        max_digits=4, decimal_places=3, null=True, blank=True
    )
    is_shared = models.BooleanField(default=True)
    tags = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."question_bank"'
        verbose_name = "Question Bank Item"
        verbose_name_plural = "Question Bank Items"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Question ({self.pk})"
