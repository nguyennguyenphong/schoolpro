"""
Role-based access control (RBAC) permissions for SchoolPro APIs.
"""

from rest_framework.permissions import BasePermission

from apps.core.models.role import UserRole


class IsAdminUserOrSchoolAdmin(BasePermission):
    """
    Allows access only to authenticated users with Admin or Principal role,
    or Django superuser / staff.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Django superuser / staff fallback
        if getattr(request.user, "is_superuser", False) or getattr(request.user, "is_staff", False):
            return True

        # Check active session role
        active_role_code = (getattr(request.user, "active_role_code", "") or "").upper()
        if any(keyword in active_role_code for keyword in ["ADMIN", "PRIN", "PRINCIPAL", "SUPER"]):
            return True

        # Check in user_roles table
        return UserRole.objects.filter(
            user=request.user,
            role__code__iregex=r"(ADMIN|PRIN|SUPER)",
            status="ACTIVE",
        ).exists()
