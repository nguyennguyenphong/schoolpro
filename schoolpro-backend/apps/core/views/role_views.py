"""
REST API ViewSets for Role and Permission management.
Follows Clean Architecture: delegates orchestration to RoleService and formats outputs via APIResponse.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action

from apps.core.permissions.role_permissions import IsRoleManagerOrReadOnly
from apps.core.serializers.role_serializers import (
    AssignUserToRoleRequestSerializer,
    PermissionResponseSerializer,
    RoleCreateRequestSerializer,
    RoleDetailResponseSerializer,
    RoleListResponseSerializer,
    RolePermissionSyncRequestSerializer,
    RoleUpdateRequestSerializer,
    UserRoleAssignmentResponseSerializer,
)
from apps.core.services.role_service import RoleService
from common.pagination.standard import StandardPagination
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List all security roles",
        description="Retrieve a paginated or filtered list of roles with active user and permission counts.",
        parameters=[
            OpenApiParameter(
                "search", str, description="Search term for code, name, or description"
            ),
            OpenApiParameter(
                "is_system", bool, description="Filter by system-protected role status"
            ),
            OpenApiParameter("is_active", bool, description="Filter by active status"),
        ],
        responses={200: RoleListResponseSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Retrieve role details",
        description="Fetch detailed profile of a role including all assigned permissions.",
        responses={200: RoleDetailResponseSerializer},
    ),
    create=extend_schema(
        summary="Create a new custom role",
        description="Register a new organizational role with optional initial permissions.",
        request=RoleCreateRequestSerializer,
        responses={201: RoleDetailResponseSerializer},
    ),
    update=extend_schema(
        summary="Update an existing role",
        description="Modify role name, description, colors, or permissions. System role codes cannot be changed.",
        request=RoleUpdateRequestSerializer,
        responses={200: RoleDetailResponseSerializer},
    ),
    partial_update=extend_schema(
        summary="Partially update a role",
        request=RoleUpdateRequestSerializer,
        responses={200: RoleDetailResponseSerializer},
    ),
    destroy=extend_schema(
        summary="Delete a custom role",
        description="Remove a custom role. System roles and roles with active assigned users cannot be deleted.",
        responses={200: None},
    ),
)
class RoleViewSet(viewsets.ViewSet):
    """
    Controller managing security roles, permission matrices, and user assignments.
    """

    permission_classes = [IsRoleManagerOrReadOnly]
    pagination_class = StandardPagination

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.role_service = RoleService()

    def list(self, request):
        """List all roles with search and filters."""
        search = request.query_params.get("search")
        is_system_param = request.query_params.get("is_system")
        is_active_param = request.query_params.get("is_active")

        is_system = is_system_param.lower() == "true" if is_system_param is not None else None
        is_active = is_active_param.lower() == "true" if is_active_param is not None else None

        queryset = self.role_service.list_roles(
            search=search, is_system=is_system, is_active=is_active
        )

        # Check if caller wants pagination or unpaginated list
        paginate = request.query_params.get("paginate", "true").lower() == "true"
        if paginate:
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            serializer = RoleListResponseSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = RoleListResponseSerializer(queryset, many=True)
        return APIResponse.success(data=serializer.data)

    def retrieve(self, request, pk=None):
        """Retrieve single role details with permissions."""
        detail = self.role_service.get_role_detail(pk)
        role = detail["role"]
        # Attach dynamic attributes to role instance for serializer
        role.permissions = detail["permissions"]
        role.user_count = detail["user_count"]
        role.permission_count = detail["permission_count"]

        serializer = RoleDetailResponseSerializer(role)
        return APIResponse.success(data=serializer.data)

    def create(self, request):
        """Create new custom role."""
        serializer = RoleCreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = self.role_service.create_role(serializer.validated_data)
        detail = self.role_service.get_role_detail(role.id)
        role.permissions = detail["permissions"]
        role.user_count = detail["user_count"]
        role.permission_count = detail["permission_count"]

        return APIResponse.created(
            data=RoleDetailResponseSerializer(role).data,
            message="Role created successfully.",
        )

    def update(self, request, pk=None):
        """Update role details."""
        serializer = RoleUpdateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = self.role_service.update_role(pk, serializer.validated_data)
        detail = self.role_service.get_role_detail(role.id)
        role.permissions = detail["permissions"]
        role.user_count = detail["user_count"]
        role.permission_count = detail["permission_count"]

        return APIResponse.success(
            data=RoleDetailResponseSerializer(role).data,
            message="Role updated successfully.",
        )

    def partial_update(self, request, pk=None):
        """Partially update role."""
        return self.update(request, pk=pk)

    def destroy(self, request, pk=None):
        """Delete custom role."""
        self.role_service.delete_role(pk)
        return APIResponse.success(message="Role deleted successfully.")

    @extend_schema(
        summary="Manage role permissions",
        description="GET: List permissions assigned to this role. POST: Sync/replace permissions. DELETE: Remove specified permissions.",
        request=RolePermissionSyncRequestSerializer,
        responses={200: PermissionResponseSerializer(many=True)},
    )
    @action(detail=True, methods=["get", "post", "delete"], url_path="permissions")
    def permissions(self, request, pk=None):
        """Handle permissions assigned to this role."""
        if request.method == "GET":
            perms = self.role_service.get_role_permissions(pk)
            serializer = PermissionResponseSerializer(perms, many=True)
            return APIResponse.success(data=serializer.data)

        if request.method == "POST":
            serializer = RolePermissionSyncRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            perm_ids = serializer.validated_data["permission_ids"]

            count = self.role_service.sync_role_permissions(pk, perm_ids)
            perms = self.role_service.get_role_permissions(pk)
            return APIResponse.success(
                data=PermissionResponseSerializer(perms, many=True).data,
                message=f"Successfully synchronized {count} permission(s) for role.",
            )

        if request.method == "DELETE":
            serializer = RolePermissionSyncRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            perm_ids = serializer.validated_data["permission_ids"]

            deleted = self.role_service.remove_role_permissions(pk, perm_ids)
            return APIResponse.success(message=f"Removed {deleted} permission(s) from role.")

    @extend_schema(
        summary="List or assign users for a role",
        description="GET: List assigned users. POST: Assign user to role.",
        request=AssignUserToRoleRequestSerializer,
        responses={200: UserRoleAssignmentResponseSerializer(many=True)},
    )
    @action(detail=True, methods=["get", "post"], url_path="users")
    def users(self, request, pk=None):
        """Manage user assignments for this role."""
        if request.method == "GET":
            assignments = self.role_service.list_role_users(pk)
            serializer = UserRoleAssignmentResponseSerializer(assignments, many=True)
            return APIResponse.success(data=serializer.data)

        if request.method == "POST":
            serializer = AssignUserToRoleRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            v = serializer.validated_data

            assignment = self.role_service.assign_user_to_role(
                role_id=pk,
                user_id=v["user_id"],
                is_primary=v.get("is_primary", False),
                effective_from=v.get("effective_from"),
                effective_to=v.get("effective_to"),
                status=v.get("status", "ACTIVE"),
            )
            return APIResponse.created(
                data=UserRoleAssignmentResponseSerializer(assignment).data,
                message="User successfully assigned to role.",
            )

    @extend_schema(
        summary="Revoke user from role",
        description="Remove a specific user assignment from this role.",
        responses={200: None},
    )
    @action(detail=True, methods=["delete"], url_path=r"users/(?P<user_id>[0-9a-f-]+)")
    def remove_user(self, request, pk=None, user_id=None):
        """Revoke a user's role assignment."""
        self.role_service.revoke_user_from_role(pk, user_id)
        return APIResponse.success(message="User role assignment revoked successfully.")

    @extend_schema(
        summary="Get full Role-Permission Matrix",
        description="Returns an interactive matrix of all roles and their mapped atomic permissions grouped by category for the RBAC admin UI.",
    )
    @action(detail=False, methods=["get"], url_path="matrix")
    def matrix(self, request):
        """Return role-permission grid matrix for UI editor."""
        data = self.role_service.get_permission_matrix()
        return APIResponse.success(data=data)


