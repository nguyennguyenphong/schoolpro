"""
REST API ViewSet for Subject master reference data.
"""

from rest_framework import permissions, status, viewsets

from apps.core.authentication import SchoolProJWTAuthentication
from apps.master.serializers.subject_serializers import SubjectListSerializer
from apps.master.services.subject_service import SubjectService
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


class SubjectViewSet(viewsets.GenericViewSet):
    """ViewSet for listing and retrieving Subjects."""

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubjectListSerializer

    def _get_effective_school_id(self, request):
        user_school_id = getattr(request.user, "school_id", None)
        if user_school_id:
            return user_school_id
        return request.query_params.get("school_id")

    def list(self, request, *args, **kwargs):
        service = SubjectService()
        school_id = self._get_effective_school_id(request)
        department_id = request.query_params.get("department_id")
        grade_level_raw = request.query_params.get("grade_level")
        grade_level = (
            int(grade_level_raw) if (grade_level_raw and grade_level_raw.isdigit()) else None
        )
        evaluation_type = request.query_params.get("evaluation_type")
        is_compulsory = _parse_bool_param(request.query_params.get("is_compulsory"))
        is_active = _parse_bool_param(request.query_params.get("is_active"))
        search = request.query_params.get("search")

        qs = service.list_subjects(
            school_id=school_id,
            department_id=department_id,
            grade_level=grade_level,
            evaluation_type=evaluation_type,
            is_compulsory=is_compulsory,
            is_active=is_active,
            search=search,
        )
        serializer = SubjectListSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách môn học thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        service = SubjectService()
        obj = service.get_subject_detail(pk)
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy môn học.",
                code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data=SubjectListSerializer(obj).data,
            message="Lấy thông tin môn học thành công.",
        )
