"""
Business Logic Service for Document and Export Templates.
"""

import logging
from typing import Any

from django.db import transaction

from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.repositories.export_template_repository import ExportTemplateRepository
from common.exceptions import BusinessLogicError, ResourceNotFoundError

logger = logging.getLogger(__name__)

DEFAULT_ANNOUNCEMENT_CODE = "ANNOUNCEMENT_OFFICIAL_A4"

DEFAULT_ANNOUNCEMENT_HEADER = """
<table class="header-table" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
  <tr>
    <td style="width: 48%; text-align: center; vertical-align: top;">
      <div style="font-size: 12pt; text-transform: uppercase;">{{school_parent_name}}</div>
      <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">{{department_name}}</div>
      <div style="width: 80px; height: 1px; background: #000; margin: 4px auto 6px auto;"></div>
      <div style="font-size: 12pt;">Số: {{notice_number}}</div>
    </td>
    <td style="width: 52%; text-align: center; vertical-align: top;">
      <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div style="font-size: 13pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
      <div style="width: 120px; height: 1px; background: #000; margin: 4px auto 6px auto;"></div>
      <div style="font-size: 12pt; font-style: italic;">{{admin_date}}</div>
    </td>
  </tr>
</table>
"""

DEFAULT_ANNOUNCEMENT_CONTENT = """
<div style="text-align: center; margin: 20px 0 24px 0;">
  <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">THÔNG BÁO</div>
  <div style="font-size: 13pt; font-weight: bold; line-height: 1.4;">V/v: {{title}}</div>
  {{priority_badge}}
</div>

<div style="margin-bottom: 18px; font-size: 13pt;">
  <strong>Kính gửi: </strong><span>{{audience}}</span>
</div>

<div style="font-style: italic; line-height: 1.5; text-align: justify; margin-bottom: 16px; text-indent: 1.25cm;">
  {{summary}}
</div>

<div style="font-size: 13pt; line-height: 1.55; text-align: justify; white-space: pre-line; margin-bottom: 24px;">
  {{content}}
</div>

{{attachments_html}}
"""

DEFAULT_ANNOUNCEMENT_FOOTER = """
<table style="width: 100%; border-collapse: collapse; margin-top: 30px; page-break-inside: avoid;">
  <tr>
    <td style="width: 45%; vertical-align: top; font-size: 11pt;">
      <div style="font-weight: bold; font-style: italic; margin-bottom: 4px;">Nơi nhận:</div>
      <ul style="margin: 0; padding-left: 14px; line-height: 1.4;">
        <li>Như kính gửi;</li>
        <li>Ban Giám hiệu (để b/c);</li>
        <li>Lưu: VT, {{department_code}}.</li>
      </ul>
    </td>
    <td style="width: 55%; vertical-align: top; text-align: center;">
      <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">TM. {{department_name}}</div>
      <div style="font-size: 11pt; font-style: italic; color: #333; margin-bottom: 50px;">(Đã ký duyệt & xác thực điện tử)</div>
      <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">{{author}}</div>
    </td>
  </tr>
</table>

<div style="margin-top: 40px; padding-top: 8px; border-top: 1px dashed #999; font-size: 9.5pt; color: #555; display: flex; justify-content: space-between;">
  <span>Mã tra cứu điện tử: #{{notice_id}}</span>
  <span>Hệ thống Quản lý Học vụ SchoolPro - Thời gian ban hành: {{publish_date}}</span>
</div>
"""

DEFAULT_ANNOUNCEMENT_STYLES = """
.print-container {
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
  padding: 10px;
}
.priority-urgent {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 11pt;
  font-weight: bold;
  color: #b91c1c;
  border: 1.5px solid #b91c1c;
  text-transform: uppercase;
}
"""


