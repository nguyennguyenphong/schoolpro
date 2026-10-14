"""
Timetable Export and PDF/Print Service.
Integrates with "sys"."export_templates" (ExportTemplate model) so schools and admins
can customize print layouts, margins, styles, filenames, and target formats.
"""

import html
import logging
from datetime import datetime
from typing import Any

from django.utils import timezone

from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_TIMETABLE_CODE,
    DEFAULT_TIMETABLE_CONTENT,
    DEFAULT_TIMETABLE_FOOTER,
    DEFAULT_TIMETABLE_HEADER,
    DEFAULT_TIMETABLE_PLACEHOLDERS,
    DEFAULT_TIMETABLE_SAMPLE_DATA,
    DEFAULT_TIMETABLE_STYLES,
    ExportTemplateService,
)

logger = logging.getLogger(__name__)


class TimetablePdfService:
    """
    Renders student timetable documents dynamically using ExportTemplate ("sys"."export_templates").
    Supports HTML_PRINT, PDF, and EXCEL formats with full placeholder, table matrix, and CSS customization.
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

            return tpl_service.get_or_create_default_timetable_template(school_id=school_id)
        except Exception as exc:
            logger.debug("Fallback to in-memory ExportTemplate for timetable: %s", exc)
            return ExportTemplate(
                code=template_code or DEFAULT_TIMETABLE_CODE,
                name="Mẫu Thời khóa biểu Tuần A4 Ngang",
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

    @classmethod
    def build_timetable_matrix_table_html(
        cls,
        slots: list[dict[str, Any]],
    ) -> str:
        """
        Builds a standard enterprise weekly timetable matrix table HTML
        with Morning (Tiết 1-5) and Afternoon (Tiết 6-9) across Monday - Saturday.
        """
        days_of_week = [
            {"key": 1, "label": "Thứ Hai"},
            {"key": 2, "label": "Thứ Ba"},
            {"key": 3, "label": "Thứ Tư"},
            {"key": 4, "label": "Thứ Năm"},
            {"key": 5, "label": "Thứ Sáu"},
            {"key": 6, "label": "Thứ Bảy"},
        ]

        periods_definition = [
            {"period": 1, "time": "07:15 - 08:00", "shift": "morning"},
            {"period": 2, "time": "08:05 - 08:50", "shift": "morning"},
            {"period": 3, "time": "09:05 - 09:50", "shift": "morning"},
            {"period": 4, "time": "09:55 - 10:40", "shift": "morning"},
            {"period": 5, "time": "10:45 - 11:30", "shift": "morning"},
            {"period": 6, "time": "13:30 - 14:15", "shift": "afternoon"},
            {"period": 7, "time": "14:20 - 15:05", "shift": "afternoon"},
            {"period": 8, "time": "15:20 - 16:05", "shift": "afternoon"},
            {"period": 9, "time": "16:10 - 16:55", "shift": "afternoon"},
        ]

        def find_slot(day_key: int, period_num: int) -> dict[str, Any] | None:
            for s in slots:
                dow = s.get("dayOfWeek")
                period_str = str(s.get("periods") or "")
                # Extract period number from "Tiết 1" or "1"
                try:
                    num = int("".join(c for c in period_str if c.isdigit()))
                except ValueError:
                    num = 0

                if dow == day_key and num == period_num:
                    return s
            return None

        # Build table rows
        rows_html: list[str] = []
        for p in periods_definition:
            p_num = p["period"]
            shift_td = ""
            if p_num == 1:
                shift_td = '<td rowspan="5" class="shift-col">Sáng</td>'
            elif p_num == 6:
                shift_td = '<td rowspan="4" class="shift-col">Chiều</td>'

            day_tds: list[str] = []
            for d in days_of_week:
                slot = find_slot(d["key"], p_num)
                if not slot:
                    day_tds.append("<td></td>")
                else:
                    course_name = html.escape(slot.get("courseName") or "Môn học")
                    room = html.escape(slot.get("room") or "")
                    instructor = html.escape(slot.get("instructorName") or "")
                    room_teacher = f"{room} • {instructor}" if room and instructor else (room or instructor)

                    leave_badge = ""
                    if slot.get("isOnLeave") or slot.get("attendanceStatus") == "excused":
                        leave_reason = html.escape(slot.get("leaveReason") or "Nghỉ phép")
                        leave_badge = f'<div class="tt-slot-excused" title="{leave_reason}">Nghỉ phép</div>'

                    cell_html = (
                        f"<td>"
                        f'<div class="tt-slot-subject">{course_name}</div>'
                        f'<div class="tt-slot-room">{room_teacher}</div>'
                        f"{leave_badge}"
                        f"</td>"
                    )
                    day_tds.append(cell_html)

            row_html = (
                f"<tr>"
                f"{shift_td}"
                f'<td class="period-col">{p_num}</td>'
                f'<td class="time-col">{p["time"]}</td>'
                f'{"".join(day_tds)}'
                f"</tr>"
            )
            rows_html.append(row_html)

        thead_th = "".join(f"<th>{d['label']}</th>" for d in days_of_week)
        table_html = f"""
        <table class="tt-matrix-table">
          <thead>
            <tr>
              <th style="width: 48px;">Buổi</th>
              <th style="width: 42px;">Tiết</th>
              <th style="width: 82px;">Thời gian</th>
              {thead_th}
            </tr>
          </thead>
          <tbody>
            {"".join(rows_html)}
          </tbody>
        </table>
        """
        return table_html

    @classmethod
    def build_template_context(
        cls,
        schedule_context: dict[str, Any],
        user: Any,
        template: ExportTemplate | None = None,
    ) -> dict[str, Any]:
        """
        Extracts metadata and slots from schedule_context and generates dynamic placeholder context.
        """
        meta = schedule_context.get("meta") or {}
        slots = schedule_context.get("slots") or []

        academic_year = meta.get("academicYear") or {}
        semester = meta.get("semester") or {}
        selected_week = meta.get("selectedWeek") or {}

        ay_name = academic_year.get("name") or "2026 - 2027"
        sem_name = semester.get("name") or "Học kỳ 1"

        week_start_str = selected_week.get("startDate") or ""
        week_end_str = selected_week.get("endDate") or ""
        date_range = ""
        if week_start_str and week_end_str:
            try:
                dt_start = datetime.strptime(week_start_str, "%Y-%m-%d")
                dt_end = datetime.strptime(week_end_str, "%Y-%m-%d")
                date_range = f"Từ ngày {dt_start.strftime('%d/%m/%Y')} đến ngày {dt_end.strftime('%d/%m/%Y')}"
            except ValueError:
                date_range = f"Từ {week_start_str} đến {week_end_str}"

        # Get first slot for class info if available
        first_slot = slots[0] if slots else {}
        class_name = first_slot.get("className") or "10A1"

        student_name = getattr(user, "full_name", "") or getattr(user, "username", "Học sinh")
        student_code = getattr(user, "student_code", "") or getattr(user, "username", "")

        matrix_table_html = cls.build_timetable_matrix_table_html(slots)
        now_local = timezone.localtime()

        sample = template.sample_data if template and isinstance(template.sample_data, dict) else {}
        context: dict[str, Any] = {
            **sample,
            "school_name": sample.get("school_name", "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO"),
            "department_name": sample.get("department_name", "PHÒNG HỌC VỤ & ĐÀO TẠO"),
            "class_name": class_name,
            "academic_year": ay_name,
            "semester_name": sem_name,
            "week_label": f"Tuần {now_local.strftime('%W')}",
            "date_range": date_range,
            "student_name": student_name,
            "student_code": student_code,
            "homeroom_teacher": sample.get("homeroom_teacher", "Thầy/Cô Giáo viên chủ nhiệm"),
            "print_date": now_local.strftime("%d/%m/%Y %H:%M"),
            "timetable_table_html": matrix_table_html,
        }
        return context

    @classmethod
    def render_timetable_html(
        cls,
        schedule_context: dict[str, Any],
        user: Any,
        template_code: str | None = None,
        template_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Renders the weekly timetable into full HTML & CSS using sys.export_templates.
        """
        school_id = getattr(user, "school_id", None)
        template = cls.resolve_export_template(
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
        )
        context = cls.build_template_context(schedule_context, user, template=template)
        rendered_html = template.render_html(context)
        filename = template.resolve_filename(
            context=context,
            default_prefix="Thoi_Khoa_Bieu",
        )
        return {
            "html": rendered_html,
            "filename": filename,
            "template_id": str(template.id) if template.id else None,
            "template_code": template.code,
            "template_name": template.name,
            "file_format": template.file_format,
            "page_orientation": template.page_orientation,
            "page_size": template.page_size,
        }

    @classmethod
    def export_timetable_file(
        cls,
        schedule_context: dict[str, Any],
        user: Any,
        template_code: str | None = None,
        template_id: str | None = None,
        output_format: str | None = None,
    ) -> tuple[bytes, str, str]:
        """
        Exports timetable into a binary file (HTML or PDF) with appropriate filename and MIME type.
        """
        rendered = cls.render_timetable_html(
            schedule_context=schedule_context,
            user=user,
            template_code=template_code,
            template_id=template_id,
        )
        html_content = rendered["html"]
        filename = rendered["filename"]
        target_format = (output_format or rendered["file_format"] or "HTML_PRINT").upper()

        if target_format in ("PDF",):
            try:
                import weasyprint

                pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
                pdf_filename = filename.rsplit(".", 1)[0] + ".pdf"
                return pdf_bytes, pdf_filename, "application/pdf"
            except (ImportError, Exception) as exc:
                logger.warning("Weasyprint unavailable or failed for timetable: %s", exc)
                # Fallback to HTML document
                html_filename = filename.rsplit(".", 1)[0] + ".html"
                return html_content.encode("utf-8"), html_filename, "text/html; charset=utf-8"

        # Default HTML
        html_filename = filename.rsplit(".", 1)[0] + ".html"
        return html_content.encode("utf-8"), html_filename, "text/html; charset=utf-8"
