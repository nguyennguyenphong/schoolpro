"""
REST API ViewSet for School Announcements and Notification Receipts.
Follows Clean Architecture: delegates orchestration to AnnouncementService and outputs via APIResponse.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.core.authentication import SchoolProJWTAuthentication
from apps.notification.serializers.announcement_serializers import (
    AnnouncementCategoryItemSerializer,
    AnnouncementItemResponseSerializer,
    AnnouncementSummaryResponseSerializer,
    MarkReadResponseSerializer,
    UnreadCountResponseSerializer,
)
from apps.notification.services.announcement_service import AnnouncementService
from common.responses.response import APIResponse


class AnnouncementPagination(PageNumberPagination):
    """
    Pagination tailored for announcements feed, accommodating both pageSize and page_size params.
    """

    page_size = 9
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
        summary="List user announcements",
        description="Retrieve filtered and paginated list of official bulletins and class notices for the authenticated user.",
        parameters=[
            OpenApiParameter(
                "search",
                str,
                description="Search keyword in title, summary, content, or department",
            ),
            OpenApiParameter(
                "category",
                str,
                description="Filter by category (exam, academic, tuition, activity, emulation, general, or custom category, or all)",
            ),
            OpenApiParameter(
                "department",
                str,
                description="Filter by issuing department (UUID, department code, or department name)",
            ),
            OpenApiParameter(
                "priority", str, description="Filter by priority level (urgent, high, normal, all)"
            ),
            OpenApiParameter(
                "readStatus", str, description="Filter by read status (all, unread, read)"
            ),
            OpenApiParameter(
                "sortBy", str, description="Sorting mode (newest, oldest, views, priority)"
            ),
            OpenApiParameter("page", int, description="Page number"),
            OpenApiParameter("pageSize", int, description="Number of items per page"),
        ],
        responses={200: AnnouncementItemResponseSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get announcement detail",
        description="Retrieve full announcement content by ID, auto-marks as read and increments views.",
        responses={200: AnnouncementItemResponseSerializer},
    ),
)
class AnnouncementViewSet(viewsets.ViewSet):
    """
    ViewSet providing announcement feeds, detail viewing, and read confirmation operations.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AnnouncementPagination

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AnnouncementService()

    def list(self, request):
        """
        List announcements with server-side filtering, sorting, and pagination.
        """
        user = request.user
        search_query = request.query_params.get("search") or request.query_params.get("q")
        category = request.query_params.get("category")
        department = request.query_params.get("department") or request.query_params.get("dept")
        priority = request.query_params.get("priority")
        read_status = request.query_params.get("readStatus") or request.query_params.get(
            "read_status"
        )
        sort_by = request.query_params.get("sortBy") or request.query_params.get("sort_by")

        queryset = self.service.list_announcements(
            user=user,
            search_query=search_query,
            category=category,
            department=department,
            priority=priority,
            read_status=read_status,
            sort_by=sort_by,
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        serializer = AnnouncementItemResponseSerializer(page, many=True)

        return Response(
            {
                "success": True,
                "code": 200,
                "message": "Danh sách thông báo",
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
        Retrieve single announcement detail, increment view counter and mark as read.
        """
        try:
            announcement = self.service.get_announcement_detail(
                user=request.user,
                announcement_id=pk,
                auto_mark_read=True,
            )
            serializer = AnnouncementItemResponseSerializer(announcement)
            return APIResponse.success(
                data=serializer.data,
                message="Chi tiết thông báo",
            )
        except Exception as e:
            return APIResponse.error(
                message=str(e),
                status_code=status.HTTP_404_NOT_FOUND,
            )

    @extend_schema(
        summary="Mark announcement as read",
        description="Acknowledge reading of a specific announcement.",
        responses={200: MarkReadResponseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        """
        Mark announcement receipt.
        """
        success = self.service.mark_as_read(user=request.user, announcement_id=pk)
        if not success:
            return APIResponse.error(
                message="Không tìm thấy thông báo cần đánh dấu.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data={"success": True},
            message="Đã đánh dấu đã đọc",
        )

    @extend_schema(
        summary="Mark all announcements as read",
        description="Bulk mark all unread eligible announcements as read for current user.",
        responses={200: MarkReadResponseSerializer},
    )
    @action(detail=False, methods=["post"], url_path="read-all")
    def mark_all_read(self, request):
        """
        Bulk acknowledge all unread announcements.
        """
        marked_count = self.service.mark_all_as_read(user=request.user)
        return APIResponse.success(
            data={"success": True, "markedCount": marked_count},
            message=f"Đã đánh dấu {marked_count} thông báo là đã đọc",
        )

    @extend_schema(
        summary="Get announcement category summary and counters",
        description="Aggregated count of total, unread, urgent, and category breakdown.",
        responses={200: AnnouncementSummaryResponseSerializer},
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Retrieve summary metrics.
        """
        summary_data = self.service.get_summary(user=request.user)
        serializer = AnnouncementSummaryResponseSerializer(summary_data)
        return APIResponse.success(
            data=serializer.data,
            message="Thống kê thông báo",
        )

    @extend_schema(
        summary="Get unread notifications count",
        description="Fast endpoint for header badge counter.",
        responses={200: UnreadCountResponseSerializer},
    )
    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        """
        Quick unread counter for navigation bar notification icon.
        """
        count = self.service.get_unread_count(user=request.user)
        return APIResponse.success(
            data={"unreadCount": count},
            message="Số thông báo chưa đọc",
        )

    @extend_schema(
        summary="Get available announcement categories",
        description="Get distinct active announcement categories for user's school with item counts and localized labels.",
        responses={200: AnnouncementCategoryItemSerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="categories")
    def categories(self, request):
        """
        Retrieve dynamic announcement categories for user's school.
        """
        categories_data = self.service.get_categories(user=request.user)
        serializer = AnnouncementCategoryItemSerializer(categories_data, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Danh sách chuyên mục thông báo",
        )

    @extend_schema(
        summary="Get issuing departments for announcements",
        description="Get distinct issuing departments present in announcements for current school.",
    )
    @action(detail=False, methods=["get"], url_path="departments")
    def departments(self, request):
        """
        Retrieve distinct departments issuing announcements.
        """
        departments_data = self.service.get_departments(user=request.user)
        return APIResponse.success(
            data=departments_data,
            message="Danh sách đơn vị ban hành thông báo",
        )
