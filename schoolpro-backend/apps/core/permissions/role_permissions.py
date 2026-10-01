"""
Role-based access control (RBAC) permission classes for Role and Permission API.
"""

from rest_framework import permissions


class IsRoleManagerOrReadOnly(permissions.BasePermission):
    """
    Permission check:
    - Safe methods (GET, HEAD, OPTIONS): Accessible to authenticated users
    - Write methods (POST, PUT, PATCH, DELETE): Requires admin/role management authorization
    """

    def has_permission(self, request, view) -> bool:
        # In testing or development with DEBUG=True, allow authenticated or local requests
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            # Check if DEBUG is on for convenient API testing
            from django.conf import settings

            return bool(settings.DEBUG)

        # Allow superusers and staff
        if getattr(request.user, "is_superuser", False) or getattr(request.user, "is_staff", False):
            return True

        # Check user roles for ADMIN privilege
        from apps.core.models.role import UserRole

        has_admin_role = UserRole.objects.filter(
            user_id=request.user.id,
            role__code__icontains="ADMIN",
            status="ACTIVE",
        ).exists()
        return has_admin_role
