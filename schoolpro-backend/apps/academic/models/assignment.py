from django.db import models

from common.models.base import UUIDModel


class Assignment(UUIDModel):
    """
    Assignment Model.

    Database Table: "academic"."assignments"
    Description: Homework tasks and group projects assigned by subject teachers
    """

    class_subject_teacher_id = models.UUIDField()
    title = models.CharField(
        max_length=255,
    )
    description = models.TextField(null=True, blank=True)
    assignment_type = models.CharField(
        max_length=20,
    )
    assigned_date = models.DateField()
    due_date = models.DateTimeField()
    max_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )
    attachments = models.JSONField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.UUIDField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

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
        related_name="+",
        db_comment="assignment_id foreign key",
    )
    student_id = models.UUIDField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    content_text = models.TextField(null=True, blank=True)
    attachments = models.JSONField(null=True, blank=True)
    score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )
    graded_by = models.UUIDField(null=True, blank=True)
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
