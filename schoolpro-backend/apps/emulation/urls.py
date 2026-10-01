"""
URL routing configuration for Emulation & Discipline domain.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "emulation"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
