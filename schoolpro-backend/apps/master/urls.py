"""
URL routing configuration for Master Reference Data domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.master.views.academic_year_views import AcademicYearViewSet
from apps.master.views.department_views import DepartmentViewSet
from apps.master.views.semester_views import SemesterViewSet
from apps.master.views.subject_views import SubjectViewSet

app_name = "master"
router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"academic-years", AcademicYearViewSet, basename="academic-year")
router.register(r"semesters", SemesterViewSet, basename="semester")
router.register(r"subjects", SubjectViewSet, basename="subject")

urlpatterns = [
    path("", include(router.urls)),
]
