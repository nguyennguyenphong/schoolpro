"""
Serializers for Academic Attendance, Leave Requests, and Attendance Logs domain.
"""

from rest_framework import serializers

from apps.academic.models.attendance import Attendance, AttendanceLog, LeaveRequest


class AttendanceLogSerializer(serializers.ModelSerializer):
    """
    Serializer for attendance change log and audit history.
    """

    performed_by_name = serializers.CharField(
        source="performed_by.full_name", read_only=True, default=None
    )

    class Meta:
        model = AttendanceLog
        fields = [
            "id",
            "attendance",
            "student",
            "previous_status",
            "new_status",
            "action",
            "reason",
            "performed_by",
            "performed_by_name",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for daily/period student attendance roll-call record.
    """

    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    class_name = serializers.CharField(source="school_class.name", read_only=True)
    period_name = serializers.CharField(source="period.name", read_only=True, default=None)
    recorded_by_name = serializers.CharField(source="recorded_by.full_name", read_only=True)
    logs = AttendanceLogSerializer(many=True, read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "student",
            "student_code",
            "student_name",
            "school_class",
            "class_name",
            "attendance_date",
            "period",
            "period_name",
            "status",
            "check_in_time",
            "check_out_time",
            "method",
            "device_id",
            "excuse_reason",
            "excuse_document_url",
            "is_parent_notified",
            "notification_sent_at",
            "note",
            "metadata",
            "recorded_by",
            "recorded_by_name",
            "recorded_at",
            "logs",
        ]
        read_only_fields = ["id", "recorded_at"]


class MarkAttendanceItemSerializer(serializers.Serializer):
    """
    Input schema for an individual student attendance mark.
    """

    student_id = serializers.UUIDField()
    status = serializers.ChoiceField(
        choices=["PRESENT", "ABSENT_EXCUSED", "ABSENT_UNEXCUSED", "LATE", "LEFT_EARLY"]
    )
    check_in_time = serializers.DateTimeField(required=False, allow_null=True)
    check_out_time = serializers.DateTimeField(required=False, allow_null=True)
    method = serializers.CharField(default="MANUAL")
    device_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    excuse_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    excuse_document_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class BulkMarkAttendanceRequestSerializer(serializers.Serializer):
    """
    Input schema for bulk roll-call submission by teacher.
    """

    class_id = serializers.UUIDField()
    attendance_date = serializers.DateField()
    period_id = serializers.UUIDField(required=False, allow_null=True)
    records = MarkAttendanceItemSerializer(many=True)


class LeaveRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for student absence/leave requests.
    """

    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    class_name = serializers.CharField(source="school_class.name", read_only=True)
    requested_by_name = serializers.CharField(source="requested_by.full_name", read_only=True)
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.full_name", read_only=True, default=None
    )

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "code",
            "student",
            "student_code",
            "student_name",
            "school_class",
            "class_name",
            "guardian",
            "requested_by",
            "requested_by_name",
            "start_date",
            "end_date",
            "reason",
            "leave_type",
            "status",
            "supporting_document_url",
            "teacher_note",
            "reviewed_by",
            "reviewed_by_name",
            "reviewed_at",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "code", "created_at", "updated_at", "reviewed_at", "reviewed_by"]


class LeaveRequestAttachmentSerializer(serializers.Serializer):
    """
    Representation of an attachment on a leave request.
    """

    id = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField()
    url = serializers.CharField(required=False, allow_blank=True, default="")
    size = serializers.CharField(required=False, allow_blank=True, default="")
    type = serializers.CharField(required=False, allow_blank=True, default="pdf")


class LeaveAffectedLessonSerializer(serializers.Serializer):
    """
    Representation of a timetable lesson slot impacted by the student leave request.
    """

    lessonKey = serializers.CharField()
    timetableId = serializers.CharField()
    date = serializers.CharField()
    dayOfWeek = serializers.IntegerField()
    dayOfWeekLabel = serializers.CharField()
    periodNumber = serializers.IntegerField()
    periodName = serializers.CharField()
    shift = serializers.CharField()
    startTime = serializers.CharField()
    endTime = serializers.CharField()
    subjectId = serializers.CharField(allow_blank=True)
    subjectName = serializers.CharField()
    teacherId = serializers.CharField(allow_blank=True)
    teacherName = serializers.CharField()
    teacherEmail = serializers.CharField(allow_blank=True)
    roomName = serializers.CharField(allow_blank=True, required=False)


class LeaveNotifiedTeacherSerializer(serializers.Serializer):
    """
    Representation of a subject teacher notified about the student's absence in their subject periods.
    """

    teacherId = serializers.CharField(allow_blank=True)
    teacherName = serializers.CharField()
    teacherEmail = serializers.CharField(allow_blank=True)
    subjects = serializers.ListField(child=serializers.CharField())
    lessonCount = serializers.IntegerField()
    periodsSummary = serializers.ListField(child=serializers.CharField(), required=False)
    role = serializers.CharField(default="SUBJECT_TEACHER")
    canApprove = serializers.BooleanField(default=False)
    isHomeroomTeacher = serializers.BooleanField(default=False, required=False)
    notificationStatus = serializers.CharField(default="NOTIFIED")


