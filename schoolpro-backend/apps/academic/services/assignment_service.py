"""
Business logic service for Academic Assignment and Submission domain.
Handles student assignment feed, detail resolution, summary metrics, online submissions,
reopen requests, score appeals, deadline extensions, rubric evaluation, and audit event logs.
"""

import logging
from datetime import timedelta
from decimal import Decimal
from typing import Any

from django.db import connection, transaction
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
from apps.core.models.profile import Student, Teacher
from apps.core.models.user import User
from apps.master.models.subject import Subject

logger = logging.getLogger(__name__)


class AssignmentService:
    """
    Orchestrates student assignment retrieval, status calculations, submissions,
    reopen requests, score appeals, and timeline event logs.
    """

    _schema_ensured: bool = False

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

    @classmethod
    def ensure_schema(cls) -> None:
        """
        Idempotently ensures all enterprise columns on `academic.assignments`,
        `academic.assignment_submissions`, and table `academic.assignment_event_logs` exist.
        """
        if cls._schema_ensured:
            return
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    ALTER TABLE "academic"."assignments"
                        ADD COLUMN IF NOT EXISTS format VARCHAR(30) NOT NULL DEFAULT 'HOMEWORK',
                        ADD COLUMN IF NOT EXISTS pass_score NUMERIC(4,2) DEFAULT 5.00,
                        ADD COLUMN IF NOT EXISTS weight_percent NUMERIC(5,2) DEFAULT 10.00,
                        ADD COLUMN IF NOT EXISTS allowed_file_types JSONB DEFAULT '["pdf", "docx", "xlsx", "pptx", "jpg", "png", "zip"]'::jsonb,
                        ADD COLUMN IF NOT EXISTS max_file_size_mb INT DEFAULT 25,
                        ADD COLUMN IF NOT EXISTS max_files_count INT DEFAULT 5,
                        ADD COLUMN IF NOT EXISTS file_naming_rule VARCHAR(255) DEFAULT '{class}_{student_name}_{assignment_title}',
                        ADD COLUMN IF NOT EXISTS file_naming_regex VARCHAR(255) NULL,
                        ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN NOT NULL DEFAULT TRUE,
                        ADD COLUMN IF NOT EXISTS late_penalty_percent NUMERIC(5,2) DEFAULT 0.00,
                        ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN NOT NULL DEFAULT TRUE,
                        ADD COLUMN IF NOT EXISTS max_resubmission_count INT DEFAULT 3,
                        ADD COLUMN IF NOT EXISTS extended_due_date_1 TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS extension_reason_1 TEXT NULL,
                        ADD COLUMN IF NOT EXISTS extended_due_date_2 TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS extension_reason_2 TEXT NULL,
                        ADD COLUMN IF NOT EXISTS extended_due_date_3 TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS extension_reason_3 TEXT NULL,
                        ADD COLUMN IF NOT EXISTS rubric JSONB NULL,
                        ADD COLUMN IF NOT EXISTS solution_attachments JSONB NULL,
                        ADD COLUMN IF NOT EXISTS solution_published_at TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
                    """
                )
                cursor.execute(
                    """
                    ALTER TABLE "academic"."assignment_submissions"
                        ADD COLUMN IF NOT EXISTS attempt_number INT NOT NULL DEFAULT 1,
                        ADD COLUMN IF NOT EXISTS submission_status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
                        ADD COLUMN IF NOT EXISTS is_late BOOLEAN NOT NULL DEFAULT FALSE,
                        ADD COLUMN IF NOT EXISTS late_minutes INT DEFAULT 0,
                        ADD COLUMN IF NOT EXISTS penalty_deduction NUMERIC(4,2) DEFAULT 0.00,
                        ADD COLUMN IF NOT EXISTS raw_score NUMERIC(4,2) NULL,
                        ADD COLUMN IF NOT EXISTS final_score NUMERIC(4,2) NULL,
                        ADD COLUMN IF NOT EXISTS rubric_scores JSONB NULL,
                        ADD COLUMN IF NOT EXISTS appeal_status VARCHAR(30) NOT NULL DEFAULT 'NONE',
                        ADD COLUMN IF NOT EXISTS appeal_reason TEXT NULL,
                        ADD COLUMN IF NOT EXISTS appeal_attachments JSONB NULL,
                        ADD COLUMN IF NOT EXISTS appealed_at TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS appeal_resolved_by UUID NULL REFERENCES "core"."users"(id) ON DELETE SET NULL,
                        ADD COLUMN IF NOT EXISTS appeal_response TEXT NULL,
                        ADD COLUMN IF NOT EXISTS appeal_resolved_at TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS reopen_status VARCHAR(30) NOT NULL DEFAULT 'NONE',
                        ADD COLUMN IF NOT EXISTS reopen_request_reason TEXT NULL,
                        ADD COLUMN IF NOT EXISTS reopen_requested_at TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS reopen_approved_by UUID NULL REFERENCES "core"."users"(id) ON DELETE SET NULL,
                        ADD COLUMN IF NOT EXISTS reopen_approved_at TIMESTAMPTZ NULL,
                        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
                    """
                )
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS "academic"."assignment_event_logs" (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        assignment_id UUID NOT NULL REFERENCES "academic"."assignments"(id) ON DELETE CASCADE,
                        submission_id UUID NULL REFERENCES "academic"."assignment_submissions"(id) ON DELETE CASCADE,
                        student_id UUID NULL REFERENCES "core"."students"(id) ON DELETE CASCADE,
                        actor_id UUID NULL REFERENCES "core"."users"(id) ON DELETE SET NULL,
                        event_type VARCHAR(50) NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        description TEXT NULL,
                        metadata JSONB DEFAULT '{}'::jsonb,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS ix_asgn_event_assignment
                        ON "academic"."assignment_event_logs"(assignment_id, created_at);
                    CREATE INDEX IF NOT EXISTS ix_asgn_event_submission
                        ON "academic"."assignment_event_logs"(submission_id);
                    CREATE INDEX IF NOT EXISTS ix_asgn_event_student
                        ON "academic"."assignment_event_logs"(student_id);
                    """
                )
            cls._schema_ensured = True
        except Exception as exc:
            logger.debug("AssignmentService.ensure_schema skipped: %s", exc)

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
        Resolves the primary enrolled class for the given student.
        """
        if not student:
            return None
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

            if submission.appeal_status and submission.appeal_status != "NONE":
                app_time = (
                    submission.appealed_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                    if submission.appealed_at
                    else timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M")
                )
                events.append(
                    {
                        "id": f"evt-appeal-{submission.id}",
                        "eventType": "APPEAL_SUBMITTED",
                        "title": "Học sinh gửi yêu cầu phúc khảo điểm",
                        "description": submission.appeal_reason or "",
                        "actorName": (
                            submission.student.user.full_name
                            if submission.student and submission.student.user
                            else "Học sinh"
                        ),
                        "createdAt": app_time,
                        "metadata": {"status": submission.appeal_status.lower()},
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
        appeal_payload = None

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

            # Score Appeal resolution
            if submission.appeal_status and submission.appeal_status != "NONE":
                appeal_payload = {
                    "status": submission.appeal_status.lower(),
                    "reason": submission.appeal_reason or "",
                    "attachments": (
                        submission.appeal_attachments
                        if isinstance(submission.appeal_attachments, list)
                        else []
                    ),
                    "appealedAt": (
                        submission.appealed_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                        if submission.appealed_at
                        else ""
                    ),
                    "response": submission.appeal_response or None,
                    "resolvedAt": (
                        submission.appeal_resolved_at.astimezone(tz).strftime("%Y-%m-%d %H:%M")
                        if submission.appeal_resolved_at
                        else None
                    ),
                    "resolvedByName": (
                        submission.appeal_resolved_by.full_name
                        if submission.appeal_resolved_by
                        else None
                    ),
                }

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
                comment = (
                    scored.get("comment") if isinstance(scored, dict) else item.get("comment")
                )
                rubric_list.append(
                    {
                        "id": crit_id,
                        "criterion": item.get("criterion") or item.get("title") or f"Tiêu chí {idx + 1}",
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
            "subjectId": str(subject.id) if subject else None,
            "subjectCode": subject_code,
            "subjectName": subject.name if subject else "Môn học",
            "className": school_class.name if school_class else "",
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
            "appeal": appeal_payload,
            "eventLogs": event_logs,
        }

    @classmethod
    def ensure_seed_data_for_class(cls, school_class: Any, student: Student) -> None:
        """
        Ensures the student's class has realistic assignments covering all statuses
        (pending, submitted, graded with rubric & solutions, overdue with extension)
        when the database table is empty for that class.
        """
        if not school_class or not student:
            return
        try:
            existing_count = Assignment.objects.filter(
                class_subject_teacher__school_class=school_class
            ).count()
            if existing_count > 0:
                return

            now = timezone.now()
            today = now.date()

            csts = list(
                ClassSubjectTeacher.objects.filter(school_class=school_class).select_related(
                    "subject", "teacher__user"
                )
            )
            if not csts:
                teacher = Teacher.objects.select_related("user").first()
                subjects = list(Subject.objects.all()[:4])
                for subj in subjects:
                    if teacher:
                        cst_obj, _ = ClassSubjectTeacher.objects.get_or_create(
                            school_class=school_class,
                            subject=subj,
                            defaults={"teacher": teacher},
                        )
                        csts.append(cst_obj)

            if not csts:
                return

            creator = (
                csts[0].teacher.user
                if csts[0].teacher and csts[0].teacher.user
                else User.objects.first()
            )
            if not creator:
                return

            def pick_cst(idx: int) -> ClassSubjectTeacher:
                return csts[idx % len(csts)]

            # 1. Pending Homework (Due in 2 days, extended once)
            cst0 = pick_cst(0)
            a1 = Assignment.objects.create(
                class_subject_teacher=cst0,
                title="Bài tập chuyên đề: Khảo sát hàm số và ứng dụng đạo hàm",
                description=(
                    "Hoàn thành đầy đủ các bài tự luận từ Bài 1 đến Bài 6 trong phiếu bài tập đính kèm.\n"
                    "- Trình bày rõ ràng các bước lập bảng biến thiên và tìm cực trị.\n"
                    "- Vẽ đồ thị hàm số trên giấy kẻ ô ly hoặc xuất từ phần mềm GeoGebra.\n"
                    "- Nộp bản PDF hoặc ảnh chụp rõ nét theo đúng quy tắc đặt tên tệp."
                ),
                assignment_type="HOMEWORK",
                format="HOMEWORK",
                assigned_date=today - timedelta(days=3),
                due_date=now + timedelta(days=1),
                extended_due_date_1=now + timedelta(days=2, hours=4),
                extension_reason_1="Gia hạn thêm 1 ngày để học sinh hoàn thiện phần vẽ đồ thị GeoGebra.",
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("15.00"),
                allowed_file_types=["pdf", "docx", "jpg", "png"],
                max_file_size_mb=20,
                max_files_count=3,
                file_naming_rule="{class}_{student_name}_KhaoSatHamSo",
                allow_late_submission=True,
                late_penalty_percent=Decimal("10.00"),
                allow_resubmission=True,
                max_resubmission_count=3,
                attachments=[
                    {
                        "name": "Phieu_Bai_Tap_Khao_Sat_Ham_So_Chuyen_De_1.pdf",
                        "size": "1.8 MB",
                        "url": "/files/assignments/phieu-bai-tap-ham-so.pdf",
                    },
                    {
                        "name": "Huong_Dan_Trinh_Bay_Bang_Bien_Thien.docx",
                        "size": "640 KB",
                        "url": "/files/assignments/huong-dan-bang-bien-thien.docx",
                    },
                ],
                rubric=[
                    {
                        "id": "r1",
                        "criterion": "Tập xác định và đạo hàm",
                        "maxPoints": 2.5,
                        "description": "Tìm đúng tập xác định, tính chính xác đạo hàm y' và nghiệm của y' = 0.",
                    },
                    {
                        "id": "r2",
                        "criterion": "Bảng biến thiên và cực trị",
                        "maxPoints": 3.5,
                        "description": "Lập bảng biến thiên đầy đủ các giới hạn và kết luận đúng các điểm cực trị.",
                    },
                    {
                        "id": "r3",
                        "criterion": "Đồ thị và bài toán tương giao",
                        "maxPoints": 4.0,
                        "description": "Vẽ đồ thị chính xác tâm đối xứng và giải biện luận phương trình tiếp tuyến.",
                    },
                ],
                created_by=creator,
            )

            # 2. Pending Project (Due in 5 days)
            cst1 = pick_cst(1)
            Assignment.objects.create(
                class_subject_teacher=cst1,
                title="Dự án nhóm: Thiết kế poster và thuyết trình Bảo vệ môi trường biển",
                description=(
                    "Thực hiện bộ hồ sơ dự án học tập gồm:\n"
                    "1. Slide thuyết trình ( định dạng PDF hoặc PPTX tối đa 15 trang).\n"
                    "2. Báo cáo tổng hợp số liệu thực trạng và giải pháp giảm thiểu rác thải nhựa.\n"
                    "3. Phân công nhiệm vụ từng thành viên trong nhóm."
                ),
                assignment_type="PROJECT",
                format="PROJECT",
                assigned_date=today - timedelta(days=5),
                due_date=now + timedelta(days=5),
                max_score=Decimal("10.00"),
                pass_score=Decimal("6.00"),
                weight_percent=Decimal("25.00"),
                allowed_file_types=["pdf", "pptx", "docx", "zip"],
                max_file_size_mb=50,
                max_files_count=5,
                file_naming_rule="{class}_{student_name}_DuAnMoiTruong",
                allow_late_submission=False,
                late_penalty_percent=Decimal("0.00"),
                allow_resubmission=True,
                max_resubmission_count=5,
                attachments=[
                    {
                        "name": "De_Cuong_Du_An_Bao_Ve_Moi_Truong_Bien.pdf",
                        "size": "2.4 MB",
                        "url": "/files/assignments/de-cuong-du-an.pdf",
                    }
                ],
                rubric=[
                    {
                        "id": "p1",
                        "criterion": "Nội dung khoa học và số liệu dẫn chứng",
                        "maxPoints": 4.0,
                        "description": "Số liệu cập nhật, trích dẫn nguồn uy tín, phân tích nguyên nhân sâu sắc.",
                    },
                    {
                        "id": "p2",
                        "criterion": "Thiết kế trực quan & sáng tạo",
                        "maxPoints": 3.0,
                        "description": "Bố cục slide/poster hài hòa, hình ảnh sắc nét, thông điệp rõ ràng.",
                    },
                    {
                        "id": "p3",
                        "criterion": "Tính khả thi của giải pháp đề xuất",
                        "maxPoints": 3.0,
                        "description": "Giải pháp thực tế, áp dụng được tại trường học và địa phương.",
                    },
                ],
                created_by=creator,
            )

            # 3. Submitted Essay (Waiting for teacher grading)
            cst2 = pick_cst(2)
            a3 = Assignment.objects.create(
                class_subject_teacher=cst2,
                title="Bài viết nghị luận xã hội: Trách nhiệm của thế hệ trẻ trong kỷ nguyên số",
                description=(
                    "Viết bài văn nghị luận xã hội (khoảng 600 - 800 chữ) trình bày suy nghĩ của anh/chị "
                    "về vai trò làm chủ công nghệ và giữ gìn bản sắc văn hóa dân tộc của học sinh hiện nay."
                ),
                assignment_type="ESSAY",
                format="ESSAY",
                assigned_date=today - timedelta(days=6),
                due_date=now + timedelta(days=1),
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("20.00"),
                allowed_file_types=["pdf", "docx"],
                max_file_size_mb=15,
                max_files_count=2,
                file_naming_rule="{class}_{student_name}_NghiLuanXaHoi",
                allow_late_submission=True,
                late_penalty_percent=Decimal("10.00"),
                allow_resubmission=True,
                max_resubmission_count=3,
                attachments=[
                    {
                        "name": "Goi_Y_Dan_Y_Nghi_Luan_Xa_Hoi_Ky_Nguyen_So.pdf",
                        "size": "920 KB",
                        "url": "/files/assignments/dan-y-nghi-luan.pdf",
                    }
                ],
                created_by=creator,
            )
            sub3 = AssignmentSubmission.objects.create(
                assignment=a3,
                student=student,
                attempt_number=1,
                submission_status="SUBMITTED",
                status="SUBMITTED",
                submitted_at=now - timedelta(hours=14),
                is_late=False,
                late_minutes=0,
                content_text=(
                    "Em xin gửi bài làm nghị luận xã hội về trách nhiệm của người trẻ trong kỷ nguyên số. "
                    "Bài viết gồm 3 phần: Mở bài, Thân bài (4 luận điểm chính kèm dẫn chứng thực tiễn) và Kết bài."
                ),
                attachments=[
                    {
                        "id": "sub-file-301",
                        "name": f"{school_class.name}_{student.user.full_name}_NghiLuanXaHoi.pdf",
                        "size": "1.1 MB",
                        "sizeBytes": 1153433,
                        "type": "pdf",
                        "url": "/files/submissions/bai-lam-nghi-luan.pdf",
                        "uploadedAt": (now - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"),
                    }
                ],
            )
            AssignmentEventLog.objects.create(
                assignment=a3,
                submission=sub3,
                student=student,
                actor=student.user,
                event_type="SUBMITTED",
                title="Học sinh đã nộp bài làm (Lần 1)",
                description="Đã tải lên 1 tệp đính kèm đúng thời hạn quy định.",
            )

            # 4. Graded Homework with Rubric Scores & Solution Attachments
            cst3 = pick_cst(3)
            a4 = Assignment.objects.create(
                class_subject_teacher=cst3,
                title="Đề cương ôn tập kiểm tra định kỳ: Dao động cơ và Sóng cơ học",
                description=(
                    "Giải chi tiết 20 câu trắc nghiệm định lượng và 3 bài toán tự luận tổng hợp "
                    "về con lắc lò xo, tổng hợp dao động điều hòa và giao thoa sóng mặt nước."
                ),
                assignment_type="REVISION",
                format="QUIZ",
                assigned_date=today - timedelta(days=12),
                due_date=now - timedelta(days=5),
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("15.00"),
                allowed_file_types=["pdf", "docx", "jpg", "png"],
                max_file_size_mb=25,
                max_files_count=4,
                file_naming_rule="{class}_{student_name}_OnTapDaoDongCo",
                allow_late_submission=True,
                late_penalty_percent=Decimal("10.00"),
                allow_resubmission=False,
                max_resubmission_count=1,
                attachments=[
                    {
                        "name": "De_Cuong_Dao_Dong_Va_Song_Co_Hoc.pdf",
                        "size": "2.1 MB",
                        "url": "/files/assignments/de-cuong-vat-ly.pdf",
                    }
                ],
                rubric=[
                    {
                        "id": "v1",
                        "criterion": "Phần trắc nghiệm định lượng (20 câu)",
                        "maxPoints": 5.0,
                        "description": "Mỗi câu trả lời đúng và có giải thích công thức ngắn gọn đạt 0.25 điểm.",
                    },
                    {
                        "id": "v2",
                        "criterion": "Bài toán năng lượng con lắc lò xo",
                        "maxPoints": 2.5,
                        "description": "Biến đổi đúng hệ thức độc lập thời gian và tính chính xác vận tốc cực đại.",
                    },
                    {
                        "id": "v3",
                        "criterion": "Bài toán cực đại giao thoa sóng",
                        "maxPoints": 2.5,
                        "description": "Xác định đúng số đường hypebol cực đại và cực tiểu trên đoạn thẳng nối hai nguồn.",
                    },
                ],
                solution_attachments=[
                    {
                        "name": "Dap_An_Chi_Tiet_Va_Thang_Diem_Dao_Dong_Co.pdf",
                        "size": "1.6 MB",
                        "url": "/files/solutions/dap-an-dao-dong-co.pdf",
                    }
                ],
                solution_published_at=now - timedelta(days=3),
                created_by=creator,
            )
            sub4 = AssignmentSubmission.objects.create(
                assignment=a4,
                student=student,
                attempt_number=1,
                submission_status="GRADED",
                status="GRADED",
                submitted_at=now - timedelta(days=6),
                is_late=False,
                late_minutes=0,
                raw_score=Decimal("9.00"),
                score=Decimal("9.00"),
                final_score=Decimal("9.00"),
                rubric_scores={
                    "v1": {
                        "earnedPoints": 4.75,
                        "comment": "Đúng 19/20 câu, nhầm đơn vị đổi từ cm sang m ở câu 17.",
                    },
                    "v2": {
                        "earnedPoints": 2.5,
                        "comment": "Lời giải chặt chẽ, trình bày rõ ràng.",
                    },
                    "v3": {
                        "earnedPoints": 1.75,
                        "comment": "Tìm đúng điều kiện k nhưng kết luận dư 2 điểm ở hai nguồn.",
                    },
                },
                feedback=(
                    "Bài làm rất tốt, nắm vững bản chất vật lý và trình bày khoa học. "
                    "Em lưu ý không lấy dấu bằng tại vị trí hai nguồn S1, S2 khi đếm cực đại giao thoa nhé!"
                ),
                graded_by=cst3.teacher.user if cst3.teacher else creator,
                graded_at=now - timedelta(days=3),
                attachments=[
                    {
                        "id": "sub-file-401",
                        "name": f"{school_class.name}_{student.user.full_name}_OnTapDaoDongCo.pdf",
                        "size": "2.3 MB",
                        "sizeBytes": 2411724,
                        "type": "pdf",
                        "url": "/files/submissions/bai-giai-vat-ly.pdf",
                        "uploadedAt": (now - timedelta(days=6)).strftime("%Y-%m-%d %H:%M"),
                    }
                ],
            )
            AssignmentEventLog.objects.create(
                assignment=a4,
                submission=sub4,
                student=student,
                actor=cst3.teacher.user if cst3.teacher else creator,
                event_type="GRADED",
                title="Giáo viên đã chấm điểm và công bố đáp án mẫu",
                description="Điểm tổng kết: 9.0/10.0. Đã đính kèm bảng chấm tiêu chí Rubric.",
            )

            # 5. Overdue Assignment (Can request reopen)
            cst4 = pick_cst(4)
            Assignment.objects.create(
                class_subject_teacher=cst4,
                title="Bài tập thực hành: Phân tích cấu trúc ngữ pháp Academic Reading Unit 4",
                description=(
                    "Hoàn thành bảng phân tích từ vựng học thuật (Collocations & Phrasal Verbs) "
                    "và trả lời câu hỏi đọc hiểu Reading Passage 2 trong tài liệu đính kèm."
                ),
                assignment_type="HOMEWORK",
                format="HOMEWORK",
                assigned_date=today - timedelta(days=8),
                due_date=now - timedelta(days=1, hours=6),
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("10.00"),
                allowed_file_types=["pdf", "docx", "xlsx"],
                max_file_size_mb=15,
                max_files_count=2,
                file_naming_rule="{class}_{student_name}_ReadingUnit4",
                allow_late_submission=False,
                late_penalty_percent=Decimal("15.00"),
                allow_resubmission=True,
                max_resubmission_count=2,
                attachments=[
                    {
                        "name": "Academic_Reading_Unit_4_Worksheet.pdf",
                        "size": "1.5 MB",
                        "url": "/files/assignments/reading-unit-4.pdf",
                    }
                ],
                created_by=creator,
            )

            # Seed creation log for a1
            AssignmentEventLog.objects.create(
                assignment=a1,
                student=student,
                actor=cst0.teacher.user if cst0.teacher else creator,
                event_type="CREATED",
                title="Giáo viên giao bài tập mới",
                description="Đã phát hành đề bài và phiếu hướng dẫn làm bài.",
            )
            AssignmentEventLog.objects.create(
                assignment=a1,
                student=student,
                actor=cst0.teacher.user if cst0.teacher else creator,
                event_type="EXTENDED_1",
                title="Gia hạn thời hạn nộp bài lần 1",
                description="Gia hạn thêm 1 ngày để học sinh hoàn thiện phần vẽ đồ thị GeoGebra.",
            )
        except Exception as exc:
            logger.warning("Auto-seeding assignments skipped: %s", exc)

    @classmethod
    def list_assignments(
        cls,
        user: Any,
        subject: str | None = None,
        status_filter: str | None = None,
        type_filter: str | None = None,
        search_query: str | None = None,
        sort_by: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Lists all published assignments for the student's class with filters and student submissions.
        """
        cls.ensure_schema()
        student = cls.resolve_student(user)
        if not student:
            return []

        school_class = cls.resolve_student_class(student)
        if not school_class:
            return []

        cls.ensure_seed_data_for_class(school_class=school_class, student=student)

        assignments_qs = (
            Assignment.objects.filter(
                class_subject_teacher__school_class=school_class,
                is_published=True,
            )
            .select_related(
                "class_subject_teacher__school_class",
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher__user",
                "created_by",
            )
            .order_by("-assigned_date", "-due_date")
        )

        assignments_list = list(assignments_qs)
        if not assignments_list:
            return []

        submissions = AssignmentSubmission.objects.filter(
            student=student,
            assignment__in=assignments_list,
        ).select_related("graded_by", "appeal_resolved_by", "student__user")
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
        cls.ensure_schema()
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
                .select_related("graded_by", "appeal_resolved_by", "student__user")
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
    def get_summary(cls, user: Any) -> dict[str, Any]:
        """
        Computes summary dashboard counts, average score, and available subjects for current student.
        """
        cls.ensure_schema()
        student = cls.resolve_student(user)
        school_class = cls.resolve_student_class(student) if student else None
        class_name = school_class.name if school_class else None

        all_items = cls.list_assignments(user=user)

        total = len(all_items)
        pending_count = sum(1 for i in all_items if i["status"] == "pending")
        submitted_count = sum(1 for i in all_items if i["status"] == "submitted")
        graded_count = sum(1 for i in all_items if i["status"] == "graded")
        overdue_count = sum(1 for i in all_items if i["status"] == "overdue")

        graded_items = [
            i for i in all_items if i["status"] == "graded" and i["score"] is not None
        ]
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
            "semesterName": "Học kỳ 1",
            "academicYear": "2026-2027",
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
        cls.ensure_schema()
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
                raise ValueError("Bài tập đã được giáo viên chấm điểm, không thể chỉnh sửa bài nộp.")

            has_previous_submission = bool(not created and submission.submitted_at is not None)
            reopen_approved = submission.reopen_status == "APPROVED"

            if is_late and not assignment.allow_late_submission and not reopen_approved:
                raise ValueError(
                    "Bài tập này đã hết hạn và không cho phép nộp muộn. Vui lòng gửi yêu cầu xin mở lại cổng nộp bài."
                )

            if has_previous_submission:
                if not assignment.allow_resubmission and not reopen_approved:
                    raise ValueError("Bài tập này không cho phép nộp lại sau khi đã gửi bài.")
                current_attempts = int(submission.attempt_number or 1)
                max_attempts = int(assignment.max_resubmission_count or 3)
                if current_attempts >= max_attempts and not reopen_approved:
                    raise ValueError(
                        f"Bạn đã sử dụng hết số lần nộp lại tối đa ({max_attempts} lần)."
                    )
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
        cls.ensure_schema()
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

    @classmethod
    def submit_appeal(
        cls,
        user: Any,
        assignment_id: str,
        reason: str,
        attachments: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        Submits a student score appeal (phúc khảo điểm) for a graded assignment.
        """
        cls.ensure_schema()
        student = cls.resolve_student(user)
        if not student:
            raise ValueError("Không tìm thấy hồ sơ học sinh.")

        assignment = Assignment.objects.filter(id=assignment_id).first()
        if not assignment:
            raise ValueError("Không tìm thấy bài tập.")

        submission = AssignmentSubmission.objects.filter(
            assignment=assignment,
            student=student,
        ).first()
        if not submission or (submission.status != "GRADED" and submission.score is None):
            raise ValueError("Chỉ có thể gửi yêu cầu phúc khảo đối với bài tập đã có điểm.")

        if submission.appeal_status == "PENDING":
            raise ValueError("Yêu cầu phúc khảo điểm của bạn đang chờ giáo viên bộ môn xét duyệt.")

        clean_reason = (reason or "").strip()
        if not clean_reason:
            raise ValueError("Vui lòng nhập nội dung và lý do đề nghị phúc khảo điểm.")

        now = timezone.now()
        with transaction.atomic():
            submission.appeal_status = "PENDING"
            submission.appeal_reason = clean_reason
            submission.appeal_attachments = attachments or []
            submission.appealed_at = now
            submission.save()

            AssignmentEventLog.objects.create(
                assignment=assignment,
                submission=submission,
                student=student,
                actor=student.user if student.user else None,
                event_type="APPEAL_SUBMITTED",
                title="Học sinh gửi yêu cầu phúc khảo điểm",
                description=clean_reason,
                metadata={
                    "currentScore": float(submission.final_score or submission.score or 0),
                    "status": "pending",
                },
            )

        return cls.get_assignment_detail(user=user, assignment_id=assignment_id)
