"""
Unit tests for ExportTemplate Model, Service, and Repository.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest

from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_ANNOUNCEMENT_CODE,
    ExportTemplateService,
)
from common.exceptions import ResourceNotFoundError


class TestExportTemplateModel:
    """Test suite for ExportTemplate model helper methods and properties."""

    def test_render_html_with_placeholders(self):
        """Test render_html replaces placeholders correctly."""
        template = ExportTemplate(
            code="TEST_CODE",
            name="Test Template",
            template_type=TemplateType.ANNOUNCEMENT,
            file_format=FileFormat.HTML_PRINT,
            header_content="<header><h1>{{ school_name }}</h1></header>",
            content="<main><p>Kính gửi: {{ recipient }}</p><p>Nội dung: {{ notice_body }}</p></main>",
            footer_content="<footer><p>Người lập: {{ author }}</p></footer>",
            style_content="body { font-family: 'Times New Roman'; }",
        )

        rendered = template.render_html(
            {
                "school_name": "Trường THPT Chuyên SchoolPro",
                "recipient": "Phụ huynh học sinh",
                "notice_body": "Thông báo họp phụ huynh đầu năm học.",
                "author": "Ban Giám Hiệu",
            }
        )

        assert "body { font-family: 'Times New Roman'; }" in rendered
        assert "Trường THPT Chuyên SchoolPro" in rendered
        assert "Kính gửi: Phụ huynh học sinh" in rendered
        assert "Nội dung: Thông báo họp phụ huynh đầu năm học." in rendered
        assert "Người lập: Ban Giám Hiệu" in rendered

    def test_render_html_handles_missing_tags(self):
        """Test render_html gracefully leaves or clears missing tags."""
        template = ExportTemplate(content="<p>Chào {{ name }}, điểm của bạn là {{ score }}.</p>")
        rendered = template.render_html({"name": "Nguyễn Văn A"})
        assert "Nguyễn Văn A" in rendered
        assert "{{ score }}" not in rendered


class TestExportTemplateService:
    """Test suite for ExportTemplateService business logic."""

    @pytest.fixture
    def mock_user(self):
        user = MagicMock()
        user.id = uuid.uuid4()
        user.school_id = uuid.uuid4()
        user.department_id = None
        user.full_name = "Quản trị viên"
        return user

    def test_get_or_create_default_announcement_template_creates_new(self):
        """Test that default announcement template is seeded if not existing."""
        service = ExportTemplateService()
        school_id = uuid.uuid4()

        mock_created_template = MagicMock(spec=ExportTemplate)
        mock_created_template.id = uuid.uuid4()
        mock_created_template.code = DEFAULT_ANNOUNCEMENT_CODE
        mock_created_template.template_type = TemplateType.ANNOUNCEMENT
        mock_created_template.school_id = school_id
        mock_created_template.is_default = True

        with (
            patch.object(service.repository, "get_active_by_code", return_value=None),
            patch(
                "apps.system.models.export_template.ExportTemplate.objects.create",
                return_value=mock_created_template,
            ) as mock_create,
        ):
            template = service.get_or_create_default_announcement_template(school_id=school_id)
            assert template is not None
            assert template.code == DEFAULT_ANNOUNCEMENT_CODE
            mock_create.assert_called_once()

    def test_get_or_create_default_announcement_template_returns_existing(self):
        """Test returning existing default template if already present."""
        service = ExportTemplateService()
        school_id = uuid.uuid4()

        mock_existing = MagicMock(spec=ExportTemplate)
        mock_existing.code = DEFAULT_ANNOUNCEMENT_CODE

        with patch.object(service.repository, "get_active_by_code", return_value=mock_existing):
            template = service.get_or_create_default_announcement_template(school_id=school_id)
            assert template == mock_existing

    def test_create_and_update_template(self, mock_user):
        """Test creating and modifying a custom export template."""
        service = ExportTemplateService()
        unique_code = f"CUSTOM_ANN_{uuid.uuid4().hex[:8].upper()}"

        mock_instance = MagicMock(spec=ExportTemplate)
        mock_instance.id = uuid.uuid4()
        mock_instance.code = unique_code
        mock_instance.name = "Biểu mẫu thông báo tuỳ biến"
        mock_instance.is_default = False
        mock_instance.save = MagicMock()

        with (
            patch("django.db.transaction.atomic"),
            patch.object(service.repository, "clear_other_defaults"),
            patch(
                "apps.system.models.export_template.ExportTemplate.objects.create",
                return_value=mock_instance,
            ),
        ):
            created = service.create_template(
                user=mock_user,
                validated_data={
                    "code": unique_code,
                    "name": "Biểu mẫu thông báo tuỳ biến",
                    "template_type": TemplateType.ANNOUNCEMENT,
                    "file_format": FileFormat.HTML_PRINT,
                    "content": "<div>Thông báo: {{ message }}</div>",
                    "is_default": False,
                },
            )
            assert created.id == mock_instance.id
            assert created.code == unique_code

        with (
            patch("django.db.transaction.atomic"),
            patch.object(service.repository, "get_by_id", return_value=mock_instance),
        ):
            updated = service.update_template(
                template_id=mock_instance.id,
                user=mock_user,
                validated_data={"name": "Biểu mẫu đã đổi tên"},
            )
            assert updated.name == "Biểu mẫu đã đổi tên"
            mock_instance.save.assert_called()

    def test_render_template_service_call(self):
        """Test rendering via service method delegates to template.render_html."""
        service = ExportTemplateService()
        template_id = uuid.uuid4()

        mock_template = MagicMock(spec=ExportTemplate)
        mock_template.id = template_id
        mock_template.code = "ANNOUNCEMENT_OFFICIAL_A4"
        mock_template.name = "Mẫu chuẩn A4"
        mock_template.is_active = True
        mock_template.render_html.return_value = "<html><body>Thông báo học kỳ</body></html>"

        with patch.object(service.repository, "get_by_id", return_value=mock_template):
            result = service.render_template(
                template_id=template_id,
                context_data={"title": "Thông báo học kỳ"},
            )
            assert "Thông báo học kỳ" in result["html"]
            assert result["template_code"] == "ANNOUNCEMENT_OFFICIAL_A4"
            mock_template.render_html.assert_called_once_with({"title": "Thông báo học kỳ"})

    def test_render_template_not_found_raises(self):
        """Test render_template with non-existent ID raises ResourceNotFoundError."""
        service = ExportTemplateService()
        with (
            patch.object(service.repository, "get_by_id", return_value=None),
            pytest.raises(ResourceNotFoundError),
        ):
            service.render_template(template_id=uuid.uuid4(), context_data={})

    def test_delete_template(self, mock_user):
        """Test soft deleting an export template."""
        service = ExportTemplateService()
        mock_template = MagicMock(spec=ExportTemplate)
        mock_template.id = uuid.uuid4()
        mock_template.is_default = False
        mock_template.delete = MagicMock()

        with patch.object(service.repository, "get_by_id", return_value=mock_template):
            service.delete_template(mock_template.id, user=mock_user)
            mock_template.delete.assert_called_once()
