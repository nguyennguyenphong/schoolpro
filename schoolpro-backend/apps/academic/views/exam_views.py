"""
REST API ViewSet for Academic Exams and Student Submissions.
Follows Clean Architecture: delegates orchestration to ExamService and outputs via APIResponse.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.negotiation import DefaultContentNegotiation
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.academic.serializers.exam_serializers import (
    ExamItemSerializer,
    ExamSubmissionResponseSerializer,
    ExamSubmitRequestSerializer,
    ExamSummarySerializer,
)
from apps.academic.services.exam_service import ExamService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


class ExamContentNegotiation(DefaultContentNegotiation):
    """
    Custom content negotiation that does not treat business filter `format` (e.g. essay, multiple_choice)
    as a DRF renderer format override unless matching an active renderer format (e.g. json, api).
    """

    def filter_renderers(self, renderers, format):
        filtered = [
            renderer for renderer in renderers if getattr(renderer, "format", None) == format
        ]
        return filtered if filtered else renderers


class ExamPagination(PageNumberPagination):
    """
    Pagination tailored for student exams list, accommodating both pageSize and page_size params.
    Enforces allowed page sizes: 10, 20, 50, 100 with default 10.
    """

    page_size = 10
    page_size_query_param = "pageSize"
    max_page_size = 100
    page_query_param = "page"

    ALLOWED_PAGE_SIZES = {10, 20, 50, 100}

    def get_page_size(self, request):
        params = getattr(request, "query_params", getattr(request, "GET", {}))
        size_val = params.get("pageSize") or params.get("page_size")
        if size_val:
            try:
                size_int = int(size_val)
                if size_int in self.ALLOWED_PAGE_SIZES:
                    return size_int
                return self.page_size
            except (ValueError, TypeError):
                return self.page_size
        return self.page_size


@extend_schema_view(
    list=extend_schema(
        summary="List student exams",
        description="Retrieve filtered, sorted, and paginated list of exams for authenticated student within current academic context.",
        parameters=[
            OpenApiParameter("q", str, description="Search keyword in title, course, or teacher"),
            OpenApiParameter("search", str, description="Alias for q"),
            OpenApiParameter(
                "status", str, description="Filter by status (pending, completed, expired, all)"
            ),
            OpenApiParameter(
                "subject", str, description="Filter by subject code, name, or id (or all)"
            ),
            OpenApiParameter(
                "format",
                str,
                description="Filter by exam format (essay, multiple_choice, mixed, all)",
            ),
            OpenApiParameter("sortBy", str, description="Sorting mode (newest, upcoming, score)"),
            OpenApiParameter("page", int, description="Page number"),
            OpenApiParameter(
                "pageSize",
                int,
                description="Number of items per page (10, 20, 50, 100). Default: 10",
            ),
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
    pagination_class = ExamPagination
    content_negotiation_class = ExamContentNegotiation

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ExamService()

    def list(self, request):
        """
        List exams for student with filters, search, and pagination.
        """
        search_query = request.query_params.get("q") or request.query_params.get("search")
        status_filter = request.query_params.get("status")
        subject = request.query_params.get("subject")
        format_filter = (
            request.query_params.get("format")
            or request.query_params.get("examFormat")
            or request.query_params.get("exam_format")
        )
        sort_by = request.query_params.get("sortBy") or request.query_params.get("sort_by")

        items = self.service.list_exams(
            user=request.user,
            search_query=search_query,
            status_filter=status_filter,
            subject=subject,
            format_filter=format_filter,
            sort_by=sort_by,
        )

        paginator = self.pagination_class()
        try:
            page = paginator.paginate_queryset(items, request)
            total_items = paginator.page.paginator.count
            current_page = paginator.page.number
            page_size = paginator.get_page_size(request) or 10
            total_pages = paginator.page.paginator.num_pages
        except Exception:
            page_size = paginator.get_page_size(request) or 10
            total_items = len(items)
            total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0
            current_page = 1
            page = items[:page_size]

        serializer = ExamItemSerializer(page, many=True)

        return Response(
            {
                "success": True,
                "code": 200,
                "message": "Danh sách bài thi",
                "data": {
                    "items": serializer.data,
                    "total": total_items,
                    "page": current_page,
                    "pageSize": page_size,
                    "totalPages": total_pages,
                },
                "meta": {
                    "pagination": {
                        "page": current_page,
                        "page_size": page_size,
                        "total_items": total_items,
                        "total_pages": total_pages,
                    }
                },
            },
            status=status.HTTP_200_OK,
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
