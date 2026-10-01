"""
URL routing configuration for Core Organization & Identity domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "core"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
