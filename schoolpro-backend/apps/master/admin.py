"""
Django Admin site registration for Master Reference models.
"""

from django.contrib import admin

from apps.master.models.department import Department
from apps.master.models.school import School


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "educational_stage",
        "phone",
        "email",
        "principal_name",
        "is_active",
    ]
    search_fields = ["code", "name", "email", "phone", "principal_name"]
    list_filter = ["is_active", "educational_stage"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "school",
        "department_type",
        "leader_teacher",
        "vice_leader",
        "is_active",
        "created_at",
    ]
    search_fields = [
        "code",
        "name",
        "school__name",
        "leader_teacher__full_name",
        "vice_leader__full_name",
    ]
    list_filter = ["school", "department_type", "is_active"]
    autocomplete_fields = ["school", "leader_teacher", "vice_leader"]
    readonly_fields = ["created_at"]
