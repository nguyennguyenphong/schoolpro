"""
Views for System Modules, Dynamic Dashboard Cards, and Admin Module Management.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.authentication import SchoolProJWTAuthentication
from apps.system.models.module import Module, RoleModule
from apps.system.serializers.module_serializers import (
    ModuleCreateUpdateSerializer,
    ModuleSerializer,
    ReorderUserModulesSerializer,
    RoleModuleAssignSerializer,
    RoleModuleDetailSerializer,
    UpdateUserModulePreferenceSerializer,
    UserDashboardCardSerializer,
)
from apps.system.services.module_service import ModuleService
from common.permissions.roles import IsAdminUserOrSchoolAdmin
from common.responses.response import APIResponse


class UserModulesView(APIView):
    """
    Returns dynamic dashboard cards and functional modules for the authenticated user
    based on their current active role session.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Dashboard Modules for Authenticated User",
        description=(
            "Retrieves personal dashboard cards for the current logged in user and role session. "
            "Resolves module configurations, badges, colors, and user pinning/ordering overrides."
        ),
        parameters=[
            OpenApiParameter(
                name="role",
                type=str,
                description="Optional role code override (e.g. STUDENT, TEACHER). Defaults to current session token role.",
                required=False,
            ),
            OpenApiParameter(
                name="include_hidden",
                type=bool,
                description="Whether to include user-hidden modules.",
                required=False,
                default=False,
            ),
        ],
        responses={200: UserDashboardCardSerializer(many=True)},
    )
    def get(self, request):
        role_code = request.query_params.get("role")
        include_hidden_str = request.query_params.get("include_hidden", "false").lower()
        include_hidden = include_hidden_str in ["true", "1", "yes"]

        service = ModuleService()
        cards = service.get_modules_for_user(
            user=request.user,
            active_role_code=role_code,
            include_hidden=include_hidden,
        )

        serializer = UserDashboardCardSerializer(cards, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Danh sách module dashboard được tải thành công",
            meta={
                "total": len(cards),
                "active_role": role_code or getattr(request.user, "active_role_code", None),
            },
        )


class UserModulePreferenceView(APIView):
    """
    Manages personalized preferences for dashboard modules
    (pinning, hiding, custom order, custom card config).
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Update User Preference for a Module",
        description="Updates or sets user personalized overrides (is_pinned, is_hidden, order_no, custom_config).",
        request=UpdateUserModulePreferenceSerializer,
        responses={200: UserDashboardCardSerializer},
    )
    def post(self, request):
        serializer = UpdateUserModulePreferenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service = ModuleService()
        service.update_user_preference(
            user=request.user,
            module_id=data["module_id"],
            is_pinned=data.get("is_pinned"),
            is_hidden=data.get("is_hidden"),
            order_no=data.get("order_no"),
            custom_config=data.get("custom_config"),
        )

        # Return updated cards stream
        cards = service.get_modules_for_user(user=request.user)
        return APIResponse.success(
            data=UserDashboardCardSerializer(cards, many=True).data,
            message="Cập nhật tùy biến module thành công",
        )


class ReorderUserModulesView(APIView):
    """
    Batch reorders user dashboard modules (e.g. drag & drop on home screen).
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Batch Reorder User Dashboard Modules",
        description="Batch updates order_no for multiple modules when user rearranges them on the homepage.",
        request=ReorderUserModulesSerializer,
        responses={200: UserDashboardCardSerializer(many=True)},
    )
    def post(self, request):
        serializer = ReorderUserModulesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = ModuleService()
        updated_cards = service.reorder_modules_for_user(
            user=request.user,
            orders=serializer.validated_data["module_orders"],
        )

        return APIResponse.success(
            data=UserDashboardCardSerializer(updated_cards, many=True).data,
            message="Sắp xếp lại thứ tự modules thành công",
        )


# =============================================================================
# ADMIN CRUD VIEWSETS
# =============================================================================


class AdminModuleViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing sys.modules.
    Full CRUD: List, Create, Retrieve, Update, Partial Update, Delete.
    """

    queryset = Module.objects.all().order_by("category", "default_order_no", "code")
    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrSchoolAdmin]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ModuleCreateUpdateSerializer
        return ModuleSerializer

    @extend_schema(summary="Admin: List all modules")
    def list(self, request, *args, **kwargs):
        category = request.query_params.get("category")
        is_active = request.query_params.get("is_active")

        service = ModuleService()
        active_filter = None
        if is_active is not None:
            active_filter = is_active.lower() in ["true", "1", "yes"]

        modules = service.list_all_modules(category=category, is_active=active_filter)
        serializer = ModuleSerializer(modules, many=True)
        return APIResponse.success(data=serializer.data, meta={"total": len(modules)})

    @extend_schema(summary="Admin: Get module by ID")
    def retrieve(self, request, *args, **kwargs):
        service = ModuleService()
        module = service.get_module_by_id(kwargs["pk"])
        return APIResponse.success(data=ModuleSerializer(module).data)

    @extend_schema(summary="Admin: Create new module")
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = ModuleService()
        instance = service.create_module(**serializer.validated_data)
        return APIResponse.created(
            data=ModuleSerializer(instance).data,
            message="Module đã được tạo thành công",
        )

    @extend_schema(summary="Admin: Update module")
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = ModuleService()
        instance = service.update_module(kwargs["pk"], **serializer.validated_data)
        return APIResponse.success(
            data=ModuleSerializer(instance).data,
            message="Module đã được cập nhật thành công",
        )

    @extend_schema(summary="Admin: Partial update module")
    def partial_update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        service = ModuleService()
        instance = service.update_module(kwargs["pk"], **serializer.validated_data)
        return APIResponse.success(
            data=ModuleSerializer(instance).data,
            message="Module đã được cập nhật một phần thành công",
        )

    @extend_schema(summary="Admin: Delete module")
    def destroy(self, request, *args, **kwargs):
        service = ModuleService()
        service.delete_module(kwargs["pk"])
        return APIResponse.success(message="Module và các liên kết đã được xóa thành công")


class AdminRoleModuleViewSet(viewsets.ViewSet):
    """
    Admin ViewSet for managing sys.role_modules assignments.
    Provides list, assign, and revoke operations.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrSchoolAdmin]

    @extend_schema(
        summary="Admin: List role module mappings",
        parameters=[
            OpenApiParameter(name="role_id", type=str, description="Filter by role UUID", required=False)
        ],
        responses={200: RoleModuleDetailSerializer(many=True)},
    )
    def list(self, request):
        role_id = request.query_params.get("role_id")
        service = ModuleService()
        mappings = service.list_role_modules(role_id=role_id)
        serializer = RoleModuleDetailSerializer(mappings, many=True)
        return APIResponse.success(data=serializer.data, meta={"total": len(mappings)})

    @extend_schema(
        summary="Admin: Assign or update module for role",
        request=RoleModuleAssignSerializer,
        responses={200: RoleModuleDetailSerializer},
    )
    def create(self, request):
        serializer = RoleModuleAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service = ModuleService()
        instance = service.assign_module_to_role(
            role_id=data["role_id"],
            module_id=data["module_id"],
            is_visible=data.get("is_visible", True),
            is_pinned_default=data.get("is_pinned_default", False),
            order_no=data.get("order_no", 0),
            grid_col_span=data.get("grid_col_span", 1),
            custom_badge=data.get("custom_badge"),
            config=data.get("config"),
        )
        return APIResponse.success(
            data=RoleModuleDetailSerializer(instance).data,
            message="Gán module cho vai trò thành công",
        )

    @extend_schema(
        summary="Admin: Revoke module from role",
        parameters=[
            OpenApiParameter(name="role_id", type=str, required=True),
            OpenApiParameter(name="module_id", type=str, required=True),
        ],
    )
    def destroy(self, request, pk=None):
        role_id = request.query_params.get("role_id") or pk
        module_id = request.query_params.get("module_id")
        if not role_id or not module_id:
            return APIResponse.error(
                message="Thiếu thông tin role_id hoặc module_id để hủy phân quyền module",
                code=status.HTTP_400_BAD_REQUEST,
            )

        service = ModuleService()
        service.revoke_module_from_role(role_id=role_id, module_id=module_id)
        return APIResponse.success(message="Đã hủy phân quyền module khỏi vai trò thành công")
