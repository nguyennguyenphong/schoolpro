"""
Dynamic Export & PDF Generation Service for Academic Student Leave Requests.
Integrates with "sys"."export_templates" (ExportTemplate model) so schools and admins
can deeply customize:
- Template name & filename pattern (e.g. Don_Xin_Nghi_Phep_{{code}}_{{student_code}})
- File format (PDF, HTML_PRINT, WORD)
- Page size (A4, A3, Letter), orientation (PORTRAIT, LANDSCAPE), and margins
- Custom CSS (style_content), HTML Header (header_content), Body (content), Footer (footer_content)
- Watermark text & dynamic {{placeholder}} interpolation
"""

import logging
import os
import re
from datetime import datetime
from html import escape
from io import BytesIO
from typing import Any

from django.utils import timezone

from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_LEAVE_REQUEST_CODE,
    DEFAULT_LEAVE_REQUEST_CONTENT,
    DEFAULT_LEAVE_REQUEST_FOOTER,
    DEFAULT_LEAVE_REQUEST_HEADER,
    DEFAULT_LEAVE_REQUEST_PLACEHOLDERS,
    DEFAULT_LEAVE_REQUEST_SAMPLE_DATA,
    DEFAULT_LEAVE_REQUEST_STYLES,
    ExportTemplateService,
)

logger = logging.getLogger(__name__)


