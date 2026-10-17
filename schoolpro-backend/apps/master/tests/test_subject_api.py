from unittest.mock import MagicMock, patch

from rest_framework import status
from rest_framework.test import APIRequestFactory

from apps.master.models.subject import Subject
from apps.master.repositories.subject_repository import SubjectRepository
from apps.master.services.subject_service import SubjectService
from apps.master.views.subject_views import SubjectViewSet
from common.exceptions import ResourceNotFoundError


def test_subject_repository_filter_and_search():
    repo = SubjectRepository()
    mock_qs = MagicMock()
    mock_qs.select_related.return_value = mock_qs
    mock_qs.all.return_value = mock_qs
    mock_qs.filter.return_value = mock_qs
    mock_qs.order_by.return_value = mock_qs
    mock_qs.first.return_value = None

    with patch.object(Subject.objects, "select_related", return_value=mock_qs):
        res = repo.get_subjects_list(
            school_id="11111111-1111-1111-1111-111111111111",
            department_id="22222222-2222-2222-2222-222222222222",
            grade_level=11,
            evaluation_type="SCORE",
            is_compulsory=True,
            is_active=True,
            search_query="Toán",
        )
        assert res == mock_qs
        assert mock_qs.filter.called


def test_subject_service_methods():
    mock_repo = MagicMock(spec=SubjectRepository)
    mock_repo.get_subjects_list.return_value = []
    mock_repo.get_subject_detail.return_value = None

    service = SubjectService(repository=mock_repo)

    # 1. get_subjects
    res_get = service.get_subjects(search="Toán")
    assert res_get == []
    mock_repo.get_subjects_list.assert_called_with(
        school_id=None,
        department_id=None,
        grade_level=None,
        evaluation_type=None,
        is_compulsory=None,
        is_active=None,
        search_query="Toán",
    )

    # 2. list_subjects alias
    res_list = service.list_subjects(search="Toán")
    assert res_list == []


def test_subject_viewset_list():
    factory = APIRequestFactory()
    request = factory.get("/api/v1/master/subjects/?pageSize=100&is_active=true")

    view = SubjectViewSet.as_view({"get": "list"})

    with patch("apps.master.views.subject_views.SubjectService") as mock_service_cls:
        mock_instance = MagicMock()
        mock_instance.list_subjects.return_value = []
        mock_service_cls.return_value = mock_instance

        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"] == []


def test_subject_viewset_retrieve_not_found():
    factory = APIRequestFactory()
    request = factory.get("/api/v1/master/subjects/invalid-id/")

    view = SubjectViewSet.as_view({"get": "retrieve"})

    with patch("apps.master.views.subject_views.SubjectService") as mock_service_cls:
        mock_instance = MagicMock()
        mock_instance.get_subject_detail.side_effect = ResourceNotFoundError(
            "Không tìm thấy môn học."
        )
        mock_service_cls.return_value = mock_instance

        response = view(request, pk="invalid-id")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["success"] is False
