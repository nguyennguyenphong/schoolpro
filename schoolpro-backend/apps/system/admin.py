"""
Django Admin site registration for System module models and preferences.
Allows full CRUD operations via Django Admin UI (http://localhost:8000/admin/).
"""

from django.contrib import admin

from apps.system.models.module import Module, RoleModule
from apps.system.models.preference import UserModulePreference
from apps.system.models.setting import (
    RoleSettingsDefault,
    SettingsDefinition,
    SystemSetting,
    UserSetting,
)


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
class ModuleAdmin(admin.ModelAdmin):
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
class SettingsDefinitionAdmin(admin.ModelAdmin):
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
