"""
Serializers for Master AcademicYear, Semester, and Subject models.
"""

from rest_framework import serializers

from apps.master.models.academic_year import AcademicYear
from apps.master.models.semester import Semester
from apps.master.models.subject import Subject


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


class SubjectListSerializer(serializers.ModelSerializer):
    """Serializer for Subject list and detail endpoints."""

    school_name = serializers.CharField(source="school.name", read_only=True)
    department_name = serializers.CharField(
        source="department.name", read_only=True, allow_null=True
    )

    class Meta:
        model = Subject
        fields = [
            "id",
            "school_id",
            "school_name",
            "department_id",
            "department_name",
            "code",
            "name",
            "short_name",
            "grade_level",
            "evaluation_type",
            "periods_per_year",
            "is_compulsory",
            "color_code",
            "icon",
            "order_no",
            "is_active",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
