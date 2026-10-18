"""
Timetable Export and PDF/Print Service.
Integrates with "sys"."export_templates" (ExportTemplate model) so schools and admins
can customize print layouts, margins, styles, filenames, and target formats.
"""

import html
import logging
import re
from datetime import datetime, timedelta
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
        Builds the 6-day (Thứ Hai -> Thứ Bảy), 2-session (Sáng & Chiều), 5-period
        timetable HTML table adhering to the official sys.export_templates A4 landscape specification.
        """
        tbody_html = cls.build_timetable_tbody_html(slots)
        return f"""<table class="timetable" aria-label="Thời khóa biểu theo ngày và tiết học">
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
{tbody_html}
            </tbody>
        </table>"""

    @classmethod
    def build_timetable_tbody_html(
        cls,
        slots: list[dict[str, Any]],
    ) -> str:
        """
        Builds the <tr> rows for the 6-day x 2-session timetable matrix.
        """
        days_of_week = [
            {"key": 2, "label": "Thứ Hai"},
            {"key": 3, "label": "Thứ Ba"},
            {"key": 4, "label": "Thứ Tư"},
            {"key": 5, "label": "Thứ Năm"},
            {"key": 6, "label": "Thứ Sáu"},
            {"key": 7, "label": "Thứ Bảy"},
        ]

        def find_slot(day_key: int, shift_name: str, period_num: int) -> dict[str, Any] | None:
            for s in slots:
                dow = s.get("dayOfWeek")
                is_day_matched = (
                    dow == day_key or (day_key == 2 and dow == 1) or (dow == day_key - 1)
                )
                if not is_day_matched:
                    continue

                slot_shift = str(s.get("shift") or "").lower()
                period_str = str(s.get("periods") or "")
                try:
                    num = int("".join(c for c in period_str if c.isdigit()))
                except ValueError:
                    num = 0

                if shift_name == "morning":
                    if (not slot_shift or slot_shift == "morning") and num == period_num:
                        return s
                elif shift_name == "afternoon":
                    if (
                        slot_shift == "afternoon" and (num == period_num or num == period_num + 5)
                    ) or (num == period_num + 5):
                        return s
            return None

        def format_cell(slot: dict[str, Any] | None) -> str:
            if not slot:
                return '<td class="lesson empty-session">Không có lịch</td>'

            course_name = html.escape(str(slot.get("courseName") or "—"))
            st = slot.get("startTime") or ""
            et = slot.get("endTime") or ""
            time_str = html.escape(f"{st} – {et}") if st else ".......... – .........."
            room = html.escape(str(slot.get("room") or "—"))
            instructor = html.escape(str(slot.get("instructorName") or "—"))

            online_url = slot.get("onlineUrl")
            teaching_mode = "Trực tuyến" if online_url else "Trực tiếp"

            class_type = slot.get("classType")
            class_type_map = {
                "practice": "Thực hành",
                "theory": "Lý thuyết",
                "seminar": "Seminar",
                "exam": "Kiểm tra",
            }
            learning_mode = class_type_map.get(class_type, "Lý thuyết")

            if slot.get("isOnLeave") or slot.get("attendanceStatus") == "excused":
                leave_reason = html.escape(str(slot.get("leaveReason") or "Nghỉ phép"))
                notes = f"Nghỉ phép ({leave_reason})"
            else:
                notes = html.escape(str(slot.get("notes") or slot.get("lessonTopic") or "—"))

            if online_url:
                online_url_escaped = html.escape(str(online_url))
                link_html = (
                    f'<a href="{online_url_escaped}" target="_blank">{online_url_escaped}</a>'
                )
            else:
                link_html = "—"

            return (
                '<td class="lesson">\n'
                f'    <div class="subject">Tên môn học: {course_name}</div>\n'
                f'    <div class="detail"><strong>Thời gian:</strong> {time_str}</div>\n'
                f'    <div class="detail"><strong>Phòng học:</strong> {room}</div>\n'
                f'    <div class="detail"><strong>Giáo viên:</strong> {instructor}</div>\n'
                f'    <div class="detail"><strong>Hình thức dạy:</strong> {teaching_mode}</div>\n'
                f'    <div class="detail"><strong>Hình thức học:</strong> {learning_mode}</div>\n'
                f'    <div class="detail" style="font-style: italic;"><strong>Ghi chú:</strong> {notes}</div>\n'
                f'    <div class="detail" style="font-style: italic;"><strong>Liên kết khác:</strong> {link_html}</div>\n'
                "</td>"
            )

        day_rows: list[str] = []
        for d in days_of_week:
            # Morning
            morning_cells = [format_cell(find_slot(d["key"], "morning", p)) for p in range(1, 6)]
            morning_row = (
                f"<tr>\n"
                f'    <td class="day" rowspan="2">{d["label"]}</td>\n'
                f'    <td class="session">Sáng</td>\n'
                f"    {''.join(morning_cells)}\n"
                f"</tr>"
            )

            # Afternoon
            afternoon_cells = [
                format_cell(find_slot(d["key"], "afternoon", p)) for p in range(1, 6)
            ]
            afternoon_row = (
                f'<tr>\n    <td class="session">Chiều</td>\n    {"".join(afternoon_cells)}\n</tr>'
            )

            day_rows.append(morning_row)
            day_rows.append(afternoon_row)

        return "\n".join(day_rows)

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
        first_slot = slots[0] if slots else {}
        now_local = timezone.localtime()

        if not week_start_str or not week_end_str:
            ref_date_str = selected_week.get("selectedDate") or (
                first_slot.get("date") if first_slot else None
            )
            if ref_date_str:
                try:
                    rd = datetime.strptime(str(ref_date_str)[:10], "%Y-%m-%d").date()
                except ValueError:
                    rd = now_local.date()
            else:
                rd = now_local.date()
            monday = rd - timedelta(days=rd.weekday())
            sunday = monday + timedelta(days=6)
            week_start_str = monday.strftime("%Y-%m-%d")
            week_end_str = sunday.strftime("%Y-%m-%d")

        try:
            dt_start = datetime.strptime(str(week_start_str)[:10], "%Y-%m-%d")
            dt_end = datetime.strptime(str(week_end_str)[:10], "%Y-%m-%d")
            start_date_formatted = dt_start.strftime("%d/%m/%Y")
            end_date_formatted = dt_end.strftime("%d/%m/%Y")
        except ValueError:
            start_date_formatted = str(week_start_str)
            end_date_formatted = str(week_end_str)

        date_range = f"Từ ngày {start_date_formatted} đến ngày {end_date_formatted}"
        effective_date_note = f"Ghi chú: Thời khóa biểu này có hiệu lực từ ngày {start_date_formatted} đến ngày {end_date_formatted}"

        raw_name = (
            getattr(user, "full_name", "")
            or f"{getattr(user, 'last_name', '')} {getattr(user, 'first_name', '')}".strip()
            or getattr(user, "username", "")
            or "Học sinh"
        )
        student_name = (
            re.sub(r"\s*\((?:Học sinh|Student|HS)\)\s*", "", raw_name, flags=re.IGNORECASE).strip()
            or raw_name
        )
        student_code = getattr(user, "student_code", "") or getattr(user, "username", "")

        # Resolve School, SchoolClass, Homeroom Teacher & Student from DB
        school_obj = None
        school_class_obj = None
        student_obj = None

        if hasattr(user, "is_authenticated") and user.is_authenticated:
            try:
                from apps.core.models.student import Student

                student_obj = (
                    Student.objects.select_related(
                        "school", "current_class", "current_class__homeroom_teacher"
                    )
                    .filter(user=user)
                    .first()
                )
            except Exception:
                student_obj = None

        if student_obj:
            school_obj = student_obj.school
            school_class_obj = student_obj.current_class
            if student_obj.student_code:
                student_code = student_obj.student_code
        elif hasattr(user, "school") and user.school:
            school_obj = user.school
        elif hasattr(user, "school_id") and user.school_id:
            try:
                from apps.master.models.school import School

                school_obj = School.objects.filter(id=user.school_id).first()
            except Exception:
                school_obj = None

        if not school_obj:
            try:
                from apps.master.models.school import School

                school_obj = School.objects.filter(is_active=True).first()
            except Exception:
                school_obj = None

        slot_class_name = first_slot.get("className")
        if not school_class_obj and slot_class_name:
            try:
                from apps.core.models.school_class import SchoolClass

                school_class_obj = (
                    SchoolClass.objects.select_related("homeroom_teacher")
                    .filter(name=slot_class_name)
                    .first()
                )
            except Exception:
                school_class_obj = None

        if not school_class_obj and school_obj:
            try:
                from apps.core.models.school_class import SchoolClass

                school_class_obj = (
                    SchoolClass.objects.select_related("homeroom_teacher")
                    .filter(school=school_obj)
                    .first()
                )
            except Exception:
                school_class_obj = None

        sample = template.sample_data if template and isinstance(template.sample_data, dict) else {}

        if school_class_obj:
            class_name = school_class_obj.name
            grade_level = f"Khối {school_class_obj.grade}" if school_class_obj.grade else "Khối 10"
            if school_class_obj.homeroom_teacher:
                teacher = school_class_obj.homeroom_teacher
                homeroom_teacher = (
                    getattr(teacher, "full_name", "")
                    or f"{getattr(teacher, 'last_name', '')} {getattr(teacher, 'first_name', '')}".strip()
                    or str(teacher)
                )
            else:
                homeroom_teacher = sample.get("homeroom_teacher_name") or "Chưa phân công"
        else:
            class_name = slot_class_name or "10A1"
            grade_level = sample.get("grade_level", "Khối 10")
            homeroom_teacher = sample.get("homeroom_teacher_name") or "Cô Trần Thị Mai"

        if school_obj:
            school_name = school_obj.name.upper()
            principal_name = school_obj.principal_name or sample.get(
                "principal_name", "Lê Trọng Nghĩa"
            )
            addr = (school_obj.address or "").lower()
            if "hồ chí minh" in addr or "tp.hcm" in addr or "hcm" in addr:
                school_parent_name = "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH"
                loc_name = "TP. Hồ Chí Minh"
            elif "hà nội" in addr:
                school_parent_name = "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HÀ NỘI"
                loc_name = "Hà Nội"
            elif "đà nẵng" in addr:
                school_parent_name = "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ ĐÀ NẴNG"
                loc_name = "Đà Nẵng"
            else:
                school_parent_name = sample.get(
                    "school_parent_name", "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH"
                )
                loc_name = "TP. Hồ Chí Minh"
        else:
            school_name = sample.get("school_name", "TRƯỜNG TRUNG HỌC PHỔ THÔNG SCHOOLPRO")
            school_parent_name = sample.get(
                "school_parent_name", "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HỒ CHÍ MINH"
            )
            principal_name = sample.get("principal_name", "Lê Trọng Nghĩa")
            loc_name = "TP. Hồ Chí Minh"

        matrix_tbody_html = cls.build_timetable_tbody_html(slots)
        matrix_table_html = cls.build_timetable_matrix_table_html(slots)
        week_label = f"Tuần {now_local.strftime('%W')}"
        created_date_formatted = sample.get(
            "created_date_formatted",
            f"{loc_name}, ngày {now_local.day:02d} tháng {now_local.month:02d} năm {now_local.year}",
        )

        context: dict[str, Any] = {
            **sample,
            "title": f"Thời khóa biểu - Lớp {class_name}",
            "school_name": school_name,
            "school_parent_name": school_parent_name,
            "department_name": sample.get("department_name", "PHÒNG HỌC VỤ & ĐÀO TẠO"),
            "doc_number": sample.get("doc_number", "08/TKB-THPT"),
            "class_name": class_name,
            "grade_level": grade_level,
            "academic_year": ay_name,
            "school_year": ay_name,
            "semester": sem_name,
            "semester_name": sem_name,
            "week_label": week_label,
            "week_number": week_label,
            "week_start_date": start_date_formatted,
            "week_end_date": end_date_formatted,
            "effective_start_date": start_date_formatted,
            "effective_end_date": end_date_formatted,
            "effective_date_note": effective_date_note,
            "date_range": date_range,
            "student_name": student_name,
            "student_code": student_code,
            "homeroom_teacher": homeroom_teacher,
            "homeroom_teacher_name": homeroom_teacher,
            "author_name": student_name,
            "principal_name": principal_name,
            "general_notes": sample.get(
                "general_notes",
                "Học sinh có mặt trước giờ học 15 phút, mặc đồng phục đúng quy định.",
            ),
            "created_date_formatted": created_date_formatted,
            "created_by_name": student_name,
            "print_date": now_local.strftime("%d/%m/%Y %H:%M"),
            "template_code": (
                template.code if template and template.code else "TIMETABLE_WEEKLY_A4_LANDSCAPE"
            ),
            "timetable_table_tbody_html": matrix_tbody_html,
            "timetable_table_html": matrix_table_html,
            "schedule_matrix_html": matrix_table_html,
            "timetable_matrix_html": matrix_table_html,
            "schedule_table_html": matrix_table_html,
            "table_html": matrix_table_html,
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