@extend_schema_view(
    list=extend_schema(
        summary="List all atomic permissions",
        description="Retrieve all available security permissions with group category and search filtering.",
        parameters=[
            OpenApiParameter(
                "group_code", str, description="Filter by permission group code (e.g. 'CORE_USER')"
            ),
            OpenApiParameter(
                "search", str, description="Search term across permission code, name, description"
            ),
        ],
        responses={200: PermissionResponseSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="Retrieve permission detail",
        responses={200: PermissionResponseSerializer},
    ),
)
class PermissionViewSet(viewsets.ViewSet):
    """
    Read-only viewset listing available atomic system permissions.
    """

    permission_classes = [IsRoleManagerOrReadOnly]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.role_service = RoleService()

    def list(self, request):
        """List permissions with optional grouping and search."""
        group_code = request.query_params.get("group_code")
        search = request.query_params.get("search")

        perms = self.role_service.list_all_permissions(group_code=group_code, search=search)
        serializer = PermissionResponseSerializer(perms, many=True)
        return APIResponse.success(data=serializer.data)

    def retrieve(self, request, pk=None):
        """Get single permission detail."""
        from apps.core.models.permission import Permission

        perm = Permission.objects.filter(id=pk).first()
        if not perm:
            return APIResponse.error(
                message=f"Permission with ID '{pk}' not found.",
                code=status.HTTP_404_NOT_FOUND,
            )
        serializer = PermissionResponseSerializer(perm)
        return APIResponse.success(data=serializer.data)

    @extend_schema(
        summary="List permissions grouped by category",
        description="Returns all permissions organized by their group code.",
    )
    @action(detail=False, methods=["get"], url_path="grouped")
    def grouped(self, request):
        """Return permissions grouped by category."""
        from collections import defaultdict

        perms = self.role_service.list_all_permissions()
        groups = defaultdict(list)
        for p in perms:
            groups[p.group_code].append(PermissionResponseSerializer(p).data)

        grouped_data = [{"group_code": g, "permissions": p_list} for g, p_list in groups.items()]
        return APIResponse.success(data=grouped_data)
