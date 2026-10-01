"""
URL routing configuration for Evaluation & Grading domain.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

app_name = "evaluation"
router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
]
