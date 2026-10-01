"""
View layer exports for apps.core.
"""

from .role_views import PermissionViewSet, RoleViewSet

__all__ = [
    "RoleViewSet",
    "PermissionViewSet",
]
