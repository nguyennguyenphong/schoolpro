"""
Department ViewSet.
REST API Endpoints for Educational and Administrative Departments.
Handles listing, details, creation, updating, deletion, summary metrics, and member assignment.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from apps.core.authentication import SchoolProJWTAuthentication
from apps.master.serializers.department_serializers import (
    DepartmentCreateUpdateSerializer,
    DepartmentDetailSerializer,
    DepartmentListSerializer,
    DepartmentSummarySerializer,
)
from apps.master.services.department_service import DepartmentService
from common.permissions.roles import IsAdminUserOrSchoolAdmin
from common.responses.response import APIResponse


class DepartmentPagination(PageNumberPagination):
    """Standard pagination for departments list."""

    page_size = 20
    page_size_query_param = "pageSize"
    max_page_size = 100
    page_query_param = "page"

    def get_page_size(self, request):
        if "pageSize" in request.query_params:
            return super().get_page_size(request)
        if "page_size" in request.query_params:
            self.page_size_query_param = "page_size"
        return super().get_page_size(request)


@extend_schema_view(
    list=extend_schema(
        summary="List departments",
        description="Retrieve filtered and paginated list of educational subject departments and administrative divisions.",
        parameters=[
            OpenApiParameter(
                "search", str, description="Search keyword in code, name, leader name"
            ),
            OpenApiParameter(
                "department_type",
                str,
                description="Filter by type (SUBJECT, ADMINISTRATION, BOARD, UNION, ALL)",
            ),
            OpenApiParameter("is_active", bool, description="Filter active/inactive status"),
            OpenApiParameter("school_id", str, description="Filter by specific school ID"),
        ],
        responses={200: DepartmentListSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get department details",
        description="Retrieve complete dossier of a department including teachers, staff members, and assigned subjects.",
        responses={200: DepartmentDetailSerializer},
    ),
    create=extend_schema(
        summary="Create department",
        description="Create a new educational or administrative department with code uniqueness validation.",
        request=DepartmentCreateUpdateSerializer,
        responses={201: DepartmentDetailSerializer},
    ),
    update=extend_schema(
        summary="Update department",
        description="Update department profile, leaders, status, or type.",
        request=DepartmentCreateUpdateSerializer,
        responses={200: DepartmentDetailSerializer},
    ),
    partial_update=extend_schema(
        summary="Partially update department",
        description="Partially update department properties.",
        request=DepartmentCreateUpdateSerializer,
        responses={200: DepartmentDetailSerializer},
    ),
    destroy=extend_schema(
        summary="Delete department",
        description="Delete department if no active teachers, staff, or subjects are linked.",
    ),
)
class DepartmentViewSet(viewsets.GenericViewSet):
    """
    Department Management ViewSet.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DepartmentPagination

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = DepartmentService()

    def get_permissions(self):
        """
        Allow read access to all authenticated users; restrict write/delete to Admins.
        """
        if self.action in ["list", "retrieve", "summary"]:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminUserOrSchoolAdmin()]

    def _get_effective_school_id(self, request):
        """
        Resolve school_id for the current request.
        Priority:
        1. User's assigned school (`request.user.school_id`)
        2. Superadmin/system admin override via query parameter `school_id`
        """
        user_school_id = getattr(request.user, "school_id", None)
        if user_school_id:
            return user_school_id

        # If user has no school assigned (e.g. system superadmin), permit query param override
        return request.query_params.get("school_id")

    def list(self, request, *args, **kwargs):
        """
        List departments with search, filtering, and pagination.
        Automatically scoped to the authenticated user's school.
        """
        search_query = request.query_params.get("search")
        department_type = request.query_params.get("department_type") or request.query_params.get(
            "type"
        )
        effective_school_id = self._get_effective_school_id(request)

        is_active = None
        if "is_active" in request.query_params:
            val = request.query_params.get("is_active").lower()
            if val in ["true", "1"]:
                is_active = True
            elif val in ["false", "0"]:
                is_active = False

        qs = self.service.get_departments(
            school_id=effective_school_id,
            department_type=department_type,
            is_active=is_active,
            search_query=search_query,
        )

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = DepartmentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = DepartmentListSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách phòng/tổ chuyên môn thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        Get full details of a department including teachers, staff, and subjects.
        Scoped to user's school.
        """
        effective_school_id = self._get_effective_school_id(request)
        department = self.service.get_department_detail(pk, school_id=effective_school_id)
        serializer = DepartmentDetailSerializer(department)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy thông tin chi tiết phòng/tổ chuyên môn thành công.",
        )

    def create(self, request, *args, **kwargs):
        """
        Create a new department under the authenticated user's school.
        """
        serializer = DepartmentCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        effective_school_id = self._get_effective_school_id(request)
        department = self.service.create_department(
            serializer.validated_data, default_school_id=effective_school_id
        )
        response_serializer = DepartmentDetailSerializer(department)
        return APIResponse.created(
            data=response_serializer.data,
            message=f"Đã tạo phòng/tổ chuyên môn '{department.name}' thành công.",
        )

    def update(self, request, pk=None, *args, **kwargs):
        """
        Full update of department within user's school.
        """
        serializer = DepartmentCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        effective_school_id = self._get_effective_school_id(request)
        department = self.service.update_department(
            pk, serializer.validated_data, school_id=effective_school_id
        )
        response_serializer = DepartmentDetailSerializer(department)
        return APIResponse.success(
            data=response_serializer.data,
            message=f"Đã cập nhật phòng/tổ chuyên môn '{department.name}' thành công.",
        )

    def partial_update(self, request, pk=None, *args, **kwargs):
        """
        Partial update of department within user's school.
        """
        serializer = DepartmentCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        effective_school_id = self._get_effective_school_id(request)
        department = self.service.update_department(
            pk, serializer.validated_data, school_id=effective_school_id
        )
        response_serializer = DepartmentDetailSerializer(department)
        return APIResponse.success(
            data=response_serializer.data,
            message=f"Đã cập nhật phòng/tổ chuyên môn '{department.name}' thành công.",
        )

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        Delete department within user's school.
        """
        effective_school_id = self._get_effective_school_id(request)
        result = self.service.delete_department(pk, school_id=effective_school_id)
        return APIResponse.success(
            data=result,
            message=result["message"],
        )

    @extend_schema(
        summary="Department summary metrics",
        description="High-level count metrics: total, active, subject departments, administration departments.",
        responses={200: DepartmentSummarySerializer},
    )
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Returns count and category breakdown summary scoped to user's school.
        """
        effective_school_id = self._get_effective_school_id(request)
        data = self.service.get_summary(school_id=effective_school_id)
        return APIResponse.success(
            data=data,
            message="Lấy số liệu thống kê phòng ban thành công.",
        )

    @extend_schema(
        summary="Assign members to department",
        description="Assign a batch of teachers, staff, or subjects to this department.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "teacher_ids": {"type": "array", "items": {"type": "string"}},
                    "staff_ids": {"type": "array", "items": {"type": "string"}},
                    "subject_ids": {"type": "array", "items": {"type": "string"}},
                },
            }
        },
        responses={200: DepartmentDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="assign-members")
    def assign_members(self, request, pk=None):
        """
        Assign teachers, staff, or subjects to the department.
        """
        teacher_ids = request.data.get("teacher_ids", [])
        staff_ids = request.data.get("staff_ids", [])
        subject_ids = request.data.get("subject_ids", [])

        effective_school_id = self._get_effective_school_id(request)
        department = self.service.assign_members(
            department_id=pk,
            teacher_ids=teacher_ids,
            staff_ids=staff_ids,
            subject_ids=subject_ids,
            school_id=effective_school_id,
        )
        response_serializer = DepartmentDetailSerializer(department)
        return APIResponse.success(
            data=response_serializer.data,
            message="Gán thành viên vào phòng/tổ chuyên môn thành công.",
        )

    @extend_schema(
        summary="Remove member from department",
        description="Unlink a single teacher, staff, or subject from this department.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "member_type": {"type": "string", "enum": ["teacher", "staff", "subject"]},
                    "member_id": {"type": "string"},
                },
                "required": ["member_type", "member_id"],
            }
        },
        responses={200: DepartmentDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="remove-member")
    def remove_member(self, request, pk=None):
        """
        Unlink a member or subject from this department.
        """
        member_type = request.data.get("member_type")
        member_id = request.data.get("member_id")

        if not member_type or not member_id:
            return APIResponse.error(
                message="Vui lòng cung cấp cả member_type và member_id.",
                code=status.HTTP_400_BAD_REQUEST,
            )

        effective_school_id = self._get_effective_school_id(request)
        department = self.service.remove_member(
            department_id=pk,
            member_type=member_type,
            member_id=member_id,
            school_id=effective_school_id,
        )
        response_serializer = DepartmentDetailSerializer(department)
        return APIResponse.success(
            data=response_serializer.data,
            message="Đã tách thành viên khỏi phòng/tổ chuyên môn thành công.",
        )
