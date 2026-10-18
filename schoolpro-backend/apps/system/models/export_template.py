"""
ExportTemplate Model.

Database Table: "sys_export_templates"
Description: Customizable document & export file templates (HTML/PDF/Excel/Word)
with relational links to School, Department, and User authors.
"""

import re
from typing import Any

from django.db import models

from common.models.base import BaseModel


class TemplateType(models.TextChoices):
    """Business domain category for the export template."""

    ANNOUNCEMENT = "ANNOUNCEMENT", "Thông báo & Công văn"
    LEAVE_REQUEST = "LEAVE_REQUEST", "Đơn xin nghỉ phép"
    ACADEMIC = "ACADEMIC", "Bảng điểm"
    STUDENT_PROFILE = "STUDENT_PROFILE", "Hồ sơ học sinh"
    ATTENDANCE = "ATTENDANCE", "Điểm danh"
    GRATEBOOK = "GRATEBOOK", "Sổ liên lạc điện tử"
    EMULATION = "EMULATION", "Thi đua & Khen thưởng"
    FEE_RECEIPT = "FEE_RECEIPT", "Biên lai & Học phí"
    PROFILE = "PROFILE", "Hồ sơ"
    GENERAL = "GENERAL", "Biểu mẫu chung"


class FileFormat(models.TextChoices):
    """Output target file format."""

    HTML_PRINT = "HTML_PRINT", "In ấn HTML / Trình duyệt"
    PDF = "PDF", "Tài liệu PDF"
    EXCEL = "EXCEL", "Bảng tính Excel"
    WORD = "WORD", "Văn bản Word"


