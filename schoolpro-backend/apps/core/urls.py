"""
URL routing configuration for Core Organization & Identity domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.core.views.auth_views import (
    AuthLoginView,
    AuthLogoutView,
    AuthMeView,
    AuthTokenRefreshView,
)
from apps.core.views.profile_views import StudentProfileView
from apps.core.views.role_views import PermissionViewSet, RoleViewSet

app_name = "core"
router = DefaultRouter()
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"permissions", PermissionViewSet, basename="permission")

urlpatterns = [
    # Authentication endpoints
    path("auth/login/", AuthLoginView.as_view(), name="auth-login"),
    path("auth/me/", AuthMeView.as_view(), name="auth-me"),
    path("auth/logout/", AuthLogoutView.as_view(), name="auth-logout"),
    path("auth/refresh/", AuthTokenRefreshView.as_view(), name="auth-refresh"),
    # Student Profile endpoints
    path("profile/", StudentProfileView.as_view(), name="student-profile"),
    path("students/profile/", StudentProfileView.as_view(), name="student-profile-alias"),
    # Role & Permission viewsets
    path("", include(router.urls)),
]
