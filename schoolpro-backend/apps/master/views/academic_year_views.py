"""
REST API ViewSets for AcademicYear, Semester, and Subject master reference data.
"""

from django.db.models import Q
from rest_framework import permissions, status, viewsets

from apps.core.authentication import SchoolProJWTAuthentication
from apps.master.models.academic_year import AcademicYear
from apps.master.models.semester import Semester
from apps.master.models.subject import Subject
from apps.master.serializers.academic_year_serializers import (
    AcademicYearListSerializer,
    SemesterListSerializer,
    SubjectListSerializer,
)
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
        qs = AcademicYear.objects.select_related("school").all()
        school_id = self._get_effective_school_id(request)
        if school_id:
            qs = qs.filter(school_id=school_id)

        is_current = _parse_bool_param(request.query_params.get("is_current"))
        if is_current is not None:
            qs = qs.filter(is_current=is_current)

        is_locked = _parse_bool_param(request.query_params.get("is_locked"))
        if is_locked is not None:
            qs = qs.filter(is_locked=is_locked)

        search = request.query_params.get("search")
        if search and search.strip():
            q = search.strip()
            qs = qs.filter(Q(name__icontains=q) | Q(code__icontains=q))

        qs = qs.order_by("-start_date", "code")
        serializer = AcademicYearListSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách năm học thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        qs = AcademicYear.objects.select_related("school")
        obj = qs.filter(Q(id=pk) | Q(code=pk)).first()
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy năm học.",
                code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data=AcademicYearListSerializer(obj).data,
            message="Lấy thông tin năm học thành công.",
        )


class SemesterViewSet(viewsets.GenericViewSet):
    """ViewSet for listing and retrieving Semesters."""

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SemesterListSerializer

    def _get_effective_school_id(self, request):
        user_school_id = getattr(request.user, "school_id", None)
        if user_school_id:
            return user_school_id
        return request.query_params.get("school_id")

    def list(self, request, *args, **kwargs):
        qs = Semester.objects.select_related("academic_year", "academic_year__school").all()
        school_id = self._get_effective_school_id(request)
        if school_id:
            qs = qs.filter(academic_year__school_id=school_id)

        academic_year_id = request.query_params.get("academic_year_id")
        if academic_year_id:
            qs = qs.filter(academic_year_id=academic_year_id)

        order_no = request.query_params.get("order_no")
        if order_no and order_no.isdigit():
            qs = qs.filter(order_no=int(order_no))

        is_current = _parse_bool_param(request.query_params.get("is_current"))
        if is_current is not None:
            qs = qs.filter(is_current=is_current)

        is_locked = _parse_bool_param(request.query_params.get("is_locked"))
        if is_locked is not None:
            qs = qs.filter(is_locked=is_locked)

        search = request.query_params.get("search")
        if search and search.strip():
            q = search.strip()
            qs = qs.filter(Q(name__icontains=q) | Q(code__icontains=q))

        qs = qs.order_by("-academic_year__start_date", "order_no")
        serializer = SemesterListSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách học kỳ thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        qs = Semester.objects.select_related("academic_year", "academic_year__school")
        obj = qs.filter(Q(id=pk) | Q(code=pk)).first()
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy học kỳ.",
                code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data=SemesterListSerializer(obj).data,
            message="Lấy thông tin học kỳ thành công.",
        )


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
        qs = Subject.objects.select_related("school", "department").all()
        school_id = self._get_effective_school_id(request)
        if school_id:
            qs = qs.filter(school_id=school_id)

        department_id = request.query_params.get("department_id")
        if department_id:
            qs = qs.filter(department_id=department_id)

        grade_level = request.query_params.get("grade_level")
        if grade_level and grade_level.isdigit():
            qs = qs.filter(Q(grade_level=int(grade_level)) | Q(grade_level__isnull=True))

        evaluation_type = request.query_params.get("evaluation_type")
        if evaluation_type and evaluation_type.upper() != "ALL":
            qs = qs.filter(evaluation_type__iexact=evaluation_type)

        is_compulsory = _parse_bool_param(request.query_params.get("is_compulsory"))
        if is_compulsory is not None:
            qs = qs.filter(is_compulsory=is_compulsory)

        is_active = _parse_bool_param(request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        search = request.query_params.get("search")
        if search and search.strip():
            q = search.strip()
            qs = qs.filter(
                Q(name__icontains=q) | Q(code__icontains=q) | Q(short_name__icontains=q)
            )

        qs = qs.order_by("order_no", "code")
        serializer = SubjectListSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách môn học thành công.",
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        qs = Subject.objects.select_related("school", "department")
        obj = qs.filter(Q(id=pk) | Q(code=pk)).first()
        if not obj:
            return APIResponse.error(
                message="Không tìm thấy môn học.",
                code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data=SubjectListSerializer(obj).data,
            message="Lấy thông tin môn học thành công.",
        )
