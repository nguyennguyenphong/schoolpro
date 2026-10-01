"""
Business Logic Layer for Role and Permission management.
Enforces validation rules, transactional security, and domain constraints.
"""

import uuid
from collections import defaultdict
from collections.abc import Sequence
from datetime import date
from typing import Any

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied

from apps.core.models.permission import Permission
from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from apps.core.repositories.role_repository import PermissionRepository, RoleRepository
from common.services.base import BaseService


class RoleService(BaseService):
    """
    Service orchestrating role management workflows, validations, and user assignments.
    """

    def __init__(
        self,
        role_repo: RoleRepository | None = None,
        perm_repo: PermissionRepository | None = None,
    ):
        super().__init__()
        self.role_repo = role_repo or RoleRepository()
        self.perm_repo = perm_repo or PermissionRepository()

    def list_roles(
        self,
        search: str | None = None,
        is_system: bool | None = None,
        is_active: bool | None = None,
    ):
        """
        List roles with calculated user and permission counts and filtering.
        """
        qs = self.role_repo.get_annotated_roles()
        if is_system is not None:
            qs = qs.filter(is_system=is_system)
        if is_active is not None:
            qs = qs.filter(is_active=is_active)
        if search:
            from django.db.models import Q

            qs = qs.filter(
                Q(code__icontains=search)
                | Q(name__icontains=search)
                | Q(description__icontains=search)
            )
        return qs

    def get_role_detail(self, role_id: uuid.UUID | str) -> dict[str, Any]:
        """
        Retrieve comprehensive role details including assigned permissions and counts.
        """
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' does not exist.")

        permissions = self.role_repo.get_role_permissions(role.id)
        user_count = self.role_repo.count_active_users(role.id)

        return {
            "role": role,
            "permissions": permissions,
            "permission_count": permissions.count(),
            "user_count": user_count,
        }

    @transaction.atomic
    def create_role(self, data: dict[str, Any]) -> Role:
        """
        Create a new custom role with optional initial permissions.
        """
        code = data.get("code", "").strip().upper()
        if not code:
            raise ValidationError({"code": "Role code is required."})

        # Check unique code
        if self.role_repo.get_by_code(code):
            raise ValidationError({"code": f"Role with code '{code}' already exists."})

        name = data.get("name", "").strip()
        if not name:
            raise ValidationError({"name": "Role name is required."})

        now = timezone.now()
        role = Role.objects.create(
            code=code,
            name=name,
            description=data.get("description"),
            badge_color=data.get("badge_color", "#2563EB"),
            icon=data.get("icon", "shield"),
            is_system=False,  # Custom roles created via API are never system-locked
            is_active=data.get("is_active", True),
            created_at=now,
            updated_at=now,
        )

        permission_ids = data.get("permission_ids", [])
        if permission_ids:
            self.sync_role_permissions(role.id, permission_ids)

        self.logger.info("Created new custom role: %s (%s)", role.name, role.code)
        return role

    @transaction.atomic
    def update_role(self, role_id: uuid.UUID | str, data: dict[str, Any]) -> Role:
        """
        Update an existing role. Preserves code and core properties of system roles.
        """
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")

        # Check immutable fields for system roles
        if role.is_system and "code" in data and data["code"] != role.code:
            raise PermissionDenied(detail="System role code cannot be modified.")

        # If code is being changed for custom role, check uniqueness
        new_code = data.get("code")
        if new_code and new_code != role.code:
            existing = self.role_repo.get_by_code(new_code)
            if existing and existing.id != role.id:
                raise ValidationError({"code": f"Role with code '{new_code}' already exists."})
            role.code = new_code.strip().upper()

        if "name" in data:
            role.name = data["name"].strip()
        if "description" in data:
            role.description = data["description"]
        if "badge_color" in data:
            role.badge_color = data["badge_color"]
        if "icon" in data:
            role.icon = data["icon"]
        if "is_active" in data:
            role.is_active = data["is_active"]

        role.updated_at = timezone.now()
        role.save()

        # Update permissions if explicitly provided
        if "permission_ids" in data:
            self.sync_role_permissions(role.id, data["permission_ids"])

        self.logger.info("Updated role: %s (%s)", role.name, role.code)
        return role

    @transaction.atomic
    def delete_role(self, role_id: uuid.UUID | str) -> None:
        """
        Delete a role. Prohibits deleting system roles or roles with active user assignments.
        """
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")

        if role.is_system:
            raise PermissionDenied(
                detail="System roles cannot be deleted as they are vital to system integrity."
            )

        active_users_count = self.role_repo.count_active_users(role.id)
        if active_users_count > 0:
            raise ValidationError(
                detail=f"Cannot delete role '{role.name}' because {active_users_count} active user(s) are currently assigned to it. Revoke user assignments first."
            )

        # Clear permissions and delete role
        self.role_repo.sync_permissions(role, [])
        role.delete()
        self.logger.info("Deleted custom role: %s (%s)", role.name, role.code)

    def get_role_permissions(self, role_id: uuid.UUID | str):
        """Fetch all permissions assigned to role."""
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")
        return self.role_repo.get_role_permissions(role.id)

    @transaction.atomic
    def sync_role_permissions(
        self, role_id: uuid.UUID | str, permission_ids: Sequence[uuid.UUID | str]
    ) -> int:
        """
        Synchronize the complete set of permissions assigned to a role.
        """
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")

        # Validate that all permission IDs exist
        valid_perm_ids = set(
            Permission.objects.filter(id__in=permission_ids).values_list("id", flat=True)
        )
        invalid_ids = [
            str(pid) for pid in permission_ids if uuid.UUID(str(pid)) not in valid_perm_ids
        ]
        if invalid_ids:
            raise ValidationError(
                {
                    "permission_ids": f"The following permission IDs are invalid: {', '.join(invalid_ids)}"
                }
            )

        assigned_count = self.role_repo.sync_permissions(role, list(valid_perm_ids))
        self.logger.info("Synchronized %d permissions for role %s", assigned_count, role.code)
        return assigned_count

    @transaction.atomic
    def add_role_permissions(
        self, role_id: uuid.UUID | str, permission_ids: Sequence[uuid.UUID | str]
    ) -> int:
        """Add permissions to an existing role."""
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")
        return self.role_repo.add_permissions(role, permission_ids)

    @transaction.atomic
    def remove_role_permissions(
        self, role_id: uuid.UUID | str, permission_ids: Sequence[uuid.UUID | str]
    ) -> int:
        """Remove specific permissions from a role."""
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")
        return self.role_repo.remove_permissions(role, permission_ids)

    def list_role_users(self, role_id: uuid.UUID | str):
        """Fetch all user assignments for a role."""
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")
        return self.role_repo.get_role_users(role.id)

    @transaction.atomic
    def assign_user_to_role(
        self,
        role_id: uuid.UUID | str,
        user_id: uuid.UUID | str,
        is_primary: bool = False,
        effective_from: date | None = None,
        effective_to: date | None = None,
        status: str = "ACTIVE",
    ) -> UserRole:
        """
        Assign a user to a security role with primary role enforcement.
        """
        role = self.role_repo.get_by_id(str(role_id))
        if not role:
            raise NotFound(detail=f"Role with ID '{role_id}' not found.")

        user = User.objects.filter(id=user_id).first()
        if not user:
            raise NotFound(detail=f"User with ID '{user_id}' not found.")

        from_date = effective_from or timezone.now().date()
        if effective_to and effective_to < from_date:
            raise ValidationError(
                {"effective_to": "Effective to date cannot be earlier than effective from date."}
            )

        # If this is set as primary, unset other primary roles for this user
        if is_primary:
            UserRole.objects.filter(user=user, is_primary=True).update(is_primary=False)

        user_role, created = UserRole.objects.update_or_create(
            user=user,
            role=role,
            defaults={
                "is_primary": is_primary,
                "effective_from": from_date,
                "effective_to": effective_to,
                "status": status,
                "created_at": timezone.now(),
            },
        )

        self.logger.info(
            "Assigned user %s to role %s (primary=%s)", user.username, role.code, is_primary
        )
        return user_role

    @transaction.atomic
    def revoke_user_from_role(self, role_id: uuid.UUID | str, user_id: uuid.UUID | str) -> None:
        """Revoke a user's assignment from a role."""
        user_role = self.role_repo.get_user_role(role_id, user_id)
        if not user_role:
            raise NotFound(detail="User assignment not found for this role.")

        user_role.delete()
        self.logger.info("Revoked user %s from role %s", user_id, role_id)

    def list_all_permissions(self, group_code: str | None = None, search: str | None = None):
        """List atomic permissions with optional group and search filters."""
        return self.perm_repo.get_all_ordered(group_code=group_code, search=search)

    def get_permission_matrix(self) -> dict[str, Any]:
        """
        Generate role-permission matrix data for matrix administrative UI.
        """
        roles = list(self.role_repo.get_annotated_roles())
        permissions = list(self.perm_repo.get_all_ordered())

        # Map role_id -> set of permission_ids
        from apps.core.models.permission import RolePermission

        role_perms = defaultdict(set)
        for rp in RolePermission.objects.all():
            role_perms[str(rp.role_id)].add(str(rp.permission_id))

        # Group permissions by group_code
        groups = defaultdict(list)
        for p in permissions:
            groups[p.group_code].append(
                {
                    "id": str(p.id),
                    "code": p.code,
                    "name": p.name,
                    "description": p.description,
                }
            )

        matrix = {
            "roles": [
                {
                    "id": str(r.id),
                    "code": r.code,
                    "name": r.name,
                    "badge_color": r.badge_color,
                    "is_system": r.is_system,
                    "permission_ids": list(role_perms[str(r.id)]),
                }
                for r in roles
            ],
            "permission_groups": [
                {"group_code": g, "permissions": perms} for g, perms in groups.items()
            ],
        }
        return matrix
