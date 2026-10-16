from unittest.mock import MagicMock, patch

from rest_framework import status
from rest_framework.test import APIRequestFactory

from apps.master.models.semester import Semester
from apps.master.repositories.semester_repository import SemesterRepository
from apps.master.services.semester_service import SemesterService
from apps.master.views.semester_views import SemesterViewSet


def test_semester_repository_filter_and_current():
    repo = SemesterRepository()
    mock_qs = MagicMock()
    mock_qs.select_related.return_value = mock_qs
    mock_qs.all.return_value = mock_qs
    mock_qs.filter.return_value = mock_qs
    mock_qs.order_by.return_value = mock_qs
    mock_qs.first.return_value = None

    with patch.object(Semester.objects, "select_related", return_value=mock_qs):
        # Test get_semesters_list
        res = repo.get_semesters_list(
            school_id="11111111-1111-1111-1111-111111111111",
            academic_year_id="22222222-2222-2222-2222-222222222222",
            order_no=1,
            is_current=True,
            is_locked=False,
            search_query="Học kỳ 1",
        )
        assert res == mock_qs
        assert mock_qs.filter.called

        # Test get_current_semester
        res_current = repo.get_current_semester(
            school_id="11111111-1111-1111-1111-111111111111",
            academic_year_id="22222222-2222-2222-2222-222222222222",
        )
        assert res_current is None


def test_semester_service_methods():
    mock_repo = MagicMock(spec=SemesterRepository)
    mock_repo.get_semesters_list.return_value = []
    mock_repo.get_current_semester.return_value = None
    mock_repo.get_semester_detail.return_value = None

    service = SemesterService(repository=mock_repo)

    # 1. list_semesters alias
    res = service.list_semesters(search="Học kỳ")
    assert res == []
    mock_repo.get_semesters_list.assert_called_with(
        school_id=None,
        academic_year_id=None,
        order_no=None,
        is_current=None,
        is_locked=None,
        search_query="Học kỳ",
    )

    # 2. get_current_semester
    current_sem = service.get_current_semester(school_id="school-123", academic_year_id="ay-123")
    assert current_sem is None
    mock_repo.get_current_semester.assert_called_with(
        school_id="school-123", academic_year_id="ay-123"
    )

    # 3. get_semester_detail
    detail = service.get_semester_detail("SEM_20262027_1", raise_exception=False)
    assert detail is None


def test_semester_viewset_list():
    factory = APIRequestFactory()
    request = factory.get("/api/v1/master/semesters/")

    view = SemesterViewSet.as_view({"get": "list"})

    with patch("apps.master.views.semester_views.SemesterService") as mock_service_cls:
        mock_instance = MagicMock()
        mock_instance.list_semesters.return_value = []
        mock_service_cls.return_value = mock_instance

        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"] == []


def test_semester_viewset_current():
    factory = APIRequestFactory()
    request = factory.get("/api/v1/master/semesters/current/")

    view = SemesterViewSet.as_view({"get": "current"})

    with patch("apps.master.views.semester_views.SemesterService") as mock_service_cls:
        mock_instance = MagicMock()
        mock_instance.get_current_semester.return_value = None
        mock_service_cls.return_value = mock_instance

        response = view(request)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["success"] is False
