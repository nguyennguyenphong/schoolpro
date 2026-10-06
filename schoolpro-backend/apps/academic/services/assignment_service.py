"""
Business logic service for Academic Assignment and Submission domain.
Handles student assignment feed, detail resolution, summary metrics, and submissions.
"""

import logging
from typing import Any

from django.utils import timezone

from apps.academic.models.assignment import Assignment, AssignmentSubmission
from apps.core.models.organization import ClassSubjectTeacher, StudentClassEnrollment
from apps.core.models.profile import Student

logger = logging.getLogger(__name__)


class AssignmentService:
    """
    Orchestrates student assignment retrieval, status calculations, and submissions.
    """

    TYPE_DB_TO_UI = {
        "HOMEWORK": "homework",
        "PROJECT": "project",
        "ESSAY": "essay",
        "REVISION": "quiz",
    }

    TYPE_UI_TO_DB = {
        "homework": "HOMEWORK",
        "project": "PROJECT",
        "essay": "ESSAY",
        "quiz": "REVISION",
    }

    @staticmethod
    def resolve_student(user: Any) -> Student | None:
        """
        Resolves the Student profile for the authenticated user.
        In dev/testing mode, falls back to the first active enrolled student if user is staff/superuser.
        """
        try:
            student = Student.objects.filter(user=user).first()
            if student:
                return student
            if user.is_staff or user.is_superuser:
                # Dev fallback for admin previewing student portal
                return Student.objects.first()
        except Exception as e:
            logger.warning(f"Error resolving student profile: {e}")
        return None

    @staticmethod
    def resolve_student_class(student: Student) -> Any | None:
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
            .select_related("school_class")
            .first()
        )
        if enrollment:
            return enrollment.school_class
        if hasattr(student, "current_class") and student.current_class:
            return student.current_class
        # Fallback to class with assignments
        first_cst = ClassSubjectTeacher.objects.filter(assignments__isnull=False).first()
        if first_cst:
            return first_cst.school_class
        return None

    @classmethod
    def format_assignment_item(
        cls,
        assignment: Assignment,
        submission: AssignmentSubmission | None = None,
    ) -> dict[str, Any]:
        """
        Maps an Assignment model instance and optional student Submission to the API payload.
        """
        now = timezone.now()
        cst = assignment.class_subject_teacher
        subject = cst.subject
        teacher_user = cst.teacher.user if cst.teacher else assignment.created_by

        # Calculate student status: pending | submitted | graded | overdue
        if submission:
            if submission.status == "GRADED" or submission.score is not None:
                item_status = "graded"
            elif submission.status in ["SUBMITTED", "LATE"]:
                item_status = "submitted"
            elif assignment.due_date < now:
                item_status = "overdue"
            else:
                item_status = "pending"
        else:
            if assignment.due_date < now:
                item_status = "overdue"
            else:
                item_status = "pending"

        # Format dates
        due_date_str = assignment.due_date.astimezone(timezone.get_current_timezone()).strftime(
            "%Y-%m-%d %H:%M"
        )
        assigned_date_str = assignment.assigned_date.strftime("%Y-%m-%d")

        # Format teacher email
        teacher_email = teacher_user.email if teacher_user and teacher_user.email else ""

        # Map assignment type
        ui_type = cls.TYPE_DB_TO_UI.get(assignment.assignment_type, "homework")

        # Format attachments
        attachments = []
        if isinstance(assignment.attachments, list):
            attachments = assignment.attachments

        # Format submission payload
        submission_payload = None
        reopen_payload = None
        if submission:
            # Check for reopen request stored in submission attachments metadata
            files_list = []
            if isinstance(submission.attachments, list):
                files_list = submission.attachments
            elif isinstance(submission.attachments, dict):
                files_list = submission.attachments.get("files", [])
                reopen_payload = submission.attachments.get("reopenRequest")

            sub_date_str = ""
            if submission.submitted_at:
                sub_date_str = submission.submitted_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M")

            first_file_name = files_list[0].get("name") if files_list else None
            first_file_url = files_list[0].get("url") if files_list else None

            if submission.submitted_at or submission.content_text or files_list:
                submission_payload = {
                    "submittedAt": sub_date_str,
                    "content": submission.content_text or "",
                    "fileName": first_file_name,
                    "fileUrl": first_file_url,
                    "files": files_list,
                }

        score_val = float(submission.score) if submission and submission.score is not None else None
        feedback_val = submission.feedback if submission and submission.feedback else None

        return {
            "id": str(assignment.id),
            "title": assignment.title,
            "subjectCode": subject.code if subject else "GEN",
            "subjectName": subject.name if subject else "Môn học",
            "teacherName": teacher_user.full_name if teacher_user else "Giáo viên bộ môn",
            "teacherEmail": teacher_email,
            "type": ui_type,
            "status": item_status,
            "dueDate": due_date_str,
            "assignedDate": assigned_date_str,
            "description": assignment.description or "",
            "pointsPossible": float(assignment.max_score),
            "score": score_val,
            "teacherFeedback": feedback_val,
            "attachments": attachments,
            "submission": submission_payload,
            "reopenRequest": reopen_payload,
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
    ) -> list[dict[str, Any]]:
        """
        Lists all published assignments for the student's class with filters and student submissions.
        """
        student = cls.resolve_student(user)
        if not student:
            return []

        school_class = cls.resolve_student_class(student)
        if not school_class:
            return []

        assignments_qs = (
            Assignment.objects.filter(
                class_subject_teacher__school_class=school_class,
                is_published=True,
            )
            .select_related(
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher__user",
                "created_by",
            )
            .order_by("-assigned_date", "-due_date")
        )

        assignments_list = list(assignments_qs)
        if not assignments_list:
            return []

        # Bulk fetch student's submissions for these assignments
        submissions = AssignmentSubmission.objects.filter(
            student=student,
            assignment__in=assignments_list,
        )
        submissions_map = {sub.assignment_id: sub for sub in submissions}

        # Format items
        formatted_items = [
            cls.format_assignment_item(
                assignment=a,
                submission=submissions_map.get(a.id),
            )
            for a in assignments_list
        ]

        # Apply in-memory filters
        result = formatted_items

        if subject and subject != "all":
            result = [i for i in result if i["subjectCode"] == subject]

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
            ]

        # Sorting
        if sort_by == "due_soon":
            result.sort(key=lambda x: x["dueDate"])
        elif sort_by == "score":
            result.sort(key=lambda x: (x["score"] is not None, x["score"] or 0), reverse=True)
        else:
            # Default newest
            result.sort(key=lambda x: (x["assignedDate"], x["dueDate"]), reverse=True)

        return result

    @classmethod
    def get_assignment_detail(cls, user: Any, assignment_id: str) -> dict[str, Any]:
        """
        Retrieves detailed view of a single assignment for the student.
        """
        student = cls.resolve_student(user)
        assignment = (
            Assignment.objects.filter(id=assignment_id)
            .select_related(
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher__user",
                "created_by",
            )
            .first()
        )
        if not assignment:
            raise ValueError("Không tìm thấy bài tập")

        submission = None
        if student:
            submission = AssignmentSubmission.objects.filter(
                assignment=assignment,
                student=student,
            ).first()

        return cls.format_assignment_item(assignment=assignment, submission=submission)

    @classmethod
    def get_summary(cls, user: Any) -> dict[str, Any]:
        """
        Computes summary dashboard counts and average score for current student.
        """
        student = cls.resolve_student(user)
        school_class = cls.resolve_student_class(student) if student else None
        class_name = school_class.name if school_class else None

        all_items = cls.list_assignments(user=user)

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

        return {
            "total": total,
            "pendingCount": pending_count,
            "submittedCount": submitted_count,
            "gradedCount": graded_count,
            "overdueCount": overdue_count,
            "averageScore": avg_score,
            "className": class_name,
            "semesterName": "HK1",
            "academicYear": "2026-2027",
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
        Processes online homework submission or re-submission.
        """
        student = cls.resolve_student(user)
        if not student:
            raise ValueError("Không tìm thấy hồ sơ học sinh của tài khoản này.")

        assignment = Assignment.objects.filter(id=assignment_id).first()
        if not assignment:
            raise ValueError("Không tìm thấy bài tập cần nộp.")

        now = timezone.now()
        is_late = now > assignment.due_date

        submission, _ = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=student,
        )

        submission.submitted_at = now
        submission.content_text = content or ""

        # Normalize attachments
        clean_files = files if files is not None else []
        submission.attachments = clean_files
        submission.status = "LATE" if is_late else "SUBMITTED"
        submission.save()

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

        teacher_user = (
            assignment.class_subject_teacher.teacher.user
            if assignment.class_subject_teacher and assignment.class_subject_teacher.teacher
            else assignment.created_by
        )
        teacher_email = teacher_user.email if teacher_user and teacher_user.email else ""

        submission, _ = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=student,
        )

        # Store reopen request payload
        existing_attachments = submission.attachments
        if isinstance(existing_attachments, list):
            submission.attachments = {
                "files": existing_attachments,
                "reopenRequest": {
                    "requestedAt": timezone.now().strftime("%Y-%m-%d %H:%M"),
                    "reason": reason,
                    "teacherEmail": teacher_email,
                    "status": "pending",
                },
            }
        elif isinstance(existing_attachments, dict):
            existing_attachments["reopenRequest"] = {
                "requestedAt": timezone.now().strftime("%Y-%m-%d %H:%M"),
                "reason": reason,
                "teacherEmail": teacher_email,
                "status": "pending",
            }
            submission.attachments = existing_attachments
        else:
            submission.attachments = {
                "files": [],
                "reopenRequest": {
                    "requestedAt": timezone.now().strftime("%Y-%m-%d %H:%M"),
                    "reason": reason,
                    "teacherEmail": teacher_email,
                    "status": "pending",
                },
            }

        submission.save()
        return cls.get_assignment_detail(user=user, assignment_id=assignment_id)
