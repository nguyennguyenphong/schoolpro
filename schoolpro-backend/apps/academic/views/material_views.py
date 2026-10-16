"""
REST API ViewSet for Curriculum Materials and Learning Resources domain.
Provides student material feeds, subject syllabus catalogs, download tracking, and bookmarking.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.academic.serializers.material_serializers import (
    MaterialItemSerializer,
    MaterialSummarySerializer,
    SubjectMaterialItemSerializer,
)
from apps.academic.services.material_service import MaterialService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List learning materials",
        description="Retrieve filtered and paginated learning materials for student.",
        parameters=[
            OpenApiParameter("q", str, description="Search keyword in title, author, description"),
            OpenApiParameter("subject", str, description="Filter by subject code (e.g. MATH11)"),
            OpenApiParameter(
                "category", str, description="Filter by category (lecture, outline, etc.)"
            ),
            OpenApiParameter("semester", str, description="Filter by semester (Học kỳ 1, all)"),
            OpenApiParameter(
                "sortBy", str, description="Sort order (newest, most_downloaded, title_asc)"
            ),
            OpenApiParameter("page", int, description="Page number"),
            OpenApiParameter("pageSize", int, description="Items per page"),
        ],
        responses={200: MaterialItemSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get learning material details",
        description="Retrieve detailed info and attachments for a specific material.",
        responses={200: MaterialItemSerializer},
    ),
)
class StudentMaterialViewSet(viewsets.ViewSet):
    """
    ViewSet providing student access to learning materials, subject catalogs, and downloads.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = MaterialService()

    def list(self, request):
        """
        List learning materials with filtering, sorting, and pagination.
        """
        search_query = request.query_params.get("q") or request.query_params.get("searchQuery")
        subject_code = request.query_params.get("subject") or request.query_params.get(
            "subjectCode"
        )
        category = request.query_params.get("category")
        semester = request.query_params.get("semester")
        sort_by = request.query_params.get("sortBy") or "newest"
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("pageSize", 12))

        result = self.service.get_materials(
            search_query=search_query,
            subject_code=subject_code,
            category=category,
            semester=semester,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
        )

        serializer = MaterialItemSerializer(result["items"], many=True)
        return APIResponse.success(
            data={"items": serializer.data, "total": result["total"]},
            message="Danh sách tài liệu học tập lấy thành công.",
        )

    def retrieve(self, request, pk=None):
        """
        Retrieve details of a single material and record view event.
        """
        item = self.service.get_material_detail(str(pk))
        if not item:
            return APIResponse.error(
                message="Không tìm thấy tài liệu yêu cầu.",
                code=status.HTTP_404_NOT_FOUND,
            )

        serializer = MaterialItemSerializer(item)
        return APIResponse.success(
            data=serializer.data,
            message="Chi tiết tài liệu học tập lấy thành công.",
        )

    @extend_schema(
        summary="List subject syllabus catalog",
        description="Retrieve catalog of subjects with material counters and teacher details.",
        parameters=[
            OpenApiParameter("q", str, description="Search keyword in subject name or teacher"),
            OpenApiParameter("semester", str, description="Filter by semester"),
            OpenApiParameter(
                "sortBy", str, description="Sort order (name_asc, most_materials, most_downloads)"
            ),
            OpenApiParameter("page", int, description="Page number"),
            OpenApiParameter("pageSize", int, description="Items per page"),
        ],
        responses={200: SubjectMaterialItemSerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="subjects")
    def subjects(self, request):
        """
        List subjects with material counters.
        """
        search_query = request.query_params.get("q") or request.query_params.get("searchQuery")
        semester = request.query_params.get("semester")
        sort_by = request.query_params.get("sortBy") or "name_asc"
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("pageSize", 20))

        result = self.service.get_subjects(
            search_query=search_query,
            semester=semester,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
        )

        serializer = SubjectMaterialItemSerializer(result["items"], many=True)
        return APIResponse.success(
            data={"items": serializer.data, "total": result["total"]},
            message="Danh mục môn học lấy thành công.",
        )

    @extend_schema(
        summary="Get single subject catalog detail",
        description="Retrieve subject details by subject code.",
        responses={200: SubjectMaterialItemSerializer},
    )
    @action(detail=False, methods=["get"], url_path=r"subjects/(?P<code>[^/.]+)")
    def subject_detail(self, request, code=None):
        """
        Retrieve single subject catalog item.
        """
        item = self.service.get_subject_by_code(str(code))
        if not item:
            return APIResponse.error(
                message="Không tìm thấy môn học yêu cầu.",
                code=status.HTTP_404_NOT_FOUND,
            )

        serializer = SubjectMaterialItemSerializer(item)
        return APIResponse.success(
            data=serializer.data,
            message="Thông tin môn học lấy thành công.",
        )

    @extend_schema(
        summary="Get material statistics summary",
        description="Retrieve total materials, lectures count, outlines count, and total downloads.",
        responses={200: MaterialSummarySerializer},
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Summary counters for materials.
        """
        summary_data = self.service.calculate_summary()
        serializer = MaterialSummarySerializer(summary_data)
        return APIResponse.success(
            data=serializer.data,
            message="Thống kê tài liệu học tập lấy thành công.",
        )

    @extend_schema(
        summary="Toggle material bookmark",
        description="Toggle bookmark / save status for a material.",
    )
    @action(detail=True, methods=["post"], url_path="bookmark")
    def bookmark(self, request, pk=None):
        """
        Toggle bookmark status.
        """
        is_bookmarked = self.service.toggle_bookmark(str(pk))
        return APIResponse.success(
            data={"id": str(pk), "isBookmarked": is_bookmarked},
            message="Đã cập nhật trạng thái lưu tài liệu.",
        )

    @extend_schema(
        summary="Record material download",
        description="Increment download counter for a material.",
    )
    @action(detail=True, methods=["post"], url_path="download")
    def download(self, request, pk=None):
        """
        Increment download counter.
        """
        downloads_count = self.service.increment_download(str(pk))
        return APIResponse.success(
            data={"id": str(pk), "downloadsCount": downloads_count},
            message="Ghi nhận lượt tải tài liệu thành công.",
        )
