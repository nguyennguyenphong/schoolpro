"""
FilterSets for Role and Permission query optimization.
"""

import django_filters
from django.db.models import Q

from apps.core.models.permission import Permission
from apps.core.models.role import Role


class RoleFilterSet(django_filters.FilterSet):
    """
    Search and filter criteria for security Roles.
    """

    search = django_filters.CharFilter(
        method="filter_search", help_text="Search by code, name, or description"
    )
    is_system = django_filters.BooleanFilter(field_name="is_system")
    is_active = django_filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = Role
        fields = ["is_system", "is_active"]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(code__icontains=value) | Q(name__icontains=value) | Q(description__icontains=value)
        )


class PermissionFilterSet(django_filters.FilterSet):
    """
    Search and filter criteria for atomic Permissions.
    """

    group_code = django_filters.CharFilter(field_name="group_code", lookup_expr="iexact")
    search = django_filters.CharFilter(
        method="filter_search", help_text="Search by code, name, or description"
    )

    class Meta:
        model = Permission
        fields = ["group_code"]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(code__icontains=value) | Q(name__icontains=value) | Q(description__icontains=value)
        )
