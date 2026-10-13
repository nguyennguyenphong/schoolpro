"""
Unit tests for TimetablePrintService integrating with sys.export_templates.
"""

from datetime import date
from unittest.mock import MagicMock, patch

from apps.academic.services.timetable_print_service import TimetablePrintService
from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType


def test_timetable_schedule_matrix_html_generation():
    """
    Verifies that build_schedule_matrix_html formats periods and day of week slots properly.
    """
    week_start = date(2026, 10, 12)  # Monday
    sample_slots = [
        {
            "id": "tt-01",
            "dayOfWeek": 2,
            "periods": "Tiết 1",
            "courseName": "Toán học 10",
            "room": "Phòng A201",
            "instructorName": "ThS. Hoàng Văn Nam",
            "isOnLeave": False,
        },
        {
            "id": "tt-02",
            "dayOfWeek": 3,
            "periods": "Tiết 6",
            "courseName": "Vật lý 10",
            "room": "Phòng Thực hành",
            "instructorName": "TS. Nguyễn Minh Tuấn",
            "isOnLeave": True,
        },
    ]

    matrix_html = TimetablePrintService.build_schedule_matrix_html(
        slots=sample_slots,
        week_start=week_start,
    )

    assert "Toán học 10" in matrix_html
    assert "Phòng A201" in matrix_html
    assert "ThS. Hoàng Văn Nam" in matrix_html
    assert "Vật lý 10" in matrix_html
    assert "Nghỉ phép" in matrix_html
    assert "tt-slot-excused" in matrix_html
    assert "Thứ Hai" in matrix_html
    assert "Thứ Bảy" in matrix_html
    assert "Sáng" in matrix_html
    assert "Chiều" in matrix_html
    # Verify strict requirement: Solid borders only, no dashed or dotted lines
    assert "dashed" not in matrix_html
    assert "dotted" not in matrix_html


def test_timetable_print_service_renders_export_template():
    """
    Verifies that render_timetable_print resolves active template, interpolates context,
    and returns rendered HTML with configured filename.
    """
    custom_tpl = ExportTemplate(
        code="CUSTOM_TIMETABLE_TPL",
        name="Thời khóa biểu tùy chỉnh",
        template_type=TemplateType.ACADEMIC,
        file_format=FileFormat.HTML_PRINT,
        header_content="<div class='custom-hdr'>Lớp: {{class_name}} - {{academic_year}}</div>",
        content="<div class='custom-body'>{{schedule_matrix_html}}</div>",
        footer_content="<div class='custom-ftr'>GVCN: {{homeroom_teacher_name}}</div>",
        style_content=".custom-hdr { font-size: 14pt; }",
        page_size="A4",
        page_orientation="LANDSCAPE",
        margins={"top": "8mm", "right": "8mm", "bottom": "8mm", "left": "8mm"},
        sample_data={
            "filename_pattern": "TKB_Lop_{{class_name}}_{{week_number}}",
        },
    )

    mock_user = MagicMock()
    mock_user.school_id = None
    mock_user.school.name = "TRƯỜNG THPT CHUYÊN HÀ NỘI"

    sample_context = {
        "slots": [
            {
                "id": "tt-01",
                "dayOfWeek": 2,
                "periods": "Tiết 1",
                "courseName": "Hóa học 10",
                "className": "10A1",
                "room": "Phòng Hóa 1",
                "instructorName": "Cô Lê Thu Hà",
                "isOnLeave": False,
            }
        ],
        "meta": {
            "academicYear": {"name": "2026 - 2027"},
            "semester": {"name": "Học kỳ 1"},
        },
    }

    with (
        patch.object(TimetablePrintService, "resolve_export_template", return_value=custom_tpl),
        patch(
            "apps.academic.services.timetable_service.TimetableService.get_weekly_schedule_context",
            return_value=sample_context,
        ),
    ):
        result = TimetablePrintService.render_timetable_print(
            user=mock_user,
            selected_date_str="2026-10-14",
        )

        assert "html" in result
        assert "filename" in result
        assert result["filename"] == "TKB_Lop_10A1_42.html"
        assert result["pageOrientation"] == "LANDSCAPE"
        assert "Lớp: 10A1 - 2026 - 2027" in result["html"]
        assert "Hóa học 10" in result["html"]
        assert "GVCN: ThS. Hoàng Văn Nam" in result["html"]
