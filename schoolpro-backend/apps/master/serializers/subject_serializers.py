"""
Serializers for Master Subject model.
"""

from rest_framework import serializers

from apps.master.models.subject import Subject


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
