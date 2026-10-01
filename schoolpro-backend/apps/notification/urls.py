"""
URL routing configuration for Notification domain.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "notification"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
