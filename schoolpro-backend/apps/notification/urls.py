"""
URL routing configuration for Notification domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.notification.views.announcement_views import AnnouncementViewSet

app_name = "notification"

router = DefaultRouter()
router.register(r"announcements", AnnouncementViewSet, basename="announcement")

urlpatterns = [
    path("", include(router.urls)),
]
