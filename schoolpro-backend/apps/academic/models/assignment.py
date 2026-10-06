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
    format = models.CharField(
        max_length=30,
        default="HOMEWORK",
        help_text="Hình thức bài tập: HOMEWORK, ESSAY, QUIZ, PROJECT, HYBRID, PRACTICAL",
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

    # Dynamic Submission File Rules
    allowed_file_types = models.JSONField(
        null=True,
        blank=True,
        default=list,
        help_text="Danh sách định dạng tệp cho phép nộp",
    )
    max_file_size_mb = models.IntegerField(
        default=25,
        help_text="Dung lượng tối đa mỗi tệp (MB)",
    )
    max_files_count = models.IntegerField(
        default=5,
        help_text="Số lượng tệp đính kèm tối đa học sinh được nộp",
    )
    file_naming_rule = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        default="{class}_{student_name}_{assignment_title}",
        help_text="Quy chuẩn đặt tên tệp giáo viên yêu cầu",
    )
    file_naming_regex = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Biểu thức Regex để kiểm tra tên file",
    )

    # Late submission & Resubmission rules
    allow_late_submission = models.BooleanField(
        default=True,
        help_text="Cho phép nộp bài sau hạn chót",
    )
    late_penalty_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text="Phần trăm điểm bị trừ khi nộp muộn",
    )
    allow_resubmission = models.BooleanField(
        default=True,
        help_text="Cho phép nộp lại trước hạn chót",
    )
    max_resubmission_count = models.IntegerField(
        default=3,
        help_text="Số lần nộp lại tối đa",
    )

    # Dynamic Deadline Extensions (Lần 1, 2, 3)
    extended_due_date_1 = models.DateTimeField(null=True, blank=True)
    extension_reason_1 = models.TextField(null=True, blank=True)
    extended_due_date_2 = models.DateTimeField(null=True, blank=True)
    extension_reason_2 = models.TextField(null=True, blank=True)
    extended_due_date_3 = models.DateTimeField(null=True, blank=True)
    extension_reason_3 = models.TextField(null=True, blank=True)

    # Grading Rubric, Solutions & Settings
    rubric = models.JSONField(null=True, blank=True, help_text="Rubric scoring matrix")
    solution_attachments = models.JSONField(null=True, blank=True, help_text="Tệp bài giải mẫu")
    solution_published_at = models.DateTimeField(null=True, blank=True)
    pass_score = models.DecimalField(max_digits=4, decimal_places=2, default=5.00)
    weight_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    settings = models.JSONField(null=True, blank=True, default=dict)

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
    attempt_number = models.IntegerField(default=1)
    submission_status = models.CharField(max_length=30, default="SUBMITTED")
    submitted_at = models.DateTimeField(null=True, blank=True)
    content_text = models.TextField(null=True, blank=True)
    attachments = models.JSONField(null=True, blank=True)

    is_late = models.BooleanField(default=False)
    late_minutes = models.IntegerField(default=0)
    penalty_deduction = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)

    raw_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    final_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    rubric_scores = models.JSONField(null=True, blank=True)

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

    # Score Appeal Workflow
    appeal_status = models.CharField(
        max_length=30,
        default="NONE",
        help_text="Trạng thái khiếu nại: NONE, PENDING, APPROVED, REJECTED",
    )
    appeal_reason = models.TextField(null=True, blank=True)
    appeal_attachments = models.JSONField(null=True, blank=True)
    appealed_at = models.DateTimeField(null=True, blank=True)
    appeal_resolved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    appeal_response = models.TextField(null=True, blank=True)
    appeal_resolved_at = models.DateTimeField(null=True, blank=True)

    # Reopen Request Workflow
    reopen_status = models.CharField(max_length=30, default="NONE")
    reopen_request_reason = models.TextField(null=True, blank=True)
    reopen_requested_at = models.DateTimeField(null=True, blank=True)
    reopen_approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    reopen_approved_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True, default=dict)

    class Meta:
        managed = False
        db_table = '"academic"."assignment_submissions"'
        verbose_name = "Assignment Submission"
        verbose_name_plural = "Assignment Submissions"

    def __str__(self) -> str:
        return f"AssignmentSubmission ({self.pk})"

    def __repr__(self) -> str:
        return f"<AssignmentSubmission {self.pk}>"


class AssignmentEventLog(UUIDModel):
    """
    AssignmentEventLog Model.

    Database Table: "academic"."assignment_event_logs"
    Description: Timeline activity and audit log for assignment lifecycle
    """

    assignment = models.ForeignKey(
        "academic.Assignment",
        on_delete=models.CASCADE,
        db_column="assignment_id",
        related_name="event_logs",
    )
    submission = models.ForeignKey(
        "academic.AssignmentSubmission",
        on_delete=models.CASCADE,
        db_column="submission_id",
        null=True,
        blank=True,
        related_name="event_logs",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="student_id",
        null=True,
        blank=True,
        related_name="+",
    )
    actor = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="actor_id",
        related_name="+",
    )
    actor_role = models.CharField(max_length=50)
    event_type = models.CharField(max_length=50)
    event_title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"academic"."assignment_event_logs"'
        verbose_name = "Assignment Event Log"
        verbose_name_plural = "Assignment Event Logs"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.event_title} ({self.created_at})"
