"""
URL routing configuration for Master Reference Data domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.master.views.department_views import DepartmentViewSet

app_name = "master"
router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="department")

urlpatterns = [
    path("", include(router.urls)),
]
