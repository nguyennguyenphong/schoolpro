"""
Serializers for Master AcademicYear model.
"""

from rest_framework import serializers

from apps.master.models.academic_year import AcademicYear


class AcademicYearListSerializer(serializers.ModelSerializer):
    """Serializer for AcademicYear list and detail endpoints."""

    school_name = serializers.CharField(source="school.name", read_only=True)

    class Meta:
        model = AcademicYear
        fields = [
            "id",
            "school_id",
            "school_name",
            "code",
            "name",
            "start_date",
            "end_date",
            "enrollment_target",
            "is_current",
            "is_locked",
            "locked_at",
            "settings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
