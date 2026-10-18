"""
Unit tests for Timetable Export & Print Service integrating with sys.export_templates.
"""

from unittest.mock import MagicMock

import pytest

from apps.academic.services.timetable_pdf_service import TimetablePdfService
from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType


@pytest.fixture
def mock_student_user():
    user = MagicMock()
    user.id = "user-std-001"
    user.full_name = "Nguyễn Văn An"
    user.student_code = "HS10A101"
    user.school_id = "school-001"
    return user


@pytest.fixture
def sample_schedule_context():
    return {
        "slots": [
            {
                "id": "slot-01",
                "courseCode": "MATH10",
                "courseName": "Toán học 10",
                "className": "10A1",
                "dayOfWeek": 1,
                "periods": "Tiết 1",
                "startTime": "07:15",
                "endTime": "08:00",
                "shift": "morning",
                "room": "Phòng A203",
                "instructorName": "Thầy Hoàng Văn Nam",
                "isOnLeave": False,
                "attendanceStatus": "present",
            },
            {
                "id": "slot-02",
                "courseCode": "PHY10",
                "courseName": "Vật lý 10",
                "className": "10A1",
                "dayOfWeek": 2,
                "periods": "Tiết 2",
                "startTime": "08:05",
                "endTime": "08:50",
                "shift": "morning",
                "room": "Phòng B102",
                "instructorName": "Cô Trần Thị Mai",
                "isOnLeave": True,
                "attendanceStatus": "excused",
                "leaveReason": "Nghỉ ốm có phép",
            },
        ],
        "meta": {
            "academicYear": {"name": "2026 - 2027"},
            "semester": {"name": "Học kỳ 1"},
            "selectedWeek": {
                "startDate": "2026-10-12",
                "endDate": "2026-10-18",
                "selectedDate": "2026-10-14",
            },
        },
    }


def test_timetable_resolve_export_template():
    """
    Verifies that resolve_export_template returns a valid ExportTemplate with A4 Landscape.
    """
    template = TimetablePdfService.resolve_export_template()
    assert template is not None
    assert template.code == "TIMETABLE_WEEKLY_A4_LANDSCAPE"
    assert template.template_type == TemplateType.ACADEMIC
    assert template.page_orientation == "LANDSCAPE"
    assert template.page_size == "A4"


def test_timetable_build_template_context(mock_student_user, sample_schedule_context):
    """
    Verifies that build_template_context populates student, class, semester, and HTML table.
    """
    context = TimetablePdfService.build_template_context(sample_schedule_context, mock_student_user)
    assert context["student_name"] == "Nguyễn Văn An"
    assert context["student_code"] == "HS10A101"
    assert context["created_by_name"] == "Nguyễn Văn An"
    assert context["class_name"] == "10A1"
    assert context["academic_year"] == "2026 - 2027"
    assert context["semester_name"] == "Học kỳ 1"
    assert "Toán học 10" in context["timetable_table_html"]
    assert "Vật lý 10" in context["timetable_table_html"]
    assert "Nghỉ phép" in context["timetable_table_html"]
    assert "Email:" not in context["timetable_table_html"]
    assert "font-style: italic;" in context["timetable_table_html"]


def test_timetable_render_html(mock_student_user, sample_schedule_context):
    """
    Verifies that render_timetable_html generates a complete HTML document with CSS and dynamic filename.
    """
    rendered = TimetablePdfService.render_timetable_html(
        sample_schedule_context,
        mock_student_user,
    )
    assert "html" in rendered
    assert "<!DOCTYPE html>" in rendered["html"]
    assert "THỜI KHÓA BIỂU" in rendered["html"]
    assert "Toán học 10" in rendered["html"]
    assert rendered["page_orientation"] == "LANDSCAPE"
    assert "filename" in rendered
    assert rendered["filename"].startswith("Thoi_Khoa_Bieu_10A1")


def test_timetable_custom_export_template_override(mock_student_user, sample_schedule_context):
    """
    Verifies that custom export template attributes like custom filename_pattern and styles are respected.
    """
    custom_tpl = ExportTemplate(
        code="CUSTOM_TIMETABLE_01",
        name="Mẫu TKB Tùy Chỉnh",
        template_type=TemplateType.ACADEMIC,
        file_format=FileFormat.HTML_PRINT,
        content="<main class='custom-main'><h1>Lớp: {{class_name}}</h1>{{timetable_table_html}}</main>",
        style_content=".custom-main { background: #fafafa; }",
        page_size="A3",
        page_orientation="LANDSCAPE",
        sample_data={
            "filename_pattern": "TKB_Custom_{{class_name}}_{{student_code}}",
        },
        is_active=True,
    )

    context = TimetablePdfService.build_template_context(
        sample_schedule_context, mock_student_user, template=custom_tpl
    )
    html_output = custom_tpl.render_html(context)
    assert "class='custom-main'" in html_output
    assert "Lớp: 10A1" in html_output

    filename = custom_tpl.resolve_filename(context=context)
    assert filename == "TKB_Custom_10A1_HS10A101.html"
