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
        read_only_fields = ["id", "created_at", "updated_at", "reviewed_at", "reviewed_by"]


class ReviewLeaveRequestInputSerializer(serializers.Serializer):
    """
    Input schema for approving or rejecting leave requests.
    """

    action = serializers.ChoiceField(choices=["APPROVE", "REJECT"])
    teacher_note = serializers.CharField(required=False, allow_blank=True, default="")
