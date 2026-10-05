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
        return {
            "html": rendered_html,
            "template_id": template.id,
            "template_code": template.code,
            "template_name": template.name,
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
