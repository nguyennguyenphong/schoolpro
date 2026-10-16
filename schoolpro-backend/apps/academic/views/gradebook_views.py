"""
REST API ViewSet for Academic Gradebook and Official Student Transcripts.
Follows Clean Architecture: delegates orchestration to GradebookService and outputs via APIResponse.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.academic.serializers.gradebook_serializers import (
    GradebookTranscriptSerializer,
    GradeSummarySerializer,
    SubjectGradeItemSerializer,
)
from apps.academic.services.gradebook_service import GradebookService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List student subject grades",
        description="Retrieve filtered and search-enabled subject grade rows for authenticated student.",
        parameters=[
            OpenApiParameter(
                "q", str, description="Search keyword in subject name, code, teacher, or comment"
            ),
            OpenApiParameter("semester", str, description="Filter by semester (HK1, HK2, all)"),
            OpenApiParameter(
                "academicYear", str, description="Filter by academic year (e.g. 2025-2026)"
            ),
            OpenApiParameter(
                "classification",
                str,
                description="Filter by rank (all, excellent, good, average, feedback_only)",
            ),
            OpenApiParameter("sortBy", str, description="Sort order (gpa_desc, gpa_asc, name_asc)"),
        ],
        responses={200: SubjectGradeItemSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Get single subject grade detail",
        description="Retrieve detailed assessment breakdown (oral, 15m, midterm, final, remarks) for a subject.",
        responses={200: SubjectGradeItemSerializer},
    ),
)
class StudentGradebookViewSet(viewsets.ViewSet):
    """
    ViewSet providing student gradebook feeds, GPA summaries, MOET Circular 22 evaluations, and electronic report cards.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = GradebookService()

    def list(self, request):
        """
        List subject grades for student with filters and search.
        """
        search_query = request.query_params.get("q") or request.query_params.get("search")
        semester = (
            request.query_params.get("semester_id")
            or request.query_params.get("semesterId")
            or request.query_params.get("semester")
        )
        academic_year = (
            request.query_params.get("academic_year_id")
            or request.query_params.get("academicYearId")
            or request.query_params.get("academic_year")
            or request.query_params.get("academicYear")
            or request.query_params.get("year")
        )
        classification = request.query_params.get("classification")
        sort_by = request.query_params.get("sortBy") or request.query_params.get("sort_by")

        items = self.service.list_subject_grades(
            user=request.user,
            search_query=search_query,
            semester=semester,
            academic_year=academic_year,
            classification=classification,
            sort_by=sort_by,
        )
        serializer = SubjectGradeItemSerializer(items, many=True)
        return APIResponse.success(
            data={"items": serializer.data, "total": len(serializer.data)},
            message="Bảng điểm học sinh lấy thành công.",
        )

    @extend_schema(
        summary="Get student grade summary metrics",
        description="Retrieve GPA, academic ranking, conduct rating, honor roll title, and homeroom remarks.",
        responses={200: GradeSummarySerializer},
    )
    @action(detail=False, methods=["get"])
    def summary(self, request):
        """
        Summary counters and honor roll metrics for the student gradebook.
        """
        semester = (
            request.query_params.get("semester_id")
            or request.query_params.get("semesterId")
            or request.query_params.get("semester")
        )
        academic_year = (
            request.query_params.get("academic_year_id")
            or request.query_params.get("academicYearId")
            or request.query_params.get("academic_year")
            or request.query_params.get("academicYear")
            or request.query_params.get("year")
        )
        data = self.service.get_grade_summary(
            request.user, semester=semester, academic_year=academic_year
        )
        serializer = GradeSummarySerializer(data)
        return APIResponse.success(data=serializer.data)

    def retrieve(self, request, pk=None):
        """
        Get single subject grade detail by subject ID or code.
        """
        semester = (
            request.query_params.get("semester_id")
            or request.query_params.get("semesterId")
            or request.query_params.get("semester")
        )
        academic_year = (
            request.query_params.get("academic_year_id")
            or request.query_params.get("academicYearId")
            or request.query_params.get("academic_year")
            or request.query_params.get("academicYear")
            or request.query_params.get("year")
        )
        item = self.service.get_subject_grade_detail(
            request.user, pk, semester=semester, academic_year=academic_year
        )
        if not item:
            return APIResponse.error(
                message="Không tìm thấy môn học hoặc chưa có dữ liệu điểm.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        serializer = SubjectGradeItemSerializer(item)
        return APIResponse.success(data=serializer.data)

    @extend_schema(
        summary="Get official electronic report card (Học bạ điện tử)",
        description="Retrieve national electronic report card transcript complying with MOET Circular 22.",
        responses={200: GradebookTranscriptSerializer},
    )
    @action(detail=False, methods=["get"])
    def transcript(self, request):
        """
        Official e-transcript / report card view.
        """
        semester = (
            request.query_params.get("semester_id")
            or request.query_params.get("semesterId")
            or request.query_params.get("semester")
        )
        academic_year = (
            request.query_params.get("academic_year_id")
            or request.query_params.get("academicYearId")
            or request.query_params.get("academic_year")
            or request.query_params.get("academicYear")
            or request.query_params.get("year")
        )
        data = self.service.get_transcript(
            request.user, semester=semester, academic_year=academic_year
        )
        serializer = GradebookTranscriptSerializer(data)
        return APIResponse.success(data=serializer.data)

    @extend_schema(
        summary="Export signed electronic report card PDF",
        description="Retrieve signed PDF export verification metadata and download URI.",
    )
    @action(detail=False, methods=["get"], url_path="export-pdf")
    def export_pdf(self, request):
        """
        Export signed PDF report card metadata.
        """
        semester = request.query_params.get("semester")
        academic_year = request.query_params.get("academicYear") or request.query_params.get(
            "academic_year"
        )
        data = self.service.export_transcript_pdf(
            request.user, semester=semester, academic_year=academic_year
        )
        return APIResponse.success(data=data, message=data.get("message", "Thành công"))
