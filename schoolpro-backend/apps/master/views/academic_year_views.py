"""
REST API ViewSet for AcademicYear master reference data.
Provides endpoints for listing, retrieving details, and fetching the current active academic year.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.core.authentication import SchoolProJWTAuthentication
from apps.master.serializers.academic_year_serializers import AcademicYearListSerializer
from apps.master.services.academic_year_service import AcademicYearService
from common.responses.response import APIResponse


def _parse_bool_param(val: str | None) -> bool | None:
    if val is None:
        return None
    lower = val.strip().lower()
    if lower in ("true", "1"):
        return True
    if lower in ("false", "0"):
        return False
    return None


@extend_schema_view(
    list=extend_schema(
        summary="List academic years",
        description="Retrieve filtered list of academic school years for the school.",
        parameters=[
            OpenApiParameter("school_id", str, description="Filter by school UUID"),
            OpenApiParameter("is_current", bool, description="Filter active/current academic year"),
            OpenApiParameter(
                "is_locked", bool, description="Filter locked/unlocked academic years"
            ),
            OpenApiParameter("search", str, description="Search keyword in code or name"),
        ],
        responses={200: AcademicYearListSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get academic year details",
        description="Retrieve detailed information of a specific academic year by UUID or code.",
        responses={200: AcademicYearListSerializer},
    ),
)
class AcademicYearViewSet(viewsets.GenericViewSet):
    """
    ViewSet for listing and retrieving AcademicYears.
    Supports filtering by current status, lock status, school, and search keyword.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    serializer_class = AcademicYearListSerializer

    def get_permissions(self):
        """Allow read access to authenticated users and clients."""
        if self.action in ["list", "retrieve", "current"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def _get_effective_school_id(self, request):
        """Extract school_id from authenticated user or query params."""
        user = getattr(request, "user", None)
        if user and getattr(user, "is_authenticated", False):
            user_school_id = getattr(user, "school_id", None)
            if user_school_id:
                return user_school_id
        return request.query_params.get("school_id")

    def list(self, request, *args, **kwargs):
        """List all academic years matching criteria."""
        service = AcademicYearService()
        school_id = self._get_effective_school_id(request)
        is_current = _parse_bool_param(request.query_params.get("is_current"))
        is_locked = _parse_bool_param(request.query_params.get("is_locked"))
        search = request.query_params.get("search")

        qs = service.list_academic_years(
            school_id=school_id,
            is_current=is_current,
            is_locked=is_locked,
            search=search,
        )
        serializer = self.get_serializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách năm học thành công.",
        )

    @extend_schema(
        summary="Get current active academic year",
        description="Retrieve the currently active academic year for the school.",
        responses={200: AcademicYearListSerializer},
    )
    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request, *args, **kwargs):
        """Retrieve the currently active academic year."""
        service = AcademicYearService()
        school_id = self._get_effective_school_id(request)
        obj = service.get_current_academic_year(school_id=school_id)
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy năm học hiện tại.",
                code=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(obj)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy thông tin năm học hiện tại thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        """Retrieve specific academic year by UUID or code."""
        service = AcademicYearService()
        school_id = self._get_effective_school_id(request)
        obj = service.get_academic_year_detail(pk, school_id=school_id)
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy năm học.",
                code=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(obj)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy thông tin năm học thành công.",
        )
