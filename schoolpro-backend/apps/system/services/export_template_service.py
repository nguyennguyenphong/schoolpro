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
            margins={"top": "12mm", "right": "16mm", "bottom": "12mm", "left": "16mm"},
            placeholders_schema=DEFAULT_LEAVE_REQUEST_PLACEHOLDERS,
            sample_data=DEFAULT_LEAVE_REQUEST_SAMPLE_DATA,
            is_default=True,
            is_active=True,
        )
        logger.info("Seeded official default leave request template: %s", template.id)
        return template

    def get_or_create_default_academic_transcript_template(
        self, school_id: Any = None
    ) -> ExportTemplate:
        """
        Ensures the official Vietnamese academic transcript / gradebook template exists
        in sys.export_templates (TemplateType.ACADEMIC).
        """
        existing = self.repository.get_active_by_code(
            DEFAULT_ACADEMIC_CODE, school_id=school_id
        ) or self.repository.get_default_by_type(TemplateType.ACADEMIC, school_id=school_id)
        if existing:
            return existing

        template = ExportTemplate.objects.create(
            code=DEFAULT_ACADEMIC_CODE,
            name="Mẫu Bảng điểm kết quả học tập A4 Ngang",
            description=(
                "Biểu mẫu bảng điểm kết quả học tập A4 khổ ngang chuẩn Bộ Giáo dục và Đào tạo, "
                "hỗ trợ điểm đánh giá thường xuyên, giữa kỳ, cuối kỳ, điểm trung bình môn, xếp loại và nhận xét."
            ),
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
        logger.info("Seeded official default academic transcript template: %s", template.id)
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
        existing = self.repository.get_active_by_code(DEFAULT_TIMETABLE_CODE, school_id=school_id)
        if existing:
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
<main class="page">
  <header class="header">
    <div class="header-left">
      <div class="school">TRƯỜNG {{school_name}}</div>
      <div class="school-line"></div>
    </div>
    <div class="header-right">
      <div class="nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
      <div class="motto-line"></div>
    </div>
  </header>
"""

DEFAULT_LEAVE_REQUEST_CONTENT = """
  <h1>ĐƠN XIN PHÉP NGHỈ HỌC</h1>

  <div class="recipient">
    <div><strong>Kính gửi:</strong> - Ban Giám hiệu {{school_name_title}}</div>
    <div>- Thầy/Cô Giáo viên chủ nhiệm lớp {{class_name}}: <strong>{{homeroom_teacher_name}}</strong></div>
    <div>- Quý Thầy/Cô giáo giảng dạy các môn học</div>
  </div>

  <p class="field">Em tên là: <strong>{{student_name}}</strong></p>
  <p class="field">Mã học sinh: <strong>{{student_code}}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lớp: <strong>{{class_name}}</strong></p>
  <p class="field">Ngày, tháng, năm sinh: <strong>{{student_dob}}</strong></p>
  <p class="field">Họ và tên Phụ huynh: <strong>{{guardian_name}}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SĐT liên hệ: <strong>{{guardian_phone}}</strong></p>

  <p class="indent">Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:</p>
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

  <div class="field reason-block-wrap">
    <strong>Lý do xin nghỉ học:</strong>
    <div class="reason-block">
      {{reason_html}}
    </div>
  </div>

  <p class="indent">{{commitment_html}}</p>
  <p class="indent">Kính mong Thầy/Cô xem xét và tạo điều kiện cho em được phép nghỉ học. Em xin chân thành cảm ơn!</p>
"""

DEFAULT_LEAVE_REQUEST_FOOTER = """
  <p class="date">{{created_date_admin}}</p>
  <div class="signatures-row">
    <div class="signature">
      <div class="sign-title">Ý KIẾN CỦA PHỤ HUYNH</div>
      <div class="sign-note">(Ký và ghi rõ họ tên)</div>
      <div class="sign-space"></div>
      <div class="sign-name">{{guardian_name}}</div>
    </div>
    <div class="signature">
      <div class="sign-title">NGƯỜI LÀM ĐƠN</div>
      <div class="sign-note">(Ký và ghi rõ họ tên)</div>
      <div class="sign-space"></div>
      <div class="sign-name">{{student_name}}</div>
    </div>
  </div>

  <section class="approval">
    <div class="approval-title">Ý KIẾN PHÊ DUYỆT CỦA GIÁO VIÊN CHỦ NHIỆM</div>
    <p class="approval-status">Tình trạng phê duyệt: &nbsp;&nbsp;&nbsp;&nbsp; <span style="font-family: DejaVu Sans, Arial, sans-serif;">{{approval_checkboxes}}</span></p>
    <p class="approval-note">Ý kiến bổ sung: <em>{{teacher_note_display}}</em></p>
    <div class="approval-sign">
      <div class="sign-title">GIÁO VIÊN CHỦ NHIỆM</div>
      <div class="sign-note">({{status_label}})</div>
      <div class="sign-space"></div>
      <div class="sign-name">{{homeroom_teacher_name}}</div>
    </div>
  </section>
</main>
"""

DEFAULT_LEAVE_REQUEST_STYLES = """
* {
  box-sizing: border-box;
}

@page {
  size: A4 portrait;
  margin: 12mm 16mm;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: "Times New Roman", Times, serif;
  color: #111;
  background: #ededed;
  font-size: 13pt;
  line-height: 1.4;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.page {
  width: 210mm;
  min-height: 297mm;
  margin: 20px auto;
  padding: 14mm 18mm;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.header {
  display: table;
  width: 100%;
  margin-bottom: 14px;
  font-size: 11.5pt;
  line-height: 1.28;
}

.header-left {
  display: table-cell;
  width: 44%;
  text-align: center;
  vertical-align: top;
}

.header-right {
  display: table-cell;
  width: 56%;
  text-align: center;
  vertical-align: top;
}

.school {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11.5pt;
}

.school-line {
  width: 75%;
  border-top: 1px solid #222;
  margin: 5px auto 0;
}

.nation {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11.5pt;
}

.motto {
  font-weight: bold;
  margin-top: 3px;
  font-size: 12pt;
}

.motto-line {
  width: 48%;
  border-top: 1px solid #222;
  margin: 5px auto 0;
}

h1 {
  text-align: center;
  font-size: 16pt;
  text-transform: uppercase;
  margin: 16px 0 12px;
  font-weight: bold;
  line-height: 1.2;
}

.recipient {
  text-align: center;
  margin: 0 0 14px;
  line-height: 1.5;
  font-size: 12.5pt;
}

p {
  margin: 6px 0;
  text-align: justify;
}

.field {
  margin: 5px 0;
  font-size: 12.5pt;
}

.indent {
  text-indent: 28px;
  font-size: 12.5pt;
}

.lr-info-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0 8px 0;
}

.lr-info-table td {
  border: 1px solid #777;
  padding: 4px 8px;
  font-size: 12pt;
}

.lr-info-label {
  width: 30%;
  font-weight: bold;
  background: #fbfbfb;
}

.lr-timetable-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0 8px 0;
  font-size: 11pt;
  page-break-inside: avoid;
}

.lr-timetable-table th,
.lr-timetable-table td {
  border: 1px solid #777;
  padding: 4px 6px;
}

.lr-timetable-table th {
  background: #f4f4f4;
  font-weight: bold;
}

.reason-block-wrap {
  margin: 5px 0;
}

.reason-block {
  margin: 3px 0 5px 0;
  padding: 4px 8px;
  background: #fafafa;
  border-left: 3px solid #234f75;
  text-align: justify;
  font-size: 12pt;
}

.date {
  text-align: right;
  font-style: italic;
  margin-top: 12px;
  font-size: 12pt;
}

.signatures-row {
  display: table;
  width: 100%;
  margin-top: 8px;
  page-break-inside: avoid;
}

.signature {
  display: table-cell;
  width: 50%;
  text-align: center;
  vertical-align: top;
}

.sign-title {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11.5pt;
}

.sign-note {
  font-style: italic;
  font-size: 11pt;
}

.sign-space {
  height: 40px;
}

.sign-name {
  font-weight: bold;
  font-size: 12.5pt;
}

.approval {
  margin-top: 12px;
  border-top: 1px solid #777;
  padding-top: 8px;
  page-break-inside: avoid;
}

.approval-title {
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 12pt;
  margin-bottom: 5px;
}

.approval p {
  text-align: left;
  margin: 4px 0;
  font-size: 12pt;
}

.approval-sign {
  text-align: center;
  width: 52%;
  margin: 6px 0 0 auto;
}

.approval-sign .sign-space {
  height: 36px;
}

@media print {
  body {
    background: #fff !important;
    padding: 0 !important;
  }
  .page {
    width: 100% !important;
    min-height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
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
    {"key": "student_dob", "label": "Ngày sinh học sinh", "example": "15/08/2010"},
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
    {
        "key": "approval_checkboxes",
        "label": "Đánh dấu đồng ý/không đồng ý của GVCN",
        "example": "☑ Đồng ý cho nghỉ học        ☐ Không đồng ý",
    },
    {
        "key": "teacher_note_display",
        "label": "Nội dung ý kiến khác của GVCN",
        "example": "Đồng ý cho học sinh nghỉ học có phép.",
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
    "student_dob": "15/08/2010",
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
    "teacher_note_display": "Đồng ý cho học sinh nghỉ học có phép.",
    "teacher_note_block_html": "",
    "approval_checkboxes": "☑ Đồng ý cho nghỉ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ Không đồng ý",
    "template_code": DEFAULT_LEAVE_REQUEST_CODE,
    "exported_at": "11:30 12/10/2026",
}


DEFAULT_TIMETABLE_CODE = "TIMETABLE_WEEKLY_A4_LANDSCAPE"

DEFAULT_TIMETABLE_HEADER = """
<main class="page">
    <header class="header">
        <div>
            <p class="agency-name">{{school_parent_name}}</p>
            <p class="school-name">{{school_name}}</p>
            <div class="rule rule-left"></div>
            <p class="doc-number">Số: {{doc_number}}</p>
        </div>
        <div>
            <p class="national-name">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p class="motto">Độc lập - Tự do - Hạnh phúc</p>
            <div class="rule rule-right"></div>
        </div>
    </header>
"""

DEFAULT_TIMETABLE_CONTENT = """
    <section class="title-block">
        <h1>THỜI KHÓA BIỂU</h1>
        <p class="period">Năm học: {{school_year}} &nbsp; | &nbsp; Học kỳ: {{semester}} &nbsp; | &nbsp; Áp dụng từ tuần: {{week_label}}</p>
    </section>
    <table class="info" aria-label="Thông tin thời khóa biểu">
        <tbody>
            <tr>
                <td style="width:34%">Lớp: <span class="value">{{class_name}}</span></td>
                <td style="width:33%">Khối: <span class="value">{{grade_level}}</span></td>
                <td style="width:33%">Giáo viên chủ nhiệm: <span class="value">{{homeroom_teacher_name}}</span></td>
            </tr>
            <tr>
                <td colspan="3">Thời gian áp dụng: <span class="value">Từ ngày {{effective_start_date}} đến ngày {{effective_end_date}}</span></td>
            </tr>
        </tbody>
    </table>
    <table class="timetable" aria-label="Thời khóa biểu theo ngày và tiết học">
        <colgroup>
            <col class="day-col">
            <col class="period-col">
            <col class="lesson-col">
            <col class="lesson-col">
            <col class="lesson-col">
            <col class="lesson-col">
            <col class="lesson-col">
        </colgroup>
        <thead>
            <tr>
                <th>Thứ</th>
                <th>Buổi</th>
                <th>Tiết 1</th>
                <th>Tiết 2</th>
                <th>Tiết 3</th>
                <th>Tiết 4</th>
                <th>Tiết 5</th>
            </tr>
        </thead>
        <tbody>
            {{timetable_table_tbody_html}}
        </tbody>
    </table>
    <section class="notes">
        <p><strong>Ghi chú chung:</strong> {{general_notes}}</p>
        <p><strong>Quy ước:</strong> Mỗi ô tiết học ghi đầy đủ thông tin; Nếu không có lịch, ghi “Không có lịch”.</p>
    </section>
"""

DEFAULT_TIMETABLE_FOOTER = """
    <footer class="footer">
        <div class="footer-date">{{created_date_formatted}}</div>
        <div class="signature-row">
            <div class="signature">
                <div class="signature-title">NGƯỜI LẬP THỜI KHÓA BIỂU</div>
                <div class="signature-guide">(Ký và ghi rõ họ tên)</div>
                <div class="signature-space"></div>
                <div class="signature-name">{{created_by_name}}</div>
            </div>
            <div class="signature">
                <div class="signature-title">GIÁO VIÊN CHỦ NHIỆM</div>
                <div class="signature-guide">(Ký và ghi rõ họ tên)</div>
                <div class="signature-space"></div>
                <div class="signature-name">{{homeroom_teacher_name}}</div>
            </div>
        </div>
    </footer>
</main>
"""

DEFAULT_TIMETABLE_STYLES = """
* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
}

body {
    font-family: "Times New Roman", Times, serif;
    color: #000;
    background: #e9e9e9;
    font-size: 10pt;
    line-height: 1.2;
}

.toolbar {
    width: 297mm;
    margin: 14px auto 10px;
    display: flex;
    justify-content: flex-end;
}

.page {
    width: 297mm;
    min-height: 210mm;
    margin: 0 auto 20px;
    padding: 9mm 10mm 7mm;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, .14);
}

.header {
    display: grid;
    grid-template-columns: 45% 55%;
    text-align: center;
    align-items: start;
    margin-bottom: 4mm;
}

.header p {
    margin: 0 0 3px;
}

.agency-name {
    font-size: 9.5pt;
    text-transform: uppercase;
}

.school-name,
.national-name {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
}

.motto {
    font-size: 10.5pt;
    font-weight: bold;
}

.rule {
    height: 1px;
    background: #000;
    margin: 4px auto 0;
}

.rule-left {
    width: 115px;
}

.rule-right {
    width: 160px;
}

.doc-number {
    margin-top: 4px !important;
    font-size: 9pt;
}

.title-block {
    text-align: center;
    margin: 0 0 3mm;
}

h1 {
    margin: 0;
    font-size: 16pt;
    text-transform: uppercase;
}

.period {
    margin: 3px 0 0;
    font-size: 10pt;
    font-style: italic;
}

.info {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 3mm;
    font-size: 9.5pt;
}

.info td {
    padding: 2px 4px;
    vertical-align: top;
}

.value {
    font-weight: bold;
}

.timetable {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 7.5pt;
    margin-bottom: 3mm;
}

.timetable th,
.timetable td {
    border: 1px solid #000;
    padding: 3px 3px;
    vertical-align: top;
    line-height: 1.15;
    overflow-wrap: anywhere;
}

.timetable th {
    text-align: center;
    vertical-align: middle;
    font-size: 8.5pt;
    background: #f1f1f1;
}

.timetable .day-col {
    width: 7%;
}

.timetable .period-col {
    width: 5%;
}

.timetable .lesson-col {
    width: 17.6%;
}

.timetable .day,
.timetable .session {
    text-align: center;
    vertical-align: middle;
    font-weight: bold;
}

.timetable .lesson {
    min-height: 56px;
}

.subject {
    text-align: start;
    font-size: 8pt;
    font-weight: normal;
    margin-bottom: 3px;
    padding-bottom: 0;
    border-bottom: none;
}

.detail {
    margin: 0 0 2px;
}

.detail strong {
    font-weight: normal;
}

.empty-session {
    text-align: center;
    vertical-align: middle !important;
    color: #555;
    font-style: italic;
}

.notes {
    font-size: 8.5pt;
    margin-top: 2mm;
}

.notes p {
    margin: 0 0 3px;
}

.footer {
    margin-top: 3mm;
}

.footer-date {
    width: 50%;
    margin-left: 50%;
    text-align: center;
    font-size: 9pt;
    font-style: italic;
    margin-bottom: 5px;
    padding: 0 4px;
}

.signature-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
}

.signature {
    text-align: center;
    padding: 0 4px;
}

.signature-title {
    font-size: 9.5pt;
    font-weight: bold;
    text-transform: uppercase;
}

.signature-guide {
    margin-top: 2px;
    font-size: 8.5pt;
    font-style: italic;
}

.signature-space {
    height: 60px;
}

.signature-name {
    font-size: 9.5pt;
    font-weight: bold;
}

@media print {
    @page {
        size: A4 landscape;
        margin: 12mm 15mm 12mm 15mm;
    }

    html,
    body {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
    }

    .toolbar {
        display: none !important;
    }

    .page {
        width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
    }

    .header,
    .title-block,
    .info,
    .notes,
    .footer,
    .signature-row {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .timetable {
        page-break-inside: auto !important;
    }

    .timetable thead {
        display: table-header-group !important;
    }

    .timetable tbody {
        display: table-row-group !important;
    }

    .timetable tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .timetable th {
        background: #f1f1f1 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}

@media screen and (max-width:1100px) {
    .page,
    .toolbar {
        margin-left: 12px;
        margin-right: 12px;
    }
}
"""

DEFAULT_TIMETABLE_PLACEHOLDERS = [
    {
        "key": "school_parent_name",
        "label": "Cơ quan chủ quản",
        "example": "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH",
    },
    {
        "key": "school_name",
        "label": "Tên trường học",
        "example": "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    },
    {"key": "doc_number", "label": "Số công văn / Số hiệu", "example": "08/TKB-THPT"},
    {"key": "school_year", "label": "Năm học", "example": "2026 – 2027"},
    {"key": "semester", "label": "Học kỳ", "example": "Học kỳ 1"},
    {"key": "week_label", "label": "Tuần áp dụng", "example": "Tuần 42"},
    {"key": "class_name", "label": "Lớp học", "example": "10A1"},
    {"key": "grade_level", "label": "Khối học", "example": "10"},
    {"key": "homeroom_teacher_name", "label": "Giáo viên chủ nhiệm", "example": "Trần Thị Văn"},
    {"key": "effective_start_date", "label": "Thời gian áp dụng từ ngày", "example": "13/10/2026"},
    {"key": "effective_end_date", "label": "Thời gian áp dụng đến ngày", "example": "18/10/2026"},
    {
        "key": "timetable_table_tbody_html",
        "label": "Nội dung các hàng thời khóa biểu (Thứ 2 - Thứ 7, Sáng - Chiều)",
    },
    {
        "key": "general_notes",
        "label": "Ghi chú chung",
        "example": "Học sinh có mặt trước giờ học 15 phút, mặc đồng phục đúng quy định.",
    },
    {
        "key": "created_date_formatted",
        "label": "Địa danh và ngày lập biểu",
        "example": "TP. Hồ Chí Minh, ngày 18 tháng 10 năm 2026",
    },
    {
        "key": "created_by_name",
        "label": "Người lập thời khóa biểu (Học sinh)",
        "example": "Nguyễn Minh Quang",
    },
]

DEFAULT_TIMETABLE_SAMPLE_DATA = {
    "filename_pattern": "Thoi_Khoa_Bieu_{{class_name}}_{{week_label}}",
    "school_parent_name": "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH",
    "school_name": "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO",
    "doc_number": "08/TKB-THPT",
    "school_year": "2026 – 2027",
    "academic_year": "2026 – 2027",
    "semester": "Học kỳ 1",
    "semester_name": "Học kỳ 1",
    "week_label": "Tuần 42",
    "class_name": "10A1",
    "grade_level": "10",
    "homeroom_teacher_name": "Trần Thị Văn",
    "effective_start_date": "13/10/2026",
    "effective_end_date": "18/10/2026",
    "general_notes": "Học sinh có mặt trước giờ học 15 phút, mặc đồng phục đúng quy định.",
    "created_date_formatted": "TP. Hồ Chí Minh, ngày 18 tháng 10 năm 2026",
    "created_by_name": "Nguyễn Minh Quang",
    "principal_name": "Lê Trọng Nghĩa",
    "student_name": "Nguyễn Minh Quang",
    "student_code": "HS10A101",
    "timetable_table_tbody_html": "",
    "schedule_matrix_html": "",
    "timetable_table_html": "",
}


DEFAULT_ACADEMIC_CODE = "ACADEMIC_TRANSCRIPT_A4_LANDSCAPE"

DEFAULT_ACADEMIC_HEADER = """
<main class="page">
  <header class="header">
    <div>
      <p class="agency-name">SỞ GIÁO DỤC VÀ ĐÀO TẠO {{school_parent_name}}</p>
      <p class="school-name">TRƯỜNG {{school_name}}</p>
      <div class="rule rule-left"></div>
      <p class="doc-number">Số: {{doc_number}}</p>
    </div>
    <div>
      <p class="national-name">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
      <p class="motto">Độc lập - Tự do - Hạnh phúc</p>
      <div class="rule rule-right"></div>
    </div>
  </header>
"""

DEFAULT_ACADEMIC_CONTENT = """
  <section class="title-block">
    <h1>BẢNG ĐIỂM KẾT QUẢ HỌC TẬP</h1>
    <p class="period">Năm học: {{academic_year}} &nbsp;&nbsp; | &nbsp;&nbsp; Học kỳ: {{semester_name}}</p>
  </section>

  <table class="student-info" aria-label="Thông tin học sinh">
    <tbody>
      <tr>
        <td style="width:38%">Họ và tên học sinh: <span class="value">{{student_name}}</span></td>
        <td style="width:24%">Mã học sinh: <span class="value">{{student_code}}</span></td>
        <td style="width:22%">Ngày sinh: <span class="value">{{date_of_birth}}</span></td>
        <td style="width:16%">Giới tính: <span class="value">{{gender}}</span></td>
      </tr>
      <tr>
        <td>Lớp: <span class="value">{{class_name}}</span></td>
        <td colspan="3">Nơi sinh: <span class="value">{{place_of_birth}}</span></td>
      </tr>
    </tbody>
  </table>

  <table class="score-table" aria-label="Điểm các môn học trong học kỳ hoặc năm học">
    <colgroup>
      <col class="subject-col">
      <col class="regular-col"><col class="regular-col"><col class="regular-col"><col class="regular-col"><col class="regular-col">
      <col class="exam-col"><col class="exam-col">
      <col class="average-col">
      <col class="rank-col">
      <col class="comment-col">
    </colgroup>
    <thead>
      <tr>
        <th rowspan="2">Môn học</th>
        <th colspan="5">Điểm đánh giá thường xuyên</th>
        <th rowspan="2">Giữa kỳ</th>
        <th rowspan="2">Cuối kỳ</th>
        <th rowspan="2">Điểm trung bình môn học</th>
        <th rowspan="2">Xếp loại</th>
        <th rowspan="2">Đánh giá / Nhận xét của giáo viên bộ môn</th>
      </tr>
      <tr>
        <th>Lần 1</th>
        <th>Lần 2</th>
        <th>Lần 3</th>
        <th>Lần 4</th>
        <th>Lần 5</th>
      </tr>
    </thead>
    <tbody>
      {{score_table_rows_html}}
    </tbody>
  </table>

  <table class="summary" aria-label="Kết quả học kỳ hoặc năm học">
    <tbody>
      <tr>
        <td style="width:25%"><strong>Điểm trung bình chung:</strong> {{gpa}}</td>
        <td style="width:25%"><strong>Kết quả rèn luyện:</strong> {{conduct}}</td>
        <td style="width:25%"><strong>Kết quả học tập:</strong> {{academic_performance}}</td>
        <td style="width:25%"><strong>Số ngày nghỉ:</strong> {{absence_days}}</td>
      </tr>
      <tr>
        <td style="width:25%" colspan="4"><strong>Nhận xét của giáo viên chủ nhiệm:</strong> {{homeroom_teacher_comment}}</td>
      </tr>
    </tbody>
  </table>
"""

DEFAULT_ACADEMIC_FOOTER = """
  <footer class="footer">
    <div class="footer-date">{{created_date_formatted}}</div>
    <div class="signature-row">
      <div class="signature">
        <div class="signature-title">NGƯỜI LẬP BẢNG KẾT QUẢ</div>
        <div class="signature-guide">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
        <div class="signature-name">{{created_by_name}}</div>
      </div>
      <div class="signature">
        <div class="signature-title">GIÁO VIÊN CHỦ NHIỆM</div>
        <div class="signature-guide">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
        <div class="signature-name">{{homeroom_teacher_name}}</div>
      </div>
      <div class="signature">
        <div class="signature-title">HIỆU TRƯỞNG</div>
        <div class="signature-guide">(Ký, ghi rõ họ tên và đóng dấu)</div>
        <div class="signature-space"></div>
        <div class="signature-name">{{principal_name}}</div>
      </div>
    </div>
  </footer>
</main>
"""

DEFAULT_ACADEMIC_STYLES = """
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Times New Roman", Times, serif;
  color: #000;
  background: #e9e9e9;
  font-size: 11pt;
  line-height: 1.25;
}
.toolbar {
  width: 297mm;
  margin: 14px auto 10px;
  display: flex;
  justify-content: flex-end;
}
.print-button {
  border: 0;
  border-radius: 4px;
  padding: 9px 16px;
  background: #174a7e;
  color: #fff;
  font: 600 13px Arial, sans-serif;
  cursor: pointer;
}
.page {
  width: 297mm;
  min-height: 210mm;
  margin: 0 auto 20px;
  padding: 10mm 12mm 8mm 15mm;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,.14);
}
.header {
  display: grid;
  grid-template-columns: 45% 55%;
  text-align: center;
  align-items: start;
  margin-bottom: 5mm;
}
.header p { margin: 0 0 3px; }
.agency-name { font-size: 10.5pt; text-transform: uppercase; }
.school-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
.national-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
.motto { font-size: 11.5pt; font-weight: bold; }
.rule { height: 1px; background: #000; margin: 4px auto 0; }
.rule-left { width: 115px; }
.rule-right { width: 160px; }
.doc-number { margin-top: 5px !important; font-size: 10pt; }
.title-block { text-align: center; margin: 0 0 4mm; }
h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
.period { margin: 3px 0 0; font-size: 11pt; font-style: italic; }
.student-info {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 3mm;
  font-size: 10.5pt;
}
.student-info td { padding: 3px 4px; vertical-align: top; }
.value { font-weight: bold; }
.score-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9pt;
  margin-bottom: 3mm;
}
.score-table col.subject-col { width: 18%; }
.score-table col.regular-col { width: 4.5%; }
.score-table col.exam-col { width: 5.5%; }
.score-table col.average-col { width: 8%; }
.score-table col.rank-col { width: 7%; }
.score-table col.comment-col { width: 33.5%; }
.score-table th, .score-table td {
  border: 1px solid #000;
  padding: 4px 3px;
  text-align: center;
  vertical-align: middle;
  overflow-wrap: anywhere;
  line-height: 1.15;
}
.score-table th { font-weight: bold; background: #f1f1f1; }
.score-table th:first-child, .score-table td:first-child {
  text-align: left;
  padding-left: 7px;
}
.score-table tbody td { height: 27px; }
.score-table .subject { font-weight: bold; }
.summary {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin: 3mm 0 4mm;
  font-size: 9.5pt;
}
.summary td { border: 1px solid #000; padding: 5px 6px; vertical-align: top; }
.footer {
  margin-top: 3mm;
}
.footer-date {
  text-align: right;
  font-size: 9.5pt;
  font-style: italic;
  margin-bottom: 5px;
}
.signature-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: start;
}
.notes { font-size: 9pt; padding-right: 8px; }
.notes p { margin: 0 0 3px; }
.signature { text-align: center; padding: 0 4px; }
.signature-title { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; }
.signature-guide { margin-top: 2px; font-size: 9pt; font-style: italic; }
.signature-space { height: 43px; }
.signature-name { font-size: 10.5pt; font-weight: bold; }
.disclaimer { margin-top: 3mm; font-size: 8pt; font-style: italic; color: #333; }
@media print {
  @page { size: A4 landscape; margin: 0; }
  html, body { width: 297mm; background: #fff; }
  .toolbar { display: none !important; }
  .page {
    width: 297mm;
    min-height: 210mm;
    margin: 0;
    padding: 8mm 12mm 7mm 15mm;
    box-shadow: none;
    page-break-inside: avoid;
  }
  .score-table th {
    background: #f1f1f1 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  tr, td, th { break-inside: avoid; }
}
@media screen and (max-width: 1100px) {
  .page, .toolbar { margin-left: 12px; margin-right: 12px; }
}
"""

DEFAULT_ACADEMIC_PLACEHOLDERS = [
    {"key": "school_parent_name", "label": "Cơ quan quản lý (Sở GD&ĐT...)"},
    {"key": "school_name", "label": "Tên trường học"},
    {"key": "doc_number", "label": "Số hiệu văn bản"},
    {"key": "academic_year", "label": "Năm học"},
    {"key": "semester_name", "label": "Học kỳ"},
    {"key": "student_name", "label": "Họ và tên học sinh"},
    {"key": "student_code", "label": "Mã định danh học sinh"},
    {"key": "date_of_birth", "label": "Ngày sinh"},
    {"key": "gender", "label": "Giới tính"},
    {"key": "class_name", "label": "Lớp học"},
    {"key": "place_of_birth", "label": "Nơi sinh"},
    {"key": "score_table_rows_html", "label": "Danh sách các dòng điểm môn học"},
    {"key": "gpa", "label": "Điểm trung bình chung"},
    {"key": "conduct", "label": "Kết quả rèn luyện"},
    {"key": "academic_performance", "label": "Kết quả học tập"},
    {"key": "absence_days", "label": "Số ngày nghỉ"},
    {"key": "homeroom_teacher_comment", "label": "Nhận xét của giáo viên chủ nhiệm"},
    {"key": "location_date_str", "label": "Địa danh, ngày tháng lập biểu"},
    {"key": "created_date_formatted", "label": "Ngày tháng định dạng"},
    {"key": "creator_name", "label": "Người lập bảng kết quả"},
    {"key": "homeroom_teacher_name", "label": "Giáo viên chủ nhiệm"},
    {"key": "principal_name", "label": "Hiệu trưởng"},
]

DEFAULT_ACADEMIC_SAMPLE_ROWS_HTML = """
<tr><td class="subject">Ngữ văn</td><td>8.0</td><td>8.5</td><td>8.0</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>8.4</td><td>Tốt</td><td>Tiếp thu bài nhanh, viết văn cảm xúc và mạch lạc</td></tr>
<tr><td class="subject">Toán</td><td>9.0</td><td>9.5</td><td>9.0</td><td>9.0</td><td>10.0</td><td>9.5</td><td>9.5</td><td>9.4</td><td>Tốt</td><td>Tư duy logic xuất sắc, tích cực xây dựng bài</td></tr>
<tr><td class="subject">Ngoại ngữ</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.5</td><td>9.0</td><td>8.7</td><td>Tốt</td><td>Phát âm chuẩn, vốn từ vựng phong phú</td></tr>
<tr><td class="subject">Vật lí</td><td>8.0</td><td>8.5</td><td>8.0</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>8.4</td><td>Tốt</td><td>Nắm chắc lý thuyết và làm bài tập tốt</td></tr>
<tr><td class="subject">Hóa học</td><td>8.5</td><td>8.0</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.6</td><td>Tốt</td><td>Hiểu bản chất hóa học, làm thí nghiệm cẩn thận</td></tr>
<tr><td class="subject">Sinh học</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>8.6</td><td>Tốt</td><td>Chăm chỉ, ghi nhớ tốt kiến thức sinh học</td></tr>
<tr><td class="subject">Lịch sử</td><td>8.0</td><td>8.5</td><td>8.0</td><td>8.5</td><td>8.5</td><td>8.0</td><td>8.5</td><td>8.3</td><td>Tốt</td><td>Nắm chắc dòng sự kiện lịch sử</td></tr>
<tr><td class="subject">Địa lí</td><td>8.5</td><td>8.0</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>8.5</td><td>Tốt</td><td>Sử dụng bản đồ và Atlat thành thạo</td></tr>
<tr><td class="subject">Giáo dục kinh tế và pháp luật</td><td>8.5</td><td>9.0</td><td>8.5</td><td>9.0</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.7</td><td>Tốt</td><td>Hiểu biết xã hội và pháp luật tốt</td></tr>
<tr><td class="subject">Tin học</td><td>9.5</td><td>9.0</td><td>9.5</td><td>9.5</td><td>10.0</td><td>9.5</td><td>9.5</td><td>9.5</td><td>Tốt</td><td>Kỹ năng tin học và lập trình rất tốt</td></tr>
<tr><td class="subject">Công nghệ</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.6</td><td>Tốt</td><td>Khéo tay, thực hành sản phẩm công nghệ tốt</td></tr>
<tr><td class="subject">Giáo dục thể chất</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Thể lực tốt, tích cực rèn luyện</td></tr>
<tr><td class="subject">Giáo dục quốc phòng và an ninh</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.5</td><td>9.0</td><td>8.5</td><td>8.6</td><td>Tốt</td><td>Ý thức kỷ luật cao, chấp hành nghiêm quy định</td></tr>
<tr><td class="subject">Hoạt động trải nghiệm, hướng nghiệp</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Đạt</td><td>Nhiệt tình tham gia hoạt động tập thể</td></tr>
""".strip()

DEFAULT_ACADEMIC_SAMPLE_DATA = {
    "filename_pattern": "Bang_Diem_{{class_name}}_{{student_code}}_{{academic_year}}",
    "school_parent_name": "THÀNH PHỐ HÀ NỘI",
    "school_name": "THPT CHUYÊN SCHOOLPRO",
    "doc_number": "124/BĐ-THPT",
    "academic_year": "2026 – 2027",
    "semester_name": "Học kỳ 1",
    "student_name": "Nguyễn Văn An",
    "student_code": "HS10A101",
    "date_of_birth": "15/09/2010",
    "gender": "Nam",
    "class_name": "10A1",
    "place_of_birth": "Hà Nội",
    "score_table_rows_html": DEFAULT_ACADEMIC_SAMPLE_ROWS_HTML,
    "gpa": "8.7",
    "conduct": "Tốt",
    "academic_performance": "Tốt",
    "absence_days": "0 buổi",
    "homeroom_teacher_comment": "Học sinh gương mẫu, chăm chỉ, có tư duy sáng tạo và ý thức kỷ luật rất tốt.",
    "location_date_str": "Hà Nội, ngày 18 tháng 10 năm 2026",
    "created_date_formatted": "Hà Nội, ngày 18 tháng 10 năm 2026",
    "creator_name": "ThS. Đỗ Văn Bình",
    "homeroom_teacher_name": "ThS. Hoàng Văn Nam",
    "principal_name": "TS. Lê Hồng Sơn",
}
