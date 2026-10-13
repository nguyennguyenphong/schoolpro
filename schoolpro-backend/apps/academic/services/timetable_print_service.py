"""
Service for rendering official Timetable print & export documents
using dynamic templates managed in sys.export_templates.
"""

import html
import logging
import re
from datetime import datetime, timedelta
from typing import Any

from django.utils import timezone

from apps.academic.services.timetable_service import TimetableService
from apps.system.models.export_template import ExportTemplate, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_TIMETABLE_CODE,
    ExportTemplateService,
)

logger = logging.getLogger(__name__)


class TimetablePrintService:
    """
    Renders student timetable documents dynamically using ExportTemplate ("sys"."export_templates").
    """

    @classmethod
    def resolve_export_template(
        cls,
        template_code: str | None = None,
        school_id: Any = None,
    ) -> ExportTemplate:
        """
        Resolves the active ExportTemplate from "sys"."export_templates".
        Prioritizes:
        1. Specified template_code (e.g. TIMETABLE_WEEKLY_A4_LANDSCAPE)
        2. Active default template for TemplateType.ACADEMIC
        3. Seeds default official A4 landscape timetable template if missing.
        """
        service = ExportTemplateService()
        code = template_code or DEFAULT_TIMETABLE_CODE
        template = service.repository.get_active_by_code(code=code, school_id=school_id)
        if not template:
            template = service.repository.get_default_by_type(
                TemplateType.ACADEMIC, school_id=school_id
            )
        if not template:
            template = service.get_or_create_default_timetable_template(school_id=school_id)
        return template

    @classmethod
    def build_schedule_matrix_html(
        cls,
        slots: list[dict[str, Any]],
        week_start: Any,
    ) -> str:
        """
        Generates an HTML table matrix representing morning and afternoon periods
        across Monday through Saturday.
        """
        days_of_week = [
            {"key": 2, "label": "Thứ Hai", "date": week_start + timedelta(days=0)},
            {"key": 3, "label": "Thứ Ba", "date": week_start + timedelta(days=1)},
            {"key": 4, "label": "Thứ Tư", "date": week_start + timedelta(days=2)},
            {"key": 5, "label": "Thứ Năm", "date": week_start + timedelta(days=3)},
            {"key": 6, "label": "Thứ Sáu", "date": week_start + timedelta(days=4)},
            {"key": 7, "label": "Thứ Bảy", "date": week_start + timedelta(days=5)},
        ]

        periods_def = [
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
                if s.get("dayOfWeek") != day_key:
                    continue
                period_str = str(s.get("periods") or "")
                match = re.search(r"\d+", period_str)
                if match and int(match.group()) == period_num:
                    return s
            return None

        # Build header row
        header_cols = [
            '<th class="tt-shift-col">Buổi</th>',
            '<th class="tt-period-col">Tiết</th>',
            '<th class="tt-time-col">Thời gian</th>',
        ]
        for d in days_of_week:
            formatted_date = d["date"].strftime("%d/%m")
            header_cols.append(
                f'<th>{html.escape(d["label"])}<br/><span style="font-weight: normal; font-size: 8.5pt; color: #475569;">({formatted_date})</span></th>'
            )

        rows_html: list[str] = []
        for p in periods_def:
            p_num = p["period"]
            cells: list[str] = []

            # Rowspan for shift label
            if p_num == 1:
                cells.append('<td class="tt-shift-col" rowspan="5">Sáng</td>')
            elif p_num == 6:
                cells.append('<td class="tt-shift-col" rowspan="4">Chiều</td>')

            cells.append(f'<td class="tt-period-col">{p_num}</td>')
            cells.append(f'<td class="tt-time-col">{p["time"]}</td>')

            for d in days_of_week:
                slot = find_slot(d["key"], p_num)
                if not slot:
                    cells.append('<td class="tt-slot-cell"></td>')
                    continue

                subj_name = html.escape(str(slot.get("courseName") or slot.get("subjectName") or ""))
                room = html.escape(str(slot.get("room") or ""))
                teacher = html.escape(str(slot.get("instructorName") or slot.get("teacherName") or ""))
                is_on_leave = slot.get("isOnLeave", False)

                cell_class = "tt-slot-cell"
                leave_badge = ""
                if is_on_leave:
                    cell_class += " tt-slot-excused"
                    leave_badge = '<div class="tt-slot-subinfo" style="color: #b45309; font-weight: bold;">(Nghỉ phép)</div>'

                room_teacher_parts = [p for p in [room, teacher] if p]
                room_teacher_str = " &bull; ".join(room_teacher_parts)

                cells.append(f"""
                <td class="{cell_class}">
                  <div class="tt-slot-subject">{subj_name}</div>
                  {f'<div class="tt-slot-subinfo">{room_teacher_str}</div>' if room_teacher_str else ''}
                  {leave_badge}
                </td>
                """)

            rows_html.append(f"<tr>{''.join(cells)}</tr>")

        return f"""
        <table class="tt-matrix-table">
          <thead>
            <tr>{''.join(header_cols)}</tr>
          </thead>
          <tbody>
            {''.join(rows_html)}
          </tbody>
        </table>
        """

    @classmethod
    def render_timetable_print(
        cls,
        user: Any,
        selected_date_str: str | None = None,
        template_code: str | None = None,
        format_override: str | None = None,
    ) -> dict[str, Any]:
        """
        Renders the weekly timetable into an official printable document.
        Uses the active ExportTemplate from sys.export_templates, including custom CSS, margins,
        page orientation, and dynamic filename pattern.
        """
        school_id = getattr(user, "school_id", None)
        template = cls.resolve_export_template(template_code=template_code, school_id=school_id)

        schedule_context = TimetableService.get_weekly_schedule_context(
            user=user,
            selected_date_str=selected_date_str,
        )

        slots = schedule_context.get("slots", [])
        meta = schedule_context.get("meta", {}) or {}

        # Resolve date & week
        today = timezone.localdate()
        if selected_date_str:
            try:
                target_date = datetime.strptime(selected_date_str, "%Y-%m-%d").date()
            except ValueError:
                target_date = today
        else:
            target_date = today

        week_start = target_date - timedelta(days=target_date.weekday())
        week_end = week_start + timedelta(days=6)
        iso_week_num = target_date.isocalendar()[1]

        # Extract school, class, semester info
        class_name = slots[0].get("className", "10A1") if slots else "10A1"
        school_name = getattr(getattr(user, "school", None), "name", "TRƯỜNG THPT CHUYÊN SCHOOLPRO")
        academic_year_name = (
            meta.get("academicYear", {}).get("name") if isinstance(meta.get("academicYear"), dict) else "2026 - 2027"
        ) or "2026 - 2027"
        semester_name = (
            meta.get("semester", {}).get("name") if isinstance(meta.get("semester"), dict) else "Học kỳ 1"
        ) or "Học kỳ 1"

        week_label = f"Tuần {iso_week_num:02d} ({week_start.strftime('%d/%m/%Y')} - {week_end.strftime('%d/%m/%Y')})"
        now_dt = timezone.localtime()
        print_date = now_dt.strftime("%d/%m/%Y %H:%M")

        matrix_html = cls.build_schedule_matrix_html(slots=slots, week_start=week_start)

        context_data: dict[str, Any] = {
            "title": f"Thời khóa biểu lớp {class_name} - {week_label}",
            "document_title": "THỜI KHÓA BIỂU HỌC TẬP",
            "school_name": school_name,
            "school_parent_name": "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HÀ NỘI",
            "class_name": class_name,
            "academic_year": academic_year_name,
            "semester_name": semester_name,
            "week_label": week_label,
            "week_number": f"{iso_week_num:02d}",
            "print_date": print_date,
            "author_name": "Bộ phận Giáo vụ",
            "homeroom_teacher_name": "ThS. Hoàng Văn Nam",
            "principal_name": "TS. Lê Hồng Sơn",
            "template_code": template.code,
            "schedule_matrix_html": matrix_html,
            "total_slots": len(slots),
        }

        # Resolve filename dynamically from template configuration
        resolved_filename = template.resolve_filename(
            context=context_data,
            extension_override=format_override,
            default_prefix=f"Thoi_Khoa_Bieu_{class_name}",
        )

        # Render full HTML with styles, headers, footers, watermarks
        rendered_html = template.render_html(context=context_data)

        return {
            "html": rendered_html,
            "filename": resolved_filename,
            "fileFormat": format_override or template.file_format,
            "pageSize": template.page_size,
            "pageOrientation": template.page_orientation,
            "template": {
                "id": str(template.id),
                "code": template.code,
                "name": template.name,
                "fileFormat": template.file_format,
            },
        }
