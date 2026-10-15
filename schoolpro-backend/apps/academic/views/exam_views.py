"""
REST API ViewSet for Academic Exams and Student Submissions.
Follows Clean Architecture: delegates orchestration to ExamService and outputs via APIResponse.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.academic.serializers.exam_serializers import (
    ExamItemSerializer,
    ExamSubmissionResponseSerializer,
    ExamSubmitRequestSerializer,
    ExamSummarySerializer,
)
from apps.academic.services.exam_service import ExamService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List student exams",
        description="Retrieve filtered and search-enabled list of exams for authenticated student.",
        parameters=[
            OpenApiParameter("q", str, description="Search keyword in title, course, or teacher"),
            OpenApiParameter(
                "status", str, description="Filter by status (pending, completed, expired, all)"
            ),
            OpenApiParameter("semester", str, description="Filter by semester (HK1, HK2, all)"),
        ],
        responses={200: ExamItemSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get exam detail with dynamic questions",
        description="Retrieve full examination config, dynamic Google Form-like question items, and submission status.",
        responses={200: ExamItemSerializer},
    ),
)
class StudentExamViewSet(viewsets.ViewSet):
    """
    ViewSet providing student examination feed, dynamic form questions, submissions, and evaluation.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ExamService()

    def list(self, request):
        """
        List exams for student with filters and search.
        """
        search_query = request.query_params.get("q") or request.query_params.get("search")
        status_filter = request.query_params.get("status")
        semester = request.query_params.get("semester")
        sort_by = request.query_params.get("sortBy") or request.query_params.get("sort_by")

        items = self.service.list_exams(
            user=request.user,
            search_query=search_query,
            status_filter=status_filter,
            semester=semester,
            sort_by=sort_by,
        )
        serializer = ExamItemSerializer(items, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Danh sách đề thi lấy thành công.",
        )

    @extend_schema(
        summary="Get exam summary metrics",
        description="Retrieve total, pending, completed, expired counts and average score.",
        responses={200: ExamSummarySerializer},
    )
    @action(detail=False, methods=["get"])
    def summary(self, request):
        """
        Summary counters for the student exam dashboard.
        """
        data = self.service.get_summary(request.user)
        serializer = ExamSummarySerializer(data)
        return APIResponse.success(data=serializer.data)

    def retrieve(self, request, pk=None):
        """
        Get single exam detail including dynamic questions and previous submission if available.
        """
        item = self.service.get_exam_detail(pk, request.user)
        if not item:
            return APIResponse.error(
                message="Không tìm thấy bài thi hoặc bạn không có quyền truy cập.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = ExamItemSerializer(item)
        return APIResponse.success(data=serializer.data)

    @extend_schema(
        summary="Submit exam answers",
        description="Validate required questions, calculate auto-grading, and record student submission.",
        request=ExamSubmitRequestSerializer,
        responses={200: ExamSubmissionResponseSerializer},
    )
    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """
        Submit exam responses with automated scoring.
        """
        serializer = ExamSubmitRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Dữ liệu nộp bài không hợp lệ.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        answers = serializer.validated_data["answers"]
        allow_incomplete = serializer.validated_data.get("allowIncomplete", False)
        try:
            result = self.service.submit_exam(
                pk, request.user, answers, allow_incomplete=allow_incomplete
            )
            resp_serializer = ExamSubmissionResponseSerializer(result)
            return APIResponse.success(
                data=resp_serializer.data,
                message=result.get("message", "Nộp bài thi thành công!"),
            )
        except ValueError as exc:
            return APIResponse.error(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return APIResponse.error(
                message=f"Lỗi xử lý nộp bài: {str(exc)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        summary="Get past exam submission",
        description="Retrieve past student attempt answers and scores for an exam.",
        responses={200: ExamSubmissionResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def submission(self, request, pk=None):
        """
        Retrieve past submission answers and result.
        """
        sub = self.service.get_submission(pk, request.user)
        if not sub:
            return APIResponse.error(
                message="Chưa có bài nộp cho đề thi này.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(data=sub)
