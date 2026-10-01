"""
Permission exports for apps.core.
"""

from .role_permissions import IsRoleManagerOrReadOnly

__all__ = [
    "IsRoleManagerOrReadOnly",
]
