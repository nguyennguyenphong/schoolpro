"""
Business logic service for Academic Student Leave Requests domain.
Handles:
- Student leave application feed, summary metrics, and timetable validation
- Deduplicated notification routing to Homeroom Teacher & Subject Teachers
- 3-hour pre-lesson approval deadline calculation & automatic approval engine
- SMTP Email dispatching (homeroom teacher, subject teachers, and student)
- Timestamped LeaveRequestEventLog audit trail
- Official A4 Vietnamese PDF generation
"""

import logging
from datetime import date, datetime, timedelta
from typing import Any

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.academic.models.attendance import (
    Attendance,
    AttendanceLog,
    LeaveRequest,
    LeaveRequestEventLog,
)
from apps.academic.services.leave_request_notification_service import (
    LeaveRequestNotificationService,
)
from apps.academic.services.leave_request_pdf_service import LeaveRequestPdfService
from apps.academic.services.leave_request_timetable_service import (
    LeaveRequestTimetableService,
)
from apps.core.models.organization import SchoolClass, StudentClassEnrollment
from apps.core.models.profile import Guardian, Student
from apps.master.models.semester import Semester

logger = logging.getLogger(__name__)


class LeaveRequestService:
    """
    Orchestrates student leave request retrieval, timetable validation,
    3-hour pre-lesson auto-approval, email notifications, and PDF generation.
    """

    LEAVE_TYPE_DB_TO_UI = {
        "SICK": "sick",
        "FAMILY_AFFAIR": "family_affair",
        "BEREAVEMENT": "bereavement",
        "OFFICIAL_COMPETITION": "official_competition",
        "OTHER": "other",
    }

    LEAVE_TYPE_UI_TO_DB = {
        "sick": "SICK",
        "family_affair": "FAMILY_AFFAIR",
        "bereavement": "BEREAVEMENT",
        "official_competition": "OFFICIAL_COMPETITION",
        "other": "OTHER",
    }

    LEAVE_TYPE_LABELS_VI = {
        "SICK": "Nghỉ ốm / Khám chữa bệnh",
        "FAMILY_AFFAIR": "Việc gia đình",
        "BEREAVEMENT": "Việc hiếu / Tang chế",
        "OFFICIAL_COMPETITION": "Thi đấu / Công tác trường",
        "OTHER": "Lý do khác",
    }

    STATUS_DB_TO_UI = {
        "PENDING": "pending",
        "APPROVED": "approved",
        "REJECTED": "rejected",
        "CANCELLED": "cancelled",
    }

    STATUS_UI_TO_DB = {
        "pending": "PENDING",
        "approved": "APPROVED",
        "rejected": "REJECTED",
        "cancelled": "CANCELLED",
    }

    DAY_OF_WEEK_LABELS = LeaveRequestTimetableService.DAY_OF_WEEK_LABELS

    MAX_ALLOWED_DAYS_PER_YEAR = 45
    AUTO_APPROVAL_HOURS_FROM_SUBMISSION = 3
    AUTO_APPROVAL_HOURS_BEFORE_LESSON = 3  # Backwards compatibility alias

    @staticmethod
    def resolve_student(user: Any) -> Student | None:
        """
        Resolves the Student profile for the authenticated user.
        In dev/testing mode, falls back to the first active enrolled student if user is staff/superuser.
        """
        try:
            student = (
                Student.objects.select_related("user", "current_class").filter(user=user).first()
            )
            if student:
                return student
            if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
                student_with_leaves = (
                    Student.objects.select_related("user", "current_class")
                    .filter(leave_requests__isnull=False)
                    .first()
                )
                if student_with_leaves:
                    return student_with_leaves
                return Student.objects.select_related("user", "current_class").first()
        except Exception as exc:
            logger.warning("Error resolving student profile for leave requests: %s", exc)
        return None

    @staticmethod
    def resolve_student_class(student: Student | None) -> SchoolClass | None:
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
            .select_related(
                "school_class",
                "school_class__academic_year",
                "school_class__homeroom_teacher",
                "school_class__homeroom_teacher__user",
            )
            .first()
        )
        if enrollment and enrollment.school_class:
            return enrollment.school_class
        if student.current_class_id:
            return (
                SchoolClass.objects.select_related(
                    "academic_year",
                    "homeroom_teacher",
                    "homeroom_teacher__user",
                )
                .filter(id=student.current_class_id)
                .first()
            )
        return SchoolClass.objects.select_related(
            "academic_year",
            "homeroom_teacher",
            "homeroom_teacher__user",
        ).first()

    @staticmethod
    def resolve_primary_guardian(student: Student | None) -> Guardian | None:
        """
        Resolves the primary guardian for the student if available.
        """
        if not student:
            return None
        return (
            Guardian.objects.filter(student=student)
            .order_by("-is_primary_contact", "created_at")
            .first()
        )

    @staticmethod
    def calculate_leave_days(
        start_date: date, end_date: date, session_shift: str = "all_day"
    ) -> float:
        return LeaveRequestTimetableService.calculate_leave_days(
            start_date=start_date, end_date=end_date, session_shift=session_shift
        )

    @classmethod
    def get_active_weekdays_for_class(
        cls,
        school_class: SchoolClass | None,
        session_shift: str = "all_day",
    ) -> list[int]:
        return LeaveRequestTimetableService.get_active_weekdays_for_class(
            school_class=school_class, session_shift=session_shift
        )

    @classmethod
    def compute_affected_lessons_for_class(
        cls,
        school_class: SchoolClass | None,
        start_date: date,
        end_date: date,
        session_shift: str = "all_day",
        selected_lesson_keys: list[str] | None = None,
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        return LeaveRequestTimetableService.compute_affected_lessons_for_class(
            school_class=school_class,
            start_date=start_date,
            end_date=end_date,
            session_shift=session_shift,
            selected_lesson_keys=selected_lesson_keys,
        )

    @classmethod
    def calculate_first_lesson_and_deadline(
        cls,
        affected_lessons: list[dict[str, Any]],
        fallback_start_date: date,
        submitted_at: datetime | None = None,
    ) -> tuple[datetime, datetime]:
        return LeaveRequestTimetableService.calculate_first_lesson_and_deadline(
            affected_lessons=affected_lessons,
            fallback_start_date=fallback_start_date,
            submitted_at=submitted_at,
        )

    @classmethod
    def _send_email_safe(
        cls,
        subject: str,
        plain_body: str,
        recipient_list: list[str],
        html_body: str | None = None,
    ) -> bool:
        return LeaveRequestNotificationService.send_email_safe(
            subject=subject,
            plain_body=plain_body,
            recipient_list=recipient_list,
            html_body=html_body,
        )

    @classmethod
    def record_event_log(
        cls,
        leave_request: LeaveRequest,
        event_type: str,
        title: str,
        description: str,
        actor_name: str,
        actor_role: str = "",
        badge_text: str = "",
        badge_color: str = "blue",
        recipient_email: str = "",
        email_sent: bool = False,
        created_at: datetime | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> LeaveRequestEventLog:
        return LeaveRequestNotificationService.record_event_log(
            leave_request=leave_request,
            event_type=event_type,
            title=title,
            description=description,
            actor_name=actor_name,
            actor_role=actor_role,
            badge_text=badge_text,
            badge_color=badge_color,
            recipient_email=recipient_email,
            email_sent=email_sent,
            created_at=created_at,
            metadata=metadata,
        )

    @classmethod
    def send_submission_notifications(
        cls,
        leave_req: LeaveRequest,
        affected_lessons: list[dict[str, Any]],
        notified_teachers: list[dict[str, Any]],
        deadline_dt: datetime,
    ) -> None:
        LeaveRequestNotificationService.send_submission_notifications(
            leave_req=leave_req,
            affected_lessons=affected_lessons,
            notified_teachers=notified_teachers,
            deadline_dt=deadline_dt,
        )

    @classmethod
    def send_approval_notifications(
        cls,
        leave_req: LeaveRequest,
        is_auto: bool = False,
    ) -> None:
        LeaveRequestNotificationService.send_approval_notifications(
            leave_req=leave_req,
            is_auto=is_auto,
        )

    @classmethod
    def check_and_send_deadline_reminders(cls) -> int:
        """
        Sends approaching deadline reminders to Homeroom Teachers when a pending request
        is within 30 minutes of its approval_deadline (submitted_at + 3 hours).
        """
        now = timezone.now()
        thirty_mins_later = now + timedelta(minutes=30)
        pending_qs = LeaveRequest.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "school_class__homeroom_teacher",
            "school_class__homeroom_teacher__user",
        ).filter(
            status="PENDING",
            approval_deadline__isnull=False,
            approval_deadline__lte=thirty_mins_later,
            approval_deadline__gt=now,
        )

        reminder_count = 0
        for req in pending_qs:
            meta = req.metadata if isinstance(req.metadata, dict) else {}
            if meta.get("reminder30mSent"):
                continue
            with transaction.atomic():
                locked_req = (
                    LeaveRequest.objects.select_for_update()
                    .filter(id=req.id, status="PENDING")
                    .first()
                )
                if not locked_req:
                    continue
                locked_meta = locked_req.metadata if isinstance(locked_req.metadata, dict) else {}
                if locked_meta.get("reminder30mSent"):
                    continue

                sent = LeaveRequestNotificationService.send_deadline_reminder_to_homeroom(
                    locked_req
                )
                if sent:
                    locked_meta["reminder30mSent"] = True
                    locked_meta["reminder30mSentAt"] = now.isoformat()
                    locked_req.metadata = locked_meta
                    locked_req.save(update_fields=["metadata"])
                    reminder_count += 1
        return reminder_count

    @classmethod
    def check_and_auto_approve_overdue_requests(cls, qs: Any = None) -> int:
        """
        BR-01 / BR-03: Automatically approves any PENDING leave request whose
        approval_deadline (submitted_at + 3 hours continuous) has arrived without
        Homeroom Teacher action.

        Concurrency & Integrity:
        - Atomic transaction with select_for_update ensures only one actor wins
          if Homeroom Teacher reviews at the exact moment auto-approval executes.
        - reviewed_by is recorded as None (System), not attributed to Homeroom Teacher.
        - approval_method is recorded as AUTO.
        """
        now = timezone.now()
        pending_qs = LeaveRequest.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "school_class__homeroom_teacher",
            "school_class__homeroom_teacher__user",
        ).filter(status="PENDING")

        if qs is not None:
            pending_ids = list(qs.filter(status="PENDING").values_list("id", flat=True))
            if not pending_ids:
                return 0
            pending_qs = pending_qs.filter(id__in=pending_ids)

        auto_approved_count = 0
        for req in pending_qs:
            meta = req.metadata if isinstance(req.metadata, dict) else {}
            affected_lessons = meta.get("affectedLessons")
            if not isinstance(affected_lessons, list) or not affected_lessons:
                affected_lessons, notified_teachers = cls.compute_affected_lessons_for_class(
                    school_class=req.school_class,
                    start_date=req.start_date,
                    end_date=req.end_date,
                    session_shift=meta.get("sessionShift", "all_day"),
                )
                meta["affectedLessons"] = affected_lessons
                meta["notifiedTeachers"] = notified_teachers

            submitted_ref = req.created_at or now
            if not req.approval_deadline:
                req.approval_deadline = submitted_ref + timedelta(
                    hours=cls.AUTO_APPROVAL_HOURS_FROM_SUBMISSION
                )
                req.save(update_fields=["approval_deadline"])

            effective_deadline = req.approval_deadline
            if now >= effective_deadline:
                with transaction.atomic():
                    locked_req = (
                        LeaveRequest.objects.select_for_update()
                        .select_related(
                            "student",
                            "student__user",
                            "school_class",
                            "school_class__homeroom_teacher",
                            "school_class__homeroom_teacher__user",
                        )
                        .filter(id=req.id, status="PENDING")
                        .first()
                    )
                    if not locked_req:
                        # Teacher already approved/rejected or student cancelled right before this
                        continue

                    locked_meta = (
                        locked_req.metadata if isinstance(locked_req.metadata, dict) else {}
                    )
                    homeroom_teacher = getattr(locked_req.school_class, "homeroom_teacher", None)
                    homeroom_user = (
                        getattr(homeroom_teacher, "user", None)
                        if homeroom_teacher
                        else locked_req.requested_by
                    )

                    locked_req.status = "APPROVED"
                    locked_req.is_auto_approved = True
                    # Per BR-01 / BR-03: Action of the System, not attributed to Homeroom Teacher
                    locked_req.reviewed_by = None
                    locked_req.reviewed_at = timezone.now()
                    locked_req.teacher_note = "Hệ thống tự động phê duyệt do Giáo viên chủ nhiệm không xử lý trong thời hạn 3 giờ kể từ khi gửi đơn."
                    locked_meta["isAutoApproved"] = True
                    locked_meta["approvalMethod"] = "AUTO"
                    locked_meta["autoApprovedAt"] = locked_req.reviewed_at.astimezone(
                        timezone.get_current_timezone()
                    ).strftime("%Y-%m-%d %H:%M")
                    locked_meta["autoApproveReason"] = "GVCN không xử lý trong thời hạn 3 giờ."
                    locked_req.metadata = locked_meta
                    locked_req.save()

                    # Populate excused attendance records
                    curr_d = locked_req.start_date
                    while curr_d <= locked_req.end_date:
                        if curr_d.weekday() != 6:
                            att, created = Attendance.objects.get_or_create(
                                student_id=locked_req.student_id,
                                attendance_date=curr_d,
                                period_id=None,
                                defaults={
                                    "school_class_id": locked_req.school_class_id,
                                    "status": Attendance.StatusChoices.ABSENT_EXCUSED,
                                    "method": Attendance.MethodChoices.EXCUSED_LEAVE,
                                    "excuse_reason": f"Đơn xin nghỉ phép #{locked_req.code} (Hệ thống tự động duyệt): {locked_req.reason}",
                                    "recorded_by": homeroom_user or locked_req.requested_by,
                                },
                            )
                            if (
                                not created
                                and att.status != Attendance.StatusChoices.ABSENT_EXCUSED
                            ):
                                prev_st = att.status
                                att.status = Attendance.StatusChoices.ABSENT_EXCUSED
                                att.excuse_reason = f"Đơn xin nghỉ phép #{locked_req.code} (Hệ thống tự động duyệt): {locked_req.reason}"
                                att.save()
                                AttendanceLog.objects.create(
                                    attendance=att,
                                    student_id=locked_req.student_id,
                                    previous_status=prev_st,
                                    new_status=Attendance.StatusChoices.ABSENT_EXCUSED,
                                    action="AUTO_APPROVED_LEAVE",
                                    reason=f"Tự động duyệt đơn #{locked_req.code}",
                                    performed_by=homeroom_user or locked_req.requested_by,
                                )
                        curr_d += timedelta(days=1)

                    cls.record_event_log(
                        leave_request=locked_req,
                        event_type="AUTO_APPROVED",
                        title="Hệ thống tự động phê duyệt đơn xin nghỉ phép",
                        description=(
                            "Hệ thống tự động phê duyệt do Giáo viên chủ nhiệm không xử lý trong thời hạn 3 giờ (180 phút) kể từ khi gửi đơn."
                        ),
                        actor_name="Hệ thống SchoolPro",
                        actor_role="SYSTEM",
                        badge_text="Tự động duyệt (Quá hạn 3 giờ)",
                        badge_color="purple",
                        created_at=locked_req.reviewed_at,
                    )

                    cls.send_approval_notifications(locked_req, is_auto=True)
                    auto_approved_count += 1

                    try:
                        from apps.academic.services.leave_request_realtime import (
                            LeaveRequestRealtimeEvent,
                            LeaveRequestRealtimeService,
                        )

                        formatted_item = cls.format_leave_request_item(
                            locked_req, include_logs=True
                        )
                        LeaveRequestRealtimeService.broadcast_event(
                            event_type=LeaveRequestRealtimeEvent.AUTO_APPROVED,
                            leave_request=locked_req,
                            item_data=formatted_item,
                            message=(
                                f"Đơn xin nghỉ phép #{locked_req.code} đã được hệ thống tự động phê duyệt "
                                f"(quá thời hạn xử lý 3 giờ)."
                            ),
                            actor_name="Hệ thống SchoolPro",
                        )
                    except Exception as exc:
                        logger.debug("Auto-approval realtime broadcast skipped: %s", exc)

        return auto_approved_count

    @classmethod
    def ensure_event_logs_for_item(
        cls,
        item: LeaveRequest,
        affected_lessons: list[dict[str, Any]],
        notified_teachers: list[dict[str, Any]],
        deadline_dt: datetime,
    ) -> list[dict[str, Any]]:
        """
        Returns serialized chronological event logs for a LeaveRequest,
        backfilling initial logs if the record was seeded prior to event log table creation.
        """
        tz = timezone.get_current_timezone()
        existing_logs = list(item.event_logs.all().order_by("created_at"))

        if not existing_logs:
            student = item.student
            student_user = getattr(student, "user", None) if student else None
            student_name = student_user.full_name if student_user else "Học sinh"
            student_code = student.student_code if student else ""
            school_class = item.school_class
            homeroom_teacher = (
                getattr(school_class, "homeroom_teacher", None) if school_class else None
            )
            homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None
            homeroom_name = homeroom_user.full_name if homeroom_user else "Giáo viên chủ nhiệm"
            homeroom_email = (homeroom_user.email or "").strip() if homeroom_user else ""
            homeroom_id = str(homeroom_teacher.id) if homeroom_teacher else ""

            meta = item.metadata if isinstance(item.metadata, dict) else {}
            guardian_name = meta.get("guardianName") or (
                item.guardian.full_name if item.guardian else "Phụ huynh"
            )
            guardian_rel = meta.get("guardianRelationship") or (
                item.guardian.relationship if item.guardian else "Phụ huynh"
            )
            guardian_phone = meta.get("guardianPhone") or (
                item.guardian.phone if item.guardian else ""
            )

            base_time = item.created_at or timezone.now()
            deadline_fmt = deadline_dt.astimezone(tz).strftime("%H:%M ngày %d/%m/%Y")

            # 1. Created log
            cls.record_event_log(
                leave_request=item,
                event_type="CREATED",
                title="Học sinh đăng ký đơn xin nghỉ phép trực tuyến",
                description=(
                    f"Đăng ký nghỉ {len(affected_lessons)} tiết học từ ngày "
                    f"{item.start_date.strftime('%d/%m/%Y')} đến {item.end_date.strftime('%d/%m/%Y')}. "
                    f"Xác nhận bởi phụ huynh {guardian_name} ({guardian_rel}"
                    f"{f' - SĐT: {guardian_phone}' if guardian_phone else ''})."
                ),
                actor_name=f"{student_name} ({student_code})",
                actor_role="STUDENT",
                badge_text="Đã đăng ký",
                badge_color="blue",
                created_at=base_time,
            )

            # 2. Homeroom & Subject Teacher notifications (deduplicated)
            homeroom_as_subject = None
            other_teachers = []
            for t in notified_teachers:
                if (
                    t.get("isHomeroomTeacher")
                    or (homeroom_id and t.get("teacherId") == homeroom_id)
                    or (
                        homeroom_email
                        and (t.get("teacherEmail") or "").strip().lower() == homeroom_email.lower()
                    )
                ):
                    homeroom_as_subject = t
                else:
                    other_teachers.append(t)

            if homeroom_as_subject:
                subj_list = ", ".join(homeroom_as_subject.get("subjects") or [])
                hr_title = "Gửi thông báo & Email tới Giáo viên chủ nhiệm (kiêm Giáo viên bộ môn)"
                hr_desc = (
                    f"Đã gửi 01 thông báo hợp nhất và email tới Giáo viên chủ nhiệm {homeroom_name} "
                    f"(đồng thời dạy môn {subj_list}). Hạn phê duyệt trước {deadline_fmt} "
                    f"(3 giờ kể từ khi gửi đơn)."
                )
            else:
                hr_title = "Gửi thông báo & Email yêu cầu phê duyệt tới Giáo viên chủ nhiệm"
                hr_desc = (
                    f"Đã gửi thông báo và email tới Giáo viên chủ nhiệm {homeroom_name} ({homeroom_email or 'N/A'}). "
                    f"Hạn phê duyệt trước {deadline_fmt} (3 giờ kể từ khi gửi đơn)."
                )

            cls.record_event_log(
                leave_request=item,
                event_type="HOMEROOM_NOTIFIED",
                title=hr_title,
                description=hr_desc,
                actor_name=f"Hệ thống SchoolPro → {homeroom_name}",
                actor_role="HOMEROOM_TEACHER",
                badge_text="Đã gửi Email Giáo viên chủ nhiệm",
                badge_color="purple",
                recipient_email=homeroom_email,
                email_sent=True,
                created_at=base_time + timedelta(seconds=15),
            )

            if other_teachers:
                t_Notif = [
                    f"{t['teacherName']} (Môn {', '.join(t['subjects'])} - {t['lessonCount']} tiết)"
                    for t in other_teachers
                ]
                cls.record_event_log(
                    leave_request=item,
                    event_type="SUBJECT_TEACHERS_NOTIFIED",
                    title=f"Thông báo tới {len(other_teachers)} Giáo viên bộ môn giảng dạy",
                    description=f"Đã thông báo lịch nghỉ học tới Giáo viên bộ môn: {'; '.join(t_Notif)}.",
                    actor_name="Hệ thống Quản lý Học vụ",
                    actor_role="SYSTEM",
                    badge_text=f"Đã báo {len(other_teachers)} Giáo viên bộ môn",
                    badge_color="cyan",
                    email_sent=True,
                    created_at=base_time + timedelta(seconds=30),
                )

            if item.status == "APPROVED":
                review_dt = item.reviewed_at or (base_time + timedelta(minutes=30))
                if item.is_auto_approved:
                    cls.record_event_log(
                        leave_request=item,
                        event_type="AUTO_APPROVED",
                        title="Hệ thống tự động phê duyệt đơn xin nghỉ phép",
                        description=(
                            item.teacher_note
                            or "Đã quá thời hạn 3 giờ xử lý của Giáo viên chủ nhiệm, hệ thống tự động phê duyệt đơn."
                        ),
                        actor_name="Hệ thống SchoolPro",
                        actor_role="SYSTEM",
                        badge_text="Tự động duyệt (Quá hạn 3 giờ)",
                        badge_color="purple",
                        created_at=review_dt,
                    )
                else:
                    reviewer_name = (
                        item.reviewed_by.full_name if item.reviewed_by else homeroom_name
                    )
                    cls.record_event_log(
                        leave_request=item,
                        event_type="APPROVED",
                        title="Giáo viên chủ nhiệm đã phê duyệt đơn xin nghỉ phép",
                        description=(
                            item.teacher_note
                            or "Đồng ý cho học sinh nghỉ phép. Đã cập nhật Vắng có phép vào sổ điểm danh."
                        ),
                        actor_name=reviewer_name,
                        actor_role="HOMEROOM_TEACHER",
                        badge_text="Đã phê duyệt",
                        badge_color="success",
                        created_at=review_dt,
                    )

                cls.record_event_log(
                    leave_request=item,
                    event_type="POST_APPROVAL_NOTIFICATION",
                    title="Gửi Email xác nhận cho Học sinh & Thông báo Giáo viên bộ môn",
                    description=(
                        f"Đã gửi email kết quả phê duyệt tới học sinh {student_name} và thông báo "
                        f"xác nhận nghỉ có phép tới các Giáo viên bộ môn ({len(affected_lessons)} tiết)."
                    ),
                    actor_name="Hệ thống Quản lý Học vụ",
                    actor_role="SYSTEM",
                    badge_text="Đã gửi Email & Báo Giáo viên bộ môn",
                    badge_color="blue",
                    recipient_email=student_user.email if student_user else "",
                    email_sent=True,
                    created_at=review_dt + timedelta(seconds=20),
                )
            elif item.status == "REJECTED":
                review_dt = item.reviewed_at or (base_time + timedelta(minutes=30))
                reviewer_name = item.reviewed_by.full_name if item.reviewed_by else homeroom_name
                cls.record_event_log(
                    leave_request=item,
                    event_type="REJECTED",
                    title="Giáo viên chủ nhiệm từ chối đơn xin nghỉ phép",
                    description=item.teacher_note
                    or "Đơn xin nghỉ phép chưa đủ điều kiện phê duyệt.",
                    actor_name=reviewer_name,
                    actor_role="HOMEROOM_TEACHER",
                    badge_text="Từ chối",
                    badge_color="error",
                    created_at=review_dt,
                )
                cls.record_event_log(
                    leave_request=item,
                    event_type="STUDENT_EMAIL_SENT",
                    title="Gửi Email thông báo kết quả tới Học sinh",
                    description=f"Đã gửi email thông báo từ chối đơn tới học sinh {student_name}.",
                    actor_name="Hệ thống Quản lý Học vụ",
                    actor_role="SYSTEM",
                    badge_text="Đã gửi Email Học sinh",
                    badge_color="blue",
                    recipient_email=student_user.email if student_user else "",
                    email_sent=True,
                    created_at=review_dt + timedelta(seconds=15),
                )
            elif item.status == "CANCELLED":
                cancel_dt = item.updated_at or timezone.now()
                cls.record_event_log(
                    leave_request=item,
                    event_type="CANCELLED",
                    title="Học sinh đã hủy / rút đơn xin nghỉ phép",
                    description=meta.get("cancelReason")
                    or "Học sinh chủ động rút đơn xin nghỉ phép.",
                    actor_name=f"{student_name} ({student_code})",
                    actor_role="STUDENT",
                    badge_text="Đã hủy",
                    badge_color="default",
                    created_at=cancel_dt,
                )

            existing_logs = list(item.event_logs.all().order_by("created_at"))

        formatted_logs: list[dict[str, Any]] = []
        for log in existing_logs:
            time_str = (
                log.created_at.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
                if log.created_at
                else timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
            )
            formatted_logs.append(
                {
                    "id": str(log.id),
                    "eventType": log.event_type,
                    "title": log.title,
                    "description": log.description or "",
                    "actor": log.actor_name or "Hệ thống",
                    "actorRole": log.actor_role or "SYSTEM",
                    "badgeText": log.badge_text or "Sự kiện",
                    "badgeColor": log.badge_color or "blue",
                    "recipientEmail": log.recipient_email or "",
                    "emailSent": bool(log.email_sent),
                    "createdAt": time_str,
                }
            )
        return formatted_logs

    @classmethod
    def get_affected_lessons(
        cls,
        user: Any,
        start_date_str: str | None,
        end_date_str: str | None,
        session_shift: str = "all_day",
    ) -> dict[str, Any]:
        """
        API helper returning affected timetable lessons, active weekdays, approval deadline,
        and deduplicated notified teachers for the given date range.
        """
        student = cls.resolve_student(user)
        school_class = cls.resolve_student_class(student)
        homeroom_teacher = getattr(school_class, "homeroom_teacher", None) if school_class else None
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None

        today = timezone.now().date()
        try:
            start_dt = (
                datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else today
            )
        except ValueError:
            start_dt = today

        try:
            end_dt = (
                datetime.strptime(end_date_str, "%Y-%m-%d").date() if end_date_str else start_dt
            )
        except ValueError:
            end_dt = start_dt

        shift = session_shift or "all_day"
        active_weekdays = cls.get_active_weekdays_for_class(
            school_class=school_class,
            session_shift=shift,
        )
        affected_lessons, notified_teachers = cls.compute_affected_lessons_for_class(
            school_class=school_class,
            start_date=start_dt,
            end_date=end_dt,
            session_shift=shift,
        )

        first_lesson_dt, deadline_dt = cls.calculate_first_lesson_and_deadline(
            affected_lessons=affected_lessons,
            fallback_start_date=start_dt,
        )
        tz = timezone.get_current_timezone()

        return {
            "className": school_class.name if school_class else "10A1",
            "homeroomTeacherName": homeroom_user.full_name
            if homeroom_user
            else "Giáo viên chủ nhiệm",
            "homeroomTeacherEmail": homeroom_user.email if homeroom_user else "",
            "approvalAuthority": "HOMEROOM_TEACHER_ONLY",
            "activeDaysOfWeek": active_weekdays,
            "hasLessons": len(affected_lessons) > 0,
            "firstLessonStartAt": first_lesson_dt.astimezone(tz).strftime("%Y-%m-%d %H:%M")
            if affected_lessons
            else None,
            "approvalDeadline": deadline_dt.astimezone(tz).strftime("%Y-%m-%d %H:%M")
            if affected_lessons
            else None,
            "affectedLessons": affected_lessons,
            "notifiedTeachers": notified_teachers,
        }

    @classmethod
    def format_leave_request_item(
        cls, item: LeaveRequest, include_logs: bool = True
    ) -> dict[str, Any]:
        """
        Formats a LeaveRequest ORM object into a rich frontend-ready dictionary.
        """
        meta = item.metadata if isinstance(item.metadata, dict) else {}
        session_shift = meta.get("sessionShift", "all_day")
        total_days = cls.calculate_leave_days(item.start_date, item.end_date, session_shift)

        student = item.student
        student_user = getattr(student, "user", None) if student else None
        student_dob = (
            student_user.date_of_birth.strftime("%d/%m/%Y")
            if (student_user and getattr(student_user, "date_of_birth", None))
            else "........................."
        )
        school_class = item.school_class
        homeroom_teacher = getattr(school_class, "homeroom_teacher", None) if school_class else None
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None

        guardian = item.guardian
        guardian_name = meta.get("guardianName") or (guardian.full_name if guardian else "")
        guardian_phone = meta.get("guardianPhone") or (guardian.phone if guardian else "")
        guardian_rel = meta.get("guardianRelationship") or (
            guardian.relationship if guardian else "Phụ huynh"
        )

        attachments = meta.get("attachments", [])
        if not isinstance(attachments, list):
            attachments = []
        if not attachments and item.supporting_document_url:
            attachments = [
                {
                    "id": f"att-{str(item.id)[:8]}",
                    "name": meta.get("documentName", "Minh_chung_nghi_phep.pdf"),
                    "url": item.supporting_document_url,
                    "size": meta.get("documentSize", "420 KB"),
                    "type": "pdf",
                }
            ]

        affected_lessons = meta.get("affectedLessons")
        notified_teachers = meta.get("notifiedTeachers")
        if not isinstance(affected_lessons, list) or not isinstance(notified_teachers, list):
            affected_lessons, notified_teachers = cls.compute_affected_lessons_for_class(
                school_class=school_class,
                start_date=item.start_date,
                end_date=item.end_date,
                session_shift=session_shift,
            )

        affected_subjects: list[str] = []
        for lesson in affected_lessons:
            subj_name = lesson.get("subjectName")
            if subj_name and subj_name not in affected_subjects:
                affected_subjects.append(subj_name)

        first_lesson_dt, deadline_dt = cls.calculate_first_lesson_and_deadline(
            affected_lessons=affected_lessons,
            fallback_start_date=item.start_date,
            submitted_at=item.created_at,
        )
        effective_deadline = item.approval_deadline or deadline_dt

        tz = timezone.get_current_timezone()
        created_local = (
            item.created_at.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S") if item.created_at else ""
        )
        updated_local = (
            item.updated_at.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S") if item.updated_at else ""
        )
        reviewed_local = (
            item.reviewed_at.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
            if item.reviewed_at
            else None
        )
        deadline_local = effective_deadline.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
        first_lesson_local = first_lesson_dt.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")

        reviewed_by_name = None
        if item.is_auto_approved:
            reviewed_by_name = "Hệ thống SchoolPro (Tự động duyệt do quá hạn 3 giờ)"
        elif item.reviewed_by:
            reviewed_by_name = item.reviewed_by.full_name
        elif item.status in ("APPROVED", "REJECTED") and homeroom_user:
            reviewed_by_name = homeroom_user.full_name

        approval_method = meta.get("approvalMethod")
        if not approval_method:
            if item.is_auto_approved:
                approval_method = "AUTO"
            elif item.status in ("APPROVED", "REJECTED"):
                approval_method = "MANUAL"
            else:
                approval_method = None

        event_logs: list[dict[str, Any]] = []
        if include_logs:
            event_logs = cls.ensure_event_logs_for_item(
                item=item,
                affected_lessons=affected_lessons,
                notified_teachers=notified_teachers,
                deadline_dt=effective_deadline,
            )

        db_code = item.code or ""

        return {
            "id": str(item.id),
            "code": db_code,
            "requestCode": db_code,
            "studentId": str(item.student_id),
            "studentCode": student.student_code if student else "",
            "studentName": student_user.full_name if student_user else "Học sinh",
            "studentDob": student_dob,
            "classId": str(item.school_class_id),
            "className": school_class.name if school_class else "10A1",
            "leaveType": cls.LEAVE_TYPE_DB_TO_UI.get(item.leave_type, "other"),
            "leaveTypeCode": item.leave_type,
            "status": cls.STATUS_DB_TO_UI.get(item.status, "pending"),
            "statusCode": item.status,
            "approvalMethod": approval_method,
            "startDate": item.start_date.strftime("%Y-%m-%d"),
            "endDate": item.end_date.strftime("%Y-%m-%d"),
            "totalDays": total_days,
            "sessionShift": session_shift,
            "reason": item.reason,
            "commitment": meta.get(
                "commitment",
                "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.",
            ),
            "supportingDocumentUrl": item.supporting_document_url or None,
            "attachments": attachments,
            "affectedSubjects": affected_subjects,
            "affectedLessons": affected_lessons,
            "notifiedTeachers": notified_teachers,
            "firstLessonStartAt": first_lesson_local,
            "approvalDeadline": deadline_local,
            "isAutoApproved": bool(item.is_auto_approved),
            "eventLogs": event_logs,
            "guardianName": guardian_name,
            "guardianPhone": guardian_phone,
            "guardianRelationship": guardian_rel,
            "homeroomTeacherName": homeroom_user.full_name
            if homeroom_user
            else "Giáo viên chủ nhiệm",
            "homeroomTeacherEmail": homeroom_user.email if homeroom_user else "",
            "homeroomTeacherPhone": getattr(homeroom_user, "phone", "") or "",
            "teacherNote": item.teacher_note or "",
            "reviewedByName": reviewed_by_name,
            "reviewedAt": reviewed_local,
            "cancelReason": meta.get("cancelReason"),
            "cancelledAt": meta.get("cancelledAt"),
            "createdAt": created_local,
            "updatedAt": updated_local,
        }

    @classmethod
    def list_leave_requests(
        cls,
        user: Any,
        status_filter: str | None = None,
        leave_type_filter: str | None = None,
        search_query: str | None = None,
        sort_by: str | None = None,
        class_id: str | None = None,
        student_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieves filtered and sorted leave requests for the student.
        Automatically runs overdue 3-hour pre-lesson auto-approval check first.
        """
        qs = LeaveRequest.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "school_class__homeroom_teacher",
            "school_class__homeroom_teacher__user",
            "guardian",
            "requested_by",
            "reviewed_by",
        ).prefetch_related("event_logs")

        if student_id:
            qs = qs.filter(student_id=student_id)
        elif class_id:
            qs = qs.filter(school_class_id=class_id)
        else:
            student = cls.resolve_student(user)
            if not student:
                return []
            qs = qs.filter(student=student)

        # Check and auto-approve any pending request past its 3-hour pre-lesson deadline
        cls.check_and_auto_approve_overdue_requests(qs)

        if status_filter and status_filter.lower() != "all":
            db_status = cls.STATUS_UI_TO_DB.get(status_filter.lower(), status_filter.upper())
            qs = qs.filter(status=db_status)

        if leave_type_filter and leave_type_filter.lower() != "all":
            db_type = cls.LEAVE_TYPE_UI_TO_DB.get(
                leave_type_filter.lower(), leave_type_filter.upper()
            )
            qs = qs.filter(leave_type=db_type)

        if search_query and search_query.strip():
            q = search_query.strip()
            qs = qs.filter(
                Q(code__icontains=q)
                | Q(reason__icontains=q)
                | Q(teacher_note__icontains=q)
                | Q(school_class__name__icontains=q)
                | Q(student__user__full_name__icontains=q)
            )

        if sort_by == "oldest":
            qs = qs.order_by("created_at")
        elif sort_by == "start_date":
            qs = qs.order_by("-start_date", "-created_at")
        else:
            qs = qs.order_by("-created_at")

        return [cls.format_leave_request_item(item, include_logs=False) for item in qs]

    @classmethod
    def get_summary(cls, user: Any) -> dict[str, Any]:
        """
        Computes aggregated summary metrics and class/guardian context for the student.
        """
        student = cls.resolve_student(user)
        school_class = cls.resolve_student_class(student)
        guardian = cls.resolve_primary_guardian(student)

        class_name = school_class.name if school_class else None
        academic_year_name = (
            school_class.academic_year.name if school_class and school_class.academic_year else None
        )

        current_semester = Semester.objects.filter(is_current=True).first()
        if not current_semester and school_class and school_class.academic_year_id:
            current_semester = Semester.objects.filter(
                academic_year_id=school_class.academic_year_id
            ).first()
        semester_name = current_semester.name if current_semester else "Học kỳ 1"

        homeroom_teacher = getattr(school_class, "homeroom_teacher", None) if school_class else None
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None

        if not student:
            return {
                "total": 0,
                "pendingCount": 0,
                "approvedCount": 0,
                "rejectedCount": 0,
                "cancelledCount": 0,
                "totalDaysOff": 0.0,
                "maxAllowedDays": cls.MAX_ALLOWED_DAYS_PER_YEAR,
                "className": class_name,
                "semesterName": semester_name,
                "academicYear": academic_year_name,
                "homeroomTeacherName": homeroom_user.full_name if homeroom_user else None,
                "homeroomTeacherEmail": homeroom_user.email if homeroom_user else None,
                "homeroomTeacherPhone": getattr(homeroom_user, "phone", None)
                if homeroom_user
                else None,
                "guardianName": guardian.full_name if guardian else None,
                "guardianPhone": guardian.phone if guardian else None,
                "guardianRelationship": guardian.relationship if guardian else None,
            }

        qs = LeaveRequest.objects.filter(student=student)
        cls.check_and_auto_approve_overdue_requests(qs)

        total = qs.count()
        pending_count = 0
        approved_count = 0
        rejected_count = 0
        cancelled_count = 0
        total_days_off = 0.0

        for req in qs:
            meta = req.metadata if isinstance(req.metadata, dict) else {}
            shift = meta.get("sessionShift", "all_day")
            days = cls.calculate_leave_days(req.start_date, req.end_date, shift)

            if req.status == "PENDING":
                pending_count += 1
            elif req.status == "APPROVED":
                approved_count += 1
                total_days_off += days
            elif req.status == "REJECTED":
                rejected_count += 1
            elif req.status == "CANCELLED":
                cancelled_count += 1

        return {
            "total": total,
            "pendingCount": pending_count,
            "approvedCount": approved_count,
            "rejectedCount": rejected_count,
            "cancelledCount": cancelled_count,
            "totalDaysOff": total_days_off,
            "maxAllowedDays": cls.MAX_ALLOWED_DAYS_PER_YEAR,
            "className": class_name,
            "semesterName": semester_name,
            "academicYear": academic_year_name,
            "homeroomTeacherName": homeroom_user.full_name
            if homeroom_user
            else "Giáo viên chủ nhiệm",
            "homeroomTeacherEmail": homeroom_user.email if homeroom_user else "",
            "homeroomTeacherPhone": getattr(homeroom_user, "phone", "") if homeroom_user else "",
            "guardianName": guardian.full_name if guardian else "",
            "guardianPhone": guardian.phone if guardian else "",
            "guardianRelationship": guardian.relationship if guardian else "Phụ huynh",
        }

    @classmethod
    def get_leave_request_detail(cls, user: Any, leave_request_id: str) -> dict[str, Any]:
        """
        Retrieves full details of a single leave request (after checking auto-approval).
        """
        student = cls.resolve_student(user)
        base_qs = LeaveRequest.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "school_class__homeroom_teacher",
            "school_class__homeroom_teacher__user",
            "guardian",
            "requested_by",
            "reviewed_by",
        ).prefetch_related("event_logs")

        if student and not (
            getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)
        ):
            filtered_qs = base_qs.filter(id=leave_request_id, student=student)
        else:
            filtered_qs = base_qs.filter(id=leave_request_id)

        cls.check_and_auto_approve_overdue_requests(filtered_qs)
        item = filtered_qs.first()

        if not item:
            raise ValueError("Không tìm thấy đơn xin nghỉ phép.")

        return cls.format_leave_request_item(item, include_logs=True)

    @classmethod
    @transaction.atomic
    def create_leave_request(cls, user: Any, data: dict[str, Any]) -> dict[str, Any]:
        """
        Creates a new leave request for the authenticated student.
        Enforces that the selected date/shift has at least one scheduled timetable lesson.
        """
        student = cls.resolve_student(user)
        if not student:
            raise ValueError("Không tìm thấy hồ sơ học sinh.")

        school_class = cls.resolve_student_class(student)
        if not school_class:
            raise ValueError("Học sinh hiện chưa được xếp vào lớp học nào.")

        guardian = cls.resolve_primary_guardian(student)

        raw_leave_type = data.get("leaveType") or data.get("leave_type") or "SICK"
        db_leave_type = cls.LEAVE_TYPE_UI_TO_DB.get(
            str(raw_leave_type).lower(), str(raw_leave_type).upper()
        )
        if db_leave_type not in cls.LEAVE_TYPE_DB_TO_UI:
            db_leave_type = "OTHER"

        start_date = data.get("startDate") or data.get("start_date")
        end_date = data.get("endDate") or data.get("end_date")
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

        if not start_date or not end_date:
            raise ValueError("Vui lòng chọn ngày bắt đầu và ngày kết thúc nghỉ.")
        if end_date < start_date:
            raise ValueError("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.")

        reason = (data.get("reason") or "").strip()
        if not reason:
            raise ValueError("Vui lòng nhập lý do xin nghỉ phép.")

        session_shift = data.get("sessionShift") or "all_day"
        selected_lesson_keys = data.get("selectedLessonKeys")

        affected_lessons, notified_teachers = cls.compute_affected_lessons_for_class(
            school_class=school_class,
            start_date=start_date,
            end_date=end_date,
            session_shift=session_shift,
            selected_lesson_keys=selected_lesson_keys
            if isinstance(selected_lesson_keys, list) and len(selected_lesson_keys) > 0
            else None,
        )

        # Enforce that the requested leave period has at least one timetable lesson
        if not affected_lessons:
            raise ValueError(
                "Buổi học hoặc ngày học bạn chọn không có môn học nào trong Thời khóa biểu. "
                "Vui lòng chọn ngày/buổi học có lịch học."
            )

        supporting_url = data.get("supportingDocumentUrl") or data.get("supporting_document_url")
        attachments = data.get("attachments") or []
        if not supporting_url and attachments and isinstance(attachments, list):
            supporting_url = attachments[0].get("url")

        guardian_name = data.get("guardianName") or (guardian.full_name if guardian else "")
        guardian_phone = data.get("guardianPhone") or (guardian.phone if guardian else "")
        guardian_rel = data.get("guardianRelationship") or (
            guardian.relationship if guardian else "Phụ huynh"
        )
        commitment = (
            data.get("commitment")
            or "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học."
        )

        now = timezone.now()
        first_lesson_dt, deadline_dt = cls.calculate_first_lesson_and_deadline(
            affected_lessons=affected_lessons,
            fallback_start_date=start_date,
            submitted_at=now,
        )

        metadata = {
            "sessionShift": session_shift,
            "commitment": commitment,
            "guardianName": guardian_name,
            "guardianPhone": guardian_phone,
            "guardianRelationship": guardian_rel,
            "attachments": attachments,
            "affectedLessons": affected_lessons,
            "notifiedTeachers": notified_teachers,
            "approvalPolicy": "HOMEROOM_TEACHER_ONLY",
            "firstLessonStartAt": first_lesson_dt.isoformat(),
            "approvalDeadline": deadline_dt.isoformat(),
            "submittedAt": now.isoformat(),
            "approvalMethod": None,
        }

        leave_req = LeaveRequest.objects.create(
            student=student,
            school_class=school_class,
            guardian=guardian,
            requested_by=user,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            leave_type=db_leave_type,
            status="PENDING",
            supporting_document_url=supporting_url,
            approval_deadline=deadline_dt,
            is_auto_approved=False,
            metadata=metadata,
        )

        student_user = getattr(student, "user", None)
        student_name = student_user.full_name if student_user else "Học sinh"
        cls.record_event_log(
            leave_request=leave_req,
            event_type="CREATED",
            title="Học sinh đăng ký đơn xin nghỉ phép trực tuyến",
            description=(
                f"Đăng ký nghỉ {len(affected_lessons)} tiết học từ ngày "
                f"{start_date.strftime('%d/%m/%Y')} đến {end_date.strftime('%d/%m/%Y')}. "
                f"Xác nhận bởi phụ huynh {guardian_name} ({guardian_rel})."
            ),
            actor_name=f"{student_name} ({student.student_code})",
            actor_role="STUDENT",
            badge_text="Đã đăng ký",
            badge_color="blue",
        )

        cls.send_submission_notifications(
            leave_req=leave_req,
            affected_lessons=affected_lessons,
            notified_teachers=notified_teachers,
            deadline_dt=deadline_dt,
        )

        logger.info(
            "Created leave request %s (code=%s) for student %s",
            leave_req.id,
            leave_req.code,
            student.id,
        )
        detail = cls.get_leave_request_detail(user, str(leave_req.id))

        try:
            from apps.academic.services.leave_request_realtime import (
                LeaveRequestRealtimeEvent,
                LeaveRequestRealtimeService,
            )

            LeaveRequestRealtimeService.broadcast_event(
                event_type=LeaveRequestRealtimeEvent.CREATED,
                leave_request=leave_req,
                item_data=detail,
                message=f"Học sinh {student_name} vừa đăng ký đơn xin nghỉ phép #{leave_req.code}.",
                actor_name=student_name,
            )
        except Exception as exc:
            logger.debug("Create realtime broadcast skipped: %s", exc)

        return detail

    @classmethod
    @transaction.atomic
    def update_leave_request(
        cls,
        user: Any,
        leave_request_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Updates an existing PENDING leave request and validates timetable lessons.
        """
        student = cls.resolve_student(user)
        qs = LeaveRequest.objects.select_related(
            "student", "student__user", "school_class", "guardian"
        )
        if student and not (
            getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)
        ):
            leave_req = qs.filter(id=leave_request_id, student=student).first()
        else:
            leave_req = qs.filter(id=leave_request_id).first()

        if not leave_req:
            raise ValueError("Không tìm thấy đơn xin nghỉ phép.")

        if leave_req.status != "PENDING":
            raise ValueError(
                "Chỉ có thể chỉnh sửa đơn xin nghỉ phép khi đang ở trạng thái Chờ duyệt."
            )

        raw_leave_type = data.get("leaveType") or data.get("leave_type")
        if raw_leave_type:
            db_leave_type = cls.LEAVE_TYPE_UI_TO_DB.get(
                str(raw_leave_type).lower(), str(raw_leave_type).upper()
            )
            if db_leave_type in cls.LEAVE_TYPE_DB_TO_UI:
                leave_req.leave_type = db_leave_type

        start_date = data.get("startDate") or data.get("start_date")
        end_date = data.get("endDate") or data.get("end_date")
        if start_date:
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            leave_req.start_date = start_date
        if end_date:
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            leave_req.end_date = end_date

        if leave_req.end_date < leave_req.start_date:
            raise ValueError("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.")

        if "reason" in data and str(data["reason"]).strip():
            leave_req.reason = str(data["reason"]).strip()

        meta = leave_req.metadata if isinstance(leave_req.metadata, dict) else {}
        if "sessionShift" in data:
            meta["sessionShift"] = data["sessionShift"]
        if "commitment" in data:
            meta["commitment"] = data["commitment"]
        if "guardianName" in data:
            meta["guardianName"] = data["guardianName"]
        if "guardianPhone" in data:
            meta["guardianPhone"] = data["guardianPhone"]
        if "guardianRelationship" in data:
            meta["guardianRelationship"] = data["guardianRelationship"]
        if "attachments" in data and isinstance(data["attachments"], list):
            meta["attachments"] = data["attachments"]
            if data["attachments"]:
                leave_req.supporting_document_url = data["attachments"][0].get("url")
            else:
                leave_req.supporting_document_url = None

        selected_lesson_keys = data.get("selectedLessonKeys")
        affected_lessons, notified_teachers = cls.compute_affected_lessons_for_class(
            school_class=leave_req.school_class,
            start_date=leave_req.start_date,
            end_date=leave_req.end_date,
            session_shift=meta.get("sessionShift", "all_day"),
            selected_lesson_keys=selected_lesson_keys
            if isinstance(selected_lesson_keys, list) and len(selected_lesson_keys) > 0
            else None,
        )

        if not affected_lessons:
            raise ValueError(
                "Buổi học hoặc ngày học bạn chọn không có môn học nào trong Thời khóa biểu. "
                "Vui lòng chọn ngày/buổi học có lịch học."
            )

        first_lesson_dt, deadline_dt = cls.calculate_first_lesson_and_deadline(
            affected_lessons=affected_lessons,
            fallback_start_date=leave_req.start_date,
            submitted_at=leave_req.created_at,
        )
        leave_req.approval_deadline = deadline_dt

        meta["affectedLessons"] = affected_lessons
        meta["notifiedTeachers"] = notified_teachers
        meta["approvalPolicy"] = "HOMEROOM_TEACHER_ONLY"
        meta["firstLessonStartAt"] = first_lesson_dt.isoformat()
        meta["approvalDeadline"] = deadline_dt.isoformat()

        leave_req.metadata = meta
        leave_req.save()

        student_user = getattr(leave_req.student, "user", None)
        student_name = student_user.full_name if student_user else "Học sinh"
        cls.record_event_log(
            leave_request=leave_req,
            event_type="UPDATED",
            title="Học sinh cập nhật thông tin đơn xin nghỉ phép",
            description=(
                f"Cập nhật thời gian nghỉ ({len(affected_lessons)} tiết học) từ ngày "
                f"{leave_req.start_date.strftime('%d/%m/%Y')} đến {leave_req.end_date.strftime('%d/%m/%Y')}."
            ),
            actor_name=f"{student_name} ({leave_req.student.student_code})",
            actor_role="STUDENT",
            badge_text="Đã cập nhật",
            badge_color="blue",
        )

        detail = cls.get_leave_request_detail(user, str(leave_req.id))

        try:
            from apps.academic.services.leave_request_realtime import (
                LeaveRequestRealtimeEvent,
                LeaveRequestRealtimeService,
            )

            LeaveRequestRealtimeService.broadcast_event(
                event_type=LeaveRequestRealtimeEvent.UPDATED,
                leave_request=leave_req,
                item_data=detail,
                message=f"Đơn xin nghỉ phép #{leave_req.code} vừa được cập nhật.",
                actor_name=student_name,
            )
        except Exception as exc:
            logger.debug("Update realtime broadcast skipped: %s", exc)

        return detail

    @classmethod
    @transaction.atomic
    def cancel_leave_request(
        cls,
        user: Any,
        leave_request_id: str,
        cancel_reason: str = "",
    ) -> dict[str, Any]:
        """
        Cancels a PENDING leave request.
        """
        student = cls.resolve_student(user)
        qs = LeaveRequest.objects.select_related("student", "student__user", "school_class")
        if student and not (
            getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)
        ):
            leave_req = qs.filter(id=leave_request_id, student=student).first()
        else:
            leave_req = qs.filter(id=leave_request_id).first()

        if not leave_req:
            raise ValueError("Không tìm thấy đơn xin nghỉ phép.")

        if leave_req.status != "PENDING":
            raise ValueError(
                "Chỉ có thể hủy đơn xin nghỉ phép khi đơn đang ở trạng thái Chờ duyệt."
            )

        leave_req.status = "CANCELLED"
        meta = leave_req.metadata if isinstance(leave_req.metadata, dict) else {}
        reason_text = cancel_reason.strip() if cancel_reason else "Học sinh chủ động rút đơn"
        meta["cancelReason"] = reason_text
        meta["cancelledAt"] = (
            timezone.now().astimezone(timezone.get_current_timezone()).strftime("%Y-%m-%d %H:%M:%S")
        )
        leave_req.metadata = meta
        leave_req.save()

        student_user = getattr(leave_req.student, "user", None)
        student_name = student_user.full_name if student_user else "Học sinh"
        cls.record_event_log(
            leave_request=leave_req,
            event_type="CANCELLED",
            title="Học sinh đã hủy / rút đơn xin nghỉ phép",
            description=reason_text,
            actor_name=f"{student_name} ({leave_req.student.student_code})",
            actor_role="STUDENT",
            badge_text="Đã hủy",
            badge_color="default",
        )

        logger.info("Cancelled leave request %s by user %s", leave_req.id, user.id)
        detail = cls.get_leave_request_detail(user, str(leave_req.id))

        try:
            from apps.academic.services.leave_request_realtime import (
                LeaveRequestRealtimeEvent,
                LeaveRequestRealtimeService,
            )

            LeaveRequestRealtimeService.broadcast_event(
                event_type=LeaveRequestRealtimeEvent.CANCELLED,
                leave_request=leave_req,
                item_data=detail,
                message=f"Đơn xin nghỉ phép #{leave_req.code} đã được hủy.",
                actor_name=student_name,
            )
        except Exception as exc:
            logger.debug("Cancel realtime broadcast skipped: %s", exc)

        return detail

    @classmethod
    @transaction.atomic
    def delete_leave_request(
        cls,
        user: Any,
        leave_request_id: str,
    ) -> None:
        """
        Deletes a leave request if it has not been reviewed yet (PENDING or CANCELLED).
        """
        student = cls.resolve_student(user)
        qs = LeaveRequest.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "school_class__homeroom_teacher",
            "school_class__homeroom_teacher__user",
        )
        if student and not (
            getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)
        ):
            leave_req = qs.filter(id=leave_request_id, student=student).first()
        else:
            leave_req = qs.filter(id=leave_request_id).first()

        if not leave_req:
            raise ValueError("Không tìm thấy đơn xin nghỉ phép.")

        if leave_req.status not in ("PENDING", "CANCELLED"):
            raise ValueError(
                "Chỉ có thể xóa đơn xin nghỉ phép khi đơn chưa được giáo viên phê duyệt."
            )

        req_id = str(leave_req.id)
        req_code = str(leave_req.code or "")
        st_id = str(leave_req.student_id)
        cls_id = str(leave_req.school_class_id)
        student_user = getattr(leave_req.student, "user", None)
        student_name = student_user.full_name if student_user else "Học sinh"

        leave_req.delete()
        logger.info("Deleted leave request %s by user %s", req_id, user.id)

        try:
            from apps.academic.services.leave_request_realtime import (
                LeaveRequestRealtimeEvent,
                LeaveRequestRealtimeService,
            )

            LeaveRequestRealtimeService.broadcast_event(
                event_type=LeaveRequestRealtimeEvent.DELETED,
                leave_request_id=req_id,
                student_id=st_id,
                class_id=cls_id,
                message=f"Đơn xin nghỉ phép #{req_code} đã bị xóa.",
                actor_name=student_name,
            )
        except Exception as exc:
            logger.debug("Delete realtime broadcast skipped: %s", exc)

    @classmethod
    def _register_vietnamese_fonts(cls) -> tuple[str, str, str]:
        return LeaveRequestPdfService.register_vietnamese_fonts()

    @classmethod
    def generate_leave_request_pdf(
        cls,
        user: Any,
        leave_request_id: str,
        template_code: str | None = None,
        template_id: str | None = None,
    ) -> tuple[bytes, str]:
        item = cls.get_leave_request_detail(user=user, leave_request_id=leave_request_id)
        school_id = getattr(user, "school_id", None) if user else None
        template = LeaveRequestPdfService.resolve_export_template(
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
        )
        return LeaveRequestPdfService.render_pdf_from_item(item, template=template)

    @classmethod
    def export_leave_request_file(
        cls,
        user: Any,
        leave_request_id: str,
        template_code: str | None = None,
        template_id: str | None = None,
        output_format: str | None = None,
    ) -> tuple[bytes, str, str]:
        """
        Exports a leave request using the dynamic ExportTemplate ("sys"."export_templates").
        Returns (file_bytes, filename, content_type).
        """
        item = cls.get_leave_request_detail(user=user, leave_request_id=leave_request_id)
        school_id = getattr(user, "school_id", None) if user else None
        return LeaveRequestPdfService.export_from_item(
            item=item,
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
            output_format=output_format,
        )

    @classmethod
    def render_leave_request_html(
        cls,
        user: Any,
        leave_request_id: str,
        template_code: str | None = None,
        template_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Renders the leave request into HTML/CSS using the dynamic ExportTemplate ("sys"."export_templates").
        """
        item = cls.get_leave_request_detail(user=user, leave_request_id=leave_request_id)
        school_id = getattr(user, "school_id", None) if user else None
        return LeaveRequestPdfService.render_html_from_item(
            item=item,
            school_id=school_id,
            template_code=template_code,
            template_id=template_id,
        )