class ExportTemplateService:
    """
    Business logic coordinator for managing, validating, and rendering export templates.
    """

    def __init__(self):
        self.repository = ExportTemplateRepository()

    def get_template(self, template_id: Any) -> ExportTemplate:
        template = self.repository.get_by_id(template_id)
        if not template:
            raise ResourceNotFoundError(f"Biểu mẫu xuất tệp (ID: {template_id}) không tồn tại")
        return template

    def create_template(self, user: Any, validated_data: dict[str, Any]) -> ExportTemplate:
        """
        Creates a new export template, handling default flags and audit author assignment.
        """
        with transaction.atomic():
            is_default = validated_data.get("is_default", False)
            template_type = validated_data.get("template_type", TemplateType.ANNOUNCEMENT)
            school = validated_data.get("school")
            school_id = school.id if school else None

            if is_default:
                self.repository.clear_other_defaults(
                    template_type=template_type, school_id=school_id
                )

            validated_data["created_by"] = user
            validated_data["updated_by"] = user

            template = ExportTemplate.objects.create(**validated_data)
        logger.info(
            f"Created ExportTemplate: {template.code} by user: {getattr(user, 'id', 'anonymous')}"
        )
        return template

    def update_template(
        self,
        template_id: Any,
        user: Any,
        validated_data: dict[str, Any],
    ) -> ExportTemplate:
        """
        Updates an existing template and tracks the updater.
        """
        template = self.get_template(template_id)
        with transaction.atomic():
            is_default = validated_data.get("is_default", template.is_default)
            template_type = validated_data.get("template_type", template.template_type)
            school = validated_data.get("school", template.school)
            school_id = school.id if school else None

            if is_default and not template.is_default:
                self.repository.clear_other_defaults(
                    template_type=template_type,
                    school_id=school_id,
                    exclude_id=template.pk,
                )

            validated_data["updated_by"] = user
            for k, v in validated_data.items():
                setattr(template, k, v)

        template.save()
        logger.info(
            f"Updated ExportTemplate: {template.code} by user: {getattr(user, 'id', 'anonymous')}"
        )
        return template

    def delete_template(self, template_id: Any, user: Any) -> None:
        """
        Soft-deletes a template. Prevents deleting the only active default template.
        """
        template = self.get_template(template_id)
        if template.is_default:
            # Check if there are other templates of same type
            others = ExportTemplate.objects.filter(
                template_type=template.template_type,
                school=template.school,
                is_active=True,
                is_deleted=False,
            ).exclude(pk=template.pk)
            if not others.exists():
                raise BusinessLogicError(
                    "Không thể xóa biểu mẫu mặc định duy nhất của phân loại này. Vui lòng thiết lập biểu mẫu khác làm mặc định trước."
                )

        template.delete()
        logger.info(
            f"Soft-deleted ExportTemplate: {template.code} by user: {getattr(user, 'id', 'anonymous')}"
        )

    def render_template(
        self,
        template_id: Any,
        context_data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Renders template to HTML string with supplied context.
        """
        template = self.get_template(template_id)
        rendered_html = template.render_html(context_data)
        filename = template.resolve_filename(
            context=context_data,
            default_prefix="Don_Xin_Nghi_Phep"
            if template.template_type in (TemplateType.LEAVE_REQUEST, TemplateType.ATTENDANCE)
            else "Thong_Bao",
        )
        return {
            "html": rendered_html,
            "template_id": template.id,
            "template_code": template.code,
            "template_name": template.name,
            "file_format": template.file_format,
            "filename": filename,
        }

    def get_or_create_default_announcement_template(self, school_id: Any = None) -> ExportTemplate:
        """
        Ensures a standard Vietnamese administrative A4 announcement template exists.
        If missing, automatically seeds the official default template into the database.
        """
        existing = self.repository.get_active_by_code(
            DEFAULT_ANNOUNCEMENT_CODE, school_id=school_id
        )
        if existing:
            return existing

        # Seed standard default
        template = ExportTemplate.objects.create(
            code=DEFAULT_ANNOUNCEMENT_CODE,
            name="Mẫu Thông báo & Công văn A4 Chuẩn",
            description="Biểu mẫu công văn thông báo A4 theo Nghị định 30/2020/NĐ-CP của Chính phủ về công tác văn thư",
            template_type=TemplateType.ANNOUNCEMENT,
            file_format=FileFormat.HTML_PRINT,
            header_content=DEFAULT_ANNOUNCEMENT_HEADER,
            content=DEFAULT_ANNOUNCEMENT_CONTENT,
            footer_content=DEFAULT_ANNOUNCEMENT_FOOTER,
            style_content=DEFAULT_ANNOUNCEMENT_STYLES,
            page_size="A4",
            page_orientation="PORTRAIT",
            margins={"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "20mm"},
            placeholders_schema=[
                {
                    "key": "school_parent_name",
                    "label": "Cơ quan chủ quản / Hệ thống",
                    "example": "HỆ THỐNG GIÁO DỤC SCHOOLPRO",
                },
                {
                    "key": "department_name",
                    "label": "Đơn vị ban hành",
                    "example": "PHÒNG ĐÀO TẠO & QUẢN LÝ HỌC VỤ",
                },
                {"key": "department_code", "label": "Mã viết tắt đơn vị", "example": "ĐT-HV"},
                {"key": "notice_number", "label": "Số hiệu thông báo", "example": "TB-SP2026-089"},
                {
                    "key": "admin_date",
                    "label": "Ngày tháng ban hành",
                    "example": "Hà Nội, ngày 28 tháng 09 năm 2026",
                },
                {
                    "key": "title",
                    "label": "Tiêu đề thông báo",
                    "example": "Thông báo lịch thi giữa học kỳ 1 năm học 2026 - 2027",
                },
                {
                    "key": "priority_badge",
                    "label": "Huy hiệu mức độ ưu tiên",
                    "example": "<span class='priority-urgent'>HỎA TỐC</span>",
                },
                {
                    "key": "audience",
                    "label": "Đối tượng áp dụng",
                    "example": "Toàn thể học sinh Khối 10, 11, 12",
                },
                {
                    "key": "summary",
                    "label": "Tóm tắt / Căn cứ ban hành",
                    "example": "Căn cứ kế hoạch năm học 2026 - 2027...",
                },
                {
                    "key": "content",
                    "label": "Nội dung chi tiết thông báo",
                    "example": "Nội dung các điều khoản thi...",
                },
                {"key": "attachments_html", "label": "Bảng tài liệu đính kèm", "example": ""},
                {"key": "author", "label": "Người ký duyệt", "example": "ThS. Hoàng Văn Nam"},
                {"key": "notice_id", "label": "Mã định danh thông báo", "example": "ANN-001"},
                {
                    "key": "publish_date",
                    "label": "Thời điểm công bố",
                    "example": "2026-09-28 08:30",
                },
            ],
            sample_data={
                "school_parent_name": "HỆ THỐNG GIÁO DỤC SCHOOLPRO",
                "department_name": "PHÒNG ĐÀO TẠO & HỌC VỤ",
                "department_code": "ĐT",
                "notice_number": "TB-01/SP",
                "admin_date": "Hà Nội, ngày 05 tháng 10 năm 2026",
                "title": "Thông báo kế hoạch tổ chức kỳ thi khảo sát năng lực",
                "priority_badge": "",
                "audience": "Toàn thể Cán bộ, Giảng viên và Học sinh, Sinh viên",
                "summary": "Nhằm đánh giá thực chất chất lượng đào tạo và phân loại học lực đầu năm học.",
                "content": "Nhà trường thông báo kế hoạch tổ chức kỳ thi khảo sát năng lực đợt 1 như sau:\n1. Thời gian: Từ ngày 15/10/2026 đến 18/10/2026.\n2. Địa điểm: Khu giảng đường A.\n3. Thí sinh chuẩn bị đầy đủ thẻ học sinh và dụng cụ học tập.",
                "attachments_html": "",
                "author": "BAN GIÁM HIỆU",
                "notice_id": "SP-2026-DEMO",
                "publish_date": "2026-10-05 08:00",
            },
            is_default=True,
            is_active=True,
        )
        logger.info(f"Seeded official default announcement template: {template.id}")
        return template

    def get_or_create_default_leave_request_template(self, school_id: Any = None) -> ExportTemplate:
        """
        Ensures a customizable Vietnamese administrative A4 leave request template exists
        in sys.export_templates.
        Prioritizes:
        1. Active template with code LEAVE_REQUEST_OFFICIAL_A4 (school-specific or global)
        2. Default template for TemplateType.LEAVE_REQUEST or TemplateType.ATTENDANCE
        3. Auto-seeds LEAVE_REQUEST_OFFICIAL_A4 if missing.
        """
        existing = (
            self.repository.get_active_by_code(DEFAULT_LEAVE_REQUEST_CODE, school_id=school_id)
            or self.repository.get_default_by_type(TemplateType.LEAVE_REQUEST, school_id=school_id)
            or self.repository.get_default_by_type(TemplateType.ATTENDANCE, school_id=school_id)
        )
        if existing:
            return existing

        template = ExportTemplate.objects.create(
            code=DEFAULT_LEAVE_REQUEST_CODE,
            name="Mẫu Đơn Xin Phép Nghỉ Học A4 Chuẩn",
            description=(
                "Biểu mẫu đơn xin phép nghỉ học hành chính khổ A4 hỗ trợ tùy biến tên file, "
                "định dạng (PDF/HTML/Word), CSS, Header/Content/Footer và các biến động."
            ),
            template_type=TemplateType.LEAVE_REQUEST,
            file_format=FileFormat.PDF,
            header_content=DEFAULT_LEAVE_REQUEST_HEADER,
            content=DEFAULT_LEAVE_REQUEST_CONTENT,
            footer_content=DEFAULT_LEAVE_REQUEST_FOOTER,
            style_content=DEFAULT_LEAVE_REQUEST_STYLES,
            page_size="A4",
            page_orientation="PORTRAIT",
            margins={"top": "18mm", "right": "18mm", "bottom": "18mm", "left": "22mm"},
            placeholders_schema=DEFAULT_LEAVE_REQUEST_PLACEHOLDERS,
            sample_data=DEFAULT_LEAVE_REQUEST_SAMPLE_DATA,
            is_default=True,
            is_active=True,
        )
        logger.info("Seeded official default leave request template: %s", template.id)
        return template

    def get_or_create_default_timetable_template(self, school_id: Any = None) -> ExportTemplate:
        """
        Ensures a customizable Vietnamese administrative A4 landscape timetable template exists
        in sys.export_templates.
        Prioritizes:
        1. Active template with code TIMETABLE_WEEKLY_A4_LANDSCAPE (school-specific or global)
        2. Default template for TemplateType.ACADEMIC
        3. Auto-seeds TIMETABLE_WEEKLY_A4_LANDSCAPE if missing.
        """
        existing = self.repository.get_active_by_code(
            DEFAULT_TIMETABLE_CODE, school_id=school_id
        ) or self.repository.get_default_by_type(TemplateType.ACADEMIC, school_id=school_id)
        if existing:
            if "print-color-adjust" not in (existing.style_content or ""):
                existing.style_content = DEFAULT_TIMETABLE_STYLES
                existing.page_orientation = "LANDSCAPE"
                existing.page_size = "A4"
                existing.margins = {"top": "8mm", "right": "10mm", "bottom": "8mm", "left": "10mm"}
                existing.save(
                    update_fields=[
                        "style_content",
                        "page_orientation",
                        "page_size",
                        "margins",
                        "updated_at",
                    ]
                )
            return existing

        template = ExportTemplate.objects.create(
            code=DEFAULT_TIMETABLE_CODE,
            name="Mẫu Thời khóa biểu Tuần A4 Ngang",
            description=(
                "Biểu mẫu thời khóa biểu tuần học tập A4 khổ ngang chuẩn sư phạm, hỗ trợ ma trận tiết học, "
                "thông tin lớp, phòng học, giáo viên bộ môn, chữ ký duyệt và tùy biến định dạng tải xuống."
            ),
            template_type=TemplateType.ACADEMIC,
            file_format=FileFormat.HTML_PRINT,
            header_content=DEFAULT_TIMETABLE_HEADER,
            content=DEFAULT_TIMETABLE_CONTENT,
            footer_content=DEFAULT_TIMETABLE_FOOTER,
            style_content=DEFAULT_TIMETABLE_STYLES,
            page_size="A4",
            page_orientation="LANDSCAPE",
            margins={"top": "8mm", "right": "10mm", "bottom": "8mm", "left": "10mm"},
            placeholders_schema=DEFAULT_TIMETABLE_PLACEHOLDERS,
            sample_data=DEFAULT_TIMETABLE_SAMPLE_DATA,
            is_default=True,
            is_active=True,
        )
        logger.info("Seeded official default timetable template: %s", template.id)
        return template


DEFAULT_LEAVE_REQUEST_CODE = "LEAVE_REQUEST_OFFICIAL_A4"

DEFAULT_LEAVE_REQUEST_HEADER = """
<table class="lr-header-table">
  <tr>
    <td class="lr-header-left">
      <div class="lr-school-name">{{school_name}}</div>
      <div class="lr-class-meta">LỚP: <strong>{{class_name}}</strong></div>
      <div class="lr-code-meta">Mã đơn: {{code}}</div>
    </td>
    <td class="lr-header-right">
      <div class="lr-motto-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="lr-motto-sub"><u>Độc lập - Tự do - Hạnh phúc</u></div>
      <div class="lr-admin-date">{{created_date_admin}}</div>
    </td>
  </tr>
</table>
"""

DEFAULT_LEAVE_REQUEST_CONTENT = """
<div class="lr-title-block">
  <div class="lr-doc-title">{{document_title}}</div>
  <div class="lr-doc-subtitle">(Phân loại: {{leave_type_label}} • Trạng thái: {{status_label}})</div>
</div>

<div class="lr-salutation-block">
  <div><strong>Kính gửi:</strong> - Ban Giám hiệu {{school_name_title}}</div>
  <div class="lr-salutation-indent">- Thầy/Cô Giáo viên chủ nhiệm lớp {{class_name}}: <strong>{{homeroom_teacher_name}}</strong> (Người xét duyệt)</div>
  <div class="lr-salutation-indent">- Quý Thầy/Cô giáo bộ môn giảng dạy lớp {{class_name}}</div>
</div>

<div class="lr-student-info-block">
  <div>
    Em tên là: <strong>{{student_name}}</strong>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Mã số học sinh: <strong>{{student_code}}</strong>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Lớp: <strong>{{class_name}}</strong>
  </div>
  <div>
    Họ và tên Phụ huynh xác nhận: <strong>{{guardian_name}}</strong> ({{guardian_relationship}}){{guardian_phone_suffix}}
  </div>
</div>

<div class="lr-intro-line">
  Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:
</div>

<table class="lr-info-table">
  <tr>
    <td class="lr-info-label">Thời gian xin nghỉ:</td>
    <td class="lr-info-value">{{date_range_text}}</td>
  </tr>
  <tr>
    <td class="lr-info-label">Số ngày &amp; Ca nghỉ:</td>
    <td class="lr-info-value"><strong>{{total_days}} ngày</strong> ({{session_shift_label}})</td>
  </tr>
  <tr>
    <td class="lr-info-label">Các môn học xin nghỉ:</td>
    <td class="lr-info-value">{{affected_subjects}}</td>
  </tr>
</table>

{{affected_lessons_table_html}}

<div class="lr-section-block">
  <div class="lr-section-title">Lý do xin nghỉ học chi tiết:</div>
  <div class="lr-section-body">{{reason_html}}</div>
</div>

<div class="lr-section-block">
  <div class="lr-section-title">Lời hứa và cam kết của học sinh:</div>
  <div class="lr-section-body">{{commitment_html}}</div>
</div>

{{teacher_note_block_html}}
"""

DEFAULT_LEAVE_REQUEST_FOOTER = """
<table class="lr-signature-table">
  <tr>
    <td>
      <div class="lr-sig-title">XÁC NHẬN CỦA PHỤ HUYNH</div>
      <div class="lr-sig-note">(Ký và ghi rõ họ tên)</div>
      <div class="lr-sig-space"></div>
      <div class="lr-sig-name">{{guardian_name}}</div>
    </td>
    <td>
      <div class="lr-sig-title">GIÁO VIÊN CHỦ NHIỆM</div>
      <div class="lr-sig-note">({{status_label}})</div>
      <div class="lr-sig-space"></div>
      <div class="lr-sig-name">{{reviewer_name}}</div>
    </td>
    <td>
      <div class="lr-sig-title">HỌC SINH LÀM ĐƠN</div>
      <div class="lr-sig-note">(Ký và ghi rõ họ tên)</div>
      <div class="lr-sig-space"></div>
      <div class="lr-sig-name">{{student_name}}</div>
    </td>
  </tr>
</table>

<div class="lr-audit-footer">
  Trích xuất từ Hệ thống Quản lý Học vụ SchoolPro • Mã đơn: {{code}} • Biểu mẫu: {{template_code}} • Thời gian xuất: {{exported_at}}
</div>
"""

DEFAULT_LEAVE_REQUEST_STYLES = """
.print-container {
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
  padding: 4px;
}
.lr-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
}
.lr-header-left,
.lr-header-right {
  vertical-align: top;
  text-align: center;
}
.lr-header-left {
  width: 44%;
}
.lr-header-right {
  width: 56%;
}
.lr-school-name,
.lr-motto-country {
  font-size: 11.5pt;
  font-weight: bold;
  text-transform: uppercase;
}
.lr-motto-sub {
  font-size: 11.5pt;
  font-weight: bold;
  margin-top: 2px;
}
.lr-class-meta {
  font-size: 11pt;
  margin-top: 3px;
}
.lr-code-meta {
  font-size: 10pt;
  color: #334155;
}
.lr-admin-date {
  font-size: 11pt;
  font-style: italic;
  text-align: right;
  margin-top: 8px;
}
.lr-title-block {
  text-align: center;
  margin: 12px 0 16px 0;
}
.lr-doc-title {
  font-size: 16pt;
  font-weight: bold;
  text-transform: uppercase;
}
.lr-doc-subtitle {
  font-size: 11pt;
  font-style: italic;
  color: #374151;
  margin-top: 4px;
}
.lr-salutation-block,
.lr-student-info-block,
.lr-intro-line {
  font-size: 11.5pt;
  line-height: 1.55;
  margin-bottom: 10px;
}
.lr-salutation-indent {
  padding-left: 56px;
}
.lr-info-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 14px 0;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
}
.lr-info-table td {
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  font-size: 11.5pt;
}
.lr-info-label {
  width: 28%;
  font-weight: bold;
}
.lr-section-block {
  margin-bottom: 10px;
  font-size: 11.5pt;
  line-height: 1.55;
}
.lr-section-title {
  font-weight: bold;
  margin-bottom: 3px;
}
.lr-section-body {
  text-align: justify;
}
.lr-signature-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 22px;
  page-break-inside: avoid;
}
.lr-signature-table td {
  width: 33.33%;
  text-align: center;
  vertical-align: top;
}
.lr-sig-title {
  font-size: 11pt;
  font-weight: bold;
  text-transform: uppercase;
}
.lr-sig-note {
  font-size: 10.5pt;
  font-style: italic;
  color: #475569;
}
.lr-sig-space {
  height: 58px;
}
.lr-sig-name {
  font-size: 11.5pt;
  font-weight: bold;
}
.lr-audit-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 9pt;
  color: #64748b;
  border-top: 1px dashed #cbd5e1;
  padding-top: 6px;
}
"""

DEFAULT_LEAVE_REQUEST_PLACEHOLDERS = [
    {"key": "document_title", "label": "Tiêu đề văn bản", "example": "ĐƠN XIN PHÉP NGHỈ HỌC"},
    {
        "key": "filename_pattern",
        "label": "Mẫu tên tệp xuất ra",
        "example": "Don_Xin_Nghi_Phep_{{code}}",
    },
    {
        "key": "school_name",
        "label": "Tên trường (In hoa)",
        "example": "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    },
    {
        "key": "school_name_title",
        "label": "Tên trường",
        "example": "Trường Trung học phổ thông SchoolPro",
    },
    {"key": "code", "label": "Mã đơn xin nghỉ phép", "example": "261012000189"},
    {"key": "class_name", "label": "Lớp học", "example": "10A1"},
    {
        "key": "created_date_admin",
        "label": "Ngày tháng làm đơn",
        "example": "Ngày 12 tháng 10 năm 2026",
    },
    {
        "key": "leave_type_label",
        "label": "Phân loại nghỉ phép",
        "example": "Nghỉ ốm / Khám chữa bệnh",
    },
    {"key": "status_label", "label": "Trạng thái phê duyệt", "example": "Đã phê duyệt"},
    {"key": "homeroom_teacher_name", "label": "Giáo viên chủ nhiệm", "example": "Nguyễn Thị Mai"},
    {"key": "reviewer_name", "label": "Người phê duyệt đơn", "example": "Nguyễn Thị Mai"},
    {"key": "student_name", "label": "Họ và tên học sinh", "example": "Đỗ Minh Quân"},
    {"key": "student_code", "label": "Mã số học sinh", "example": "HS20260001"},
    {"key": "guardian_name", "label": "Họ và tên phụ huynh", "example": "Đỗ Văn Hùng"},
    {"key": "guardian_relationship", "label": "Mối quan hệ phụ huynh", "example": "Bố"},
    {"key": "guardian_phone", "label": "Số điện thoại phụ huynh", "example": "0912345678"},
    {"key": "date_range_text", "label": "Khoảng thời gian nghỉ", "example": "Ngày 15/10/2026"},
    {"key": "total_days", "label": "Tổng số ngày nghỉ", "example": "1"},
    {"key": "session_shift_label", "label": "Ca nghỉ", "example": "Nghỉ cả ngày"},
    {
        "key": "affected_subjects",
        "label": "Danh sách môn học xin nghỉ",
        "example": "Toán, Ngữ văn, Tiếng Anh",
    },
    {
        "key": "affected_lessons_table_html",
        "label": "Bảng chi tiết các tiết học bị ảnh hưởng (HTML)",
        "example": "",
    },
    {
        "key": "reason",
        "label": "Lý do xin nghỉ học",
        "example": "Em bị sốt virus cần đi khám tại bệnh viện.",
    },
    {
        "key": "commitment",
        "label": "Lời hứa và cam kết",
        "example": "Em xin hứa chép bài và làm bài tập đầy đủ.",
    },
    {
        "key": "teacher_note",
        "label": "Ý kiến giáo viên chủ nhiệm",
        "example": "Đồng ý cho em nghỉ học có phép.",
    },
    {"key": "exported_at", "label": "Thời điểm xuất tệp", "example": "11:30 12/10/2026"},
]

DEFAULT_LEAVE_REQUEST_SAMPLE_DATA = {
    "title": "Đơn xin phép nghỉ học",
    "document_title": "ĐƠN XIN PHÉP NGHỈ HỌC",
    "filename_pattern": "Don_Xin_Nghi_Phep_{{code}}",
    "school_name": "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    "school_name_title": "Trường Trung học phổ thông SchoolPro",
    "code": "261012000189",
    "class_name": "10A1",
    "created_date_admin": "Ngày 12 tháng 10 năm 2026",
    "leave_type_label": "Nghỉ ốm / Khám chữa bệnh",
    "status_label": "Đã phê duyệt",
    "homeroom_teacher_name": "Nguyễn Thị Mai",
    "reviewer_name": "Nguyễn Thị Mai",
    "student_name": "Đỗ Minh Quân",
    "student_code": "HS20260001",
    "guardian_name": "Đỗ Văn Hùng",
    "guardian_relationship": "Phụ huynh",
    "guardian_phone": "0912345678",
    "guardian_phone_suffix": " — SĐT: <strong>0912345678</strong>",
    "date_range_text": "Ngày 15/10/2026",
    "total_days": 1,
    "session_shift_label": "Nghỉ cả ngày",
    "affected_subjects": "Toán, Vật lý, Tiếng Anh",
    "affected_lessons_table_html": "",
    "reason": "Em bị sốt cao cần đi khám và theo dõi sức khỏe theo chỉ định của bác sĩ.",
    "reason_html": "Em bị sốt cao cần đi khám và theo dõi sức khỏe theo chỉ định của bác sĩ.",
    "commitment": "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.",
    "commitment_html": "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.",
    "teacher_note": "Đồng ý cho học sinh nghỉ học có phép.",
    "teacher_note_block_html": "",
    "template_code": DEFAULT_LEAVE_REQUEST_CODE,
    "exported_at": "11:30 12/10/2026",
}


DEFAULT_TIMETABLE_CODE = "TIMETABLE_WEEKLY_A4_LANDSCAPE"

DEFAULT_TIMETABLE_HEADER = """
<table class="tt-header-table" style="width: 100%; border-collapse: collapse; margin-bottom: 6px; padding-bottom: 4px; border: none; page-break-inside: avoid;">
  <tr>
    <td style="width: 50%; text-align: center; vertical-align: top;">
      <div style="font-size: 9.5pt; text-transform: uppercase; color: #334155;">{{school_parent_name}}</div>
      <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 1px;">{{school_name}}</div>
      <div style="width: 130px; margin: 3px auto 4px auto; border-top: 1px solid #334155;"></div>
      <div style="font-size: 9.5pt; margin-top: 1px; color: #334155;">Lớp: <strong>{{class_name}}</strong> - Năm học: <strong>{{academic_year}}</strong></div>
    </td>
    <td style="width: 50%; text-align: center; vertical-align: top;">
      <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div style="font-size: 10.5pt; font-weight: bold; color: #0f172a; margin-top: 1px;">Độc lập - Tự do - Hạnh phúc</div>
      <div style="width: 140px; margin: 3px auto 4px auto; border-top: 1px solid #0f172a;"></div>
      <div style="font-size: 9pt; font-style: italic; color: #475569; margin-top: 1px;">Học kỳ: {{semester_name}} - Ngày lập: {{print_date}}</div>
    </td>
  </tr>