class ExportTemplate(BaseModel):
    """
    ExportTemplate Model.

    Stores customizable document templates for PDF printing, Excel export,
    and administrative notices. Allows future modifications per school or department.
    """

    # Relational links
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="export_templates",
        null=True,
        blank=True,
        help_text="Trường học sở hữu template (null = template mặc định toàn hệ thống)",
    )
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="export_templates",
        null=True,
        blank=True,
        help_text="Đơn vị / Phòng ban chuyên môn sở hữu biểu mẫu (null = áp dụng toàn trường)",
    )
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="created_by",
        related_name="created_export_templates",
        null=True,
        blank=True,
        help_text="Người dùng tạo biểu mẫu",
    )
    updated_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="updated_by",
        related_name="updated_export_templates",
        null=True,
        blank=True,
        help_text="Người dùng cập nhật biểu mẫu gần nhất",
    )

    # Identifiers & Metadata
    code = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text="Mã định danh duy nhất (VD: ANNOUNCEMENT_OFFICIAL_A4, LEAVE_REQUEST_OFFICIAL_A4)",
    )
    name = models.CharField(
        max_length=255,
        help_text="Tên biểu mẫu hiển thị (VD: Mẫu thông báo công văn chuẩn A4)",
    )
    description = models.TextField(
        null=True,
        blank=True,
        help_text="Mô tả mục đích sử dụng và hướng dẫn chỉnh sửa biểu mẫu",
    )
    template_type = models.CharField(
        max_length=50,
        choices=TemplateType.choices,
        default=TemplateType.ANNOUNCEMENT,
        db_index=True,
        help_text="Phân loại nghiệp vụ của biểu mẫu",
    )
    file_format = models.CharField(
        max_length=20,
        choices=FileFormat.choices,
        default=FileFormat.HTML_PRINT,
        help_text="Định dạng tệp tin xuất ra",
    )
    version = models.SmallIntegerField(
        default=1,
        help_text="Phiên bản của biểu mẫu",
    )
    watermark_text = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Chữ in chìm bảo mật",
    )
    include_digital_stamp = models.BooleanField(
        default=True,
        help_text="Nhúng con dấu điện tử của nhà trường",
    )
    include_qr_verification = models.BooleanField(
        default=True,
        help_text="Nhúng mã QR xác thực văn bản",
    )

    # Template Content & Styles
    content = models.TextField(
        help_text="Nội dung chính biểu mẫu (hỗ trợ các biến placeholder {{ten_bien}})",
    )
    header_content = models.TextField(
        null=True,
        blank=True,
        help_text="Đầu đề văn bản: Quốc hiệu, tên trường, cơ quan cấp trên, số hiệu",
    )
    footer_content = models.TextField(
        null=True,
        blank=True,
        help_text="Chân trang văn bản: Nơi nhận, người ký duyệt, mã tra cứu",
    )
    style_content = models.TextField(
        null=True,
        blank=True,
        help_text="CSS định dạng in ấn (@page, font, cỡ chữ, căn lề văn bản)",
    )

    # Page layout configuration
    page_size = models.CharField(
        max_length=20,
        default="A4",
        help_text="Khổ giấy (A4, A3, Letter)",
    )
    page_orientation = models.CharField(
        max_length=20,
        default="PORTRAIT",
        help_text="Hướng trang (PORTRAIT: Dọc, LANDSCAPE: Ngang)",
    )
    margins = models.JSONField(
        default=dict,
        blank=True,
        help_text="Cấu hình lề trang in (top, bottom, left, right)",
    )

    # Variable placeholders schema & sample preview data
    placeholders_schema = models.JSONField(
        default=list,
        blank=True,
        help_text="Danh mục các biến hỗ trợ trong template: [{'key': 'title', 'label': 'Tiêu đề'}]",
    )
    sample_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Dữ liệu mẫu json để render kiểm tra giao diện",
    )

    # Status flags
    is_default = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Đánh dấu là mẫu mặc định cho loại tài liệu này của trường",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Trạng thái kích hoạt sử dụng",
    )

    class Meta:
        managed = False
        db_table = '"sys"."export_templates"'
        verbose_name = "Export Template"
        verbose_name_plural = "Export Templates"
        ordering = ["-is_default", "name"]
        indexes = [
            models.Index(fields=["code", "school"]),
            models.Index(fields=["template_type", "is_active"]),
        ]

    def __str__(self) -> str:
        school_suffix = f" [{self.school.name}]" if self.school else " [Toàn hệ thống]"
        return f"{self.name} ({self.code}){school_suffix}"

    def __repr__(self) -> str:
        return f"<ExportTemplate {self.pk}: {self.code}>"

    def interpolate_text(self, raw_text: str, context: dict[str, Any] | None = None) -> str:
        """
        Replaces {{ placeholder }} variables in raw_text using sample_data + context.
        """
        if not raw_text:
            return ""
        ctx = context or {}
        sample = self.sample_data if isinstance(self.sample_data, dict) else {}
        merged_context: dict[str, Any] = {**sample, **ctx}

        def replace_placeholder(match: re.Match) -> str:
            raw_key = match.group(1).strip()
            val: Any = merged_context
            for part in raw_key.split("."):
                if isinstance(val, dict):
                    val = val.get(part, "")
                else:
                    val = getattr(val, part, "")
            return str(val) if val is not None else ""

        pattern = re.compile(r"\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}")
        return pattern.sub(replace_placeholder, raw_text)

    def resolve_filename(
        self,
        context: dict[str, Any] | None = None,
        extension_override: str | None = None,
        default_prefix: str = "Tai_Lieu",
    ) -> str:
        """
        Resolves output filename dynamically based on template configuration:
        - Checks sample_data.get('filename_pattern') or context.get('filename_pattern')
        - Interpolates {{code}}, {{student_code}}, etc.
        - Appends appropriate extension based on extension_override or self.file_format.
        """
        ctx = context or {}
        sample = self.sample_data if isinstance(self.sample_data, dict) else {}
        merged = {**sample, **ctx}

        ext_map = {
            FileFormat.PDF: "pdf",
            FileFormat.HTML_PRINT: "html",
            FileFormat.WORD: "doc",
            FileFormat.EXCEL: "xlsx",
        }
        ext = (extension_override or ext_map.get(self.file_format, "pdf")).lstrip(".").lower()

        raw_pattern = (
            merged.get("filename_pattern")
            or sample.get("filename_pattern")
            or f"{default_prefix}_{{{{code}}}}"
        )
        interpolated = self.interpolate_text(str(raw_pattern), merged).strip()
        safe_base = re.sub(r'[\\/*?:"<>|#\s]+', "_", interpolated).strip("_") or default_prefix
        if safe_base.lower().endswith(f".{ext}"):
            return safe_base
        return f"{safe_base}.{ext}"

    def render_html(self, context: dict[str, Any] | None = None) -> str:
        """
        Renders the full HTML document by merging styles, header, content, and footer,
        and replacing placeholder tags {{variable_name}} with context values.
        """
        ctx = context or {}
        sample = self.sample_data if isinstance(self.sample_data, dict) else {}
        merged_context: dict[str, Any] = {**sample, **ctx}
        margins = self.margins if isinstance(self.margins, dict) else {}

        watermark_html = ""
        if self.watermark_text:
            wm_text = self.interpolate_text(self.watermark_text, merged_context)
            watermark_html = (
                f'<div class="export-watermark" style="position: fixed; top: 45%; left: 50%; '
                f"transform: translate(-50%, -50%) rotate(-35deg); font-size: 44pt; "
                f"color: rgba(100, 116, 139, 0.09); font-weight: bold; white-space: nowrap; "
                f'pointer-events: none; z-index: 0;">{wm_text}</div>'
            )

        full_template = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>{merged_context.get("title", self.name)}</title>
  <style>
    @page {{
      size: {self.page_size or "A4"} {(self.page_orientation or "PORTRAIT").lower()};
      margin: {margins.get("top", "20mm")} {margins.get("right", "15mm")} {margins.get("bottom", "20mm")} {margins.get("left", "20mm")};
    }}
    * {{
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }}
    body {{
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.45;
      color: #000;
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }}
    {self.style_content or ""}
  </style>
</head>
<body>
  {watermark_html}
  <div class="print-container" style="position: relative; z-index: 1;">
    {self.header_content or ""}
    {self.content or ""}
    {self.footer_content or ""}
  </div>
</body>
</html>"""

        return self.interpolate_text(full_template, merged_context)
