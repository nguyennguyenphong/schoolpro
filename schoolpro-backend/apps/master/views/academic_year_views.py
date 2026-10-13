"""
REST API ViewSet for AcademicYear master reference data.
"""

from rest_framework import permissions, status, viewsets

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


class AcademicYearViewSet(viewsets.GenericViewSet):
    """ViewSet for listing and retrieving AcademicYears."""

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AcademicYearListSerializer

    def _get_effective_school_id(self, request):
        user_school_id = getattr(request.user, "school_id", None)
        if user_school_id:
            return user_school_id
        return request.query_params.get("school_id")

    def list(self, request, *args, **kwargs):
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
        serializer = AcademicYearListSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách năm học thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        service = AcademicYearService()
        obj = service.get_academic_year_detail(pk)
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy năm học.",
                code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data=AcademicYearListSerializer(obj).data,
            message="Lấy thông tin năm học thành công.",
        )
