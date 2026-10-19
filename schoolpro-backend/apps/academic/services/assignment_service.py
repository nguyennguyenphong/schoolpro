"""
Business logic service for Academic Assignment and Submission domain.
Handles student assignment feed, detail resolution, summary metrics, online submissions,
reopen requests, deadline extensions, rubric evaluation, and audit event logs.
"""

import logging
import uuid
from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.academic.models.assignment import (
    Assignment,
    AssignmentEventLog,
    AssignmentSubmission,
)
from apps.core.models.organization import (
    ClassSubjectTeacher,
    SchoolClass,
    StudentClassEnrollment,
)
from apps.core.models.profile import Student

logger = logging.getLogger(__name__)


def _is_valid_uuid(val: Any) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False


class AssignmentService:
    """
    Orchestrates student assignment retrieval, status calculations, submissions,
    reopen requests, and timeline event logs.
    """

    TYPE_DB_TO_UI = {
        "HOMEWORK": "homework",
        "PROJECT": "project",
        "ESSAY": "essay",
        "REVISION": "quiz",
        "QUIZ": "quiz",
    }

    TYPE_UI_TO_DB = {
        "homework": "HOMEWORK",
        "project": "PROJECT",
        "essay": "ESSAY",
        "quiz": "REVISION",
    }

    DEFAULT_ALLOWED_FILE_TYPES = [
        "pdf",
        "docx",
        "doc",
        "xlsx",
        "xls",
        "pptx",
        "ppt",
        "jpg",
        "jpeg",
        "png",
        "zip",
        "rar",
        "txt",
    ]

    @staticmethod
    def resolve_student(user: Any) -> Student | None:
        """
        Resolves the Student profile for the authenticated user.
        In dev/testing mode, falls back to the first active enrolled student if user is staff/superuser.
        """
        try:
            if user and getattr(user, "is_authenticated", False):
                student = (
                    Student.objects.select_related("user", "current_class")
                    .filter(user=user)
                    .first()
                )
                if student:
                    return student
                if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
                    return Student.objects.select_related("user", "current_class").first()
        except Exception as exc:
            logger.warning("Error resolving student profile: %s", exc)
        return None

    @staticmethod
    def resolve_student_class(student: Student | None) -> Any | None:
        """
        Resolves the primary enrolled class for the given student,
        preferring active enrollment in the current academic year if available.
        """
        if not student:
            return None
        enrollment = (
            StudentClassEnrollment.objects.filter(
                student=student,
                status="ACTIVE",
                school_class__academic_year__is_current=True,
            )
            .select_related("school_class", "school_class__academic_year")
            .first()
        )
        if not enrollment:
            enrollment = (
                StudentClassEnrollment.objects.filter(
                    student=student,
                    status="ACTIVE",
                )
                .select_related("school_class", "school_class__academic_year")
                .first()
            )
        if enrollment and enrollment.school_class:
            return enrollment.school_class
        if getattr(student, "current_class", None):
            return student.current_class
        first_cst = (
            ClassSubjectTeacher.objects.select_related("school_class")
            .filter(assignments__isnull=False)
            .first()
        )
        if first_cst:
            return first_cst.school_class
        return SchoolClass.objects.first()

    @classmethod
    def resolve_current_academic_context(
        cls,
        student: Student | None = None,
        school_class: Any | None = None,
    ) -> tuple[Any | None, Any | None]:
        """
        Resolves current AcademicYear and Semester for the student and their enrolled class.
        Returns (academic_year, semester).
        """
        from apps.master.models.academic_year import AcademicYear
        from apps.master.models.semester import Semester

        academic_year = None
        # 1. Prefer academic year from student's enrolled class
        if school_class and getattr(school_class, "academic_year", None):
            academic_year = school_class.academic_year
        elif (
            student
            and getattr(student, "current_class", None)
            and getattr(student.current_class, "academic_year", None)
        ):
            academic_year = student.current_class.academic_year

        # 2. If still none, check is_current=True on AcademicYear
        if not academic_year:
            academic_year = (
                AcademicYear.objects.filter(is_current=True).first()
                or AcademicYear.objects.order_by("-start_date").first()
            )

        # 3. Resolve current semester for this academic year
        semester = None
        if academic_year:
            semester = Semester.objects.filter(
                academic_year=academic_year,
                is_current=True,
            ).first()
            if not semester:
                semester = (
                    Semester.objects.filter(academic_year=academic_year)
                    .order_by("-start_date")
                    .first()
                )

        if not semester:
            semester = (
                Semester.objects.filter(is_current=True).first()
                or Semester.objects.order_by("-start_date").first()
            )

        return academic_year, semester

    @staticmethod
    def get_effective_due_date(assignment: Assignment) -> Any:
        """
        Returns the latest active due date taking into account up to 3 teacher deadline extensions.
        """
        if assignment.extended_due_date_3:
            return assignment.extended_due_date_3
        if assignment.extended_due_date_2:
            return assignment.extended_due_date_2
        if assignment.extended_due_date_1:
            return assignment.extended_due_date_1
        return assignment.due_date

    @staticmethod
    def format_extensions(assignment: Assignment) -> list[dict[str, Any]]:
        """
        Formats the chronological list of deadline extensions (1..3) if present.
        """
        tz = timezone.get_current_timezone()
        extensions: list[dict[str, Any]] = []
        for level in (1, 2, 3):
            dt = getattr(assignment, f"extended_due_date_{level}", None)
            reason = getattr(assignment, f"extension_reason_{level}", None)
            if dt:
                extensions.append(
                    {
                        "level": level,
                        "dueDate": dt.astimezone(tz).strftime("%Y-%m-%d %H:%M"),
                        "reason": reason or f"Gia hạn thời gian nộp bài lần {level}",
                    }
                )
        return extensions

    @classmethod
    def build_event_logs(
        cls,
        assignment: Assignment,
        submission: AssignmentSubmission | None = None,
        db_logs: list[AssignmentEventLog] | None = None,
    ) -> list[dict[str, Any]]:
        """
        Builds a complete chronological audit trail for the assignment and student submission.
        Combines stored AssignmentEventLog records with synthesized lifecycle milestones if logs are empty.
        """
        tz = timezone.get_current_timezone()
        cst = assignment.class_subject_teacher
        teacher_user = cst.teacher.user if cst and cst.teacher else assignment.created_by
        teacher_name = teacher_user.full_name if teacher_user else "Giáo viên bộ môn"

        if db_logs:
            formatted_logs: list[dict[str, Any]] = []
            for log in db_logs:
                actor_name = log.actor.full_name if log.actor else "Hệ thống"
                formatted_logs.append(
                    {
                        "id": str(log.id),
                        "eventType": log.event_type,
                        "title": log.title,
                        "description": log.description or "",
                        "actorName": actor_name,
                        "createdAt": log.created_at.astimezone(tz).strftime("%Y-%m-%d %H:%M"),
                        "metadata": log.metadata if isinstance(log.metadata, dict) else {},
                    }
                )
            return formatted_logs

        # Synthesize deterministic timeline when historic DB rows don't have event_logs yet
        events: list[dict[str, Any]] = [
            {
                "id": f"evt-created-{assignment.id}",
                "eventType": "CREATED",
                "title": "Giáo viên giao bài tập",
                "description": f"{teacher_name} đã phát hành bài tập và tài liệu hướng dẫn.",
                "actorName": teacher_name,
                "createdAt": f"{assignment.assigned_date.strftime('%Y-%m-%d')} 07:30",
                "metadata": {},
            }
        ]

        for ext in cls.format_extensions(assignment):
            events.append(
                {
                    "id": f"evt-ext-{assignment.id}-{ext['level']}",
                    "eventType": f"EXTENDED_{ext['level']}",
                    "title": f"Gia hạn hạn nộp lần {ext['level']}",
                    "description": f"Hạn chót mới: {ext['dueDate']}. Lý do: {ext['reason']}",
                    "actorName": teacher_name,
                    "createdAt": ext["dueDate"],
                    "metadata": {"level": ext["level"]},
                }
            )

        if submission:
            if submission.submitted_at:
                sub_time = submission.submitted_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                attempt = submission.attempt_number or 1
                events.append(
                    {
                        "id": f"evt-sub-{submission.id}",
                        "eventType": "RESUBMITTED" if attempt > 1 else "SUBMITTED",
                        "title": (
                            f"Học sinh nộp lại bài (Lần {attempt})"
                            if attempt > 1
                            else "Học sinh đã nộp bài làm"
                        ),
                        "description": (
                            "Nộp bài sau thời hạn quy định."
                            if submission.is_late
                            else "Nộp bài đúng thời hạn quy định."
                        ),
                        "actorName": (
                            submission.student.user.full_name
                            if submission.student and submission.student.user
                            else "Học sinh"
                        ),
                        "createdAt": sub_time,
                        "metadata": {"attemptNumber": attempt, "isLate": submission.is_late},
                    }
                )

            if submission.status == "GRADED" or submission.score is not None:
                graded_time = (
                    submission.graded_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                    if submission.graded_at
                    else timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M")
                )
                final_val = (
                    submission.final_score
                    if submission.final_score is not None
                    else submission.score
                )
                events.append(
                    {
                        "id": f"evt-graded-{submission.id}",
                        "eventType": "GRADED",
                        "title": "Giáo viên đã chấm điểm và nhận xét",
                        "description": f"Điểm đạt được: {float(final_val or 0):.1f}/{float(assignment.max_score):.1f}.",
                        "actorName": (
                            submission.graded_by.full_name if submission.graded_by else teacher_name
                        ),
                        "createdAt": graded_time,
                        "metadata": {"score": float(final_val or 0)},
                    }
                )

            if submission.reopen_status and submission.reopen_status != "NONE":
                req_time = (
                    submission.reopen_requested_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                    if submission.reopen_requested_at
                    else timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M")
                )
                events.append(
                    {
                        "id": f"evt-reopen-{submission.id}",
                        "eventType": "REOPEN_REQUESTED",
                        "title": "Gửi yêu cầu xin mở lại cổng nộp bài",
                        "description": submission.reopen_request_reason or "",
                        "actorName": (
                            submission.student.user.full_name
                            if submission.student and submission.student.user
                            else "Học sinh"
                        ),
                        "createdAt": req_time,
                        "metadata": {"status": submission.reopen_status.lower()},
                    }
                )

        effective_due = cls.get_effective_due_date(assignment)
        if effective_due < timezone.now() and (not submission or not submission.submitted_at):
            events.append(
                {
                    "id": f"evt-expired-{assignment.id}",
                    "eventType": "EXPIRED",
                    "title": "Hệ thống đóng cổng nộp bài định kỳ",
                    "description": "Đã quá thời hạn nộp bài mà chưa ghi nhận bài làm của học sinh.",
                    "actorName": "Hệ thống tự động",
                    "createdAt": effective_due.astimezone(tz).strftime("%Y-%m-%d %H:%M"),
                    "metadata": {},
                }
            )

        return events

    @classmethod
    def format_assignment_item(
        cls,
        assignment: Assignment,
        submission: AssignmentSubmission | None = None,
        db_logs: list[AssignmentEventLog] | None = None,
    ) -> dict[str, Any]:
        """
        Maps an Assignment model instance and optional student Submission to the API payload.
        """
        now = timezone.now()
        tz = timezone.get_current_timezone()
        cst = assignment.class_subject_teacher
        subject = cst.subject if cst else None
        school_class = cst.school_class if cst else None
        semester = getattr(cst, "semester", None) if cst else None
        academic_year = (
            school_class.academic_year
            if school_class and getattr(school_class, "academic_year", None)
            else (
                semester.academic_year
                if semester and getattr(semester, "academic_year", None)
                else None
            )
        )
        teacher_user = cst.teacher.user if cst and cst.teacher else assignment.created_by
        teacher_name = teacher_user.full_name if teacher_user else "Giáo viên bộ môn"
        teacher_email = teacher_user.email if teacher_user and teacher_user.email else ""

        effective_due_date = cls.get_effective_due_date(assignment)
        extensions = cls.format_extensions(assignment)

        # Normalize submission files & legacy reopenRequest dict if any
        files_list: list[dict[str, Any]] = []
        legacy_reopen: dict[str, Any] | None = None
        if submission:
            if isinstance(submission.attachments, list):
                files_list = submission.attachments
            elif isinstance(submission.attachments, dict):
                files_list = submission.attachments.get("files", [])
                legacy_reopen = submission.attachments.get("reopenRequest")

        has_submitted_work = bool(
            submission and (submission.submitted_at or submission.content_text or files_list)
        )
        reopen_approved = bool(submission and submission.reopen_status == "APPROVED")

        # Calculate student status: pending | submitted | graded | overdue
        if submission:
            if (
                submission.status == "GRADED"
                or submission.final_score is not None
                or submission.score is not None
            ):
                item_status = "graded"
            elif submission.status in ["SUBMITTED", "LATE"] and has_submitted_work:
                item_status = "submitted"
            elif effective_due_date < now and not reopen_approved:
                item_status = "overdue"
            else:
                item_status = "pending"
        else:
            if effective_due_date < now:
                item_status = "overdue"
            else:
                item_status = "pending"

        due_date_str = effective_due_date.astimezone(tz).strftime("%Y-%m-%d %H:%M")
        original_due_date_str = assignment.due_date.astimezone(tz).strftime("%Y-%m-%d %H:%M")
        assigned_date_str = assignment.assigned_date.strftime("%Y-%m-%d")

        ui_type = cls.TYPE_DB_TO_UI.get(assignment.assignment_type, "homework")
        attachments = assignment.attachments if isinstance(assignment.attachments, list) else []

        # Submission rules
        allowed_file_types = (
            assignment.allowed_file_types
            if isinstance(assignment.allowed_file_types, list) and assignment.allowed_file_types
            else cls.DEFAULT_ALLOWED_FILE_TYPES
        )
        max_file_size_mb = int(assignment.max_file_size_mb or 25)
        max_files_count = int(assignment.max_files_count or 5)
        file_naming_rule = (
            assignment.file_naming_rule or "{class}_{student_name}_{assignment_title}"
        )
        allow_late_submission = bool(assignment.allow_late_submission)
        late_penalty_percent = float(assignment.late_penalty_percent or 0.0)
        allow_resubmission = bool(assignment.allow_resubmission)
        max_resubmission_count = int(assignment.max_resubmission_count or 3)

        # Format submission payload
        submission_payload = None
        reopen_payload = None

        if submission:
            if has_submitted_work:
                sub_date_str = (
                    submission.submitted_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                    if submission.submitted_at
                    else ""
                )
                first_file_name = files_list[0].get("name") if files_list else None
                first_file_url = files_list[0].get("url") if files_list else None
                submission_payload = {
                    "id": str(submission.id),
                    "attemptNumber": int(submission.attempt_number or 1),
                    "submissionStatus": submission.submission_status or submission.status,
                    "submittedAt": sub_date_str,
                    "isLate": bool(submission.is_late),
                    "lateMinutes": int(submission.late_minutes or 0),
                    "penaltyDeduction": float(submission.penalty_deduction or 0.0),
                    "content": submission.content_text or "",
                    "fileName": first_file_name,
                    "fileUrl": first_file_url,
                    "files": files_list,
                }

            # Reopen request resolution (prefer first-class columns, fallback to legacy JSON)
            if submission.reopen_status and submission.reopen_status != "NONE":
                reopen_payload = {
                    "requestedAt": (
                        submission.reopen_requested_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                        if submission.reopen_requested_at
                        else due_date_str
                    ),
                    "reason": submission.reopen_request_reason or "",
                    "teacherEmail": teacher_email,
                    "status": submission.reopen_status.lower(),
                    "approvedAt": (
                        submission.reopen_approved_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                        if submission.reopen_approved_at
                        else None
                    ),
                }
            elif legacy_reopen:
                reopen_payload = legacy_reopen

        # Score & Rubric resolution
        score_val = None
        raw_score_val = None
        penalty_val = 0.0
        graded_at_str = None
        graded_by_name = None
        if submission:
            if submission.final_score is not None:
                score_val = float(submission.final_score)
            elif submission.score is not None:
                score_val = float(submission.score)
            if submission.raw_score is not None:
                raw_score_val = float(submission.raw_score)
            elif score_val is not None:
                raw_score_val = score_val
            penalty_val = float(submission.penalty_deduction or 0.0)
            if submission.graded_at:
                graded_at_str = submission.graded_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
            if submission.graded_by:
                graded_by_name = submission.graded_by.full_name
            elif item_status == "graded":
                graded_by_name = teacher_name

        feedback_val = submission.feedback if submission and submission.feedback else None

        # Format Rubric criteria merged with student rubric_scores if graded
        rubric_list: list[dict[str, Any]] = []
        if isinstance(assignment.rubric, list):
            rubric_scores_map: dict[str, Any] = {}
            if submission and isinstance(submission.rubric_scores, dict):
                rubric_scores_map = submission.rubric_scores
            elif submission and isinstance(submission.rubric_scores, list):
                for rs in submission.rubric_scores:
                    if isinstance(rs, dict) and rs.get("id"):
                        rubric_scores_map[str(rs["id"])] = rs

            for idx, item in enumerate(assignment.rubric):
                if not isinstance(item, dict):
                    continue
                crit_id = str(item.get("id") or f"crit-{idx + 1}")
                scored = rubric_scores_map.get(crit_id, {})
                earned = (
                    scored.get("earnedPoints")
                    if isinstance(scored, dict)
                    else (scored if isinstance(scored, (int, float)) else item.get("earnedPoints"))
                )
                comment = scored.get("comment") if isinstance(scored, dict) else item.get("comment")
                rubric_list.append(
                    {
                        "id": crit_id,
                        "criterion": item.get("criterion")
                        or item.get("title")
                        or f"Tiêu chí {idx + 1}",
                        "maxPoints": float(item.get("maxPoints") or item.get("points") or 0),
                        "description": item.get("description") or "",
                        "earnedPoints": float(earned) if earned is not None else None,
                        "comment": comment or None,
                    }
                )

        # Solution attachments (visible if solution_published_at <= now or already graded)
        solution_files: list[dict[str, Any]] = []
        if isinstance(assignment.solution_attachments, list) and assignment.solution_attachments:
            if item_status == "graded" or (
                assignment.solution_published_at and assignment.solution_published_at <= now
            ):
                solution_files = assignment.solution_attachments

        subject_code = subject.code if subject else "GEN"
        assignment_code = f"BT-{subject_code}-{str(assignment.id)[:6].upper()}"

        event_logs = cls.build_event_logs(
            assignment=assignment,
            submission=submission,
            db_logs=db_logs,
        )

        return {
            "id": str(assignment.id),
            "code": assignment_code,
            "title": assignment.title,
            "subjectId": str(subject.id) if subject and getattr(subject, "id", None) else None,
            "subjectCode": subject_code,
            "subjectName": subject.name if subject else "Môn học",
            "className": school_class.name if school_class else "",
            "academicYear": (
                academic_year.name if academic_year and getattr(academic_year, "name", None) else ""
            ),
            "semesterName": (semester.name if semester and getattr(semester, "name", None) else ""),
            "semesterId": (
                str(semester.id) if semester and getattr(semester, "id", None) else None
            ),
            "teacherName": teacher_name,
            "teacherEmail": teacher_email,
            "type": ui_type,
            "format": assignment.format or "HOMEWORK",
            "status": item_status,
            "dueDate": due_date_str,
            "originalDueDate": original_due_date_str,
            "isExtended": len(extensions) > 0,
            "extensions": extensions,
            "assignedDate": assigned_date_str,
            "description": assignment.description or "",
            "pointsPossible": float(assignment.max_score),
            "passScore": float(assignment.pass_score) if assignment.pass_score is not None else 5.0,
            "weightPercent": (
                float(assignment.weight_percent) if assignment.weight_percent is not None else 10.0
            ),
            "score": score_val,
            "rawScore": raw_score_val,
            "penaltyDeduction": penalty_val,
            "teacherFeedback": feedback_val,
            "gradedAt": graded_at_str,
            "gradedByName": graded_by_name,
            "allowedFileTypes": allowed_file_types,
            "maxFileSizeMb": max_file_size_mb,
            "maxFilesCount": max_files_count,
            "fileNamingRule": file_naming_rule,
            "allowLateSubmission": allow_late_submission,
            "latePenaltyPercent": late_penalty_percent,
            "allowResubmission": allow_resubmission,
            "maxResubmissionCount": max_resubmission_count,
            "attachments": attachments,
            "rubric": rubric_list,
            "solutionAttachments": solution_files,
            "submission": submission_payload,
            "reopenRequest": reopen_payload,
            "eventLogs": event_logs,
        }

    @classmethod
    def list_assignments(
        cls,
        user: Any,
        subject: str | None = None,
        status_filter: str | None = None,
        type_filter: str | None = None,
        search_query: str | None = None,
        sort_by: str | None = None,
        academic_year_param: str | None = None,
        semester_param: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Lists all published assignments for the student's class with filters and student submissions,
        always scoped to the current academic year and current semester by default.
        """
        student = cls.resolve_student(user)
        if not student:
            return []

        school_class = cls.resolve_student_class(student)
        if not school_class:
            return []

        from apps.master.models.academic_year import AcademicYear
        from apps.master.models.semester import Semester

        current_ay, current_sem = cls.resolve_current_academic_context(
            student=student, school_class=school_class
        )

        target_ay = current_ay
        if academic_year_param and academic_year_param != "all":
            ay_match = (
                AcademicYear.objects.filter(id=academic_year_param).first()
                if _is_valid_uuid(academic_year_param)
                else AcademicYear.objects.filter(
                    Q(code=academic_year_param) | Q(name=academic_year_param)
                ).first()
            )
            if ay_match:
                target_ay = ay_match

        target_sem = current_sem
        if semester_param and semester_param != "all":
            sem_match = (
                Semester.objects.filter(id=semester_param).first()
                if _is_valid_uuid(semester_param)
                else Semester.objects.filter(
                    Q(code=semester_param) | Q(name=semester_param)
                ).first()
            )
            if sem_match:
                target_sem = sem_match

        assignments_qs = (
            Assignment.objects.filter(
                class_subject_teacher__school_class=school_class,
                is_published=True,
            )
            .select_related(
                "class_subject_teacher__school_class",
                "class_subject_teacher__school_class__academic_year",
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher__user",
                "class_subject_teacher__semester",
                "class_subject_teacher__semester__academic_year",
                "created_by",
            )
            .order_by("-assigned_date", "-due_date")
        )

        if target_ay and academic_year_param != "all":
            assignments_qs = assignments_qs.filter(
                Q(class_subject_teacher__school_class__academic_year=target_ay)
                | Q(class_subject_teacher__semester__academic_year=target_ay)
            )

        if target_sem and semester_param != "all":
            assignments_qs = assignments_qs.filter(class_subject_teacher__semester=target_sem)

        assignments_list = list(assignments_qs)
        if not assignments_list:
            return []

        submissions = AssignmentSubmission.objects.filter(
            student=student,
            assignment__in=assignments_list,
        ).select_related("graded_by", "student__user")
        submissions_map = {sub.assignment_id: sub for sub in submissions}

        formatted_items = [
            cls.format_assignment_item(
                assignment=a,
                submission=submissions_map.get(a.id),
            )
            for a in assignments_list
        ]

        result = formatted_items

        if subject and subject != "all":
            subj_norm = subject.strip().lower()
            result = [
                i
                for i in result
                if str(i.get("subjectId") or "").lower() == subj_norm
                or str(i.get("subjectCode") or "").lower() == subj_norm
                or str(i.get("subjectName") or "").lower() == subj_norm
            ]

        if status_filter and status_filter != "all":
            result = [i for i in result if i["status"] == status_filter]

        if type_filter and type_filter != "all":
            result = [i for i in result if i["type"] == type_filter]

        if search_query and search_query.strip():
            q = search_query.strip().lower()
            result = [
                i
                for i in result
                if q in i["title"].lower()
                or q in i["subjectName"].lower()
                or q in i["teacherName"].lower()
                or q in i["description"].lower()
                or q in i.get("code", "").lower()
            ]

        if sort_by == "due_soon":
            result.sort(key=lambda x: x["dueDate"])
        elif sort_by == "score":
            result.sort(key=lambda x: (x["score"] is not None, x["score"] or 0), reverse=True)
        else:
            result.sort(key=lambda x: (x["assignedDate"], x["dueDate"]), reverse=True)

        return result

    @classmethod
    def get_assignment_detail(cls, user: Any, assignment_id: str) -> dict[str, Any]:
        """
        Retrieves detailed view of a single assignment for the student, including event logs.
        """
        student = cls.resolve_student(user)
        assignment = (
            Assignment.objects.filter(id=assignment_id)
            .select_related(
                "class_subject_teacher__school_class",
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher__user",
                "created_by",
            )
            .first()
        )
        if not assignment:
            raise ValueError("Không tìm thấy bài tập")

        submission = None
        db_logs: list[AssignmentEventLog] = []
        if student:
            submission = (
                AssignmentSubmission.objects.filter(
                    assignment=assignment,
                    student=student,
                )
                .select_related("graded_by", "student__user")
                .first()
            )
            db_logs = list(
                AssignmentEventLog.objects.filter(assignment=assignment)
                .select_related("actor")
                .order_by("created_at")
            )

        return cls.format_assignment_item(
            assignment=assignment,
            submission=submission,
            db_logs=db_logs if db_logs else None,
        )

    @classmethod
    def get_summary(
        cls,
        user: Any,
        academic_year_param: str | None = None,
        semester_param: str | None = None,
    ) -> dict[str, Any]:
        """
        Computes summary dashboard counts, average score, and available subjects for current student,
        strictly scoped to current academic year and semester.
        """
        student = cls.resolve_student(user)
        school_class = cls.resolve_student_class(student) if student else None
        class_name = school_class.name if school_class else None

        academic_year, semester = cls.resolve_current_academic_context(
            student=student, school_class=school_class
        )

        all_items = cls.list_assignments(
            user=user,
            academic_year_param=academic_year_param,
            semester_param=semester_param,
        )

        total = len(all_items)
        pending_count = sum(1 for i in all_items if i["status"] == "pending")
        submitted_count = sum(1 for i in all_items if i["status"] == "submitted")
        graded_count = sum(1 for i in all_items if i["status"] == "graded")
        overdue_count = sum(1 for i in all_items if i["status"] == "overdue")

        graded_items = [i for i in all_items if i["status"] == "graded" and i["score"] is not None]
        if graded_items:
            avg_score = round(sum(i["score"] for i in graded_items) / len(graded_items), 1)
        else:
            avg_score = 0.0

        # Aggregate unique subjects across all class assignments
        subjects_map: dict[str, dict[str, Any]] = {}
        for item in all_items:
            code = item["subjectCode"]
            if code not in subjects_map:
                subjects_map[code] = {
                    "code": code,
                    "name": item["subjectName"],
                    "count": 0,
                }
            subjects_map[code]["count"] += 1

        return {
            "total": total,
            "pendingCount": pending_count,
            "submittedCount": submitted_count,
            "gradedCount": graded_count,
            "overdueCount": overdue_count,
            "averageScore": avg_score,
            "className": class_name,
            "semesterName": (
                semester.name if semester and getattr(semester, "name", None) else None
            ),
            "academicYear": (
                academic_year.name
                if academic_year and getattr(academic_year, "name", None)
                else None
            ),
            "subjects": list(subjects_map.values()),
        }

    @classmethod
    def submit_assignment(
        cls,
        user: Any,
        assignment_id: str,
        content: str | None = None,
        files: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        Processes online homework submission or re-submission with rule validation and audit log.
        """
        student = cls.resolve_student(user)
        if not student:
            raise ValueError("Không tìm thấy hồ sơ học sinh của tài khoản này.")

        assignment = Assignment.objects.filter(id=assignment_id).first()
        if not assignment:
            raise ValueError("Không tìm thấy bài tập cần nộp.")

        clean_files = files if files is not None else []
        clean_content = (content or "").strip()
        if not clean_files and not clean_content:
            raise ValueError("Vui lòng đính kèm ít nhất 1 tệp bài làm hoặc nhập nội dung trả lời.")

        max_files = int(assignment.max_files_count or 5)
        if len(clean_files) > max_files:
            raise ValueError(f"Số lượng tệp vượt quá giới hạn cho phép (tối đa {max_files} tệp).")

        now = timezone.now()
        effective_due = cls.get_effective_due_date(assignment)
        is_late = now > effective_due

        with transaction.atomic():
            submission, created = AssignmentSubmission.objects.get_or_create(
                assignment=assignment,
                student=student,
            )

            if submission.status == "GRADED" or submission.score is not None:
                raise ValueError(
                    "Bài tập đã được giáo viên chấm điểm, không thể chỉnh sửa bài nộp."
                )

            has_previous_submission = bool(not created and submission.submitted_at is not None)
            reopen_approved = submission.reopen_status == "APPROVED"

            if is_late and not reopen_approved:
                raise ValueError(
                    "Bài tập này đã hết hạn và không cho phép nộp muộn. Vui lòng đợi giáo viên gia hạn thêm thời gian hoặc gửi yêu cầu xin mở lại cổng nộp bài."
                )

            if has_previous_submission:
                current_attempts = int(submission.attempt_number or 1)
                submission.attempt_number = current_attempts + 1
            else:
                submission.attempt_number = 1

            late_minutes = (
                max(0, int((now - effective_due).total_seconds() // 60)) if is_late else 0
            )
            submission.submitted_at = now
            submission.content_text = clean_content
            submission.attachments = clean_files
            submission.is_late = is_late
            submission.late_minutes = late_minutes
            submission.submission_status = (
                "RESUBMITTED"
                if submission.attempt_number > 1
                else ("LATE" if is_late else "SUBMITTED")
            )
            submission.status = "LATE" if is_late else "SUBMITTED"
            submission.save()

            AssignmentEventLog.objects.create(
                assignment=assignment,
                submission=submission,
                student=student,
                actor=student.user if student.user else None,
                event_type="RESUBMITTED" if submission.attempt_number > 1 else "SUBMITTED",
                title=(
                    f"Học sinh nộp lại bài làm (Lần {submission.attempt_number})"
                    if submission.attempt_number > 1
                    else "Học sinh đã nộp bài làm"
                ),
                description=(
                    f"Đã tải lên {len(clean_files)} tệp đính kèm (nộp trễ {late_minutes} phút)."
                    if is_late
                    else f"Đã tải lên {len(clean_files)} tệp đính kèm đúng thời hạn."
                ),
                metadata={
                    "attemptNumber": submission.attempt_number,
                    "filesCount": len(clean_files),
                    "isLate": is_late,
                    "lateMinutes": late_minutes,
                },
            )

        return cls.get_assignment_detail(user=user, assignment_id=assignment_id)

    @classmethod
    def request_reopen(
        cls,
        user: Any,
        assignment_id: str,
        reason: str,
    ) -> dict[str, Any]:
        """
        Stores request from student asking teacher to reopen expired assignment.
        """
        student = cls.resolve_student(user)
        if not student:
            raise ValueError("Không tìm thấy hồ sơ học sinh.")

        assignment = (
            Assignment.objects.filter(id=assignment_id)
            .select_related("class_subject_teacher__teacher__user", "created_by")
            .first()
        )
        if not assignment:
            raise ValueError("Không tìm thấy bài tập.")

        clean_reason = (reason or "").strip()
        if not clean_reason:
            raise ValueError("Vui lòng nhập lý do xin mở lại cổng nộp bài.")

        teacher_user = (
            assignment.class_subject_teacher.teacher.user
            if assignment.class_subject_teacher and assignment.class_subject_teacher.teacher
            else assignment.created_by
        )
        teacher_email = teacher_user.email if teacher_user and teacher_user.email else ""

        now = timezone.now()
        with transaction.atomic():
            submission, _ = AssignmentSubmission.objects.get_or_create(
                assignment=assignment,
                student=student,
            )

            if submission.submitted_at is not None:
                raise ValueError(
                    "Bài tập đã được nộp. Khi hết hạn nộp bài, bài làm đã nộp chỉ ở chế độ xem lại."
                )

            submission.reopen_status = "PENDING"
            submission.reopen_request_reason = clean_reason
            submission.reopen_requested_at = now

            existing_attachments = submission.attachments
            reopen_dict = {
                "requestedAt": now.astimezone(timezone.get_current_timezone()).strftime(
                    "%Y-%m-%d %H:%M"
                ),
                "reason": clean_reason,
                "teacherEmail": teacher_email,
                "status": "pending",
            }
            if isinstance(existing_attachments, list):
                submission.attachments = {
                    "files": existing_attachments,
                    "reopenRequest": reopen_dict,
                }
            elif isinstance(existing_attachments, dict):
                existing_attachments["reopenRequest"] = reopen_dict
                submission.attachments = existing_attachments
            else:
                submission.attachments = {
                    "files": [],
                    "reopenRequest": reopen_dict,
                }

            submission.save()

            AssignmentEventLog.objects.create(
                assignment=assignment,
                submission=submission,
                student=student,
                actor=student.user if student.user else None,
                event_type="REOPEN_REQUESTED",
                title="Học sinh gửi yêu cầu xin mở lại cổng nộp bài",
                description=clean_reason,
                metadata={"teacherEmail": teacher_email, "status": "pending"},
            )

        return cls.get_assignment_detail(user=user, assignment_id=assignment_id)
