"""
REST API ViewSet for Semester master reference data.
Provides endpoints for listing, retrieving details, and fetching the current active semester.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.core.authentication import SchoolProJWTAuthentication
from apps.master.serializers.semester_serializers import SemesterListSerializer
from apps.master.services.semester_service import SemesterService
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
        summary="List semesters",
        description="Retrieve filtered list of academic semesters.",
        parameters=[
            OpenApiParameter("academic_year_id", str, description="Filter by academic year UUID"),
            OpenApiParameter("school_id", str, description="Filter by school UUID"),
            OpenApiParameter("order_no", int, description="Filter by semester order (1, 2, 3)"),
            OpenApiParameter("is_current", bool, description="Filter current active semester"),
            OpenApiParameter("is_locked", bool, description="Filter locked/unlocked semesters"),
            OpenApiParameter("search", str, description="Search keyword in code or name"),
        ],
        responses={200: SemesterListSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get semester details",
        description="Retrieve detailed information of a specific semester by UUID or code.",
        responses={200: SemesterListSerializer},
    ),
)
class SemesterViewSet(viewsets.GenericViewSet):
    """
    ViewSet for listing and retrieving Semesters.
    Supports filtering by academic year, school, current status, and lock status.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    serializer_class = SemesterListSerializer

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
        """List all semesters matching criteria."""
        service = SemesterService()
        school_id = self._get_effective_school_id(request)
        academic_year_id = request.query_params.get("academic_year_id")
        order_no_raw = request.query_params.get("order_no")
        order_no = int(order_no_raw) if (order_no_raw and order_no_raw.isdigit()) else None
        is_current = _parse_bool_param(request.query_params.get("is_current"))
        is_locked = _parse_bool_param(request.query_params.get("is_locked"))
        search = request.query_params.get("search")

        qs = service.list_semesters(
            school_id=school_id,
            academic_year_id=academic_year_id,
            order_no=order_no,
            is_current=is_current,
            is_locked=is_locked,
            search=search,
        )
        serializer = self.get_serializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách học kỳ thành công.",
        )

    @extend_schema(
        summary="Get current active semester",
        description="Retrieve the currently active semester for a school or academic year.",
        parameters=[
            OpenApiParameter("academic_year_id", str, description="Filter by academic year UUID"),
            OpenApiParameter("school_id", str, description="Filter by school UUID"),
        ],
        responses={200: SemesterListSerializer},
    )
    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request, *args, **kwargs):
        """Retrieve the currently active semester."""
        service = SemesterService()
        school_id = self._get_effective_school_id(request)
        academic_year_id = request.query_params.get("academic_year_id")

        obj = service.get_current_semester(
            school_id=school_id,
            academic_year_id=academic_year_id,
        )
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy học kỳ hiện tại.",
                code=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(obj)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy thông tin học kỳ hiện tại thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        """Retrieve specific semester by UUID or code."""
        service = SemesterService()
        school_id = self._get_effective_school_id(request)
        obj = service.get_semester_detail(pk, school_id=school_id)
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy học kỳ.",
                code=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(obj)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy thông tin học kỳ thành công.",
        )
