"""
Serializers for Role and Permission management endpoints.
Provides validation schemas and structured responses.
"""

from rest_framework import serializers

from apps.core.models.permission import Permission
from apps.core.models.role import Role, UserRole


class PermissionResponseSerializer(serializers.ModelSerializer):
    """
    Serializer representing atomic Permission definitions.
    """

    class Meta:
        model = Permission
        fields = [
            "id",
            "code",
            "name",
            "group_code",
            "description",
        ]
        read_only_fields = fields


class PermissionGroupResponseSerializer(serializers.Serializer):
    """
    Serializer grouping permissions by module/group code.
    """

    group_code = serializers.CharField()
    permissions = PermissionResponseSerializer(many=True)


class RoleListResponseSerializer(serializers.ModelSerializer):
    """
    Summary serializer for Role list endpoint with aggregate metrics.
    """

    user_count = serializers.IntegerField(read_only=True, default=0)
    permission_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Role
        fields = [
            "id",
            "code",
            "name",
            "description",
            "badge_color",
            "icon",
            "is_system",
            "is_active",
            "user_count",
            "permission_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class RoleDetailResponseSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for single Role details with nested permissions.
    """

    user_count = serializers.IntegerField(read_only=True, default=0)
    permission_count = serializers.IntegerField(read_only=True, default=0)
    permissions = PermissionResponseSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = [
            "id",
            "code",
            "name",
            "description",
            "badge_color",
            "icon",
            "is_system",
            "is_active",
            "user_count",
            "permission_count",
            "permissions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class RoleCreateRequestSerializer(serializers.Serializer):
    """
    Request payload schema for creating a new custom Role.
    """

    code = serializers.CharField(
        max_length=50,
        required=True,
        help_text="Unique uppercase code for the role (e.g., 'R_ACADEMIC_HEAD')",
    )
    name = serializers.CharField(
        max_length=150,
        required=True,
        help_text="Human-readable role title",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Detailed description of responsibilities and access privileges",
    )
    badge_color = serializers.CharField(
        max_length=30,
        required=False,
        default="#2563EB",
        help_text="Hex color code for UI tag badges",
    )
    icon = serializers.CharField(
        max_length=50,
        required=False,
        default="shield",
        help_text="Icon identifier (e.g., 'shield', 'user', 'graduation-cap')",
    )
    is_active = serializers.BooleanField(
        required=False,
        default=True,
        help_text="Whether this role is currently enabled",
    )
    permission_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        help_text="List of permission UUIDs to initially assign to this role",
    )


class RoleUpdateRequestSerializer(serializers.Serializer):
    """
    Request payload schema for updating an existing Role.
    """

    name = serializers.CharField(max_length=150, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    badge_color = serializers.CharField(max_length=30, required=False)
    icon = serializers.CharField(max_length=50, required=False)
    is_active = serializers.BooleanField(required=False)
    permission_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="Optional full list of permission UUIDs to sync with this role",
    )


class RolePermissionSyncRequestSerializer(serializers.Serializer):
    """
    Request schema to batch assign or sync permissions for a role.
    """

    permission_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        help_text="Full list of permission UUIDs to assign to this role",
    )


class UserRoleAssignmentResponseSerializer(serializers.ModelSerializer):
    """
    Serializer representing a user assigned to a role.
    """

    user_id = serializers.UUIDField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    role_code = serializers.CharField(source="role.code", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = UserRole
        fields = [
            "id",
            "user_id",
            "username",
            "full_name",
            "email",
            "role_code",
            "role_name",
            "is_primary",
            "effective_from",
            "effective_to",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class AssignUserToRoleRequestSerializer(serializers.Serializer):
    """
    Request payload schema to assign a user to a security role.
    """

    user_id = serializers.UUIDField(required=True, help_text="Target User UUID")
    is_primary = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Set as user's primary active role",
    )
    effective_from = serializers.DateField(
        required=False,
        help_text="Start date of role assignment (defaults to today)",
    )
    effective_to = serializers.DateField(
        required=False,
        allow_null=True,
        help_text="Optional expiration date of role assignment",
    )
    status = serializers.ChoiceField(
        choices=["ACTIVE", "SUSPENDED", "EXPIRED"],
        default="ACTIVE",
        help_text="Current assignment status",
    )
