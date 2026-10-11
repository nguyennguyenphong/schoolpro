from django.db import models
from django.utils import timezone

from common.models.base import UUIDModel


class Attendance(UUIDModel):
    """
    Attendance Model.

    Database Table: "academic"."attendance"
    Description: Daily student attendance roll-call tracking excuses and tardiness
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="attendance_records",
        db_comment="student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="attendance_records",
        db_comment="class_id foreign key",
    )
    attendance_date = models.DateField()
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.SET_NULL,
        db_column="period_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="period_id foreign key",
    )
    status = models.CharField(max_length=20, default="PRESENT")
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    method = models.CharField(max_length=30, default="TEACHER_APP")
    device_id = models.CharField(max_length=100, null=True, blank=True)
    excuse_reason = models.TextField(null=True, blank=True)
    excuse_document_url = models.TextField(null=True, blank=True)
    is_parent_notified = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    recorded_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="recorded_by",
        related_name="+",
    )
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"academic"."attendance"'
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"
        ordering = ["-attendance_date", "period"]

    def __str__(self) -> str:
        return f"Attendance ({self.student_id}: {self.status} on {self.attendance_date})"

    def __repr__(self) -> str:
        return f"<Attendance {self.pk}>"


class AttendanceLog(UUIDModel):
    """
    AttendanceLog Model.

    Database Table: "academic"."attendance_logs"
    Description: Audit trail and change history for student attendance roll-calls
    """

    attendance = models.ForeignKey(
        "academic.Attendance",
        on_delete=models.CASCADE,
        db_column="attendance_id",
        related_name="logs",
        db_comment="attendance_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="attendance_logs",
        db_comment="student_id foreign key",
    )
    previous_status = models.CharField(max_length=20, null=True, blank=True)
    new_status = models.CharField(max_length=20)
    action = models.CharField(max_length=50, default="STATUS_UPDATED")
    reason = models.TextField(null=True, blank=True)
    performed_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="performed_by",
        null=True,
        blank=True,
        related_name="+",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"academic"."attendance_logs"'
        verbose_name = "Attendance Log"
        verbose_name_plural = "Attendance Logs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"AttendanceLog ({self.student_id}: {self.previous_status} -> {self.new_status} at {self.created_at})"

    def __repr__(self) -> str:
        return f"<AttendanceLog {self.pk}>"


class LeaveRequest(UUIDModel):
    """
    LeaveRequest Model.

    Database Table: "academic"."leave_requests"
    Description: Student leave and excused absence requests with approval workflow
    """

    class LeaveTypeChoices(models.TextChoices):
        SICK = "SICK", "Nghỉ ốm / Khám chữa bệnh"
        FAMILY_AFFAIR = "FAMILY_AFFAIR", "Việc gia đình"
        BEREAVEMENT = "BEREAVEMENT", "Việc hiếu / Tang chế"
        OFFICIAL_COMPETITION = "OFFICIAL_COMPETITION", "Thi đấu / Công tác trường"
        OTHER = "OTHER", "Lý do khác"

    class LeaveStatusChoices(models.TextChoices):
        PENDING = "PENDING", "Chờ duyệt"
        APPROVED = "APPROVED", "Đã duyệt"
        REJECTED = "REJECTED", "Từ chối"
        CANCELLED = "CANCELLED", "Đã hủy"

    code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        help_text="Mã đơn 12 chữ số tự động sinh",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="leave_requests",
        db_comment="student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="leave_requests",
        db_comment="class_id foreign key",
    )
    guardian = models.ForeignKey(
        "core.Guardian",
        on_delete=models.SET_NULL,
        db_column="guardian_id",
        null=True,
        blank=True,
        related_name="student_leave_requests",
    )
    requested_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="requested_by",
        related_name="submitted_leave_requests",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    leave_type = models.CharField(
        max_length=30,
        choices=LeaveTypeChoices.choices,
        default=LeaveTypeChoices.SICK,
    )
    status = models.CharField(
        max_length=20,
        choices=LeaveStatusChoices.choices,
        default=LeaveStatusChoices.PENDING,
    )
    supporting_document_url = models.TextField(null=True, blank=True)
    teacher_note = models.TextField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="reviewed_by",
        null=True,
        blank=True,
        related_name="+",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approval_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Hạn phê duyệt: Trước thời gian diễn ra môn học đầu tiên 3 giờ",
    )
    is_auto_approved = models.BooleanField(
        default=False,
        help_text="Đánh dấu đơn được hệ thống tự động phê duyệt khi quá hạn 3 giờ trước giờ học",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."leave_requests"'
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"LeaveRequest ({self.code}: {self.student_id} - {self.start_date} to {self.end_date} - {self.status})"

    def __repr__(self) -> str:
        return f"<LeaveRequest {self.pk}>"


class LeaveRequestEventLog(UUIDModel):
    """
    LeaveRequestEventLog Model.

    Database Table: "academic"."leave_request_event_logs"
    Description: Chronological audit trail, notifications, and email delivery history for student leave requests
    """

    leave_request = models.ForeignKey(
        "academic.LeaveRequest",
        on_delete=models.CASCADE,
        db_column="leave_request_id",
        related_name="event_logs",
    )
    event_type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    actor_name = models.CharField(max_length=150, null=True, blank=True)
    actor_role = models.CharField(max_length=60, null=True, blank=True)
    badge_text = models.CharField(max_length=80, null=True, blank=True)
    badge_color = models.CharField(max_length=30, default="blue")
    recipient_email = models.CharField(max_length=255, null=True, blank=True)
    email_sent = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        managed = False
        db_table = '"academic"."leave_request_event_logs"'
        verbose_name = "Leave Request Event Log"
        verbose_name_plural = "Leave Request Event Logs"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"LeaveRequestEventLog ({self.leave_request_id}: {self.event_type} at {self.created_at})"

    def __repr__(self) -> str:
        return f"<LeaveRequestEventLog {self.pk}>"