class LeaveRequestPdfService:
    """
    Renders student leave request documents dynamically using ExportTemplate ("sys"."export_templates").
    Supports PDF, HTML_PRINT, and WORD formats with full placeholder and CSS/layout customization.
    """

    @classmethod
    def resolve_export_template(
        cls,
        school_id: Any = None,
        template_code: str | None = None,
        template_id: str | None = None,
    ) -> ExportTemplate:
        """
        Resolves the active ExportTemplate from "sys"."export_templates".
        Falls back to an in-memory ExportTemplate instance if database is unreachable.
        """
        try:
            tpl_service = ExportTemplateService()
            if template_id:
                found = tpl_service.repository.get_by_id(template_id)
                if found:
                    return found

            if template_code:
                found = tpl_service.repository.get_active_by_code(
                    code=template_code, school_id=school_id
                )
                if found:
                    return found

            return tpl_service.get_or_create_default_leave_request_template(school_id=school_id)
        except Exception as exc:
            logger.debug("Fallback to in-memory ExportTemplate for leave request: %s", exc)
            return ExportTemplate(
                code=template_code or DEFAULT_LEAVE_REQUEST_CODE,
                name="Mẫu Đơn Xin Phép Nghỉ Học A4 Chuẩn",
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

    @classmethod
    def build_template_context(
        cls,
        item: dict[str, Any],
        template: ExportTemplate | None = None,
    ) -> dict[str, Any]:
        """
        Builds a rich placeholder context dictionary from a formatted leave request item,
        merging any custom defaults from template.sample_data.
        """
        leave_type_labels = {
            "sick": "Nghỉ ốm / Khám chữa bệnh",
            "family_affair": "Việc gia đình",
            "bereavement": "Việc hiếu / Tang chế",
            "official_competition": "Thi đấu / Công tác trường",
            "other": "Lý do khác",
        }
        status_labels = {
            "pending": "Chờ phê duyệt",
            "approved": "Đã phê duyệt (Tự động)" if item.get("isAutoApproved") else "Đã phê duyệt",
            "rejected": "Từ chối phê duyệt",
            "cancelled": "Đã hủy đơn",
        }
        shift_labels = {
            "all_day": "Nghỉ cả ngày",
            "morning": "Nghỉ buổi sáng",
            "afternoon": "Nghỉ buổi chiều",
        }

        leave_type_text = leave_type_labels.get(str(item.get("leaveType") or ""), "Xin nghỉ phép")
        status_text = status_labels.get(
            str(item.get("status") or ""), str(item.get("status") or "")
        )
        shift_text = shift_labels.get(str(item.get("sessionShift") or ""), "Nghỉ cả ngày")

        def fmt_date(d_str: str) -> str:
            try:
                return datetime.strptime(d_str, "%Y-%m-%d").strftime("%d/%m/%Y")
            except ValueError:
                return d_str

        start_raw = str(item.get("startDate") or "")
        end_raw = str(item.get("endDate") or start_raw)
        start_fmt = fmt_date(start_raw)
        end_fmt = fmt_date(end_raw)
        date_range_text = (
            f"Ngày {start_fmt}"
            if start_raw == end_raw
            else f"Từ ngày {start_fmt} đến hết ngày {end_fmt}"
        )

        now_local = timezone.now().astimezone(timezone.get_current_timezone())
        created_dt = now_local
        if item.get("createdAt"):
            try:
                created_dt = datetime.strptime(str(item["createdAt"])[:16], "%Y-%m-%d %H:%M")
            except ValueError:
                created_dt = now_local

        created_date_admin = (
            f"Ngày {created_dt.strftime('%d')} tháng {created_dt.strftime('%m')} "
            f"năm {created_dt.strftime('%Y')}"
        )

        homeroom_name = str(item.get("homeroomTeacherName") or "Giáo viên chủ nhiệm")
        reviewer_name = str(item.get("reviewedByName") or homeroom_name)
        class_name = str(item.get("className") or "10A1")
        student_name = str(item.get("studentName") or "")
        student_code = str(item.get("studentCode") or "")
        guardian_name = str(item.get("guardianName") or "Phụ huynh học sinh")
        guardian_rel = str(item.get("guardianRelationship") or "Phụ huynh")
        guardian_phone = str(item.get("guardianPhone") or "")
        guardian_phone_suffix = (
            f" — SĐT: <strong>{escape(guardian_phone)}</strong>" if guardian_phone else ""
        )

        affected_subjects_str = (
            ", ".join(item.get("affectedSubjects") or []) or "Theo thời khóa biểu"
        )

        affected_lessons = item.get("affectedLessons") or []
        affected_lessons_table_html = ""
        if isinstance(affected_lessons, list) and affected_lessons:
            rows_html = []
            for idx, lesson in enumerate(affected_lessons, start=1):
                day_label = escape(str(lesson.get("dayOfWeekLabel") or ""))
                date_formatted = escape(fmt_date(str(lesson.get("date") or "")))
                period_num = escape(str(lesson.get("periodNumber") or ""))
                start_t = escape(str(lesson.get("startTime") or ""))
                end_t = escape(str(lesson.get("endTime") or ""))
                subj = escape(str(lesson.get("subjectName") or ""))
                teacher = escape(str(lesson.get("teacherName") or ""))
                time_str = (
                    f"Tiết {period_num} ({start_t}-{end_t})"
                    if start_t and end_t
                    else f"Tiết {period_num}"
                )
                rows_html.append(
                    f"<tr>"
                    f"<td style='border:1px solid #777;padding:5px 8px;text-align:center;'>{idx}</td>"
                    f"<td style='border:1px solid #777;padding:5px 8px;'>{day_label} ({date_formatted})</td>"
                    f"<td style='border:1px solid #777;padding:5px 8px;text-align:center;'>{time_str}</td>"
                    f"<td style='border:1px solid #777;padding:5px 8px;font-weight:bold;'>{subj}</td>"
                    f"<td style='border:1px solid #777;padding:5px 8px;'>{teacher}</td>"
                    f"</tr>"
                )
            affected_lessons_table_html = (
                "<div style='margin:10px 0 14px 0;'>"
                "<div style='font-weight:bold;font-size:13pt;margin-bottom:6px;'>Chi tiết các tiết học xin nghỉ theo Thời khóa biểu:</div>"
                "<table class='lr-timetable-table' style='width:100%;border-collapse:collapse;font-size:12pt;font-family:\"Times New Roman\",Times,serif;'>"
                "<thead><tr style='background:#f4f4f4;'>"
                "<th style='border:1px solid #777;padding:6px 8px;width:40px;text-align:center;'>STT</th>"
                "<th style='border:1px solid #777;padding:6px 8px;text-align:left;'>Thứ / Ngày</th>"
                "<th style='border:1px solid #777;padding:6px 8px;text-align:center;'>Tiết / Khung giờ</th>"
                "<th style='border:1px solid #777;padding:6px 8px;text-align:left;'>Môn học</th>"
                "<th style='border:1px solid #777;padding:6px 8px;text-align:left;'>Giáo viên bộ môn</th>"
                "</tr></thead>"
                f"<tbody>{''.join(rows_html)}</tbody></table></div>"
            )

        reason_raw = str(item.get("reason") or "")
        reason_html = escape(reason_raw).replace("\n", "<br/>")

        commitment_raw = str(
            item.get("commitment")
            or "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học."
        )
        commitment_html = escape(commitment_raw).replace("\n", "<br/>")

        teacher_note_raw = str(item.get("teacherNote") or "")
        teacher_note_block_html = ""
        if teacher_note_raw:
            note_escaped = escape(teacher_note_raw).replace("\n", "<br/>")
            teacher_note_block_html = (
                f"<div class='lr-section-block'>"
                f"<div class='lr-section-title'>Ý kiến phê duyệt ({escape(reviewer_name)}):</div>"
                f"<div class='lr-section-body'><i>\"{note_escaped}\"</i></div>"
                f"</div>"
            )

        sample = (
            template.sample_data
            if (template and isinstance(template.sample_data, dict))
            else DEFAULT_LEAVE_REQUEST_SAMPLE_DATA
        )
        school_name = str(
            (template.school.name.upper() if (template and template.school) else None)
            or sample.get("school_name")
            or "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO"
        )
        school_name_title = str(
            (template.school.name if (template and template.school) else None)
            or sample.get("school_name_title")
            or "Trường Trung học phổ thông SchoolPro"
        )
        document_title = str(sample.get("document_title") or "ĐƠN XIN PHÉP NGHỈ HỌC")

        code_clean = str(item.get("code") or item.get("requestCode") or "DON").replace("#", "")

        student_dob = str(
            item.get("studentDob")
            or item.get("student_dob")
            or sample.get("student_dob")
            or "........................."
        )

        status_lower = str(item.get("status") or "").lower()
        if status_lower == "approved":
            approval_checkboxes = "☑ Đồng ý cho nghỉ học &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ Không đồng ý"
        elif status_lower == "rejected":
            approval_checkboxes = "☐ Đồng ý cho nghỉ học &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☑ Không đồng ý"
        else:
            approval_checkboxes = "☐ Đồng ý cho nghỉ học &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☐ Không đồng ý"

        teacher_note_display = (
            escape(teacher_note_raw)
            if teacher_note_raw
            else "......................................................................................................................."
        )

        return {
            **sample,
            "title": f"{document_title} - {code_clean}",
            "document_title": document_title,
            "school_name": school_name,
            "school_name_title": school_name_title,
            "code": code_clean,
            "class_name": class_name,
            "created_date_admin": created_date_admin,
            "leave_type": str(item.get("leaveType") or ""),
            "leave_type_label": leave_type_text,
            "status": str(item.get("status") or ""),
            "status_label": status_text,
            "session_shift": str(item.get("sessionShift") or "all_day"),
            "session_shift_label": shift_text,
            "homeroom_teacher_name": homeroom_name,
            "homeroom_teacher_email": str(item.get("homeroomTeacherEmail") or ""),
            "reviewer_name": reviewer_name,
            "reviewed_at": str(item.get("reviewedAt") or ""),
            "student_name": student_name,
            "student_code": student_code,
            "student_dob": student_dob,
            "guardian_name": guardian_name,
            "guardian_relationship": guardian_rel,
            "guardian_phone": guardian_phone,
            "guardian_phone_suffix": guardian_phone_suffix,
            "start_date": start_fmt,
            "end_date": end_fmt,
            "date_range_text": date_range_text,
            "total_days": item.get("totalDays", 1),
            "affected_subjects": affected_subjects_str,
            "affected_lessons_table_html": affected_lessons_table_html,
            "reason": reason_raw,
            "reason_html": reason_html,
            "commitment": commitment_raw,
            "commitment_html": commitment_html,
            "teacher_note": teacher_note_raw,
            "teacher_note_display": teacher_note_display,
            "teacher_note_block_html": teacher_note_block_html,
            "approval_checkboxes": approval_checkboxes,
            "template_code": template.code if template else DEFAULT_LEAVE_REQUEST_CODE,
            "template_name": template.name if template else "Mẫu Đơn Xin Phép Nghỉ Học A4 Chuẩn",
            "exported_at": now_local.strftime("%H:%M %d/%m/%Y"),
        }

    @classmethod
    def render_html_from_item(
        cls,
        item: dict[str, Any],
        school_id: Any = None,
        template_code: str | None = None,
        template_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Renders the leave request into a complete HTML document using the resolved ExportTemplate
        from "sys"."export_templates", including custom CSS, margins, page size, and filename.
        """
        template = cls.resolve_export_template(
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
        )
        context = cls.build_template_context(item, template=template)
        rendered_html = template.render_html(context)
        filename = template.resolve_filename(
            context=context,
            default_prefix="Don_Xin_Nghi_Phep",
        )
        return {
            "html": rendered_html,
            "filename": filename,
            "fileFormat": template.file_format,
            "templateId": str(template.id) if template.id else "",
            "templateCode": template.code,
            "templateName": template.name,
            "pageSize": template.page_size,
            "pageOrientation": template.page_orientation,
            "margins": template.margins,
        }

    @classmethod
    def register_vietnamese_fonts(cls) -> tuple[str, str, str]:
        """
        Registers Unicode TTF fonts (Times New Roman / DejaVu / Arial) with ReportLab
        so Vietnamese diacritics render accurately in generated PDF files.
        """
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont

        registered = pdfmetrics.getRegisteredFontNames()
        if "VN-Serif" in registered and "VN-Serif-Bold" in registered:
            return "VN-Serif", "VN-Serif-Bold", "VN-Serif-Italic"

        candidates = [
            (
                "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
                "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
                "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
            ),
            (
                "/System/Library/Fonts/Supplemental/Arial.ttf",
                "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                "/System/Library/Fonts/Supplemental/Arial Italic.ttf",
            ),
            (
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            ),
            (
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
            ),
        ]

        for reg_path, bold_path, italic_path in candidates:
            if os.path.exists(reg_path):
                pdfmetrics.registerFont(TTFont("VN-Serif", reg_path))
                pdfmetrics.registerFont(
                    TTFont("VN-Serif-Bold", bold_path if os.path.exists(bold_path) else reg_path)
                )
                pdfmetrics.registerFont(
                    TTFont(
                        "VN-Serif-Italic",
                        italic_path if os.path.exists(italic_path) else reg_path,
                    )
                )
                return "VN-Serif", "VN-Serif-Bold", "VN-Serif-Italic"

        return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"

    @staticmethod
    def _parse_mm(val: Any, default_mm: float) -> float:
        if val is None:
            return default_mm
        match = re.search(r"(\d+(?:\.\d+)?)", str(val))
        return float(match.group(1)) if match else default_mm

    @classmethod
    def export_from_item(
        cls,
        item: dict[str, Any],
        school_id: Any = None,
        template_code: str | None = None,
        template_id: str | None = None,
        output_format: str | None = None,
    ) -> tuple[bytes, str, str]:
        """
        Exports a leave request document based on the dynamic ExportTemplate in "sys"."export_templates".
        Supports output_format: 'PDF', 'HTML_PRINT'/'HTML', 'WORD'/'DOC'.
        Returns (file_bytes, filename, content_type).
        """
        template = cls.resolve_export_template(
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
        )
        context = cls.build_template_context(item, template=template)

        target_format = (output_format or template.file_format or FileFormat.PDF).strip().upper()

        if target_format in ("HTML", "HTML_PRINT"):
            html_str = template.render_html(context)
            filename = template.resolve_filename(
                context=context,
                extension_override="html",
                default_prefix="Don_Xin_Nghi_Phep",
            )
            return html_str.encode("utf-8"), filename, "text/html; charset=utf-8"

        if target_format in ("WORD", "DOC", "DOCX"):
            html_str = template.render_html(context)
            word_doc = html_str.replace(
                '<html lang="vi">',
                '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
                'xmlns:w="urn:schemas-microsoft-com:office:word" '
                'xmlns="http://www.w3.org/TR/REC-html40" lang="vi">',
            )
            filename = template.resolve_filename(
                context=context,
                extension_override="doc",
                default_prefix="Don_Xin_Nghi_Phep",
            )
            return word_doc.encode("utf-8"), filename, "application/msword"

        html_str = template.render_html(context)
        filename = template.resolve_filename(
            context=context,
            extension_override="pdf",
            default_prefix="Don_Xin_Nghi_Phep",
        )
        try:
            import weasyprint

            pdf_bytes = weasyprint.HTML(string=html_str).write_pdf()
            return pdf_bytes, filename, "application/pdf"
        except Exception as exc:
            logger.warning(
                "WeasyPrint conversion failed for %s, falling back to ReportLab: %s",
                filename,
                exc,
            )
            pdf_bytes, filename = cls.render_pdf_from_item(
                item=item,
                template=template,
                context=context,
            )
            return pdf_bytes, filename, "application/pdf"

    @classmethod
    def render_pdf_from_item(
        cls,
        item: dict[str, Any],
        template: ExportTemplate | None = None,
        context: dict[str, Any] | None = None,
    ) -> tuple[bytes, str]:
        """
        Renders an official Vietnamese administrative PDF document from a formatted
        leave request item dictionary, honoring the ExportTemplate's page size, orientation,
        margins, title, school name, watermark, and filename pattern.
        Returns (pdf_bytes, filename).
        """
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
        from reportlab.lib.pagesizes import A3, A4, LETTER, landscape, portrait
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

        resolved_tpl = template or cls.resolve_export_template()
        ctx = context or cls.build_template_context(item, template=resolved_tpl)
        font_reg, font_bold, font_italic = cls.register_vietnamese_fonts()

        page_size_map = {
            "A4": A4,
            "A3": A3,
            "LETTER": LETTER,
        }
        base_page_size = page_size_map.get((resolved_tpl.page_size or "A4").upper(), A4)
        is_landscape = (resolved_tpl.page_orientation or "PORTRAIT").upper() == "LANDSCAPE"
        final_page_size = landscape(base_page_size) if is_landscape else portrait(base_page_size)

        margins = resolved_tpl.margins if isinstance(resolved_tpl.margins, dict) else {}
        top_mm = cls._parse_mm(margins.get("top"), 18.0)
        right_mm = cls._parse_mm(margins.get("right"), 18.0)
        bottom_mm = cls._parse_mm(margins.get("bottom"), 18.0)
        left_mm = cls._parse_mm(margins.get("left"), 22.0)

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=final_page_size,
            leftMargin=left_mm * mm,
            rightMargin=right_mm * mm,
            topMargin=top_mm * mm,
            bottomMargin=bottom_mm * mm,
            title=str(ctx.get("title") or f"Đơn xin phép nghỉ học - {ctx.get('code')}"),
        )

        style_center = ParagraphStyle(
            "VNCenter",
            fontName=font_reg,
            fontSize=11.5,
            leading=16,
            alignment=TA_CENTER,
        )
        style_center_bold = ParagraphStyle(
            "VNCenterBold",
            fontName=font_bold,
            fontSize=11.5,
            leading=16,
            alignment=TA_CENTER,
        )
        style_right_italic = ParagraphStyle(
            "VNRightItalic",
            fontName=font_italic,
            fontSize=11.5,
            leading=16,
            alignment=TA_RIGHT,
        )
        style_title = ParagraphStyle(
            "VNTitle",
            fontName=font_bold,
            fontSize=16,
            leading=22,
            alignment=TA_CENTER,
        )
        style_subtitle = ParagraphStyle(
            "VNSubtitle",
            fontName=font_italic,
            fontSize=11,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#374151"),
        )
        style_body = ParagraphStyle(
            "VNBody",
            fontName=font_reg,
            fontSize=11.5,
            leading=17,
            alignment=TA_JUSTIFY,
        )
        style_body_bold = ParagraphStyle(
            "VNBodyBold",
            fontName=font_bold,
            fontSize=11.5,
            leading=17,
        )

        story: list[Any] = []

        # 1. Header Table (Dynamic School Name & National Motto from ExportTemplate context)
        header_data = [
            [
                Paragraph(escape(str(ctx.get("school_name") or "")), style_center_bold),
                Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", style_center_bold),
            ],
            [
                Paragraph(
                    f"LỚP: <b>{escape(str(ctx.get('class_name') or '10A1'))}</b><br/>"
                    f"<font size='10'>Mã đơn: {escape(str(ctx.get('code') or ''))}</font>",
                    style_center,
                ),
                Paragraph("<u>Độc lập - Tự do - Hạnh phúc</u>", style_center_bold),
            ],
        ]
        header_table = Table(header_data, colWidths=[72 * mm, 98 * mm])
        header_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(header_table)
        story.append(Spacer(1, 3 * mm))

        # 2. Date Line
        story.append(
            Paragraph(
                escape(str(ctx.get("created_date_admin") or "")),
                style_right_italic,
            )
        )
        story.append(Spacer(1, 3 * mm))

        # 3. Title (Dynamic document_title from ExportTemplate)
        story.append(
            Paragraph(
                escape(str(ctx.get("document_title") or "ĐƠN XIN PHÉP NGHỈ HỌC")),
                style_title,
            )
        )
        story.append(
            Paragraph(
                f"(Phân loại: {escape(str(ctx.get('leave_type_label') or ''))} • "
                f"Trạng thái: {escape(str(ctx.get('status_label') or ''))})",
                style_subtitle,
            )
        )
        story.append(Spacer(1, 4 * mm))

        # 4. Salutation
        homeroom_name = escape(str(ctx.get("homeroom_teacher_name") or "Giáo viên chủ nhiệm"))
        class_name = escape(str(ctx.get("class_name") or "10A1"))
        school_name_title = escape(
            str(ctx.get("school_name_title") or "Trường Trung học phổ thông SchoolPro")
        )
        story.append(
            Paragraph(
                f"<b>Kính gửi:</b> - Ban Giám hiệu {school_name_title}",
                style_body,
            )
        )
        story.append(
            Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"- Thầy/Cô Giáo viên chủ nhiệm lớp {class_name}: <b>{homeroom_name}</b> (Người xét duyệt)",
                style_body,
            )
        )
        story.append(
            Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"- Quý Thầy/Cô giáo bộ môn giảng dạy lớp {class_name}",
                style_body,
            )
        )
        story.append(Spacer(1, 3 * mm))

        # 5. Student & Guardian Info
        student_name = escape(str(ctx.get("student_name") or ""))
        student_code = escape(str(ctx.get("student_code") or ""))
        guardian_name = escape(str(ctx.get("guardian_name") or "Phụ huynh học sinh"))
        guardian_rel = escape(str(ctx.get("guardian_relationship") or "Phụ huynh"))
        guardian_phone = escape(str(ctx.get("guardian_phone") or ""))

        story.append(
            Paragraph(
                f"Em tên là: <b>{student_name}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"Mã số học sinh: <b>{student_code}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"Lớp: <b>{class_name}</b>",
                style_body,
            )
        )
        guardian_line = f"Họ và tên Phụ huynh xác nhận: <b>{guardian_name}</b> ({guardian_rel})"
        if guardian_phone:
            guardian_line += f" — SĐT: <b>{guardian_phone}</b>"
        story.append(Paragraph(guardian_line, style_body))
        story.append(Spacer(1, 3 * mm))

        # 6. Leave Request Details Box
        story.append(
            Paragraph(
                "Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:",
                style_body,
            )
        )
        story.append(Spacer(1, 2 * mm))

        info_rows = [
            [
                Paragraph("<b>Thời gian xin nghỉ:</b>", style_body),
                Paragraph(escape(str(ctx.get("date_range_text") or "")), style_body),
            ],
            [
                Paragraph("<b>Số ngày &amp; Ca nghỉ:</b>", style_body),
                Paragraph(
                    f"<b>{ctx.get('total_days', 1)} ngày</b> "
                    f"({escape(str(ctx.get('session_shift_label') or ''))})",
                    style_body,
                ),
            ],
            [
                Paragraph("<b>Các môn học xin nghỉ:</b>", style_body),
                Paragraph(escape(str(ctx.get("affected_subjects") or "")), style_body),
            ],
        ]
        info_table = Table(info_rows, colWidths=[48 * mm, 122 * mm])
        info_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        story.append(info_table)
        story.append(Spacer(1, 3 * mm))

        # 7. Reason & Commitment
        story.append(Paragraph("<b>Lý do xin nghỉ học chi tiết:</b>", style_body_bold))
        story.append(Paragraph(str(ctx.get("reason_html") or ""), style_body))
        story.append(Spacer(1, 2.5 * mm))

        story.append(Paragraph("<b>Lời hứa và cam kết của học sinh:</b>", style_body_bold))
        story.append(Paragraph(str(ctx.get("commitment_html") or ""), style_body))
        story.append(Spacer(1, 3 * mm))

        if ctx.get("teacher_note"):
            reviewer = escape(str(ctx.get("reviewer_name") or homeroom_name))
            note_html = escape(str(ctx.get("teacher_note"))).replace("\n", "<br/>")
            story.append(
                Paragraph(
                    f"<b>Ý kiến phê duyệt ({reviewer}):</b>",
                    style_body_bold,
                )
            )
            story.append(Paragraph(f'<i>"{note_html}"</i>', style_body))
            story.append(Spacer(1, 3 * mm))

        story.append(Spacer(1, 4 * mm))

        # 8. Signature Block
        reviewer_display = escape(str(ctx.get("reviewer_name") or ""))
        status_label_escaped = escape(str(ctx.get("status_label") or ""))
        sig_data = [
            [
                Paragraph("<b>XÁC NHẬN CỦA PHỤ HUYNH</b>", style_center_bold),
                Paragraph("<b>GIÁO VIÊN CHỦ NHIỆM</b>", style_center_bold),
                Paragraph("<b>HỌC SINH LÀM ĐƠN</b>", style_center_bold),
            ],
            [
                Paragraph("<i>(Ký và ghi rõ họ tên)</i>", style_subtitle),
                Paragraph(f"<i>({status_label_escaped})</i>", style_subtitle),
                Paragraph("<i>(Ký và ghi rõ họ tên)</i>", style_subtitle),
            ],
            [
                Spacer(1, 16 * mm),
                Spacer(1, 16 * mm),
                Spacer(1, 16 * mm),
            ],
            [
                Paragraph(f"<b>{guardian_name}</b>", style_center_bold),
                Paragraph(f"<b>{reviewer_display}</b>", style_center_bold),
                Paragraph(f"<b>{student_name}</b>", style_center_bold),
            ],
        ]
        sig_table = Table(sig_data, colWidths=[56 * mm, 58 * mm, 56 * mm])
        sig_table.setStyle(
            TableStyle(
                [
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(sig_table)
        story.append(Spacer(1, 6 * mm))

        story.append(
            Paragraph(
                f"<font size='9' color='#64748B'>Trích xuất từ Hệ thống Quản lý Học vụ SchoolPro • "
                f"Mã đơn: {escape(str(ctx.get('code') or ''))} • "
                f"Biểu mẫu: {escape(str(ctx.get('template_code') or ''))} • "
                f"Thời gian xuất: {escape(str(ctx.get('exported_at') or ''))}</font>",
                style_center,
            )
        )

        watermark_text = (
            resolved_tpl.interpolate_text(resolved_tpl.watermark_text, ctx)
            if resolved_tpl.watermark_text
            else ""
        )

        def draw_watermark(canvas_obj: Any, doc_obj: Any) -> None:
            if not watermark_text:
                return
            canvas_obj.saveState()
            canvas_obj.setFont(font_bold, 38)
            canvas_obj.setFillColor(colors.Color(0.4, 0.45, 0.52, alpha=0.08))
            width, height = final_page_size
            canvas_obj.translate(width / 2.0, height / 2.0)
            canvas_obj.rotate(35)
            canvas_obj.drawCentredString(0, 0, watermark_text)
            canvas_obj.restoreState()

        doc.build(story, onFirstPage=draw_watermark, onLaterPages=draw_watermark)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        filename = resolved_tpl.resolve_filename(
            context=ctx,
            extension_override="pdf",
            default_prefix="Don_Xin_Nghi_Phep",
        )
        return pdf_bytes, filename
