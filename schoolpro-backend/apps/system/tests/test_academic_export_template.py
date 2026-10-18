"""
Unit tests for Academic Transcript ExportTemplate.
"""

from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_ACADEMIC_CODE,
    DEFAULT_ACADEMIC_CONTENT,
    DEFAULT_ACADEMIC_FOOTER,
    DEFAULT_ACADEMIC_HEADER,
    DEFAULT_ACADEMIC_PLACEHOLDERS,
    DEFAULT_ACADEMIC_SAMPLE_DATA,
    DEFAULT_ACADEMIC_STYLES,
)


def test_academic_transcript_template_rendering():
    """
    Verifies that the academic transcript template renders dynamic placeholders
    into the official Vietnamese high school gradebook format.
    """
    template = ExportTemplate(
        code=DEFAULT_ACADEMIC_CODE,
        name="Mẫu Bảng điểm kết quả học tập A4 Ngang",
        template_type=TemplateType.ACADEMIC,
        file_format=FileFormat.HTML_PRINT,
        header_content=DEFAULT_ACADEMIC_HEADER,
        content=DEFAULT_ACADEMIC_CONTENT,
        footer_content=DEFAULT_ACADEMIC_FOOTER,
        style_content=DEFAULT_ACADEMIC_STYLES,
        page_size="A4",
        page_orientation="LANDSCAPE",
        margins={"top": "8mm", "right": "12mm", "bottom": "7mm", "left": "15mm"},
        placeholders_schema=DEFAULT_ACADEMIC_PLACEHOLDERS,
        sample_data=DEFAULT_ACADEMIC_SAMPLE_DATA,
        is_default=True,
        is_active=True,
    )

    context = {
        "student_name": "Trần Thị Minh Anh",
        "student_code": "HS10A188",
        "class_name": "10A1",
        "academic_year": "2026 – 2027",
        "semester_name": "Học kỳ 1",
        "gpa": "9.1",
        "conduct": "Tốt",
        "academic_performance": "Tốt",
        "absence_days": "1 buổi (có phép)",
        "homeroom_teacher_name": "ThS. Hoàng Văn Nam",
        "principal_name": "TS. Lê Hồng Sơn",
        "created_by_name": "Nguyễn Văn Hùng",
        "creator_name": "Nguyễn Văn Hùng",
    }

    rendered_html = template.render_html(context)

    # 1. Structure assertions
    assert "<!DOCTYPE html>" in rendered_html
    assert "BẢNG ĐIỂM KẾT QUẢ HỌC TẬP" in rendered_html
    assert "SỞ GIÁO DỤC VÀ ĐÀO TẠO" in rendered_html
    assert "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" in rendered_html

    # 2. Context variable interpolation assertions
    assert "Trần Thị Minh Anh" in rendered_html
    assert "HS10A188" in rendered_html
    assert "10A1" in rendered_html
    assert "9.1" in rendered_html
    assert "1 buổi (có phép)" in rendered_html
    assert "ThS. Hoàng Văn Nam" in rendered_html
    assert "TS. Lê Hồng Sơn" in rendered_html
    assert "Nguyễn Văn Hùng" in rendered_html

    # 3. Subject rows assertion (from sample_data fallback or custom)
    assert "Ngữ văn" in rendered_html
    assert "Toán" in rendered_html
    assert "Vật lí" in rendered_html
    assert "Hóa học" in rendered_html

    # 4. Signatures block assertion
    assert "NGƯỜI LẬP BẢNG KẾT QUẢ" in rendered_html
    assert "GIÁO VIÊN CHỦ NHIỆM" in rendered_html
    assert "HIỆU TRƯỞNG" in rendered_html

    # 5. Filename resolution test
    filename = template.resolve_filename(context=context)
    assert filename == "Bang_Diem_10A1_HS10A188_2026_–_2027.html"
