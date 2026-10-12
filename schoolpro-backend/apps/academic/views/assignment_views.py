"""
REST API ViewSet for Academic Assignments and Student Submissions.
Follows Clean Architecture: delegates orchestration to AssignmentService and outputs via APIResponse.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.academic.serializers.assignment_serializers import (
    AssignmentItemResponseSerializer,
    AssignmentSummaryResponseSerializer,
    ReopenRequestInputSerializer,
    ScoreAppealInputSerializer,
    SubmitAssignmentRequestSerializer,
)
from apps.academic.services.assignment_service import AssignmentService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


class AssignmentPagination(PageNumberPagination):
    """
    Pagination tailored for assignments list, accommodating both pageSize and page_size params.
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
        summary="List student assignments",
        description="Retrieve filtered and paginated list of class assignments for authenticated student.",
        parameters=[
            OpenApiParameter("q", str, description="Search keyword in title, subject, or teacher"),
            OpenApiParameter(
                "search",
                str,
                description="Search keyword in title, subject, or teacher (alias for q)",
            ),
            OpenApiParameter("subject", str, description="Filter by subject code (or all)"),
            OpenApiParameter(
                "status",
                str,
                description="Filter by status (pending, submitted, graded, overdue, all)",
            ),
            OpenApiParameter(
                "type",
                str,
                description="Filter by assignment type (homework, quiz, project, essay, all)",
            ),
            OpenApiParameter("sortBy", str, description="Sorting mode (newest, due_soon, score)"),
            OpenApiParameter("page", int, description="Page number"),
            OpenApiParameter("pageSize", int, description="Number of items per page"),
        ],
        responses={200: AssignmentItemResponseSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get assignment detail",
        description="Retrieve full assignment requirement, teacher attachments, rubric, event logs, and student submission.",
        responses={200: AssignmentItemResponseSerializer},
    ),
)
class StudentAssignmentViewSet(viewsets.ViewSet):
    """
    ViewSet providing student homework feed, detail view, submission, reopen requests, and score appeals.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AssignmentPagination

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AssignmentService()

    def list(self, request):
        """
        List assignments with server-side filtering, sorting, and pagination.
        """
        user = request.user
        search_query = request.query_params.get("q") or request.query_params.get("search")
        subject = request.query_params.get("subject")
        status_filter = request.query_params.get("status")
        type_filter = request.query_params.get("type")
        sort_by = request.query_params.get("sortBy") or request.query_params.get("sort_by")

        items = self.service.list_assignments(
            user=user,
            subject=subject,
            status_filter=status_filter,
            type_filter=type_filter,
            search_query=search_query,
            sort_by=sort_by,
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(items, request)

        serializer = AssignmentItemResponseSerializer(page, many=True)

        return Response(
            {
                "success": True,
                "code": 200,
                "message": "Danh sách bài tập",
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

    def retrieve(self, request, pk=None):
        """
        Retrieve single assignment detail with attachments and student submission.
        """
        try:
            item = self.service.get_assignment_detail(
                user=request.user,
                assignment_id=pk,
            )
            serializer = AssignmentItemResponseSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="Chi tiết bài tập",
            )
        except Exception as e:
            return APIResponse.error(
                message=str(e),
                status_code=status.HTTP_404_NOT_FOUND,
            )

    @extend_schema(
        summary="Get assignment summary and metrics",
        description="Aggregated count of total, pending, submitted, graded, overdue, average score, and class subjects.",
        responses={200: AssignmentSummaryResponseSerializer},
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Retrieve summary metrics for assignment dashboard.
        """
        summary_data = self.service.get_summary(user=request.user)
        serializer = AssignmentSummaryResponseSerializer(summary_data)
        return APIResponse.success(
            data=serializer.data,
            message="Thống kê bài tập",
        )

    @extend_schema(
        summary="Submit assignment online",
        description="Submit answer text and attached solution files for an assignment.",
        request=SubmitAssignmentRequestSerializer,
        responses={200: AssignmentItemResponseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        """
        Submit homework answer and attachments.
        """
        serializer = SubmitAssignmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        content = data.get("content", "")
        files = data.get("files", [])

        try:
            updated_item = self.service.submit_assignment(
                user=request.user,
                assignment_id=pk,
                content=content,
                files=files,
            )
            response_serializer = AssignmentItemResponseSerializer(updated_item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Nộp bài tập thành công",
            )
        except Exception as e:
            return APIResponse.error(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Request reopening late assignment",
        description="Send justification request to teacher to reopen an overdue assignment port.",
        request=ReopenRequestInputSerializer,
        responses={200: AssignmentItemResponseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="reopen")
    def reopen(self, request, pk=None):
        """
        Submit late reopen request.
        """
        serializer = ReopenRequestInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data["reason"]
        try:
            updated_item = self.service.request_reopen(
                user=request.user,
                assignment_id=pk,
                reason=reason,
            )
            response_serializer = AssignmentItemResponseSerializer(updated_item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Đã gửi yêu cầu mở lại nộp bài đến giáo viên",
            )
        except Exception as e:
            return APIResponse.error(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Submit score appeal for graded assignment",
        description="Send a score appeal (phúc khảo điểm) to the subject teacher for a graded assignment.",
        request=ScoreAppealInputSerializer,
        responses={200: AssignmentItemResponseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="appeal")
    def appeal(self, request, pk=None):
        """
        Submit score appeal request for a graded assignment.
        """
        serializer = ScoreAppealInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data["reason"]
        attachments = serializer.validated_data.get("attachments", [])
        try:
            updated_item = self.service.submit_appeal(
                user=request.user,
                assignment_id=pk,
                reason=reason,
                attachments=attachments,
            )
            response_serializer = AssignmentItemResponseSerializer(updated_item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Đã gửi yêu cầu phúc khảo điểm đến giáo viên bộ môn",
            )
        except Exception as e:
            return APIResponse.error(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
