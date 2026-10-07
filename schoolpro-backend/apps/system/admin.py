"""
Django Admin site registration for System module models, preferences, audit, and settings.
Allows full CRUD operations via Django Admin UI (http://localhost:8000/admin/).
Covers 11 models:
  - AuditLog, LoginHistory
  - Module, RoleModule, UserModulePreference
  - SettingsDefinition, SystemSetting, RoleSettingsDefault, UserSetting
  - ExportTemplate
  - EventOutbox
"""

from django.contrib import admin

from apps.system.models.audit import AuditLog
from apps.system.models.export_template import ExportTemplate
from apps.system.models.login_history import LoginHistory
from apps.system.models.module import Module, RoleModule
from apps.system.models.outbox import EventOutbox
from apps.system.models.preference import UserModulePreference
from apps.system.models.setting import (
    RoleSettingsDefault,
    SettingsDefinition,
    SystemSetting,
    UserSetting,
)
from common.admin_mixins import AutoCodeAdminMixin


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "module",
        "action",
        "table_name",
        "severity",
        "ip_address",
        "client_type",
        "created_at",
    ]
    search_fields = ["username_snapshot", "target_summary", "action", "table_name"]
    list_filter = ["module", "severity", "action", "client_type", "created_at"]
    autocomplete_fields = ["user", "impersonated_by"]
    readonly_fields = [
        "user",
        "impersonated_by",
        "username_snapshot",
        "role_code_snapshot",
        "module",
        "subsystem",
        "action",
        "severity",
        "table_name",
        "record_id",
        "target_summary",
        "old_data",
        "new_data",
        "diff_data",
        "changed_fields",
        "ip_address",
        "ip_country",
        "user_agent",
        "client_type",
        "session_id",
        "device_id",
        "created_at",
    ]


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "username_attempt",
        "login_status",
        "auth_method",
        "device_type",
        "browser_name",
        "ip_address",
        "login_at",
    ]
    search_fields = ["username_attempt", "ip_address", "failure_reason"]
    list_filter = ["login_status", "auth_method", "device_type", "login_at"]
    autocomplete_fields = ["user"]
    readonly_fields = [
        "user",
        "username_attempt",
        "login_at",
        "login_status",
        "failure_reason",
        "device_name",
        "device_id",
        "device_type",
        "browser_name",
        "browser_version",
        "os_name",
        "os_version",
        "client_type",
        "app_version",
        "auth_method",
        "ip_address",
        "user_agent",
        "request_id",
        "location_country",
        "location_country_code",
        "location_city",
    ]


class RoleModuleInline(admin.TabularInline):
    model = RoleModule
    extra = 1
    fields = [
        "role_id",
        "is_visible",
        "is_pinned_default",
        "order_no",
        "grid_col_span",
        "custom_badge",
    ]


@admin.register(Module)
class ModuleAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "category",
        "module_type",
        "icon",
        "route",
        "default_order_no",
        "is_active",
        "created_at",
    ]
    list_filter = ["category", "module_type", "is_active"]
    search_fields = ["code", "name", "route", "description"]
    ordering = ["category", "default_order_no", "code"]
    inlines = [RoleModuleInline]


@admin.register(RoleModule)
class RoleModuleAdmin(admin.ModelAdmin):
    list_display = [
        "role_id",
        "module",
        "is_visible",
        "is_pinned_default",
        "order_no",
        "grid_col_span",
        "custom_badge",
    ]
    list_filter = ["is_visible", "is_pinned_default"]
    search_fields = ["module__name", "module__code", "custom_badge"]
    ordering = ["role_id", "order_no"]
    autocomplete_fields = ["module"]


@admin.register(UserModulePreference)
class UserModulePreferenceAdmin(admin.ModelAdmin):
    list_display = ["user_id", "module", "is_pinned", "is_hidden", "order_no", "updated_at"]
    list_filter = ["is_pinned", "is_hidden"]
    search_fields = ["user_id", "module__name", "module__code"]
    ordering = ["user_id", "order_no"]
    autocomplete_fields = ["module"]


@admin.register(SettingsDefinition)
class SettingsDefinitionAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = ["code", "name", "data_type", "scope", "category", "is_active"]
    list_filter = ["scope", "category", "data_type", "is_active"]
    search_fields = ["code", "name", "description"]


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ["school_id", "setting", "value", "updated_at"]
    search_fields = ["setting__code", "setting__name"]
    autocomplete_fields = ["setting"]


@admin.register(RoleSettingsDefault)
class RoleSettingsDefaultAdmin(admin.ModelAdmin):
    list_display = ["role_id", "setting", "value"]
    search_fields = ["setting__code", "setting__name"]
    autocomplete_fields = ["setting"]


@admin.register(UserSetting)
class UserSettingAdmin(admin.ModelAdmin):
    list_display = ["user_id", "setting", "value", "updated_at"]
    search_fields = ["user_id", "setting__code", "setting__name"]
    autocomplete_fields = ["setting"]


@admin.register(ExportTemplate)
class ExportTemplateAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "template_type",
        "file_format",
        "school",
        "department",
        "is_default",
        "is_active",
        "updated_at",
    ]
    list_filter = ["template_type", "file_format", "is_default", "is_active", "school"]
    search_fields = ["code", "name", "description"]
    ordering = ["-is_default", "name"]
    autocomplete_fields = ["school", "department", "created_by", "updated_by"]
    fieldsets = [
        (
            "Thông tin cơ bản",
            {
                "fields": (
                    "code",
                    "name",
                    "description",
                    "template_type",
                    "file_format",
                    "school",
                    "department",
                    "is_default",
                    "is_active",
                )
            },
        ),
        (
            "Cấu hình trang & In ấn",
            {
                "fields": (
                    "page_size",
                    "page_orientation",
                    "margins",
                    "style_content",
                )
            },
        ),
        (
            "Nội dung biểu mẫu",
            {
                "fields": (
                    "header_content",
                    "content",
                    "footer_content",
                )
            },
        ),
        (
            "Cấu hình biến & Xem trước",
            {
                "fields": (
                    "placeholders_schema",
                    "sample_data",
                )
            },
        ),
        (
            "Thông tin kiểm toán",
            {
                "fields": ("created_by", "updated_by"),
                "classes": ("collapse",),
            },
        ),
    ]


@admin.register(EventOutbox)
class EventOutboxAdmin(admin.ModelAdmin):
    list_display = [
        "aggregate_type",
        "event_type",
        "topic",
        "status",
        "retry_count",
        "created_at",
        "processed_at",
    ]
    search_fields = ["event_type", "aggregate_type", "topic", "correlation_id"]
    list_filter = ["status", "aggregate_type", "event_type", "created_at"]
    readonly_fields = ["created_at"]