</table>
"""

DEFAULT_TIMETABLE_CONTENT = """
<div style="text-align: center; margin: 4px 0 6px 0;">
  <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">THỜI KHÓA BIỂU HỌC TẬP</div>
</div>

<div class="tt-table-container">
  {{schedule_matrix_html}}
</div>

<div style="margin-top: 6px; font-size: 8.5pt; color: #334155; line-height: 1.35;">
  <div><strong>Ghi chú:</strong> Thời khóa biểu này có hiệu lực từ ngày {{week_start_date}} đến ngày {{week_end_date}}</div>
</div>
"""

DEFAULT_TIMETABLE_FOOTER = """
<table class="tt-signatures-table" style="width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: avoid;">
  <tr>
    <td style="width: 33.33%; text-align: center; vertical-align: top;">
      <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">NGƯỜI LẬP BIỂU</div>
      <div style="font-size: 8.5pt; font-style: italic; color: #64748b; margin-top: 1px;">(Ký và ghi rõ họ tên)</div>
      <div style="height: 36px;"></div>
      <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">{{student_name}}</div>
    </td>
    <td style="width: 33.33%; text-align: center; vertical-align: top;">
      <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">GIÁO VIÊN CHỦ NHIỆM</div>
      <div style="font-size: 8.5pt; font-style: italic; color: #64748b; margin-top: 1px;">(Ký và ghi rõ họ tên)</div>
      <div style="height: 36px;"></div>
      <div style="font-size: 10pt; font-weight: bold; color: #0f172a;">{{homeroom_teacher_name}}</div>
    </td>
    <td style="width: 33.33%; text-align: center; vertical-align: top;">
      <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">HIỆU TRƯỞNG / BGH</div>
      <div style="font-size: 8.5pt; font-style: italic; color: #64748b; margin-top: 1px;">(Ký tên và đóng dấu)</div>
      <div style="height: 36px;"></div>
      <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">{{principal_name}}</div>
    </td>
  </tr>