class LeaveRequestEventLogItemSerializer(serializers.Serializer):
    """
    Chronological event log entry for a leave request workflow.
    """

    id = serializers.CharField()
    eventType = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    actor = serializers.CharField()
    actorRole = serializers.CharField(allow_blank=True, required=False)
    badgeText = serializers.CharField(allow_blank=True, required=False)
    badgeColor = serializers.CharField(allow_blank=True, required=False)
    recipientEmail = serializers.CharField(allow_blank=True, required=False)
    emailSent = serializers.BooleanField(default=False)
    createdAt = serializers.CharField()


class LeaveRequestItemResponseSerializer(serializers.Serializer):
    """
    Formatted response representation of a student leave request item for frontend clients.
    """

    id = serializers.CharField()
    code = serializers.CharField()
    requestCode = serializers.CharField()
    studentId = serializers.CharField()
    studentCode = serializers.CharField(allow_blank=True)
    studentName = serializers.CharField()
    classId = serializers.CharField()
    className = serializers.CharField()
    leaveType = serializers.CharField()
    leaveTypeCode = serializers.CharField()
    status = serializers.CharField()
    statusCode = serializers.CharField()
    startDate = serializers.CharField()
    endDate = serializers.CharField()
    totalDays = serializers.FloatField()
    sessionShift = serializers.CharField(default="all_day")
    reason = serializers.CharField()
    commitment = serializers.CharField(allow_blank=True, required=False)
    supportingDocumentUrl = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    attachments = LeaveRequestAttachmentSerializer(many=True, required=False)
    affectedSubjects = serializers.ListField(child=serializers.CharField(), required=False)
    affectedLessons = LeaveAffectedLessonSerializer(many=True, required=False)
    notifiedTeachers = LeaveNotifiedTeacherSerializer(many=True, required=False)
    guardianName = serializers.CharField(allow_blank=True, required=False)
    guardianPhone = serializers.CharField(allow_blank=True, required=False)
    guardianRelationship = serializers.CharField(allow_blank=True, required=False)
    homeroomTeacherName = serializers.CharField(allow_blank=True, required=False)
    homeroomTeacherEmail = serializers.CharField(allow_blank=True, required=False)
    homeroomTeacherPhone = serializers.CharField(allow_blank=True, required=False)
    teacherNote = serializers.CharField(allow_blank=True, required=False)
    reviewedByName = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    reviewedAt = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    firstLessonStartAt = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    approvalDeadline = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    isAutoApproved = serializers.BooleanField(default=False, required=False)
    eventLogs = LeaveRequestEventLogItemSerializer(many=True, required=False)
    cancelReason = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    cancelledAt = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    createdAt = serializers.CharField()
    updatedAt = serializers.CharField()


class LeaveRequestSummaryResponseSerializer(serializers.Serializer):
    """
    Summary overview metrics and student context for leave requests view.
    """

    total = serializers.IntegerField()
    pendingCount = serializers.IntegerField()
    approvedCount = serializers.IntegerField()
    rejectedCount = serializers.IntegerField()
    cancelledCount = serializers.IntegerField()
    totalDaysOff = serializers.FloatField()
    maxAllowedDays = serializers.IntegerField()
    className = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    semesterName = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    academicYear = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    homeroomTeacherName = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    homeroomTeacherEmail = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    homeroomTeacherPhone = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    guardianName = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    guardianPhone = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    guardianRelationship = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class CreateUpdateLeaveRequestInputSerializer(serializers.Serializer):
    """
    Input schema for creating or updating a student leave request.
    """

    leaveType = serializers.CharField(required=False, default="sick")
    leave_type = serializers.CharField(required=False)
    startDate = serializers.CharField(required=False)
    start_date = serializers.DateField(required=False)
    endDate = serializers.CharField(required=False)
    end_date = serializers.DateField(required=False)
    sessionShift = serializers.ChoiceField(
        choices=["all_day", "morning", "afternoon"],
        required=False,
        default="all_day",
    )
    reason = serializers.CharField(required=True)
    commitment = serializers.CharField(required=False, allow_blank=True)
    supportingDocumentUrl = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    supporting_document_url = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    attachments = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )
    selectedLessonKeys = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )
    guardianName = serializers.CharField(required=False, allow_blank=True)
    guardianPhone = serializers.CharField(required=False, allow_blank=True)
    guardianRelationship = serializers.CharField(required=False, allow_blank=True)


class CancelLeaveRequestInputSerializer(serializers.Serializer):
    """
    Input schema for cancelling a pending leave request.
    """

    reason = serializers.CharField(required=False, allow_blank=True, default="")


class ReviewLeaveRequestInputSerializer(serializers.Serializer):
    """
    Input schema for approving or rejecting leave requests.
    """

    action = serializers.ChoiceField(choices=["APPROVE", "REJECT"])
    teacher_note = serializers.CharField(required=False, allow_blank=True, default="")
