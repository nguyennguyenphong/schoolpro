"""
REST API ViewSet for Academic Timetable domain.
Delivers weekly schedule matrices, detail lookups, and aggregate metrics.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, viewsets
from rest_framework.decorators import action

from apps.academic.serializers.timetable_serializers import (
    CourseOptionSerializer,
    TimetableSlotResponseSerializer,
    TimetableSummaryResponseSerializer,
)
from apps.academic.services.timetable_service import TimetableService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="Get weekly timetable",
        description="Retrieve class timetable schedule slots for the authenticated student mapped to the target week.",
        parameters=[
            OpenApiParameter(
                "date",
                str,
                description="Selected date in YYYY-MM-DD format (defaults to current date)",
            ),
            OpenApiParameter(
                "search", str, description="Search keyword matching subject, code, room, or teacher"
            ),
            OpenApiParameter(
                "shift", str, description="Filter by shift (morning, afternoon, evening, all)"
            ),
            OpenApiParameter(
                "classType", str, description="Filter by class type (theory, practice, all)"
            ),
            OpenApiParameter(
                "status", str, description="Filter by status (upcoming, ongoing, completed, all)"
            ),
        ],
        responses={200: TimetableSlotResponseSerializer(many=True)},
    ),
    summary=extend_schema(
        summary="Get timetable summary metrics",
        description="Calculates overview summary counts for sessions, credits, theory/practice, and attendance.",
        parameters=[
            OpenApiParameter("date", str, description="Selected date in YYYY-MM-DD format"),
        ],
        responses={200: TimetableSummaryResponseSerializer},
    ),
    courses=extend_schema(
        summary="Get enrolled course list",
        description="Returns distinct list of courses/subjects scheduled in the student's timetable.",
        responses={200: CourseOptionSerializer(many=True)},
    ),
)
class TimetableStudentViewSet(viewsets.ViewSet):
    """
    ViewSet delivering student timetable operations.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        Retrieves weekly slots according to the requested date and filters.
        """
        user = request.user
        selected_date = request.query_params.get("date")
        search_query = request.query_params.get("search") or request.query_params.get("q")
        shift = request.query_params.get("shift")
        class_type = request.query_params.get("classType") or request.query_params.get("class_type")
        status_param = request.query_params.get("status")

        schedule_context = TimetableService.get_weekly_schedule_context(
            user=user,
            selected_date_str=selected_date,
            search_query=search_query,
            shift_filter=shift,
            class_type_filter=class_type,
            status_filter=status_param,
        )

        serializer = TimetableSlotResponseSerializer(schedule_context["slots"], many=True)
        return APIResponse.success(
            data=serializer.data,
            meta=schedule_context.get("meta"),
            message="Timetable retrieved successfully",
        )

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        Computes summary metrics for the target date week.
        """
        user = request.user
        selected_date = request.query_params.get("date")

        slots = TimetableService.get_weekly_slots(
            user=user,
            selected_date_str=selected_date,
        )
        summary_data = TimetableService.calculate_summary(slots)
        serializer = TimetableSummaryResponseSerializer(summary_data)
        return APIResponse.success(
            data=serializer.data,
            message="Timetable summary calculated successfully",
        )

    @action(detail=False, methods=["get"], url_path="courses")
    def courses(self, request):
        """
        Returns unique course choices for filter dropdowns.
        """
        user = request.user
        options = TimetableService.get_course_options(user)
        serializer = CourseOptionSerializer(options, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Course options retrieved successfully",
        )
