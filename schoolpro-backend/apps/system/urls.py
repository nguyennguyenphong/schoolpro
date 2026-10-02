"""
URL routing configuration for System & Audit domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.system.views.module_views import (
    AdminModuleViewSet,
    AdminRoleModuleViewSet,
    ReorderUserModulesView,
    UserModulePreferenceView,
    UserModulesView,
)

app_name = "system"

router = DefaultRouter()
# Admin Module Full CRUD: /api/v1/system/admin/modules/
router.register(r"admin/modules", AdminModuleViewSet, basename="admin-modules")
# Admin Role-Module Assignments: /api/v1/system/admin/role-modules/
router.register(r"admin/role-modules", AdminRoleModuleViewSet, basename="admin-role-modules")

urlpatterns = [
    # User Dynamic Dashboard Cards & Preferences
    path("modules/", UserModulesView.as_view(), name="user-modules"),
    path("modules/preferences/", UserModulePreferenceView.as_view(), name="user-module-preference"),
    path("modules/reorder/", ReorderUserModulesView.as_view(), name="user-modules-reorder"),
    # Admin CRUD Endpoints
    path("", include(router.urls)),
]
