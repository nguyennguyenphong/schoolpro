"""
URL configuration for SchoolPro backend.

Root URL routing defining:
- Admin site
- OpenAPI 3 Schema & Swagger / ReDoc docs
- JWT Authentication endpoints
- Domain-driven API v1 routes
- System Healthcheck endpoint
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)


def health_check(request):
    """
    Lightweight health check endpoint for container orchestrators and reverse proxies.
    """
    return JsonResponse(
        {
            "status": "healthy",
            "service": "schoolpro-backend",
            "version": "1.0.0",
        }
    )


urlpatterns = [
    # Administration
    path("admin/", admin.site.urls),
    # System Healthcheck
    path("health/", health_check, name="health-check"),
    path("api/health/", health_check, name="api-health-check"),
    # API Schema & Documentation (OpenAPI 3 / Swagger)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # JWT Authentication Endpoints
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path(
        "api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"
    ),
    path("api/v1/auth/token/verify/", TokenVerifyView.as_view(), name="token-verify"),
    # Domain APIs (v1)
    path("api/v1/core/", include("apps.core.urls", namespace="core")),
    path("api/v1/master/", include("apps.master.urls", namespace="master")),
    path("api/v1/academic/", include("apps.academic.urls", namespace="academic")),
    path("api/v1/emulation/", include("apps.emulation.urls", namespace="emulation")),
    path("api/v1/evaluation/", include("apps.evaluation.urls", namespace="evaluation")),
    path(
        "api/v1/notification/",
        include("apps.notification.urls", namespace="notification"),
    ),
    path("api/v1/system/", include("apps.system.urls", namespace="system")),
]
