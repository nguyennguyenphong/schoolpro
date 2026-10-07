"""
Django Admin site registration for Master Reference models.
Covers 9 models:
  - School
  - AcademicYear, Semester
  - Grade
  - Department
  - Subject
  - Position
  - LookupType, LookupValue
"""

from django.contrib import admin

from apps.master.models.academic_year import AcademicYear
from apps.master.models.department import Department
from apps.master.models.grade import Grade
from apps.master.models.lookup import LookupType, LookupValue
from apps.master.models.position import Position
from apps.master.models.school import School
from apps.master.models.semester import Semester
from apps.master.models.subject import Subject


class SemesterInline(admin.TabularInline):
    model = Semester
    extra = 2
    readonly_fields = ["created_at"]


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "educational_stage",
        "school_type",
        "phone",
        "email",
        "principal_name",
        "is_active",
        "created_at",
    ]
    search_fields = ["code", "name", "email", "phone", "principal_name"]
    list_filter = ["is_active", "educational_stage", "school_type"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "school", "start_date", "end_date", "is_current", "created_at"]
    search_fields = ["code", "name"]
    list_filter = ["school", "is_current"]
    autocomplete_fields = ["school"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [SemesterInline]


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "academic_year",
        "order_no",
        "start_date",
        "end_date",
        "is_current",
        "is_locked",
    ]
    search_fields = ["code", "name"]
    list_filter = ["academic_year__school", "is_current", "is_locked"]
    autocomplete_fields = ["academic_year"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "school", "order_no", "created_at"]
    search_fields = ["code", "name"]
    list_filter = ["school"]
    autocomplete_fields = ["school"]
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
        "leader_teacher__teacher_code",
        "leader_teacher__user__full_name",
    ]
    list_filter = ["school", "department_type", "is_active"]
    autocomplete_fields = ["school", "leader_teacher", "vice_leader"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "school",
        "department",
        "grade_level",
        "evaluation_type",
        "is_compulsory",
        "periods_per_year",
        "is_active",
    ]
    search_fields = ["code", "name", "short_name"]
    list_filter = [
        "school",
        "department",
        "grade_level",
        "evaluation_type",
        "is_compulsory",
        "is_active",
    ]
    autocomplete_fields = ["school", "department"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "school",
        "scope_type",
        "is_leadership",
        "max_holders",
        "is_active",
    ]
    search_fields = ["code", "name"]
    list_filter = ["school", "scope_type", "is_leadership", "is_active"]
    autocomplete_fields = ["school", "applicable_role"]
    readonly_fields = ["created_at", "updated_at"]


class LookupValueInline(admin.TabularInline):
    model = LookupValue
    extra = 3
    readonly_fields = ["created_at"]


@admin.register(LookupType)
class LookupTypeAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "school", "is_system", "is_hierarchical", "created_at"]
    search_fields = ["code", "name", "description"]
    list_filter = ["is_system", "is_hierarchical", "school"]
    autocomplete_fields = ["school"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [LookupValueInline]


@admin.register(LookupValue)
class LookupValueAdmin(admin.ModelAdmin):
    list_display = [
        "lookup_type",
        "code",
        "name",
        "short_name",
        "order_no",
        "is_default",
        "is_active",
    ]
    search_fields = ["code", "name", "lookup_type__code", "lookup_type__name"]
    list_filter = ["lookup_type", "is_default", "is_active"]
    autocomplete_fields = ["lookup_type", "parent"]
    readonly_fields = ["created_at", "updated_at"]
