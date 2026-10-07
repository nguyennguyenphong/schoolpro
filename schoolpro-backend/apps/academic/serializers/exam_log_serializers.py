"""
Serializers for Academic Exam Event Logs and Exam Submissions monitoring.
"""

from rest_framework import serializers

from apps.academic.models.exam import ExamEventLog


class ExamEventLogSerializer(serializers.ModelSerializer):
    """
    Serializer for examination event log and anti-cheat tracking.
    """

    student_name = serializers.CharField(
        source="student.user.full_name", read_only=True, default=None
    )
    student_code = serializers.CharField(
        source="student.student_code", read_only=True, default=None
    )
    actor_name = serializers.CharField(source="actor.full_name", read_only=True, default=None)
    exam_title = serializers.CharField(source="exam.title", read_only=True)

    class Meta:
        model = ExamEventLog
        fields = [
            "id",
            "exam",
            "exam_title",
            "submission",
            "student",
            "student_code",
            "student_name",
            "actor",
            "actor_name",
            "event_type",
            "title",
            "description",
            "severity",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RecordExamEventInputSerializer(serializers.Serializer):
    """
    Input schema for recording client-side or proctor anti-cheat/lifecycle events.
    """

    submission_id = serializers.UUIDField(required=False, allow_null=True)
    student_id = serializers.UUIDField(required=False, allow_null=True)
    event_type = serializers.CharField(max_length=50)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    severity = serializers.ChoiceField(
        choices=["INFO", "WARNING", "CRITICAL", "VIOLATION"], default="INFO"
    )
    metadata = serializers.DictField(required=False, default=dict)
