"""
Django Admin site registration for Core security and organizational models.
"""

from django.contrib import admin

from apps.core.models.permission import Permission, RolePermission
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["username", "full_name", "email", "phone", "status_code", "created_at"]
    search_fields = ["username", "full_name", "email", "phone", "national_id"]
    list_filter = ["status_code", "gender_code"]
    readonly_fields = ["created_at", "updated_at", "last_login_at"]


class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1
    autocomplete_fields = ["permission"]


class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 0
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at"]


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "badge_color", "icon", "is_system", "is_active", "created_at"]
    list_filter = ["is_system", "is_active"]
    search_fields = ["code", "name", "description"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [RolePermissionInline, UserRoleInline]


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "group_code", "description"]
    list_filter = ["group_code"]
    search_fields = ["code", "name", "group_code", "description"]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ["user", "role", "is_primary", "status", "effective_from", "effective_to"]
    list_filter = ["is_primary", "status", "role"]
    search_fields = ["user__username", "user__full_name", "role__code", "role__name"]
    autocomplete_fields = ["user", "role"]