</table>

<div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #64748b; text-align: right;">
  Mã biểu mẫu: {{template_code}}
</div>
"""

DEFAULT_TIMETABLE_STYLES = """
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}
@page {
  size: A4 landscape !important;
  margin: 6mm 8mm !important;
}
html, body {
  font-family: 'Times New Roman', 'Segoe UI', serif !important;
  font-size: 8.5pt !important;
  line-height: 1.25 !important;
  color: #0f172a !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #fff !important;
}
.print-container {
  width: 100%;
  max-width: 297mm;
  margin: 0 auto;
}
.tt-matrix-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 8pt;
  page-break-inside: auto;
}
.tt-matrix-table thead {
  display: table-header-group !important;
}
.tt-matrix-table tbody {
  display: table-row-group !important;
}
.tt-matrix-table tr {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.tt-matrix-table th, .tt-matrix-table td {
  border: 1px solid #475569;
  padding: 3px 2px;
  text-align: center;
  vertical-align: middle;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.tt-matrix-table th {
  background-color: #f1f5f9;
  font-weight: bold;
  color: #0f172a;
  font-size: 8.5pt;
  padding: 4px 2px;
}
.tt-matrix-table .shift-col {
  width: 38px;
  background-color: #f8fafc;
  font-weight: bold;
  font-size: 8.5pt;
}
.tt-matrix-table .period-col {
  width: 32px;
  font-weight: bold;
  font-size: 8.5pt;
}
.tt-matrix-table .time-col {
  width: 72px;
  font-size: 7.5pt;
  color: #334155;
}
.tt-slot-card {
  text-align: left;
  line-height: 1.25;
  padding: 1px 2px;
}
.tt-slot-subject {
  font-weight: bold;
  color: #1e3a8a;
  font-size: 8pt;
  margin-bottom: 2px;
  line-height: 1.2;
  border-bottom: 1px dashed #cbd5e1;
  padding-bottom: 1.5px;
}
.tt-slot-row {
  font-size: 7pt;
  line-height: 1.25;
  margin-top: 1px;
  color: #334155;
  word-break: break-word;
}
.tt-slot-lbl {
  font-weight: 600;
  color: #475569;
}
.tt-slot-val {
  color: #0f172a;
}
.tt-slot-note {
  font-style: italic;
  color: #475569;
}
.tt-slot-link {
  color: #2563eb;
  text-decoration: underline;
  word-break: break-all;
}
.tt-slot-excused {
  background-color: #fef3c7;
  border-radius: 2px;
  padding: 1px 3px;
  margin-top: 2px;
  font-size: 6.5pt;
  color: #92400e;
  font-weight: 600;
  border: 1px solid #fde68a;
  display: inline-block;
}
.tt-signatures-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.tt-signatures-table td {
  text-align: center;
  vertical-align: top;
}
.tt-header-table {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
"""

DEFAULT_TIMETABLE_PLACEHOLDERS = [
    {"key": "school_name", "label": "Tên cơ sở / Trường học"},
    {"key": "department_name", "label": "Phòng ban chuyên môn"},
    {"key": "class_name", "label": "Lớp học"},
    {"key": "academic_year", "label": "Năm học"},
    {"key": "semester_name", "label": "Học kỳ"},
    {"key": "week_label", "label": "Tuần học"},
    {"key": "date_range", "label": "Khoảng thời gian tuần học"},
    {"key": "student_name", "label": "Họ và tên học sinh"},
    {"key": "student_code", "label": "Mã định danh học sinh"},
    {"key": "homeroom_teacher", "label": "Giáo viên chủ nhiệm"},
    {"key": "print_date", "label": "Thời điểm in"},
    {"key": "timetable_table_html", "label": "Bảng ma trận tiết học trong tuần"},
]

DEFAULT_TIMETABLE_SAMPLE_DATA = {
    "filename_pattern": "Thoi_Khoa_Bieu_{{class_name}}_{{week_label}}",
    "school_name": "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    "department_name": "PHÒNG HỌC VỤ & ĐÀO TẠO",
    "class_name": "10A1",
    "academic_year": "2026 - 2027",
    "semester_name": "Học kỳ 1",
    "week_label": "Tuần 06",
    "date_range": "Từ ngày 13/10/2026 đến ngày 18/10/2026",
    "student_name": "Nguyễn Văn An",
    "student_code": "HS10A101",
    "homeroom_teacher": "Thầy Hoàng Văn Nam",
    "print_date": "14/10/2026 09:30",
    "timetable_table_html": "",
}
