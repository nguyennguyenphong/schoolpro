"""
PDF generation service for Academic Student Leave Requests.
Handles Unicode TTF font registration (Times New Roman / DejaVu / Arial)
and renders official A4 Vietnamese administrative leave request documents.
"""

import os
from datetime import datetime
from html import escape
from io import BytesIO
from typing import Any

from django.utils import timezone


class LeaveRequestPdfService:
    """
    Renders A4 Vietnamese PDF documents for student leave requests.
    """

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

    @classmethod
    def render_pdf_from_item(cls, item: dict[str, Any]) -> tuple[bytes, str]:
        """
        Renders an official A4 Vietnamese administrative PDF document from a formatted
        leave request item dictionary.
        Returns (pdf_bytes, filename).
        """
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

        font_reg, font_bold, font_italic = cls.register_vietnamese_fonts()

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

        leave_type_text = leave_type_labels.get(item["leaveType"], "Xin nghỉ phép")
        status_text = status_labels.get(item["status"], item["status"])
        shift_text = shift_labels.get(item["sessionShift"], "Nghỉ cả ngày")

        def fmt_date(d_str: str) -> str:
            try:
                return datetime.strptime(d_str, "%Y-%m-%d").strftime("%d/%m/%Y")
            except ValueError:
                return d_str

        start_fmt = fmt_date(item["startDate"])
        end_fmt = fmt_date(item["endDate"])
        date_range_text = (
            f"Ngày {start_fmt}"
            if item["startDate"] == item["endDate"]
            else f"Từ ngày {start_fmt} đến hết ngày {end_fmt}"
        )

        now_local = timezone.now().astimezone(timezone.get_current_timezone())
        created_dt = now_local
        if item.get("createdAt"):
            try:
                created_dt = datetime.strptime(item["createdAt"][:16], "%Y-%m-%d %H:%M")
            except ValueError:
                created_dt = now_local

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=22 * mm,
            rightMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=f"Đơn xin phép nghỉ học - {item['code']}",
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

        # 1. Header Table (School Name & National Motto)
        header_data = [
            [
                Paragraph("TRƯỜNG Trung học phổ thông SCHOOLPRO", style_center_bold),
                Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", style_center_bold),
            ],
            [
                Paragraph(
                    f"LỚP: <b>{escape(str(item.get('className') or '10A1'))}</b><br/>"
                    f"<font size='10'>Mã đơn: {escape(str(item.get('code') or ''))}</font>",
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
                f"Ngày {created_dt.strftime('%d')} tháng {created_dt.strftime('%m')} năm {created_dt.strftime('%Y')}",
                style_right_italic,
            )
        )
        story.append(Spacer(1, 3 * mm))

        # 3. Title
        story.append(Paragraph("ĐƠN XIN PHÉP NGHỈ HỌC", style_title))
        story.append(
            Paragraph(
                f"(Phân loại: {escape(leave_type_text)} • Trạng thái: {escape(status_text)})",
                style_subtitle,
            )
        )
        story.append(Spacer(1, 4 * mm))

        # 4. Salutation
        homeroom_name = escape(str(item.get("homeroomTeacherName") or "Giáo viên chủ nhiệm"))
        class_name = escape(str(item.get("className") or "10A1"))
        story.append(
            Paragraph(
                "<b>Kính gửi:</b> - Ban Giám hiệu Trường Trung học phổ thông SchoolPro",
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
        student_name = escape(str(item.get("studentName") or ""))
        student_code = escape(str(item.get("studentCode") or ""))
        guardian_name = escape(str(item.get("guardianName") or "Phụ huynh học sinh"))
        guardian_rel = escape(str(item.get("guardianRelationship") or "Phụ huynh"))
        guardian_phone = escape(str(item.get("guardianPhone") or ""))

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

        affected_subjects_str = (
            ", ".join(item.get("affectedSubjects") or []) or "Theo thời khóa biểu"
        )
        info_rows = [
            [
                Paragraph("<b>Thời gian xin nghỉ:</b>", style_body),
                Paragraph(escape(date_range_text), style_body),
            ],
            [
                Paragraph("<b>Số ngày &amp; Ca nghỉ:</b>", style_body),
                Paragraph(
                    f"<b>{item.get('totalDays', 1)} ngày</b> ({escape(shift_text)})",
                    style_body,
                ),
            ],
            [
                Paragraph("<b>Các môn học xin nghỉ:</b>", style_body),
                Paragraph(escape(affected_subjects_str), style_body),
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
        reason_html = escape(str(item.get("reason") or "")).replace("\n", "<br/>")
        story.append(Paragraph("<b>Lý do xin nghỉ học chi tiết:</b>", style_body_bold))
        story.append(Paragraph(reason_html, style_body))
        story.append(Spacer(1, 2.5 * mm))

        commitment_html = escape(
            str(
                item.get("commitment")
                or "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học."
            )
        )
        story.append(Paragraph("<b>Lời hứa và cam kết của học sinh:</b>", style_body_bold))
        story.append(Paragraph(commitment_html, style_body))
        story.append(Spacer(1, 3 * mm))

        if item.get("teacherNote"):
            reviewer = escape(str(item.get("reviewedByName") or homeroom_name))
            note_html = escape(str(item.get("teacherNote"))).replace("\n", "<br/>")
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
        reviewer_display = escape(
            str(item.get("reviewedByName") or item.get("homeroomTeacherName") or "")
        )
        sig_data = [
            [
                Paragraph("<b>XÁC NHẬN CỦA PHỤ HUYNH</b>", style_center_bold),
                Paragraph("<b>GIÁO VIÊN CHỦ NHIỆM</b>", style_center_bold),
                Paragraph("<b>HỌC SINH LÀM ĐƠN</b>", style_center_bold),
            ],
            [
                Paragraph("<i>(Ký và ghi rõ họ tên)</i>", style_subtitle),
                Paragraph(f"<i>({escape(status_text)})</i>", style_subtitle),
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
                f"Mã đơn: {escape(str(item.get('code') or ''))} • "
                f"Thời gian xuất: {now_local.strftime('%H:%M %d/%m/%Y')}</font>",
                style_center,
            )
        )

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        safe_code = str(item.get("code") or "DON").replace("#", "").replace("/", "-")
        filename = f"Don_Xin_Nghi_Phep_{safe_code}.pdf"
        return pdf_bytes, filename
