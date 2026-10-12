"""
REST API ViewSets for Academic Attendance, Leave Requests, and Attendance Logs.
"""

from django.http import HttpResponse
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.academic.models.attendance import Attendance, AttendanceLog, LeaveRequest
from apps.academic.serializers.attendance_serializers import (
    AttendanceLogSerializer,
    AttendanceSerializer,
    BulkMarkAttendanceRequestSerializer,
    CancelLeaveRequestInputSerializer,
    CreateUpdateLeaveRequestInputSerializer,
    LeaveRequestItemResponseSerializer,
    LeaveRequestSerializer,
    LeaveRequestSummaryResponseSerializer,
    OpenAttendanceSessionInputSerializer,
    ReviewLeaveRequestInputSerializer,
    StudentCheckInInputSerializer,
)
from apps.academic.services.attendance_realtime import AttendanceRealtimeService
from apps.academic.services.attendance_service import AttendanceService
from apps.academic.services.attendance_session_service import AttendanceSessionService
from apps.academic.services.leave_request_service import LeaveRequestService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


class LeaveRequestPagination(PageNumberPagination):
    """
    Pagination tailored for leave requests list, accommodating both pageSize and page_size params.
    """

    page_size = 10
    page_size_query_param = "pageSize"
    max_page_size = 50
    page_query_param = "page"

    def get_page_size(self, request):
        if "pageSize" in request.query_params:
            return super().get_page_size(request)
        if "page_size" in request.query_params:
            self.page_size_query_param = "page_size"
        return super().get_page_size(request)


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
    ViewSet for attendance roll-call records, teacher sessions, GPS check-ins, and audit trails.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendanceSerializer
    queryset = (
        Attendance.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "subject",
            "period",
            "session",
            "recorded_by",
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
        summary="Get student daily subject attendance schedule and sessions",
        description=(
            "Returns subject attendance cards for the selected date with 6-digit PIN, "
            "QR token, teacher GPS coordinates, allowed radius, countdown timer, and check-in status."
        ),
        parameters=[
            OpenApiParameter("date", str, description="Target date (YYYY-MM-DD)"),
            OpenApiParameter(
                "shift",
                str,
                description="Filter by shift (all, morning, afternoon, evening)",
            ),
            OpenApiParameter(
                "status",
                str,
                description="Filter by status (all, open, present, upcoming, excused, absent)",
            ),
            OpenApiParameter("q", str, description="Search keyword"),
        ],
    )
    @action(detail=False, methods=["get"], url_path="daily")
    def daily(self, request):
        date_str = request.query_params.get("date")
        shift_filter = request.query_params.get("shift")
        status_filter = request.query_params.get("status")
        search_query = request.query_params.get("q") or request.query_params.get("search")

        result = AttendanceSessionService.list_student_attendance_by_date(
            user=request.user,
            date_str=date_str,
            shift_filter=shift_filter,
            status_filter=status_filter,
            search_query=search_query,
        )
        return APIResponse.success(
            data=result,
            message="Danh sách điểm danh môn học theo ngày",
        )

    @extend_schema(
        summary="Get student attendance summary",
        description="Returns daily and overall semester attendance metrics.",
        parameters=[
            OpenApiParameter("date", str, description="Target date (YYYY-MM-DD)"),
        ],
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        date_str = request.query_params.get("date")
        result = AttendanceSessionService.list_student_attendance_by_date(
            user=request.user,
            date_str=date_str,
        )
        return APIResponse.success(
            data=result["summary"],
            message="Thống kê chuyên cần của học sinh",
        )

    @extend_schema(
        summary="Student check-in via 6-digit PIN or QR code with GPS geofencing",
        description=(
            "Validates 6-digit PIN code or QR token, checks strict expiration time, "
            "and verifies student GPS coordinates are within the teacher's allowed scan radius."
        ),
        request=StudentCheckInInputSerializer,
    )
    @action(detail=False, methods=["post"], url_path="check-in")
    def check_in(self, request):
        serializer = StudentCheckInInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = AttendanceSessionService.student_check_in(
                user=request.user,
                data=serializer.validated_data,
            )
            return APIResponse.success(
                data=result,
                message=result["message"],
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Teacher opens or regenerates an attendance session (6-digit PIN + QR + GPS radius)",
        description=(
            "Creates or updates a real-time attendance session with a 6-digit PIN code, "
            "QR token, teacher GPS coordinates, allowed scan radius in meters, and expiration timer."
        ),
        request=OpenAttendanceSessionInputSerializer,
    )
    @action(detail=False, methods=["post"], url_path="open-session")
    def open_session(self, request):
        serializer = OpenAttendanceSessionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            session_data = AttendanceSessionService.open_or_update_session(
                user=request.user,
                data=serializer.validated_data,
            )
            return APIResponse.success(
                data=session_data,
                message="Mở phiên điểm danh và phát mã 6 chữ số / QR thành công.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Expire or close an attendance session immediately",
        description="Marks an active attendance session as EXPIRED and broadcasts in real time.",
    )
    @action(detail=False, methods=["post"], url_path="expire-session")
    def expire_session(self, request):
        target_id = (
            request.data.get("sessionId")
            or request.data.get("recordId")
            or request.data.get("timetableId")
            or ""
        )
        try:
            session_data = AttendanceSessionService.expire_session_now(
                user=request.user,
                session_id_or_record_id=str(target_id),
            )
            return APIResponse.success(
                data=session_data,
                message="Phiên điểm danh đã hết hạn sử dụng.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Get real-time synchronization snapshot for attendance",
        description="Returns current syncVersion, auto-expires overdue sessions, and provides counts.",
        parameters=[
            OpenApiParameter("date", str, description="Target date (YYYY-MM-DD)"),
            OpenApiParameter("classId", str, description="Optional class UUID"),
            OpenApiParameter("studentId", str, description="Optional student UUID"),
            OpenApiParameter("sessionId", str, description="Optional attendance session UUID"),
        ],
    )
    @action(detail=False, methods=["get"], url_path="realtime-sync")
    def realtime_sync(self, request):
        date_str = request.query_params.get("date")
        class_id = request.query_params.get("classId") or request.query_params.get("class_id")
        student_id = request.query_params.get("studentId") or request.query_params.get("student_id")
        session_id = request.query_params.get("sessionId") or request.query_params.get("session_id")

        snapshot = AttendanceRealtimeService.get_sync_snapshot(
            user=request.user,
            date_str=date_str,
            class_id=class_id,
            student_id=student_id,
            session_id=session_id,
        )
        return APIResponse.success(
            data=snapshot,
            message="Đồng bộ trạng thái thời gian thực điểm danh môn học",
        )

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
        description="Filter leave requests by student, class, status, leaveType, or search query.",
        parameters=[
            OpenApiParameter("class_id", str, description="Filter by class UUID"),
            OpenApiParameter("student_id", str, description="Filter by student UUID"),
            OpenApiParameter(
                "status",
                str,
                description="Filter by status (pending, approved, rejected, cancelled, all)",
            ),
            OpenApiParameter(
                "leaveType",
                str,
                description="Filter by leave type (sick, family_affair, bereavement, official_competition, other, all)",
            ),
            OpenApiParameter("q", str, description="Search keyword"),
            OpenApiParameter(
                "sortBy", str, description="Sorting mode (newest, oldest, start_date)"
            ),
            OpenApiParameter("page", int, description="Page number"),
            OpenApiParameter("pageSize", int, description="Items per page"),
        ],
        responses={200: LeaveRequestItemResponseSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Retrieve leave request detail",
        responses={200: LeaveRequestItemResponseSerializer},
    ),
    create=extend_schema(
        summary="Submit a new leave request",
        request=CreateUpdateLeaveRequestInputSerializer,
        responses={201: LeaveRequestItemResponseSerializer},
    ),
    update=extend_schema(
        summary="Update a pending leave request",
        request=CreateUpdateLeaveRequestInputSerializer,
        responses={200: LeaveRequestItemResponseSerializer},
    ),
)
class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student absence and leave requests.
    Supports paginated list, summary statistics, creation, updating, cancellation, and teacher review.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LeaveRequestSerializer
    pagination_class = LeaveRequestPagination
    queryset = LeaveRequest.objects.select_related(
        "student", "student__user", "school_class", "requested_by", "reviewed_by"
    ).all()

    def list(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status")
        leave_type_filter = request.query_params.get("leaveType") or request.query_params.get(
            "leave_type"
        )
        search_query = request.query_params.get("q") or request.query_params.get("search")
        sort_by = request.query_params.get("sortBy") or request.query_params.get("sort_by")
        class_id = request.query_params.get("class_id")
        student_id = request.query_params.get("student_id")

        items = LeaveRequestService.list_leave_requests(
            user=request.user,
            status_filter=status_filter,
            leave_type_filter=leave_type_filter,
            search_query=search_query,
            sort_by=sort_by,
            class_id=class_id,
            student_id=student_id,
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(items, request)
        serializer = LeaveRequestItemResponseSerializer(page, many=True)

        return Response(
            {
                "success": True,
                "code": 200,
                "message": "Danh sách đơn xin nghỉ phép",
                "data": {
                    "items": serializer.data,
                    "total": paginator.page.paginator.count,
                    "page": paginator.page.number,
                    "pageSize": paginator.get_page_size(request),
                    "totalPages": paginator.page.paginator.num_pages,
                },
                "meta": {
                    "pagination": {
                        "page": paginator.page.number,
                        "page_size": paginator.get_page_size(request),
                        "total_items": paginator.page.paginator.count,
                        "total_pages": paginator.page.paginator.num_pages,
                    }
                },
            },
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            item = LeaveRequestService.get_leave_request_detail(
                user=request.user,
                leave_request_id=str(pk),
            )
            serializer = LeaveRequestItemResponseSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="Chi tiết đơn xin nghỉ phép",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_404_NOT_FOUND,
            )

    def create(self, request, *args, **kwargs):
        serializer = CreateUpdateLeaveRequestInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = LeaveRequestService.create_leave_request(
                user=request.user,
                data=serializer.validated_data,
            )
            output = LeaveRequestItemResponseSerializer(item)
            return APIResponse.created(
                data=output.data,
                message="Gửi đơn xin nghỉ phép thành công.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, pk=None, *args, **kwargs):
        serializer = CreateUpdateLeaveRequestInputSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = LeaveRequestService.update_leave_request(
                user=request.user,
                leave_request_id=str(pk),
                data=serializer.validated_data,
            )
            output = LeaveRequestItemResponseSerializer(item)
            return APIResponse.success(
                data=output.data,
                message="Cập nhật đơn xin nghỉ phép thành công.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    def partial_update(self, request, pk=None, *args, **kwargs):
        return self.update(request, pk, *args, **kwargs)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            LeaveRequestService.delete_leave_request(
                user=request.user,
                leave_request_id=str(pk),
            )
            return APIResponse.success(
                data={"id": str(pk)},
                message="Đã xóa đơn xin nghỉ phép thành công.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Get leave request summary and student context",
        description="Aggregated statistics of leave requests and homeroom teacher/guardian context.",
        responses={200: LeaveRequestSummaryResponseSerializer},
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        summary_data = LeaveRequestService.get_summary(user=request.user)
        serializer = LeaveRequestSummaryResponseSerializer(summary_data)
        return APIResponse.success(
            data=serializer.data,
            message="Thống kê đơn xin nghỉ phép",
        )

    @extend_schema(
        summary="Lookup timetable lessons and subject teachers affected by leave date range",
        description="Returns the list of lessons and subject teachers to notify for the specified startDate, endDate, and sessionShift.",
        parameters=[
            OpenApiParameter("startDate", str, description="Start date (YYYY-MM-DD)"),
            OpenApiParameter("endDate", str, description="End date (YYYY-MM-DD)"),
            OpenApiParameter(
                "sessionShift",
                str,
                description="Shift filter (all_day, morning, afternoon)",
            ),
        ],
    )
    @action(detail=False, methods=["get"], url_path="affected-lessons")
    def affected_lessons(self, request):
        start_date = request.query_params.get("startDate") or request.query_params.get("start_date")
        end_date = request.query_params.get("endDate") or request.query_params.get("end_date")
        session_shift = (
            request.query_params.get("sessionShift")
            or request.query_params.get("session_shift")
            or "all_day"
        )
        result = LeaveRequestService.get_affected_lessons(
            user=request.user,
            start_date_str=start_date,
            end_date_str=end_date,
            session_shift=session_shift,
        )
        return APIResponse.success(
            data=result,
            message="Danh sách các tiết học và giáo viên bộ môn nhận thông báo",
        )

    @extend_schema(
        summary="Cancel a pending leave request",
        description="Allows student to cancel their own leave request while it is still PENDING.",
        request=CancelLeaveRequestInputSerializer,
        responses={200: LeaveRequestItemResponseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        serializer = CancelLeaveRequestInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = LeaveRequestService.cancel_leave_request(
                user=request.user,
                leave_request_id=str(pk),
                cancel_reason=serializer.validated_data.get("reason", ""),
            )
            output = LeaveRequestItemResponseSerializer(item)
            return APIResponse.success(
                data=output.data,
                message="Đã hủy đơn xin nghỉ phép thành công.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Download leave request document via dynamic ExportTemplate",
        description=(
            "Fetches latest leave request data from database and exports it using "
            "the active ExportTemplate in sys.export_templates (supports PDF, HTML, WORD)."
        ),
        parameters=[
            OpenApiParameter(
                "format",
                str,
                description="Optional output format override: pdf, html, word (defaults to template's file_format)",
            ),
            OpenApiParameter(
                "templateCode",
                str,
                description="Optional template code override (defaults to LEAVE_REQUEST_OFFICIAL_A4)",
            ),
            OpenApiParameter(
                "templateId",
                str,
                description="Optional specific ExportTemplate UUID",
            ),
        ],
    )
    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        output_format = request.query_params.get("format") or request.query_params.get(
            "file_format"
        )
        template_code = request.query_params.get("templateCode") or request.query_params.get(
            "template_code"
        )
        template_id = request.query_params.get("templateId") or request.query_params.get(
            "template_id"
        )
        try:
            file_bytes, filename, content_type = LeaveRequestService.export_leave_request_file(
                user=request.user,
                leave_request_id=str(pk),
                template_code=template_code,
                template_id=template_id,
                output_format=output_format,
            )
            response = HttpResponse(file_bytes, content_type=content_type)
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            response["Access-Control-Expose-Headers"] = "Content-Disposition"
            return response
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_404_NOT_FOUND,
            )

    @extend_schema(
        summary="Render leave request HTML/CSS via dynamic ExportTemplate",
        description="Renders the leave request into full HTML & CSS using sys.export_templates for print or preview.",
        parameters=[
            OpenApiParameter(
                "templateCode",
                str,
                description="Optional template code override (defaults to LEAVE_REQUEST_OFFICIAL_A4)",
            ),
            OpenApiParameter(
                "templateId",
                str,
                description="Optional specific ExportTemplate UUID",
            ),
        ],
    )
    @action(detail=True, methods=["get"], url_path="export-render")
    def export_render(self, request, pk=None):
        template_code = request.query_params.get("templateCode") or request.query_params.get(
            "template_code"
        )
        template_id = request.query_params.get("templateId") or request.query_params.get(
            "template_id"
        )
        try:
            rendered = LeaveRequestService.render_leave_request_html(
                user=request.user,
                leave_request_id=str(pk),
                template_code=template_code,
                template_id=template_id,
            )
            return APIResponse.success(
                data=rendered,
                message="Render biểu mẫu đơn xin nghỉ phép thành công.",
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_404_NOT_FOUND,
            )

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
            return APIResponse.error(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get real-time synchronization snapshot for leave requests",
        description="Returns current syncVersion, latest timestamp, and runs 3-hour pre-lesson auto-approval check.",
        parameters=[
            OpenApiParameter("classId", str, description="Optional class UUID"),
            OpenApiParameter("studentId", str, description="Optional student UUID"),
            OpenApiParameter(
                "leaveRequestId", str, description="Optional single leave request UUID"
            ),
        ],
    )
    @action(detail=False, methods=["get"], url_path="realtime-sync")
    def realtime_sync(self, request):
        from apps.academic.services.leave_request_realtime import LeaveRequestRealtimeService

        class_id = request.query_params.get("classId") or request.query_params.get("class_id")
        student_id = request.query_params.get("studentId") or request.query_params.get("student_id")
        leave_request_id = request.query_params.get("leaveRequestId") or request.query_params.get(
            "leave_request_id"
        )

        snapshot = LeaveRequestRealtimeService.get_sync_snapshot(
            user=request.user,
            class_id=class_id,
            student_id=student_id,
            leave_request_id=leave_request_id,
        )
        return APIResponse.success(
            data=snapshot,
            message="Đồng bộ trạng thái thời gian thực đơn xin nghỉ phép",
        )


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
