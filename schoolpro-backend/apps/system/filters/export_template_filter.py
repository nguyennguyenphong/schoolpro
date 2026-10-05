"""
Filters for ExportTemplate queries.
"""

from django_filters import rest_framework as filters

from apps.system.models.export_template import ExportTemplate


class ExportTemplateFilter(filters.FilterSet):
    """
    FilterSet for ExportTemplate listing.
    """

    school_id = filters.UUIDFilter(field_name="school_id")
    department_id = filters.UUIDFilter(field_name="department_id")
    template_type = filters.CharFilter(field_name="template_type")
    file_format = filters.CharFilter(field_name="file_format")
    is_default = filters.BooleanFilter(field_name="is_default")
    is_active = filters.BooleanFilter(field_name="is_active")
    code = filters.CharFilter(field_name="code", lookup_expr="iexact")

    class Meta:
        model = ExportTemplate
        fields = [
            "school_id",
            "department_id",
            "template_type",
            "file_format",
            "is_default",
            "is_active",
            "code",
        ]
