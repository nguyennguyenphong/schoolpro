"""
Django Admin site registration for Core security, organizational, and profile models.
Covers 19 models:
  - User
  - Role, Permission, RolePermission, UserRole
  - Teacher, Student, Staff, Guardian, StudentHealthRecord
  - SchoolClass, ClassGroup, StudentClassEnrollment, ClassSubjectTeacher, PositionAssignment
  - CustomFieldDefinition, CustomFieldValue
  - Club, ClubMember
"""

from typing import Any

from django import forms
from django.contrib import admin
from django.contrib.auth.hashers import make_password

from apps.core.models.club import Club, ClubMember
from apps.core.models.custom_field import CustomFieldDefinition, CustomFieldValue
from apps.core.models.organization import (
    ClassGroup,
    ClassSubjectTeacher,
    PositionAssignment,
    SchoolClass,
    StudentClassEnrollment,
)
from apps.core.models.permission import Permission, RolePermission
from apps.core.models.profile import Guardian, Staff, Student, StudentHealthRecord, Teacher
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from common.admin_mixins import AutoCodeAdminMixin


class UserAdminForm(forms.ModelForm):
    """Custom Admin form for User allowing plain-text password input auto-hashed on save."""

    raw_password = forms.CharField(
        label="Mật khẩu khởi tạo / Đặt lại",
        required=False,
        widget=forms.PasswordInput(render_value=False),
        help_text="Nhập mật khẩu văn bản thô để tự động băm (hash) khi lưu. Để trống nếu giữ nguyên mật khẩu cũ.",
    )

    class Meta:
        model = User
        fields = [
            "school",
            "username",
            "email",
            "phone",
            "raw_password",
            "password_hash",
            "full_name",
            "first_name",
            "last_name",
            "preferred_name",
            "date_of_birth",
            "gender_code",
            "national_id",
            "avatar_url",
            "address",
            "locale",
            "timezone",
            "status_code",
            "must_change_password",
            "is_verified",
            "is_2fa_enabled",
            "bio",
            "metadata",
            "notification_preferences",
        ]

    def clean(self):
        cleaned_data = super().clean()
        raw_pwd = cleaned_data.get("raw_password")
        if raw_pwd:
            cleaned_data["password_hash"] = make_password(raw_pwd)
        elif not self.instance.pk and not cleaned_data.get("password_hash"):
            cleaned_data["password_hash"] = make_password("SchoolPro@123")
        return cleaned_data


class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 1
    autocomplete_fields = ["role"]
    readonly_fields = ["created_at"]


