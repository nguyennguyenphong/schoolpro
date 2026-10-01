from django.contrib.postgres.fields import ArrayField
from django.db import models

from common.models.base import UUIDModel


class Exam(UUIDModel):
    """
    Exam Model.

    Database Table: "academic"."exams"
    Description: Formal examination events (15-min tests, mid-term, final term exams)
    """

    class_subject_teacher_id = models.UUIDField(null=True, blank=True)
    score_type = models.ForeignKey(
        "academic.ScoreType",
        on_delete=models.CASCADE,
        db_column="score_type_id",
        related_name="+",
        db_comment="score_type_id foreign key",
    )
    title = models.CharField(
        max_length=255,
    )
    exam_date = models.DateField()
    duration_minutes = models.SmallIntegerField()
    max_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="room_id foreign key",
    )
    description = models.TextField(null=True, blank=True)
    created_by = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."exams"'
        verbose_name = "Exam"
        verbose_name_plural = "Exams"
        ordering = ["-exam_date"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<Exam {self.pk}>"


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
        related_name="+",
        db_comment="exam_id foreign key",
    )
    question = models.ForeignKey(
        "academic.QuestionBank",
        on_delete=models.CASCADE,
        db_column="question_id",
        related_name="+",
        db_comment="question_id foreign key",
    )
    order_no = models.SmallIntegerField()
    score_weight = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )
    paper_code = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."exam_questions"'
        verbose_name = "Exam Question"
        verbose_name_plural = "Exam Questions"
        ordering = ["question_order"]

    def __str__(self) -> str:
        return f"ExamQuestion ({self.pk})"

    def __repr__(self) -> str:
        return f"<ExamQuestion {self.pk}>"


class ExamSubmission(UUIDModel):
    """
    ExamSubmission Model.

    Database Table: "academic"."exam_submissions"
    Description: Student examination attempts and final test grading status
    """

    exam = models.ForeignKey(
        "academic.Exam",
        on_delete=models.CASCADE,
        db_column="exam_id",
        related_name="+",
        db_comment="exam_id foreign key",
    )
    student_id = models.UUIDField()
    paper_code = models.CharField(max_length=20, null=True, blank=True)
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    auto_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    manual_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    total_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )
    teacher_feedback = models.TextField(null=True, blank=True)
    graded_by = models.UUIDField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."exam_submissions"'
        verbose_name = "Exam Submission"
        verbose_name_plural = "Exam Submissions"
        ordering = ["-submitted_at"]

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
        related_name="+",
        db_comment="submission_id foreign key",
    )
    exam_question = models.ForeignKey(
        "academic.ExamQuestion",
        on_delete=models.CASCADE,
        db_column="exam_question_id",
        related_name="+",
        db_comment="exam_question_id foreign key",
    )
    selected_answers = models.JSONField(null=True, blank=True)
    text_response = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    awarded_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    teacher_note = models.TextField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."exam_submission_answers"'
        verbose_name = "Exam Submission Answer"
        verbose_name_plural = "Exam Submission Answers"

    def __str__(self) -> str:
        return f"ExamSubmissionAnswer ({self.pk})"

    def __repr__(self) -> str:
        return f"<ExamSubmissionAnswer {self.pk}>"


class QuestionBank(UUIDModel):
    """
    QuestionBank Model.

    Database Table: "academic"."question_bank"
    Description: Centralized educational question repository categorized by Bloom cognitive taxonomy
    """

    subject_id = models.UUIDField()
    grade_id = models.UUIDField()
    chapter_name = models.CharField(max_length=150, null=True, blank=True)
    difficulty_level = models.CharField(
        max_length=30,
    )
    question_type = models.CharField(
        max_length=30,
    )
    content = models.TextField()
    options = models.JSONField(null=True, blank=True)
    correct_answers = models.JSONField(null=True, blank=True)
    solution_explanation = models.TextField(null=True, blank=True)
    default_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )
    author_id = models.UUIDField(null=True, blank=True)
    is_shared = models.BooleanField(default=False)
    tags = ArrayField(models.TextField(), null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."question_bank"'
        verbose_name = "Question Bank Item"
        verbose_name_plural = "Question Bank Items"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"QuestionBank ({self.pk})"

    def __repr__(self) -> str:
        return f"<QuestionBank {self.pk}>"
