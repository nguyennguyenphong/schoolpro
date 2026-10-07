"""
REST API ViewSets for Academic Attendance, Leave Requests, and Attendance Logs.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.academic.models.attendance import Attendance, AttendanceLog, LeaveRequest
from apps.academic.serializers.attendance_serializers import (
    AttendanceLogSerializer,
    AttendanceSerializer,
    BulkMarkAttendanceRequestSerializer,
    LeaveRequestSerializer,
    ReviewLeaveRequestInputSerializer,
)
from apps.academic.services.attendance_service import AttendanceService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List attendance records",
        description="Filter attendance records by class, date range, or student.",
        parameters=[
            OpenApiParameter("class_id", str, description="Filter by class UUID"),
            OpenApiParameter("student_id", str, description="Filter by student UUID"),
            OpenApiParameter("date", str, description="Filter by attendance date (YYYY-MM-DD)"),
            OpenApiParameter("status", str, description="Filter by attendance status"),
        ],
    ),
    retrieve=extend_schema(summary="Retrieve attendance record detail"),
)
class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for attendance roll-call records and audit trails.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendanceSerializer
    queryset = (
        Attendance.objects.select_related(
            "student", "student__user", "school_class", "period", "recorded_by"
        )
        .prefetch_related("logs", "logs__performed_by")
        .all()
    )

    def get_queryset(self):
        qs = super().get_queryset()
        class_id = self.request.query_params.get("class_id")
        student_id = self.request.query_params.get("student_id")
        date_str = self.request.query_params.get("date")
        att_status = self.request.query_params.get("status")

        if class_id:
            qs = qs.filter(school_class_id=class_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if date_str:
            qs = qs.filter(attendance_date=date_str)
        if att_status:
            qs = qs.filter(status=att_status)
        return qs

    @extend_schema(
        summary="Bulk mark class attendance",
        description="Submit roll-call for students in a class. Creates or updates attendance and generates audit logs.",
        request=BulkMarkAttendanceRequestSerializer,
        responses={200: AttendanceSerializer(many=True)},
    )
    @action(detail=False, methods=["post"], url_path="bulk-mark")
    def bulk_mark(self, request):
        serializer = BulkMarkAttendanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        records = AttendanceService.bulk_mark_attendance(
            class_id=data["class_id"],
            attendance_date=data["attendance_date"],
            records=data["records"],
            recorded_by=request.user,
            period_id=data.get("period_id"),
        )
        output_serializer = AttendanceSerializer(records, many=True)
        return APIResponse.success(
            data=output_serializer.data,
            message="Attendance roll-call saved successfully.",
        )


@extend_schema_view(
    list=extend_schema(
        summary="List student leave requests",
        description="Filter leave requests by student, class, status, or date range.",
        parameters=[
            OpenApiParameter("class_id", str, description="Filter by class UUID"),
            OpenApiParameter("student_id", str, description="Filter by student UUID"),
            OpenApiParameter(
                "status", str, description="Filter by status (PENDING, APPROVED, REJECTED)"
            ),
        ],
    ),
    retrieve=extend_schema(summary="Retrieve leave request detail"),
    create=extend_schema(summary="Submit a new leave request"),
)
class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student absence and leave requests.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LeaveRequestSerializer
    queryset = LeaveRequest.objects.select_related(
        "student", "student__user", "school_class", "requested_by", "reviewed_by"
    ).all()

    def get_queryset(self):
        qs = super().get_queryset()
        class_id = self.request.query_params.get("class_id")
        student_id = self.request.query_params.get("student_id")
        req_status = self.request.query_params.get("status")

        if class_id:
            qs = qs.filter(school_class_id=class_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if req_status:
            qs = qs.filter(status=req_status)
        return qs

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @extend_schema(
        summary="Review leave request",
        description="Teacher approves or rejects student leave request. If approved, automatically populates excused attendance records.",
        request=ReviewLeaveRequestInputSerializer,
        responses={200: LeaveRequestSerializer},
    )
    @action(detail=True, methods=["post"], url_path="review")
    def review(self, request, pk=None):
        serializer = ReviewLeaveRequestInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            leave_req = AttendanceService.review_leave_request(
                leave_request_id=pk,
                action=data["action"],
                reviewer=request.user,
                teacher_note=data.get("teacher_note", ""),
            )
            output = LeaveRequestSerializer(leave_req)
            return APIResponse.success(
                data=output.data,
                message=f"Leave request {data['action'].lower()}d successfully.",
            )
        except ValueError as exc:
            return APIResponse.error(message=str(exc), code=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    list=extend_schema(
        summary="List attendance logs",
        description="Retrieve chronological change history of attendance records.",
        parameters=[
            OpenApiParameter("student_id", str, description="Filter by student UUID"),
            OpenApiParameter("attendance_id", str, description="Filter by attendance UUID"),
        ],
    ),
    retrieve=extend_schema(summary="Retrieve attendance log detail"),
)
class AttendanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnly ViewSet for Attendance history audit log.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendanceLogSerializer
    queryset = AttendanceLog.objects.select_related(
        "student", "student__user", "performed_by"
    ).all()

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        attendance_id = self.request.query_params.get("attendance_id")
        if student_id:
            qs = qs.filter(student_id=student_id)
        if attendance_id:
            qs = qs.filter(attendance_id=attendance_id)
        return qs
