"""
Repository module exports for apps.core.
"""

from .role_repository import PermissionRepository, RoleRepository

__all__ = [
    "RoleRepository",
    "PermissionRepository",
]
