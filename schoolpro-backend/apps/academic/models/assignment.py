from django.db import models

from common.models.base import UUIDModel


class Assignment(UUIDModel):
    """
    Assignment Model.

    Database Table: "academic"."assignments"
    Description: Homework tasks and group projects assigned by subject teachers
    """

    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.CASCADE,
        db_column="class_subject_teacher_id",
        related_name="assignments",
        db_comment="class_subject_teacher_id foreign key",
    )
    title = models.CharField(
        max_length=255,
    )
    description = models.TextField(null=True, blank=True)
    assignment_type = models.CharField(
        max_length=20,
        default="HOMEWORK",
    )
    assigned_date = models.DateField()
    due_date = models.DateTimeField()
    max_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=10.00,
    )
    attachments = models.JSONField(null=True, blank=True)
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="created_by",
        related_name="+",
        db_comment="created_by user foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."assignments"'
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<Assignment {self.pk}>"


class AssignmentSubmission(UUIDModel):
    """
    AssignmentSubmission Model.

    Database Table: "academic"."assignment_submissions"
    Description: Student homework answers, uploaded files, and graded feedback
    """

    assignment = models.ForeignKey(
        "academic.Assignment",
        on_delete=models.CASCADE,
        db_column="assignment_id",
        related_name="submissions",
        db_comment="assignment_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="assignment_submissions",
        db_comment="student_id foreign key",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    content_text = models.TextField(null=True, blank=True)
    attachments = models.JSONField(null=True, blank=True)
    score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        default="PENDING",
    )
    graded_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="graded_by",
        null=True,
        blank=True,
        related_name="+",
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"academic"."assignment_submissions"'
        verbose_name = "Assignment Submission"
        verbose_name_plural = "Assignment Submissions"

    def __str__(self) -> str:
        return f"AssignmentSubmission ({self.pk})"

    def __repr__(self) -> str:
        return f"<AssignmentSubmission {self.pk}>"
