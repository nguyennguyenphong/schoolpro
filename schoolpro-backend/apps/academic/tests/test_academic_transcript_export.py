"""
Unit tests for Academic Transcript Export and Print Service integrating with sys.export_templates.
"""

from unittest.mock import MagicMock

import pytest

from apps.academic.services.academic_transcript_pdf_service import (
    AcademicTranscriptPdfService,
)
from apps.system.models.export_template import TemplateType


@pytest.fixture
def mock_student_user():
    user = MagicMock()
    user.id = "std-user-test-01"
    user.full_name = "Nguyễn Minh Quang"
    user.student_code = "HS10A101"
    user.school_id = "school-001"
    user.is_authenticated = True
    return user


def test_academic_transcript_resolve_export_template():
    """
    Verifies that resolve_export_template returns a valid ExportTemplate with A4 Landscape.
    """
    template = AcademicTranscriptPdfService.resolve_export_template()
    assert template is not None
    assert template.code == "ACADEMIC_TRANSCRIPT_A4_LANDSCAPE"
    assert template.template_type == TemplateType.ACADEMIC
    assert template.page_orientation == "LANDSCAPE"
    assert template.page_size == "A4"


def test_academic_transcript_build_score_table_rows_html():
    """
    Verifies that score table rows are correctly formatted into 11 columns per row.
    """
    sample_subjects = [
        {
            "name": "Toán học",
            "regularScores": [{"score": 8.5}, {"score": 9.0}],
            "midtermScore": {"score": 8.5},
            "finalScore": {"score": 9.0},
            "averageScore": 8.8,
            "gradeLevel": "excellent",
            "teacherComment": "Tư duy toán học xuất sắc.",
        },
        {
            "name": "Giáo dục Thể chất",
            "evaluationType": "feedback",
            "feedbackResult": "pass",
            "teacherComment": "Đạt yêu cầu.",
        },
    ]

    rows_html = AcademicTranscriptPdfService.build_score_table_rows_html(sample_subjects)
    assert 'class="subject">Toán học</td>' in rows_html
    assert "<td>8.5</td>" in rows_html
    assert "<td>9.0</td>" in rows_html
    assert "<td>8.8</td>" in rows_html
    assert "Giỏi" in rows_html
    assert "Tư duy toán học xuất sắc." in rows_html
    assert 'class="subject">Giáo dục Thể chất</td>' in rows_html
    assert "Đạt" in rows_html


def test_academic_transcript_render_html(mock_student_user):
    """
    Verifies that render_academic_transcript_html returns a complete HTML document with dynamic filename.
    """
    rendered = AcademicTranscriptPdfService.render_academic_transcript_html(
        user=mock_student_user,
        semester="Học kỳ 1",
        academic_year="2025 - 2026",
    )
    assert "html" in rendered
    assert "<!DOCTYPE html>" in rendered["html"]
    assert "BẢNG ĐIỂM KẾT QUẢ HỌC TẬP" in rendered["html"]
    assert "Nguyễn" in rendered["html"]
    assert rendered["template"]["page_orientation"] == "LANDSCAPE"
    assert "filename" in rendered
    assert rendered["filename"].startswith("Bang_Diem_")
