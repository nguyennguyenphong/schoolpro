"""
URL routing configuration for Academic Affairs domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.academic.views.assignment_views import StudentAssignmentViewSet
from apps.academic.views.timetable_views import TimetableStudentViewSet

app_name = "academic"
router = DefaultRouter()
router.register(r"timetable", TimetableStudentViewSet, basename="timetable")
router.register(r"assignments", StudentAssignmentViewSet, basename="assignment")

urlpatterns = [
    path("", include(router.urls)),
]
