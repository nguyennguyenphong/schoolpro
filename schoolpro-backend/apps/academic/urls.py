"""
URL routing configuration for Academic Affairs domain.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "academic"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
