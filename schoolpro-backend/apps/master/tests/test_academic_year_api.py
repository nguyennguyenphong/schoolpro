from unittest.mock import MagicMock, patch

from rest_framework import status
from rest_framework.test import APIRequestFactory

from apps.master.models.academic_year import AcademicYear
from apps.master.repositories.academic_year_repository import AcademicYearRepository
from apps.master.services.academic_year_service import AcademicYearService
from apps.master.views.academic_year_views import AcademicYearViewSet


def test_academic_year_repository_filter_and_current():
    repo = AcademicYearRepository()
    mock_qs = MagicMock()
    mock_qs.select_related.return_value = mock_qs
    mock_qs.all.return_value = mock_qs
    mock_qs.filter.return_value = mock_qs
    mock_qs.order_by.return_value = mock_qs
    mock_qs.first.return_value = None

    with patch.object(AcademicYear.objects, "select_related", return_value=mock_qs):
        # Test get_academic_years_list
        res = repo.get_academic_years_list(
            school_id="11111111-1111-1111-1111-111111111111",
            is_current=True,
            is_locked=False,
            search_query="2026",
        )
        assert res == mock_qs
        assert mock_qs.filter.called

        # Test get_current_academic_year
        res_current = repo.get_current_academic_year(
            school_id="11111111-1111-1111-1111-111111111111"
        )
        assert res_current is None


def test_academic_year_service_methods():
    mock_repo = MagicMock(spec=AcademicYearRepository)
    mock_repo.get_academic_years_list.return_value = []
    mock_repo.get_current_academic_year.return_value = None
    mock_repo.get_academic_year_detail.return_value = None

    service = AcademicYearService(repository=mock_repo)

    # 1. list_academic_years alias
    res = service.list_academic_years(search="2026")
    assert res == []
    mock_repo.get_academic_years_list.assert_called_with(
        school_id=None,
        is_current=None,
        is_locked=None,
        search_query="2026",
    )

    # 2. get_current_academic_year
    current_ay = service.get_current_academic_year(school_id="school-123")
    assert current_ay is None
    mock_repo.get_current_academic_year.assert_called_with(school_id="school-123")

    # 3. get_academic_year_detail
    detail = service.get_academic_year_detail("AY_20262027", raise_exception=False)
    assert detail is None


def test_academic_year_viewset_list():
    factory = APIRequestFactory()
    request = factory.get("/api/v1/master/academic-years/")

    view = AcademicYearViewSet.as_view({"get": "list"})

    with patch("apps.master.views.academic_year_views.AcademicYearService") as mock_service_cls:
        mock_instance = MagicMock()
        mock_instance.list_academic_years.return_value = []
        mock_service_cls.return_value = mock_instance

        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"] == []


def test_academic_year_viewset_current():
    factory = APIRequestFactory()
    request = factory.get("/api/v1/master/academic-years/current/")

    view = AcademicYearViewSet.as_view({"get": "current"})

    with patch("apps.master.views.academic_year_views.AcademicYearService") as mock_service_cls:
        mock_instance = MagicMock()
        # Mock not found
        mock_instance.get_current_academic_year.return_value = None
        mock_service_cls.return_value = mock_instance

        response = view(request)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["success"] is False
