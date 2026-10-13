"""
Serializers for Master Semester model.
"""

from rest_framework import serializers

from apps.master.models.semester import Semester


class SemesterListSerializer(serializers.ModelSerializer):
    """Serializer for Semester list and detail endpoints."""

    academic_year_name = serializers.CharField(source="academic_year.name", read_only=True)
    school_id = serializers.UUIDField(source="academic_year.school_id", read_only=True)
    school_name = serializers.CharField(source="academic_year.school.name", read_only=True)

    class Meta:
        model = Semester
        fields = [
            "id",
            "academic_year_id",
            "academic_year_name",
            "school_id",
            "school_name",
            "code",
            "name",
            "order_no",
            "weeks_count",
            "start_date",
            "end_date",
            "gradebook_lock_date",
            "is_current",
            "is_locked",
            "locked_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
