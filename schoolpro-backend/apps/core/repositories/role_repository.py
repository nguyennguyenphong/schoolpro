"""
Repository layer for Role & Permission domain entities.
Handles database access, queries, aggregates, and relation syncing.
"""

import uuid
from collections.abc import Sequence

from django.db import models
from django.db.models import Count, QuerySet

from apps.core.models.permission import Permission, RolePermission
from apps.core.models.role import Role, UserRole
from common.repositories.base import BaseRepository


class RoleRepository(BaseRepository[Role]):
    """
    Data access repository for Role entities and user-role relations.
    """

    def __init__(self):
        super().__init__(Role)

    def get_annotated_roles(self) -> QuerySet[Role]:
        """
        Return all roles with user count and permission count calculated via subquery/aggregation.
        """
        return (
            self.model_class.objects.all()
            .annotate(
                user_count=Count("user_roles", distinct=True),
                permission_count=Count("role_permissions", distinct=True),
            )
            .order_by("code")
        )

    def get_by_code(self, code: str) -> Role | None:
        """Fetch role by unique code."""
        return self.model_class.objects.filter(code=code).first()

    def get_role_permissions(self, role_id: uuid.UUID | str) -> QuerySet[Permission]:
        """Fetch all permissions associated with a role."""
        return Permission.objects.filter(role_permissions__role_id=role_id).order_by(
            "group_code", "code"
        )

    def sync_permissions(self, role: Role, permission_ids: Sequence[uuid.UUID | str]) -> int:
        """
        Replace current role permissions with the provided list of permission IDs.
        """
        # Delete existing role permissions
        RolePermission.objects.filter(role=role).delete()

        # Bulk create new mappings
        new_mappings = [
            RolePermission(role=role, permission_id=perm_id) for perm_id in permission_ids
        ]
        if new_mappings:
            RolePermission.objects.bulk_create(new_mappings)
        return len(new_mappings)

    def add_permissions(self, role: Role, permission_ids: Sequence[uuid.UUID | str]) -> int:
        """
        Add new permissions to role without removing existing ones.
        """
        existing_ids = set(
            RolePermission.objects.filter(role=role).values_list("permission_id", flat=True)
        )
        to_create = [
            RolePermission(role=role, permission_id=perm_id)
            for perm_id in permission_ids
            if perm_id not in existing_ids
        ]
        if to_create:
            RolePermission.objects.bulk_create(to_create)
        return len(to_create)

    def remove_permissions(self, role: Role, permission_ids: Sequence[uuid.UUID | str]) -> int:
        """
        Remove specified permissions from role.
        """
        deleted_count, _ = RolePermission.objects.filter(
            role=role,
            permission_id__in=permission_ids,
        ).delete()
        return deleted_count

    def get_role_users(self, role_id: uuid.UUID | str) -> QuerySet[UserRole]:
        """Fetch all user assignments for a specific role."""
        return (
            UserRole.objects.filter(role_id=role_id)
            .select_related("user", "role")
            .order_by("-is_primary", "user__full_name")
        )

    def get_user_role(self, role_id: uuid.UUID | str, user_id: uuid.UUID | str) -> UserRole | None:
        """Fetch specific user-role assignment."""
        return UserRole.objects.filter(role_id=role_id, user_id=user_id).first()

    def count_active_users(self, role_id: uuid.UUID | str) -> int:
        """Count active users assigned to this role."""
        return UserRole.objects.filter(role_id=role_id, status="ACTIVE").count()


class PermissionRepository(BaseRepository[Permission]):
    """
    Data access repository for atomic Permission definitions.
    """

    def __init__(self):
        super().__init__(Permission)

    def get_all_ordered(
        self, group_code: str | None = None, search: str | None = None
    ) -> QuerySet[Permission]:
        """Fetch permissions with optional group filtering and search."""
        qs = self.model_class.objects.all().order_by("group_code", "code")
        if group_code:
            qs = qs.filter(group_code=group_code)
        if search:
            qs = qs.filter(
                models.Q(code__icontains=search)
                | models.Q(name__icontains=search)
                | models.Q(description__icontains=search)
            )
        return qs

    def get_distinct_groups(self) -> list[str]:
        """Return list of distinct permission group codes."""
        return list(
            self.model_class.objects.values_list("group_code", flat=True)
            .distinct()
            .order_by("group_code")
        )
