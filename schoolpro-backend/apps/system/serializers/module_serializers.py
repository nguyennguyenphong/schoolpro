"""
Serializers for System Modules, Role Mappings, and Personalized Dashboard Cards.
Full CRUD & Management support.
"""

from typing import Any

from rest_framework import serializers

from apps.core.models.role import Role
from apps.system.models.module import Module, RoleModule


class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for the master system module definition.
    Supports list, retrieve, create, and update actions.
    """

    class Meta:
        model = Module
        fields = [
            "id",
            "code",
            "name",
            "short_name",
            "description",
            "icon",
            "route",
            "module_type",
            "category",
            "default_color",
            "default_badge",
            "component_name",
            "parent_module",
            "default_order_no",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ModuleCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Validation serializer for Admin creating or updating a module.
    """

    class Meta:
        model = Module
        fields = [
            "code",
            "name",
            "short_name",
            "description",
            "icon",
            "route",
            "module_type",
            "category",
            "default_color",
            "default_badge",
            "component_name",
            "parent_module",
            "default_order_no",
            "is_active",
        ]

    def validate_code(self, value: str) -> str:
        clean_code = value.strip().upper()
        instance = getattr(self, "instance", None)
        qs = Module.objects.filter(code=clean_code)
        if instance:
            qs = qs.exclude(id=instance.id)
        if qs.exists():
            raise serializers.ValidationError(
                f"Mã module '{clean_code}' đã tồn tại trong hệ thống."
            )
        return clean_code

    def validate_module_type(self, value: str) -> str:
        valid_types = ["CARD", "MENU", "WIDGET", "QUICK_ACTION", "BANNER"]
        if value not in valid_types:
            raise serializers.ValidationError(f"Loại module phải thuộc: {', '.join(valid_types)}")
        return value

    def validate_category(self, value: str) -> str:
        valid_cats = [
            "ACADEMIC",
            "EMULATION",
            "EVALUATION",
            "COMMUNICATION",
            "MANAGEMENT",
            "UTILITY",
        ]
        if value not in valid_cats:
            raise serializers.ValidationError(
                f"Danh mục module phải thuộc: {', '.join(valid_cats)}"
            )
        return value


class RoleModuleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for role module mappings including joined module information.
    """

    module = ModuleSerializer(read_only=True)
    role_id = serializers.UUIDField()
    role_code = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = RoleModule
        fields = [
            "id",
            "role_id",
            "role_code",
            "role_name",
            "module",
            "is_visible",
            "is_pinned_default",
            "order_no",
            "grid_col_span",
            "custom_badge",
            "config",
        ]

    def get_role_code(self, obj: RoleModule) -> str:
        role = Role.objects.filter(id=obj.role_id).first()
        return role.code if role else ""

    def get_role_name(self, obj: RoleModule) -> str:
        role = Role.objects.filter(id=obj.role_id).first()
        return role.name if role else ""


class RoleModuleAssignSerializer(serializers.Serializer):
    """
    Serializer for assigning/updating a module to a role.
    """

    role_id = serializers.UUIDField(required=True)
    module_id = serializers.UUIDField(required=True)
    is_visible = serializers.BooleanField(required=False, default=True)
    is_pinned_default = serializers.BooleanField(required=False, default=False)
    order_no = serializers.IntegerField(required=False, default=0, min_value=0)
    grid_col_span = serializers.IntegerField(required=False, default=1, min_value=1, max_value=12)
    custom_badge = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=50
    )
    config = serializers.JSONField(required=False, default=dict)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if not Role.objects.filter(id=attrs["role_id"]).exists():
            raise serializers.ValidationError({"role_id": "Vai trò (Role) không tồn tại."})
        if not Module.objects.filter(id=attrs["module_id"]).exists():
            raise serializers.ValidationError({"module_id": "Module không tồn tại."})
        return attrs


class UserDashboardCardSerializer(serializers.Serializer):
    """
    Serializer for the resolved user dashboard cards.
    Conforms directly to sys.modules and sys.role_modules schema.
    """

    id = serializers.CharField()
    module_id = serializers.UUIDField()
    code = serializers.CharField(source="module_code")
    name = serializers.CharField(source="module_name")
    short_name = serializers.CharField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, required=False)
    icon = serializers.CharField()
    route = serializers.CharField()
    module_type = serializers.CharField()
    category = serializers.CharField()
    default_color = serializers.CharField(allow_null=True, required=False)
    default_badge = serializers.CharField(allow_null=True, required=False)
    badge_text = serializers.CharField(allow_null=True, required=False)
    is_pinned = serializers.BooleanField()
    is_hidden = serializers.BooleanField()
    order_no = serializers.IntegerField(source="display_order")
    config = serializers.JSONField(source="ui_config", allow_null=True, required=False)


class UpdateUserModulePreferenceSerializer(serializers.Serializer):
    """
    Serializer to update or create user personalized module preferences
    (pinning, hiding, custom ordering, custom theme config).
    """

    module_id = serializers.UUIDField(required=True)
    is_pinned = serializers.BooleanField(required=False, default=None)
    is_hidden = serializers.BooleanField(required=False, default=None)
    order_no = serializers.IntegerField(required=False, default=None, min_value=0)
    custom_config = serializers.DictField(
        required=False, default=None, child=serializers.CharField()
    )


class ReorderUserModulesSerializer(serializers.Serializer):
    """
    Serializer to batch update module positions (e.g. drag & drop).
    """

    module_orders = serializers.ListField(
        child=serializers.DictField(
            child=serializers.JSONField(),
        ),
        help_text="List of items: [{'module_id': 'uuid', 'order_no': 1}, ...]",
    )

    def validate_module_orders(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        for item in value:
            if "module_id" not in item:
                raise serializers.ValidationError("Each item must have 'module_id'.")
            if "order_no" not in item:
                raise serializers.ValidationError("Each item must have 'order_no'.")
        return value
