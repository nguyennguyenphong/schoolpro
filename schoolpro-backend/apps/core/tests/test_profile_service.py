"""
Unit tests for Student Profile Service and StudentProfileView.
"""

from unittest.mock import MagicMock

from rest_framework.test import APIRequestFactory, force_authenticate

from apps.core.models.user import User
from apps.core.services.profile_service import StudentProfileService
from apps.core.views.profile_views import StudentProfileView


class TestStudentProfile:
    def test_get_student_profile_structure(self):
        user = MagicMock(spec=User)
        user.id = "user-test-01"
        user.username = "hocsinh_01"
        user.full_name = "Đỗ Minh Quân"
        user.email = "hocsinh_01@schoolpro.edu.vn"
        user.phone = "0912345810"
        user.address = "Số 75 Hoàng Mai, Hà Nội"
        user.avatar_url = ""
        user.date_of_birth = None
        user.gender_code = "MALE"
        user.national_id = "566251446151"
        user.bio = "Học sinh chuyên Toán"
        user.is_staff = True

        data = StudentProfileService.get_student_profile(user)
        assert "personalInfo" in data
        assert "academicInfo" in data
        assert "healthRecord" in data
        assert "guardians" in data
        assert "completionPercentage" in data
        assert data["completionPercentage"] > 0

        p = data["personalInfo"]
        assert "studentCode" in p
        assert "fullName" in p
        assert "email" in p
        assert "phone" in p

        a = data["academicInfo"]
        assert "className" in a
        assert "homeroomTeacher" in a
        assert "semester" in a
        assert "schoolName" in a
        assert "academicYear" in a
        assert "THPT" not in a["schoolName"]

        h = data["healthRecord"]
        assert "heightCm" in h
        assert "weightKg" in h
        assert "bloodType" in h

    def test_view_get_profile_returns_200(self):
        factory = APIRequestFactory()
        request = factory.get("/api/v1/core/profile/")
        user = MagicMock(spec=User)
        user.is_authenticated = True
        user.is_staff = True
        user.username = "hocsinh_01"
        user.full_name = "Đỗ Minh Quân"
        user.email = "hocsinh_01@schoolpro.edu.vn"
        user.phone = "0912345810"
        user.address = "Hà Nội"
        user.avatar_url = ""
        user.date_of_birth = None
        user.gender_code = "MALE"
        user.national_id = "079208001010"
        user.bio = ""
        force_authenticate(request, user=user)

        view = StudentProfileView.as_view()
        response = view(request)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert "data" in response.data
        assert "personalInfo" in response.data["data"]

    def test_view_put_profile_validates_and_updates(self):
        factory = APIRequestFactory()
        payload = {
            "phone": "0987654321",
            "email": "updated_student@schoolpro.edu.vn",
            "address": "Số 100 Cầu Giấy, Hà Nội",
            "permanentAddress": "Số 100 Cầu Giấy, Hà Nội",
            "birthPlace": "Hà Nội",
            "ethnicity": "Kinh",
            "religion": "Không",
            "heightCm": 175.5,
            "weightKg": 65.0,
            "healthNotes": "Sức khỏe tốt",
        }
        request = factory.put("/api/v1/core/profile/", payload, format="json")
        user = MagicMock(spec=User)
        user.is_authenticated = True
        user.is_staff = True
        user.username = "hocsinh_01"
        user.full_name = "Đỗ Minh Quân"
        user.email = "hocsinh_01@schoolpro.edu.vn"
        user.phone = "0912345810"
        user.address = "Hà Nội"
        user.avatar_url = ""
        user.date_of_birth = None
        user.gender_code = "MALE"
        user.national_id = "079208001010"
        user.bio = ""
        force_authenticate(request, user=user)

        view = StudentProfileView.as_view()
        response = view(request)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert "data" in response.data
