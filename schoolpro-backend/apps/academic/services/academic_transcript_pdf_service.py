"""
Academic Transcript Export and Print Service.
Integrates with "sys"."export_templates" (ExportTemplate model) so students, schools,
and admins can customize academic transcript / gradebook print layouts, styles,
placeholders, and target formats dynamically from database storage.
"""

import html
import logging
from typing import Any

from django.utils import timezone

from apps.academic.services.gradebook_service import GradebookService
from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_ACADEMIC_CODE,
    DEFAULT_ACADEMIC_CONTENT,
    DEFAULT_ACADEMIC_FOOTER,
    DEFAULT_ACADEMIC_HEADER,
    DEFAULT_ACADEMIC_PLACEHOLDERS,
    DEFAULT_ACADEMIC_SAMPLE_DATA,
    DEFAULT_ACADEMIC_STYLES,
    ExportTemplateService,
)

logger = logging.getLogger(__name__)


class AcademicTranscriptPdfService:
    """
    Renders official student academic transcripts (Bảng điểm kết quả học tập)
    dynamically using ExportTemplate ("sys"."export_templates").
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

            return tpl_service.get_or_create_default_academic_transcript_template(
                school_id=school_id
            )
        except Exception as exc:
            logger.debug("Fallback to in-memory ExportTemplate for academic transcript: %s", exc)
            return ExportTemplate(
                code=template_code or DEFAULT_ACADEMIC_CODE,
                name="Mẫu Bảng điểm kết quả học tập A4 Ngang",
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

    @classmethod
    def build_score_table_rows_html(cls, subjects: list[dict[str, Any]]) -> str:
        """
        Builds the <tr> rows for the 14 subjects or student's enrolled subjects.
        Columns:
          1. Môn học (left-aligned bold)
          2-6. Điểm đánh giá thường xuyên (Lần 1 - 5)
          7. Giữa kỳ
          8. Cuối kỳ
          9. Điểm trung bình môn học
          10. Xếp loại
          11. Nhận xét của giáo viên bộ môn
        """
        if not subjects:
            # Fallback 14 standard subjects empty rows
            standard_subjects = [
                "Ngữ văn",
                "Toán",
                "Ngoại ngữ",
                "Vật lí",
                "Hóa học",
                "Sinh học",
                "Lịch sử",
                "Địa lí",
                "Giáo dục kinh tế và pháp luật",
                "Tin học",
                "Công nghệ",
                "Giáo dục thể chất",
                "Giáo dục quốc phòng và an ninh",
                "Hoạt động trải nghiệm, hướng nghiệp",
            ]
            empty_rows = [
                f'<tr><td class="subject">{name}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
                for name in standard_subjects
            ]
            return "\n        ".join(empty_rows)

        rows = []
        for s in subjects:
            name = html.escape(str(s.get("name", "")))

            # Extract regular scores (up to 5)
            reg_list = s.get("regularScores", [])
            reg_vals: list[str] = []
            if isinstance(reg_list, list):
                for r in reg_list:
                    if isinstance(r, dict):
                        sc = r.get("score")
                        reg_vals.append(
                            f"{sc:.1f}" if isinstance(sc, (int, float)) else str(sc or "")
                        )
                    else:
                        reg_vals.append(str(r))
            elif s.get("regularScoresStr") and s.get("regularScoresStr") != "—":
                reg_vals = [x.strip() for x in str(s["regularScoresStr"]).split(",")]

            reg_cols = []
            for i in range(5):
                val_str = html.escape(reg_vals[i]) if i < len(reg_vals) else ""
                reg_cols.append(f"<td>{val_str}</td>")
            reg_html = "".join(reg_cols)

            # Midterm score
            mid = s.get("midtermScore")
            if isinstance(mid, dict):
                mid = mid.get("score")
            mid_str = (
                f"{mid:.1f}"
                if isinstance(mid, (int, float))
                else (str(mid) if mid is not None else "")
            )

            # Final score
            fin = s.get("finalScore")
            if isinstance(fin, dict):
                fin = fin.get("score")
            fin_str = (
                f"{fin:.1f}"
                if isinstance(fin, (int, float))
                else (str(fin) if fin is not None else "")
            )

            # Average score & Rank
            avg = s.get("averageScore")
            eval_type = s.get("evaluationType")
            if eval_type == "feedback":
                fb = s.get("feedbackResult")
                avg_str = "Đạt" if fb == "pass" else ("Chưa đạt" if fb == "fail" else "Đạt")
                rank_str = avg_str
            else:
                avg_str = (
                    f"{avg:.1f}"
                    if isinstance(avg, (int, float))
                    else (str(avg) if avg is not None else "")
                )
                level_raw = str(s.get("gradeLevel") or "")
                level_map = {
                    "excellent": "Giỏi",
                    "good": "Khá",
                    "average": "Đạt",
                    "pass": "Đạt",
                    "fail": "Chưa đạt",
                }
                rank_str = html.escape(level_map.get(level_raw, level_raw))

            comment_str = html.escape(str(s.get("teacherComment") or ""))

            row = (
                f'<tr><td class="subject">{name}</td>'
                f"{reg_html}"
                f"<td>{html.escape(mid_str)}</td>"
                f"<td>{html.escape(fin_str)}</td>"
                f"<td>{html.escape(avg_str)}</td>"
                f"<td>{rank_str}</td>"
                f"<td>{comment_str}</td></tr>"
            )
            rows.append(row)

        return "\n        ".join(rows)

    @classmethod
    def build_template_context(
        cls,
        transcript: dict[str, Any],
        user: Any = None,
        template: ExportTemplate | None = None,
    ) -> dict[str, Any]:
        """
        Prepares standard context dictionary mapping placeholders to real transcript values.
        """
        now_local = timezone.localtime()
        sample = template.sample_data if template and isinstance(template.sample_data, dict) else {}

        # Resolve student profile details
        student = GradebookService.resolve_student(user) if user else None

        dob_str = ""
        gender_str = "Nam"
        place_of_birth = "Hà Nội"

        if student:
            if hasattr(student, "birth_place") and student.birth_place:
                place_of_birth = student.birth_place
            student_user = getattr(student, "user", None)
            if student_user:
                dob = getattr(student_user, "date_of_birth", None)
                if dob:
                    dob_str = dob.strftime("%d/%m/%Y") if hasattr(dob, "strftime") else str(dob)
                g = getattr(student_user, "gender", None)
                if g:
                    gender_str = "Nữ" if str(g).lower() in ("female", "f", "nữ") else "Nam"

        if not dob_str:
            dob_str = sample.get("date_of_birth", "15/08/2009")

        student_name = transcript.get("studentName") or sample.get(
            "student_name", "Nguyễn Minh Quang"
        )
        student_code = transcript.get("studentCode") or sample.get("student_code", "HS10A101")
        class_name = transcript.get("className") or sample.get("class_name", "10A1")
        academic_year = transcript.get("academicYear") or sample.get("school_year", "2025 - 2026")
        semester = transcript.get("semester") or sample.get("semester", "Học kỳ 1")

        # Format score rows
        subjects = transcript.get("subjects", [])
        score_rows_html = cls.build_score_table_rows_html(subjects)

        # Formatting values
        gpa_val = transcript.get("gpa")
        gpa_str = (
            f"{gpa_val:.2f}"
            if isinstance(gpa_val, (int, float))
            else str(gpa_val or sample.get("gpa", "8.72"))
        )

        created_date_formatted = (
            f"Ngày {now_local.day:02d} tháng {now_local.month:02d} năm {now_local.year}"
        )

        context: dict[str, Any] = {
            **sample,
            "school_parent_name": sample.get(
                "school_parent_name", "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HÀ NỘI"
            ),
            "school_name": transcript.get("schoolName")
            or sample.get("school_name", "TRƯỜNG THPT CHUYÊN HÀ NỘI - AMSTERDAM"),
            "doc_number": transcript.get("decisionNumber")
            or sample.get("doc_number", "102/BĐ-THPT"),
            "school_year": academic_year,
            "academic_year": academic_year,
            "semester": semester,
            "student_name": student_name,
            "student_code": student_code,
            "date_of_birth": dob_str,
            "gender": gender_str,
            "class_name": class_name,
            "place_of_birth": place_of_birth,
            "score_table_rows_html": score_rows_html,
            "gpa": gpa_str,
            "academic_performance": transcript.get("academicRank")
            or sample.get("academic_performance", "Tốt"),
            "conduct": transcript.get("conductRank") or sample.get("conduct", "Tốt"),
            "rank": f"{transcript.get('rankInClass', 3)}/{transcript.get('totalStudents', 42)}",
            "absence_with_permission": sample.get("absence_with_permission", "0"),
            "absence_without_permission": sample.get("absence_without_permission", "0"),
            "homeroom_teacher_comment": transcript.get("homeroomComment")
            or sample.get(
                "homeroom_teacher_comment",
                "Học sinh có tinh thần tự giác cao, tích cực tham gia các hoạt động tập thể.",
            ),
            "created_date_formatted": created_date_formatted,
            "created_by_name": sample.get("created_by_name", "Nguyễn Văn Tuấn"),
            "homeroom_teacher_name": transcript.get("homeroomTeacher")
            or sample.get("homeroom_teacher_name", "Cô Trần Thị Mai"),
            "principal_name": transcript.get("principalName")
            or sample.get("principal_name", "TS. Lê Hồng Sơn"),
            "print_date": now_local.strftime("%d/%m/%Y %H:%M"),
        }
        return context

    @classmethod
    def render_academic_transcript_html(
        cls,
        user: Any,
        semester: str | None = None,
        academic_year: str | None = None,
        template_code: str | None = None,
        template_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Renders the academic transcript into full HTML & CSS using sys.export_templates.
        """
        school_id = getattr(user, "school_id", None)
        template = cls.resolve_export_template(
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
        )

        transcript = GradebookService.get_transcript(
            user=user, semester=semester, academic_year=academic_year
        )
        context = cls.build_template_context(transcript, user=user, template=template)
        rendered_html = template.render_html(context)
        filename = template.resolve_filename(
            context=context,
            default_prefix=f"Bang_Diem_{context.get('student_code', 'HS')}_{context.get('class_name', 'Lop')}",
        )

        return {
            "html": rendered_html,
            "filename": filename,
            "template": {
                "id": str(template.id) if getattr(template, "id", None) else None,
                "code": template.code,
                "name": template.name,
                "file_format": template.file_format,
                "page_size": template.page_size,
                "page_orientation": template.page_orientation,
            },
        }
