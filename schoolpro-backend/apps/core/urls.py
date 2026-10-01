"""
URL routing configuration for Core Organization & Identity domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.core.views.role_views import PermissionViewSet, RoleViewSet

app_name = "core"
router = DefaultRouter()
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"permissions", PermissionViewSet, basename="permission")

urlpatterns = [
    path("", include(router.urls)),
]