class StudentHealthRecordInline(admin.StackedInline):
    model = StudentHealthRecord
    extra = 0
    can_delete = True


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    list_display = [
        "username",
        "full_name",
        "email",
        "phone",
        "school",
        "status_code",
        "is_verified",
        "created_at",
    ]
    search_fields = ["username", "full_name", "email", "phone", "national_id"]
    list_filter = ["status_code", "gender_code", "school", "is_verified"]
    readonly_fields = ["created_at", "updated_at", "last_login_at"]
    inlines = [UserRoleInline]

    fieldsets = (
        (
            "Thông tin đăng nhập & Tài khoản",
            {
                "fields": (
                    "username",
                    "raw_password",
                    "password_hash",
                    "email",
                    "phone",
                    "school",
                    "status_code",
                    "is_verified",
                ),
            },
        ),
        (
            "Thông tin cá nhân",
            {
                "fields": (
                    "full_name",
                    "first_name",
                    "last_name",
                    "preferred_name",
                    "date_of_birth",
                    "gender_code",
                    "national_id",
                    "avatar_url",
                    "address",
                    "bio",
                ),
            },
        ),
        (
            "Bảo mật & Trạng thái",
            {
                "fields": (
                    "must_change_password",
                    "is_2fa_enabled",
                    "failed_login_attempts",
                    "locked_at",
                    "locked_until",
                    "lock_reason",
                    "last_login_at",
                    "last_login_ip",
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    def save_model(self, request: Any, obj: User, form: Any, change: bool) -> None:
        raw_pwd = form.cleaned_data.get("raw_password")
        if raw_pwd:
            obj.password_hash = make_password(raw_pwd)
        elif not obj.password_hash:
            obj.password_hash = make_password("SchoolPro@123")
        super().save_model(request, obj, form, change)


class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1
    autocomplete_fields = ["permission"]


@admin.register(Role)
class RoleAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = ["code", "name", "badge_color", "icon", "is_system", "is_active", "created_at"]
    list_filter = ["is_system", "is_active"]
    search_fields = ["code", "name", "description"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [RolePermissionInline, UserRoleInline]


@admin.register(Permission)
class PermissionAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = ["code", "name", "group_code", "module", "is_dangerous", "created_at"]
    list_filter = ["group_code", "module", "is_dangerous"]
    search_fields = ["code", "name", "group_code", "module", "description"]
    readonly_fields = ["created_at"]


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ["role", "permission"]
    list_filter = ["role"]
    search_fields = ["role__name", "role__code", "permission__name", "permission__code"]
    autocomplete_fields = ["role", "permission"]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ["user", "role", "is_primary", "status", "effective_from", "effective_to"]
    list_filter = ["is_primary", "status", "role"]
    search_fields = ["user__username", "user__full_name", "role__code", "role__name"]
    autocomplete_fields = ["user", "role"]
    readonly_fields = ["created_at"]


@admin.register(Teacher)
class TeacherAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "teacher_code"
    list_display = [
        "teacher_code",
        "user",
        "school",
        "department",
        "subject_major",
        "academic_rank",
        "is_homeroom",
        "status",
    ]
    search_fields = ["teacher_code", "user__username", "user__full_name", "subject_major"]
    list_filter = ["school", "academic_rank", "is_homeroom", "status", "qualification"]
    autocomplete_fields = ["user", "school", "department"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Student)
class StudentAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "student_code"
    list_display = [
        "student_code",
        "user",
        "school",
        "current_class",
        "status",
        "admission_date",
        "ethnicity",
    ]
    search_fields = ["student_code", "user__username", "user__full_name", "national_id_number"]
    list_filter = ["school", "status", "current_class", "ethnicity"]
    autocomplete_fields = ["user", "school", "current_class"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [StudentHealthRecordInline]


@admin.register(Staff)
class StaffAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "staff_code"
    list_display = [
        "staff_code",
        "user",
        "school",
        "department",
        "job_title",
        "employment_type",
        "status",
    ]
    search_fields = ["staff_code", "user__username", "user__full_name", "job_title"]
    list_filter = ["school", "department", "employment_type", "status"]
    autocomplete_fields = ["user", "school", "department"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Guardian)
class GuardianAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "student",
        "relationship",
        "phone",
        "email",
        "job",
        "is_primary_contact",
        "is_emergency_contact",
    ]
    search_fields = ["full_name", "phone", "student__student_code", "student__user__full_name"]
    list_filter = ["relationship", "is_primary_contact", "is_emergency_contact"]
    autocomplete_fields = ["user", "student"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(StudentHealthRecord)
class StudentHealthRecordAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "height_cm",
        "weight_kg",
        "blood_type",
        "vision_left",
        "vision_right",
        "health_classification",
        "last_checkup_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name"]
    list_filter = ["health_classification", "blood_type", "hearing_status"]
    autocomplete_fields = ["student", "examined_by_nurse"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(SchoolClass)
class SchoolClassAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "grade",
        "academic_year",
        "homeroom_teacher",
        "room",
        "max_students",
        "is_active",
    ]
    search_fields = ["code", "name"]
    list_filter = ["school", "grade", "academic_year", "shift", "is_active"]
    autocomplete_fields = ["school", "grade", "academic_year", "homeroom_teacher", "room"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ClassGroup)
class ClassGroupAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = ["name", "school_class", "leader_student", "order_no"]
    search_fields = ["name", "school_class__name"]
    list_filter = ["school_class"]
    autocomplete_fields = ["school_class", "leader_student", "deputy_leader_student"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(StudentClassEnrollment)
class StudentClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "school_class",
        "class_group",
        "enroll_date",
        "status",
        "created_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "school_class__name"]
    list_filter = ["school_class", "status"]
    autocomplete_fields = ["student", "school_class", "class_group", "enrolled_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ClassSubjectTeacher)
class ClassSubjectTeacherAdmin(admin.ModelAdmin):
    list_display = [
        "school_class",
        "subject",
        "teacher",
        "semester",
        "periods_per_week",
        "is_primary_teacher",
        "status",
    ]
    search_fields = [
        "school_class__name",
        "subject__name",
        "teacher__teacher_code",
        "teacher__user__full_name",
    ]
    list_filter = ["school_class", "subject", "semester", "is_primary_teacher", "status"]
    autocomplete_fields = ["school_class", "subject", "teacher", "semester", "assigned_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(PositionAssignment)
class PositionAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "position",
        "school",
        "department",
        "academic_year",
        "start_date",
        "end_date",
        "is_current",
    ]
    search_fields = ["user__username", "user__full_name", "position__name"]
    list_filter = ["position", "department", "is_current", "school"]
    autocomplete_fields = [
        "user",
        "position",
        "school",
        "department",
        "academic_year",
        "grade",
        "school_class",
    ]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(CustomFieldDefinition)
class CustomFieldDefinitionAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "field_code"
    list_display = [
        "field_code",
        "field_label",
        "entity_type",
        "data_type",
        "school",
        "is_required",
        "is_active",
    ]
    search_fields = ["field_code", "field_label", "entity_type"]
    list_filter = ["entity_type", "data_type", "is_required", "is_active", "school"]
    autocomplete_fields = ["school"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(CustomFieldValue)
class CustomFieldValueAdmin(admin.ModelAdmin):
    list_display = [
        "field",
        "entity_id",
        "field_value",
        "updated_at",
    ]
    search_fields = ["field__field_label", "field_value"]
    list_filter = ["field"]
    autocomplete_fields = ["field"]
    readonly_fields = ["updated_at"]


@admin.register(Club)
class ClubAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "category",
        "advisor_teacher",
        "president_student",
        "is_active",
        "established_date",
    ]
    search_fields = ["code", "name", "advisor_teacher__user__full_name"]
    list_filter = ["school", "category", "is_active"]
    autocomplete_fields = [
        "school",
        "advisor_teacher",
        "president_student",
        "vice_president_student",
    ]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ClubMember)
class ClubMemberAdmin(admin.ModelAdmin):
    list_display = [
        "club",
        "student",
        "role_title",
        "joined_date",
        "left_date",
        "status",
    ]
    search_fields = ["club__name", "student__student_code", "student__user__full_name"]
    list_filter = ["club", "role_title", "status"]
    autocomplete_fields = ["club", "student"]
    readonly_fields = ["created_at", "updated_at"]
