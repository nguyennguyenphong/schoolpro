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
    def _resolve_shift(cls, slot: dict[str, Any]) -> str:
        """
        Resolves shift (morning/afternoon/evening) from slot dictionary,
        falling back to periods or start_time when not explicitly present.
        """
        shift = str(slot.get("shift") or "").lower()
        if shift in {"morning", "afternoon", "evening"}:
            return shift

        # Infer from periods e.g. "Tiết 1" -> morning, "Tiết 6" -> afternoon
        periods = str(slot.get("periods") or "")
        match = re.search(r"\d+", periods)
        if match:
            period_no = int(match.group(0))
            if 1 <= period_no <= 5:
                return "morning"
            elif 6 <= period_no <= 10:
                return "afternoon"
            elif period_no > 10:
                return "evening"

        # Infer from start_time e.g. "07:15"
        start_t = str(slot.get("startTime") or "")
        if ":" in start_t:
            try:
                hour = int(start_t.split(":")[0])
                if hour < 12:
                    return "morning"
                elif hour < 17:
                    return "afternoon"
                else:
                    return "evening"
            except ValueError:
                pass

        return "morning"

    @classmethod
    def build_schedule_matrix_html(
        cls,
        slots: list[dict[str, Any]],
        week_start: Any,
    ) -> str:
        """
        Generates an HTML table matrix matching the UI WeeklyGridView:
        7 day columns (Monday to Sunday) across 3 shifts (Morning, Afternoon, Evening),
        rendering full card details with solid borders (no dashed lines).
        """
        days_of_week = [
            {"key": 2, "label": "Thứ Hai", "short": "T2", "date": week_start + timedelta(days=0)},
            {"key": 3, "label": "Thứ Ba", "short": "T3", "date": week_start + timedelta(days=1)},
            {"key": 4, "label": "Thứ Tư", "short": "T4", "date": week_start + timedelta(days=2)},
            {"key": 5, "label": "Thứ Năm", "short": "T5", "date": week_start + timedelta(days=3)},
            {"key": 6, "label": "Thứ Sáu", "short": "T6", "date": week_start + timedelta(days=4)},
            {"key": 7, "label": "Thứ Bảy", "short": "T7", "date": week_start + timedelta(days=5)},
            {"key": 8, "label": "Chủ Nhật", "short": "CN", "date": week_start + timedelta(days=6)},
        ]

        shifts_def = [
            {"key": "morning", "label": "Buổi Sáng", "timeRange": "07:00 - 11:30"},
            {"key": "afternoon", "label": "Buổi Chiều", "timeRange": "12:30 - 17:30"},
            {"key": "evening", "label": "Buổi Tối", "timeRange": "17:45 - 21:00"},
        ]

        # Calculate leave metadata for each day
        day_leave_info: dict[str, dict[str, Any]] = {}
        for d in days_of_week:
            date_str = d["date"].strftime("%Y-%m-%d")
            day_slots = [
                s for s in slots if s.get("date") == date_str or s.get("dayOfWeek") == d["key"]
            ]
            leave_slots = [
                s for s in day_slots if s.get("isOnLeave") or s.get("attendanceStatus") == "excused"
            ]
            has_leave = len(leave_slots) > 0
            is_pending = any(s.get("leaveStatus") == "pending" for s in leave_slots)
            day_leave_info[date_str] = {
                "has_leave": has_leave,
                "is_pending": is_pending,
            }

        # Build table headers
        header_cols = ['<th class="tt-shift-col">Ca học</th>']
        for d in days_of_week:
            date_str = d["date"].strftime("%Y-%m-%d")
            formatted_date = d["date"].strftime("%d/%m")
            leave_meta = day_leave_info.get(date_str, {})
            has_leave = leave_meta.get("has_leave", False)

            leave_badge_html = ""
            th_class = "tt-day-col"
            if has_leave:
                th_class += " tt-header-leave"
                badge_text = (
                    "Nghỉ phép: Chờ duyệt"
                    if leave_meta.get("is_pending")
                    else "Nghỉ phép: Đã duyệt"
                )
                leave_badge_html = f'<div style="margin-top: 2px;"><span class="tt-leave-badge">{badge_text}</span></div>'

            header_cols.append(f"""
            <th class="{th_class}">
              <div style="font-size: 9.5pt; font-weight: bold;">{html.escape(d["label"])} ({d["short"]})</div>
              <div style="font-size: 8pt; font-weight: normal; color: #475569;">{formatted_date}</div>
              {leave_badge_html}
            </th>
            """)

        # Build rows for shifts
        rows_html: list[str] = []
        for shift in shifts_def:
            shift_cells: list[str] = []

            # Shift column
            shift_cells.append(f"""
            <td class="tt-shift-col">
              <span style="font-weight: bold; font-size: 8.5pt;">{html.escape(shift["label"])}</span>
              <span class="tt-shift-timerange">{shift["timeRange"]}</span>
            </td>
            """)

            # Day columns
            for d in days_of_week:
                date_str = d["date"].strftime("%Y-%m-%d")
                cell_slots = [
                    s
                    for s in slots
                    if (s.get("date") == date_str or s.get("dayOfWeek") == d["key"])
                    and cls._resolve_shift(s) == shift["key"]
                ]

                # Sort by start time if available
                cell_slots.sort(key=lambda s: str(s.get("startTime") or s.get("periods") or ""))

                if not cell_slots:
                    shift_cells.append(
                        '<td class="tt-day-col"><div class="tt-empty-cell">—</div></td>'
                    )
                    continue

                cards_html: list[str] = []
                for s in cell_slots:
                    subj_name = html.escape(
                        str(s.get("courseName") or s.get("subjectName") or "Môn học")
                    )
                    cls_name = html.escape(str(s.get("className") or s.get("classCode") or "10A1"))
                    room = html.escape(str(s.get("room") or "Phòng học"))
                    bld = html.escape(str(s.get("building") or ""))
                    campus = html.escape(str(s.get("campus") or ""))
                    start_t = html.escape(str(s.get("startTime") or ""))
                    end_t = html.escape(str(s.get("endTime") or ""))
                    periods_str = html.escape(str(s.get("periods") or ""))
                    instructor = html.escape(
                        str(s.get("instructorName") or s.get("teacherName") or "Giáo viên")
                    )
                    email = html.escape(str(s.get("instructorEmail") or ""))
                    class_type = str(s.get("classType") or "theory").lower()
                    type_label = "Thực hành" if class_type == "practice" else "Lý thuyết"
                    is_online = bool(s.get("onlineUrl"))
                    mode_label = "Trực tuyến" if is_online else "Trực tiếp"
                    topic_or_notes = html.escape(
                        str(s.get("lessonTopic") or s.get("notes") or "").strip()
                    )

                    is_on_leave = bool(s.get("isOnLeave") or s.get("attendanceStatus") == "excused")
                    leave_status = str(s.get("leaveStatus") or "")
                    leave_badge = ""
                    card_class = "tt-slot-card"

                    if is_on_leave:
                        card_class += " tt-slot-excused"
                        leave_text = (
                            "Nghỉ phép (Chờ duyệt)"
                            if leave_status == "pending"
                            else "Nghỉ phép (Đã duyệt)"
                        )
                        leave_badge = f'<span class="tt-leave-badge">{leave_text}</span>'

                    # Room location string
                    room_parts = [f"Phòng: {room}"]
                    if bld:
                        room_parts.append(bld)
                    if campus:
                        room_parts.append(f"({campus})")
                    room_line = " &bull; ".join(room_parts)

                    # Time & period string
                    time_parts = []
                    if start_t and end_t:
                        time_parts.append(f"{start_t} - {end_t}")
                    if periods_str:
                        time_parts.append(f"({periods_str})")
                    time_line = " ".join(time_parts) or "Theo thời khóa biểu"

                    instructor_line = f"GV: {instructor}"
                    if email:
                        instructor_line += f' &bull; <span class="tt-slot-email">{email}</span>'

                    topic_html = ""
                    if topic_or_notes:
                        topic_html = (
                            f'<div class="tt-topic-note">Bài học / Ghi chú: {topic_or_notes}</div>'
                        )

                    cards_html.append(f"""
                    <div class="{card_class}">
                      <div class="tt-card-badge-row">
                        <span class="tt-class-badge">Lớp: {cls_name}</span>
                        {leave_badge}
                      </div>
                      <div class="tt-slot-subject">{subj_name}</div>
                      <div class="tt-slot-row"><strong>Địa điểm:</strong> {room_line}</div>
                      <div class="tt-slot-row"><strong>Thời gian:</strong> {time_line}</div>
                      <div class="tt-slot-instructor">{instructor_line}</div>
                      <div class="tt-slot-tags">
                        <span class="tt-type-tag">{type_label}</span>
                        <span class="tt-type-tag">{mode_label}</span>
                      </div>
                      {topic_html}
                    </div>
                    """)

                shift_cells.append(f'<td class="tt-day-col">{"".join(cards_html)}</td>')

            rows_html.append(f"<tr>{''.join(shift_cells)}</tr>")

        return f"""
        <table class="tt-matrix-table">
          <thead>
            <tr>{"".join(header_cols)}</tr>
          </thead>
          <tbody>
            {"".join(rows_html)}
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
            meta.get("academicYear", {}).get("name")
            if isinstance(meta.get("academicYear"), dict)
            else "2026 - 2027"
        ) or "2026 - 2027"
        semester_name = (
            meta.get("semester", {}).get("name")
            if isinstance(meta.get("semester"), dict)
            else "Học kỳ 1"
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
