"""
Unit tests for ModuleService and dynamic role card resolution.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest

from apps.system.services.module_service import ModuleService


@pytest.mark.django_db
class TestModuleService:
    """Test suite for ModuleService business logic."""

    @pytest.fixture
    def mock_user(self):
        user = MagicMock()
        user.id = uuid.uuid4()
        user.username = "nam.nguyen"
        user.active_role_code = "STUDENT"
        return user

    @patch("apps.system.services.module_service.connection")
    def test_get_modules_for_user_via_view(self, mock_conn, mock_user):
        """Test retrieving dashboard cards when database view returns rows."""
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        sample_module_id = uuid.uuid4()
        mock_cursor.fetchall.return_value = [
            (
                sample_module_id,
                "MOD_STT_839201",
                "Thời khóa biểu 360",
                "Tra cứu lịch học tuần",
                "calendar",
                "/student/timetable",
                "CARD",
                "ACADEMIC",
                False,
                True,
                1,
                "Hôm nay",
                {
                    "id": "feat-timetable",
                    "translationKey": "timetable",
                    "iconName": "calendar",
                    "iconBgColor": "bg-emerald-50 border border-emerald-200",
                    "iconColor": "text-emerald-600",
                    "badgeColor": "green",
                },
            )
        ]

        service = ModuleService()
        with patch.object(service, "_resolve_target_role") as mock_resolve:
            mock_role = MagicMock()
            mock_role.code = "STUDENT"
            mock_resolve.return_value = mock_role

            cards = service.get_modules_for_user(mock_user)

            assert len(cards) == 1
            card = cards[0]
            assert card["module_code"] == "MOD_STT_839201"
            assert card["module_name"] == "Thời khóa biểu 360"
            assert card["route"] == "/student/timetable"
            assert card["icon_name"] == "calendar"
            assert card["is_pinned"] is True
            assert card["display_order"] == 1
            assert card["translation_key"] == "timetable"
            assert card["icon_color"] == "text-emerald-600"

    def test_admin_create_and_delete_module_mock(self):
        """Test admin CRUD methods on ModuleService."""
        service = ModuleService()
        sample_mod = MagicMock()
        sample_mod.id = uuid.uuid4()
        sample_mod.code = "MOD_TEST_001"

        with patch.object(
            service.module_repo, "create_module", return_value=sample_mod
        ) as mock_create:
            created = service.create_module(code="MOD_TEST_001", name="Test Module")
            assert created.code == "MOD_TEST_001"
            mock_create.assert_called_once()

        with (
            patch.object(service, "get_module_by_id", return_value=sample_mod),
            patch.object(service.module_repo, "delete_module") as mock_del,
        ):
            service.delete_module(sample_mod.id)
            mock_del.assert_called_once_with(sample_mod)
