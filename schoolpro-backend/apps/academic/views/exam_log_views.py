"""
REST API ViewSet for Exam Proctoring and Anti-Cheat Event Logs.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action

from apps.academic.models.exam import ExamEventLog
from apps.academic.serializers.exam_log_serializers import (
    ExamEventLogSerializer,
    RecordExamEventInputSerializer,
)
from apps.academic.services.exam_event_service import ExamEventLogService
from apps.core.authentication import SchoolProJWTAuthentication
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List exam event logs",
        description="Retrieve anti-cheat and lifecycle audit logs for an exam or submission.",
        parameters=[
            OpenApiParameter("exam_id", str, description="Filter by exam UUID"),
            OpenApiParameter("submission_id", str, description="Filter by submission UUID"),
            OpenApiParameter("student_id", str, description="Filter by student UUID"),
            OpenApiParameter(
                "severity",
                str,
                description="Filter by severity (INFO, WARNING, CRITICAL, VIOLATION)",
            ),
        ],
    ),
    retrieve=extend_schema(summary="Retrieve exam event log detail"),
)
class ExamEventLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for querying and recording exam event logs and anti-cheat signals.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExamEventLogSerializer
    queryset = ExamEventLog.objects.select_related(
        "exam", "submission", "student", "student__user", "actor"
    ).all()

    def get_queryset(self):
        qs = super().get_queryset()
        exam_id = self.request.query_params.get("exam_id")
        submission_id = self.request.query_params.get("submission_id")
        student_id = self.request.query_params.get("student_id")
        severity = self.request.query_params.get("severity")

        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        if submission_id:
            qs = qs.filter(submission_id=submission_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if severity:
            qs = qs.filter(severity=severity)
        return qs

    @extend_schema(
        summary="Record exam telemetry event",
        description="Log anti-cheat event, tab switch, or proctor alert during an exam.",
        request=RecordExamEventInputSerializer,
        responses={201: ExamEventLogSerializer},
    )
    @action(detail=False, methods=["post"], url_path="record")
    def record_event(self, request):
        serializer = RecordExamEventInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        exam_id = request.data.get("exam_id")
        if not exam_id:
            return APIResponse.error(
                message="exam_id is required in request body.",
                code=status.HTTP_400_BAD_REQUEST,
            )

        event_log = ExamEventLogService.log_event(
            exam_id=exam_id,
            submission_id=data.get("submission_id"),
            student_id=data.get("student_id"),
            actor=request.user,
            event_type=data["event_type"],
            title=data["title"],
            description=data.get("description", ""),
            severity=data.get("severity", "INFO"),
            metadata=data.get("metadata", {}),
        )
        output = ExamEventLogSerializer(event_log)
        return APIResponse.created(
            data=output.data,
            message="Exam event logged successfully.",
        )
