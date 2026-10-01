"""
URL routing configuration for Master Reference Data domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "master"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
