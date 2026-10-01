"""
URL routing configuration for System & Audit domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "system"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
