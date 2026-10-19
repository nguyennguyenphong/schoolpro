"""
REST API View for Student Profile Management.
Follows Clean Architecture and Enterprise API Design.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.views import APIView

from apps.core.authentication import SchoolProJWTAuthentication
from apps.core.serializers.profile_serializers import (
    StudentProfileResponseSerializer,
    StudentProfileUpdateSerializer,
)
from apps.core.services.profile_service import StudentProfileService
from common.responses.response import APIResponse


class StudentProfileView(APIView):
    """
    Endpoint for fetching and updating the authenticated student's full profile dossier.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Student Profile",
        description="Retrieve full educational dossier (personal, academic, health, guardians) for the authenticated student.",
        responses={200: StudentProfileResponseSerializer},
    )
    def get(self, request):
        """
        Retrieve student profile.
        """
        data = StudentProfileService.get_student_profile(request.user)
        return APIResponse.success(
            data=data,
            message="Thông tin hồ sơ học sinh",
            code=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Update Student Profile",
        description="Update editable student profile fields across personal, contact, residence, and health records.",
        request=StudentProfileUpdateSerializer,
        responses={200: StudentProfileResponseSerializer},
    )
    def put(self, request):
        """
        Full or partial update of student profile.
        """
        serializer = StudentProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        data = StudentProfileService.update_student_profile(
            user=request.user,
            data=serializer.validated_data,
        )
        return APIResponse.success(
            data=data,
            message="Cập nhật hồ sơ học sinh thành công",
            code=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Partial Update Student Profile",
        description="Partially update student profile fields.",
        request=StudentProfileUpdateSerializer,
        responses={200: StudentProfileResponseSerializer},
    )
    def patch(self, request):
        """
        Partial update alias.
        """
        return self.put(request)
