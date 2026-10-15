"""
URL routing configuration for Academic Affairs domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.academic.views.assignment_views import StudentAssignmentViewSet
from apps.academic.views.attendance_views import (
    AttendanceLogViewSet,
    AttendanceViewSet,
    LeaveRequestViewSet,
)
from apps.academic.views.exam_log_views import ExamEventLogViewSet
from apps.academic.views.exam_views import StudentExamViewSet
from apps.academic.views.timetable_views import TimetableStudentViewSet

app_name = "academic"
router = DefaultRouter()
router.register(r"timetable", TimetableStudentViewSet, basename="timetable")
router.register(r"assignments", StudentAssignmentViewSet, basename="assignment")
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"attendance-logs", AttendanceLogViewSet, basename="attendance-log")
router.register(r"leave-requests", LeaveRequestViewSet, basename="leave-request")
router.register(r"exam-logs", ExamEventLogViewSet, basename="exam-log")
router.register(r"exams", StudentExamViewSet, basename="exam")

urlpatterns = [
    path("", include(router.urls)),
]
