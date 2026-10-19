"""
Notification, SMTP Email & Event Log service for Academic Student Leave Requests.
Handles:
- Background SMTP email delivery
- Chronological LeaveRequestEventLog persistence and realtime WebSocket broadcast
- Deduplicated submission & approval notifications to Homeroom Teacher, Subject Teachers, and Student
"""

import logging
import threading
from datetime import datetime, timedelta
from typing import Any

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from apps.academic.models.attendance import LeaveRequest, LeaveRequestEventLog
from apps.academic.services.leave_request_timetable_service import LeaveRequestTimetableService

logger = logging.getLogger(__name__)


class LeaveRequestNotificationService:
    """
    Manages email notifications and chronological audit event logs for student leave requests.
    """

    @classmethod
    def send_email_safe(
        cls,
        subject: str,
        plain_body: str,
        recipient_list: list[str],
        html_body: str | None = None,
    ) -> bool:
        """
        Dispatches an SMTP email safely in a background daemon thread so API latency stays low,
        while logging delivery status.
        """
        valid_recipients = [
            r.strip() for r in recipient_list if r and "@" in r and not r.endswith(".local")
        ]
        if not valid_recipients:
            return False

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or getattr(
            settings, "EMAIL_HOST_USER", "noreply@schoolpro.edu.vn"
        )

        def _worker():
            try:
                send_mail(
                    subject=subject,
                    message=plain_body,
                    from_email=from_email,
                    recipient_list=valid_recipients,
                    html_message=html_body,
                    fail_silently=False,
                )
                logger.info("Sent leave request email '%s' to %s", subject, valid_recipients)
            except Exception as exc:
                logger.warning("SMTP email delivery warning for %s: %s", valid_recipients, exc)

        threading.Thread(target=_worker, daemon=True).start()
        return True

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
        """
        Persists a chronological LeaveRequestEventLog entry in the database
        and broadcasts a LOG_CREATED event over WebSocket.
        """
        log_time = created_at or timezone.now()
        log_entry = LeaveRequestEventLog.objects.create(
            leave_request=leave_request,
            event_type=event_type,
            title=title,
            description=description,
            actor_name=actor_name,
            actor_role=actor_role,
            badge_text=badge_text,
            badge_color=badge_color,
            recipient_email=recipient_email or None,
            email_sent=email_sent,
            metadata=metadata or {},
            created_at=log_time,
        )

        try:
            from apps.academic.services.leave_request_realtime import (
                LeaveRequestRealtimeEvent,
                LeaveRequestRealtimeService,
            )

            tz = timezone.get_current_timezone()
            formatted_log = {
                "id": str(log_entry.id),
                "eventType": log_entry.event_type,
                "title": log_entry.title,
                "description": log_entry.description or "",
                "actor": log_entry.actor_name or "Hệ thống",
                "actorRole": log_entry.actor_role or "SYSTEM",
                "badgeText": log_entry.badge_text or "Sự kiện",
                "badgeColor": log_entry.badge_color or "blue",
                "recipientEmail": log_entry.recipient_email or "",
                "emailSent": bool(log_entry.email_sent),
                "createdAt": log_time.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S"),
            }
            LeaveRequestRealtimeService.broadcast_event(
                event_type=LeaveRequestRealtimeEvent.LOG_CREATED,
                leave_request=leave_request,
                log_data=formatted_log,
                message=title,
                actor_name=actor_name,
            )
        except Exception as exc:
            logger.debug("Realtime log broadcast skipped: %s", exc)

        return log_entry

    @classmethod
    def send_submission_notifications(
        cls,
        leave_req: LeaveRequest,
        affected_lessons: list[dict[str, Any]],
        notified_teachers: list[dict[str, Any]],
        deadline_dt: datetime,
    ) -> None:
        """
        Logs and dispatches initial submission notifications & emails:
        1. Deduplicated recipients: If Homeroom Teacher is also a Subject Teacher of an affected lesson,
           send ONE combined notification & email to them.
        2. Other Subject Teachers receive a notification & email about the student's registration for leave.
        """
        student = leave_req.student
        student_user = getattr(student, "user", None) if student else None
        student_name = student_user.full_name if student_user else "Học sinh"
        student_code = student.student_code if student else ""
        school_class = leave_req.school_class
        class_name = school_class.name if school_class else "10A1"

        homeroom_teacher = getattr(school_class, "homeroom_teacher", None) if school_class else None
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None
        homeroom_name = homeroom_user.full_name if homeroom_user else "Giáo viên chủ nhiệm"
        homeroom_email = (homeroom_user.email or "").strip() if homeroom_user else ""
        homeroom_id = str(homeroom_teacher.id) if homeroom_teacher else ""

        tz = timezone.get_current_timezone()
        now_dt = timezone.now()
        deadline_fmt = deadline_dt.astimezone(tz).strftime("%H:%M ngày %d/%m/%Y")
        date_range_fmt = (
            leave_req.start_date.strftime("%d/%m/%Y")
            if leave_req.start_date == leave_req.end_date
            else f"{leave_req.start_date.strftime('%d/%m/%Y')} - {leave_req.end_date.strftime('%d/%m/%Y')}"
        )

        homeroom_as_subject_entry = None
        other_subject_teachers: list[dict[str, Any]] = []
        for t in notified_teachers:
            if (
                t.get("isHomeroomTeacher")
                or (homeroom_id and t.get("teacherId") == homeroom_id)
                or (
                    homeroom_email
                    and (t.get("teacherEmail") or "").strip().lower() == homeroom_email.lower()
                )
            ):
                homeroom_as_subject_entry = t
            else:
                other_subject_teachers.append(t)

        # 1. Notify Homeroom Teacher (combined if also teaching affected subject)
        if homeroom_as_subject_entry:
            subj_list = ", ".join(homeroom_as_subject_entry.get("subjects") or [])
            lesson_cnt = homeroom_as_subject_entry.get("lessonCount", 1)
            hr_title = "Gửi thông báo & Email tới Giáo viên chủ nhiệm (kiêm Giáo viên bộ môn)"
            hr_desc = (
                f"Đã gửi 01 thông báo hợp nhất và email tới Giáo viên chủ nhiệm {homeroom_name} "
                f"(đồng thời dạy môn {subj_list} - {lesson_cnt} tiết). "
                f"Hạn xử lý trước {deadline_fmt} (trong thời hạn 3 giờ kể từ khi gửi đơn)."
            )
        else:
            hr_title = "Gửi thông báo & Email yêu cầu phê duyệt tới Giáo viên chủ nhiệm"
            hr_desc = (
                f"Đã gửi thông báo và email tới Giáo viên chủ nhiệm {homeroom_name} ({homeroom_email or 'N/A'}). "
                f"Hạn xử lý trước {deadline_fmt} (trong thời hạn 3 giờ kể từ khi gửi đơn)."
            )

        email_subject_hr = f"[SchoolPro] Đơn xin nghỉ phép #{leave_req.code} - Học sinh {student_name} (Lớp {class_name})"
        email_body_hr = (
            f"Kính gửi Thầy/Cô {homeroom_name},\n\n"
            f"Học sinh {student_name} ({student_code}) - Lớp {class_name} vừa đăng ký đơn xin nghỉ phép.\n"
            f"- Mã đơn: {leave_req.code}\n"
            f"- Thời gian nghỉ: {date_range_fmt}\n"
            f"- Số tiết học xin nghỉ: {len(affected_lessons)} tiết\n"
            f"- Lý do: {leave_req.reason}\n"
            f"- Hạn xử lý: Trước {deadline_fmt} (thời hạn 3 giờ liên tục kể từ khi gửi đơn).\n"
            f"Lưu ý: Nếu quá thời hạn 3 giờ trên mà đơn chưa được xử lý, hệ thống sẽ tự động chuyển sang trạng thái Đã duyệt.\n\n"
            f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
        )
        sent_hr = cls.send_email_safe(
            subject=email_subject_hr,
            plain_body=email_body_hr,
            recipient_list=[homeroom_email] if homeroom_email else [],
        )

        cls.record_event_log(
            leave_request=leave_req,
            event_type="HOMEROOM_NOTIFIED",
            title=hr_title,
            description=hr_desc,
            actor_name=f"Hệ thống SchoolPro → {homeroom_name}",
            actor_role="HOMEROOM_TEACHER",
            badge_text="Đã gửi Email Giáo viên chủ nhiệm",
            badge_color="purple",
            recipient_email=homeroom_email,
            email_sent=sent_hr,
            created_at=now_dt + timedelta(seconds=1),
        )

        # 2. Notify remaining Subject Teachers (excluding homeroom teacher to avoid duplicate)
        if other_subject_teachers:
            teacher_summaries = [
                f"{t['teacherName']} (Môn {', '.join(t['subjects'])} - {t['lessonCount']} tiết)"
                for t in other_subject_teachers
            ]
            st_emails = [t["teacherEmail"] for t in other_subject_teachers if t.get("teacherEmail")]

            for t in other_subject_teachers:
                t_email = (t.get("teacherEmail") or "").strip()
                if t_email:
                    subj_str = ", ".join(t.get("subjects") or [])
                    cls.send_email_safe(
                        subject=f"[SchoolPro] Thông báo học sinh đăng ký nghỉ môn {subj_str} - Lớp {class_name}",
                        plain_body=(
                            f"Kính gửi Thầy/Cô {t['teacherName']},\n\n"
                            f"Học sinh {student_name} ({student_code}) - Lớp {class_name} đã đăng ký xin nghỉ phép "
                            f"vào thời gian {date_range_fmt} có tiết môn {subj_str} ({t['lessonCount']} tiết).\n"
                            f"- Mã đơn: {leave_req.code}\n"
                            f"- Lý do: {leave_req.reason}\n"
                            f"- Đơn đang chờ Giáo viên chủ nhiệm ({homeroom_name}) xử lý (hạn trước {deadline_fmt}).\n\n"
                            f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
                        ),
                        recipient_list=[t_email],
                    )

            cls.record_event_log(
                leave_request=leave_req,
                event_type="SUBJECT_TEACHERS_NOTIFIED",
                title=f"Thông báo tới {len(other_subject_teachers)} Giáo viên bộ môn giảng dạy",
                description=(
                    f"Đã gửi thông báo đăng ký nghỉ học tới giáo viên bộ môn: "
                    f"{'; '.join(teacher_summaries)}."
                ),
                actor_name="Hệ thống Quản lý Học vụ",
                actor_role="SYSTEM",
                badge_text=f"Đã báo {len(other_subject_teachers)} Giáo viên bộ môn",
                badge_color="cyan",
                recipient_email=", ".join(st_emails[:3]),
                email_sent=bool(st_emails),
                created_at=now_dt + timedelta(seconds=2),
            )

    @classmethod
    def send_approval_notifications(
        cls,
        leave_req: LeaveRequest,
        is_auto: bool = False,
    ) -> None:
        """
        Triggered when a leave request is approved (by Homeroom Teacher or System Auto-Approval Engine)
        or rejected by Homeroom Teacher:
        1. Sends email to Student (and Guardian) with clear distinction between System auto-approval and Teacher action.
        2. Sends notification & email to Subject Teachers confirming the approved absence.
        """
        meta = leave_req.metadata if isinstance(leave_req.metadata, dict) else {}
        affected_lessons = meta.get("affectedLessons") or []
        notified_teachers = meta.get("notifiedTeachers") or []
        if not notified_teachers:
            affected_lessons, notified_teachers = (
                LeaveRequestTimetableService.compute_affected_lessons_for_class(
                    school_class=leave_req.school_class,
                    start_date=leave_req.start_date,
                    end_date=leave_req.end_date,
                    session_shift=meta.get("sessionShift", "all_day"),
                )
            )

        student = leave_req.student
        student_user = getattr(student, "user", None) if student else None
        student_name = student_user.full_name if student_user else "Học sinh"
        student_email = (student_user.email or "").strip() if student_user else ""
        school_class = leave_req.school_class
        class_name = school_class.name if school_class else "10A1"
        homeroom_teacher = getattr(school_class, "homeroom_teacher", None) if school_class else None
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None
        homeroom_name = homeroom_user.full_name if homeroom_user else "Giáo viên chủ nhiệm"
        homeroom_id = str(homeroom_teacher.id) if homeroom_teacher else ""
        homeroom_email = (homeroom_user.email or "").strip().lower() if homeroom_user else ""

        date_range_fmt = (
            leave_req.start_date.strftime("%d/%m/%Y")
            if leave_req.start_date == leave_req.end_date
            else f"{leave_req.start_date.strftime('%d/%m/%Y')} - {leave_req.end_date.strftime('%d/%m/%Y')}"
        )

        review_time = leave_req.reviewed_at or timezone.now()
        is_approved = leave_req.status == "APPROVED"

        # 1. Email to Student
        if is_auto:
            student_subject = f"[SchoolPro] Đơn xin nghỉ phép #{leave_req.code} đã được HỆ THỐNG TỰ ĐỘNG PHÊ DUYỆT (Quá hạn 3 giờ)"
            student_body = (
                f"Chào em {student_name} (Lớp {class_name}),\n\n"
                f"Đơn xin nghỉ phép #{leave_req.code} của em (thời gian: {date_range_fmt}) "
                f"đã được Hệ thống tự động phê duyệt do Giáo viên chủ nhiệm không xử lý trong thời hạn 3 giờ theo quy định.\n"
                f"- Trạng thái: ĐÃ PHÊ DUYỆT (TỰ ĐỘNG)\n"
                f"- Người xử lý: Hệ thống SchoolPro\n"
                f"- Hình thức: Tự động phê duyệt do quá hạn xử lý (180 phút)\n"
                f"- Ghi chú hệ thống: {leave_req.teacher_note or 'Hệ thống tự động phê duyệt do GVCN không xử lý trong thời hạn 3 giờ.'}\n\n"
                f"Hệ thống đã cập nhật trạng thái Vắng có phép vào sổ điểm danh và thông báo tới các Giáo viên bộ môn.\n\n"
                f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
            )
            log_title = "Gửi Email thông báo kết quả Tự động phê duyệt (Quá hạn 3 giờ) tới Học sinh"
            log_desc = (
                f"Đã gửi email thông báo kết quả 'ĐÃ PHÊ DUYỆT (TỰ ĐỘNG)' tới học sinh {student_name} "
                f"do Giáo viên chủ nhiệm không xử lý trong thời hạn 3 giờ."
            )
            approver_label = "Hệ thống SchoolPro (Tự động duyệt do quá thời hạn 3 giờ)"
        elif is_approved:
            reviewer_name = (
                leave_req.reviewed_by.full_name if leave_req.reviewed_by else homeroom_name
            )
            student_subject = (
                f"[SchoolPro] Giáo viên chủ nhiệm ĐÃ PHÊ DUYỆT đơn xin nghỉ phép #{leave_req.code}"
            )
            student_body = (
                f"Chào em {student_name} (Lớp {class_name}),\n\n"
                f"Đơn xin nghỉ phép #{leave_req.code} của em (thời gian: {date_range_fmt}) đã được Giáo viên chủ nhiệm phê duyệt:\n"
                f"- Trạng thái: ĐÃ PHÊ DUYỆT\n"
                f"- Người duyệt: Giáo viên chủ nhiệm {reviewer_name}\n"
                f"- Ghi chú: {leave_req.teacher_note or 'Đồng ý cho học sinh nghỉ học có phép.'}\n\n"
                f"Hệ thống đã cập nhật trạng thái Vắng có phép vào sổ điểm danh.\n\n"
                f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
            )
            log_title = "Gửi Email thông báo Giáo viên chủ nhiệm ĐÃ DUYỆT đơn tới Học sinh"
            log_desc = (
                f"Đã gửi email xác nhận trạng thái 'ĐÃ PHÊ DUYỆT' bởi Giáo viên chủ nhiệm {reviewer_name} "
                f"tới học sinh {student_name} ({student_email or 'Tài khoản học sinh'})."
            )
            approver_label = f"Giáo viên chủ nhiệm {reviewer_name}"
        else:
            reviewer_name = (
                leave_req.reviewed_by.full_name if leave_req.reviewed_by else homeroom_name
            )
            student_subject = (
                f"[SchoolPro] Giáo viên chủ nhiệm TỪ CHỐI đơn xin nghỉ phép #{leave_req.code}"
            )
            student_body = (
                f"Chào em {student_name} (Lớp {class_name}),\n\n"
                f"Đơn xin nghỉ phép #{leave_req.code} của em (thời gian: {date_range_fmt}) đã bị Giáo viên chủ nhiệm từ chối:\n"
                f"- Trạng thái: TỪ CHỐI\n"
                f"- Người từ chối: Giáo viên chủ nhiệm {reviewer_name}\n"
                f"- Lý do từ chối: {leave_req.teacher_note}\n\n"
                f"Vui lòng liên hệ trực tiếp Giáo viên chủ nhiệm nếu cần thêm thông tin.\n\n"
                f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
            )
            log_title = "Gửi Email thông báo Giáo viên chủ nhiệm TỪ CHỐI đơn tới Học sinh"
            log_desc = (
                f"Đã gửi email thông báo từ chối kèm lý do '{leave_req.teacher_note}' "
                f"tới học sinh {student_name} ({student_email or 'Tài khoản học sinh'})."
            )
            approver_label = f"Giáo viên chủ nhiệm {reviewer_name}"

        sent_student = cls.send_email_safe(
            subject=student_subject,
            plain_body=student_body,
            recipient_list=[student_email] if student_email else [],
        )

        cls.record_event_log(
            leave_request=leave_req,
            event_type="STUDENT_EMAIL_SENT",
            title=log_title,
            description=log_desc,
            actor_name="Hệ thống Quản lý Học vụ",
            actor_role="SYSTEM",
            badge_text="Đã gửi Email Học sinh",
            badge_color="blue",
            recipient_email=student_email,
            email_sent=sent_student,
            created_at=review_time + timedelta(seconds=1),
        )

        # 2. If Approved, notify Subject Teachers about the finalized approval
        if is_approved and notified_teachers:
            other_teachers = [
                t
                for t in notified_teachers
                if not (
                    t.get("isHomeroomTeacher")
                    or (homeroom_id and t.get("teacherId") == homeroom_id)
                    or (
                        homeroom_email
                        and (t.get("teacherEmail") or "").strip().lower() == homeroom_email
                    )
                )
            ]
            target_teachers = other_teachers if other_teachers else notified_teachers
            teacher_names = [
                f"{t['teacherName']} ({', '.join(t['subjects'])})" for t in target_teachers
            ]

            for t in other_teachers:
                t_email = (t.get("teacherEmail") or "").strip()
                if t_email:
                    subj_str = ", ".join(t.get("subjects") or [])
                    cls.send_email_safe(
                        subject=f"[SchoolPro] Đã duyệt nghỉ phép - Học sinh {student_name} (Lớp {class_name}) môn {subj_str}",
                        plain_body=(
                            f"Kính gửi Thầy/Cô {t['teacherName']},\n\n"
                            f"Đơn xin nghỉ phép #{leave_req.code} của học sinh {student_name} (Lớp {class_name}) "
                            f"trong thời gian {date_range_fmt} (môn {subj_str} - {t['lessonCount']} tiết) "
                            f"đã được {approver_label} phê duyệt.\n"
                            f"Hệ thống đã cập nhật trạng thái Vắng có phép vào sổ điểm danh.\n\n"
                            f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
                        ),
                        recipient_list=[t_email],
                    )

            cls.record_event_log(
                leave_request=leave_req,
                event_type="SUBJECT_TEACHERS_APPROVAL_NOTIFIED",
                title="Thông báo kết quả phê duyệt tới Giáo viên bộ môn",
                description=(
                    f"Đã gửi thông báo xác nhận học sinh nghỉ có phép ({len(affected_lessons)} tiết) "
                    f"tới Giáo viên bộ môn: {', '.join(teacher_names)} và cập nhật sổ điểm danh."
                ),
                actor_name="Hệ thống Quản lý Học vụ",
                actor_role="SYSTEM",
                badge_text="Đã báo Giáo viên bộ môn sau duyệt",
                badge_color="success",
                created_at=review_time + timedelta(seconds=2),
            )

    @classmethod
    def send_deadline_reminder_to_homeroom(cls, leave_req: LeaveRequest) -> bool:
        """
        Sends a 30-minute approaching deadline reminder to Homeroom Teacher.
        """
        school_class = leave_req.school_class
        homeroom_teacher = getattr(school_class, "homeroom_teacher", None) if school_class else None
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None
        if not homeroom_user or not homeroom_user.email:
            return False

        homeroom_email = homeroom_user.email.strip()
        homeroom_name = homeroom_user.full_name or "Giáo viên chủ nhiệm"
        student = leave_req.student
        student_user = getattr(student, "user", None) if student else None
        student_name = student_user.full_name if student_user else "Học sinh"
        class_name = school_class.name if school_class else ""

        tz = timezone.get_current_timezone()
        created_fmt = (
            leave_req.created_at.astimezone(tz).strftime("%H:%M ngày %d/%m/%Y")
            if leave_req.created_at
            else "N/A"
        )
        deadline_fmt = (
            leave_req.approval_deadline.astimezone(tz).strftime("%H:%M ngày %d/%m/%Y")
            if leave_req.approval_deadline
            else "N/A"
        )

        subject = f"[SchoolPro] Nhắc nhở: Đơn xin nghỉ phép #{leave_req.code} sắp hết hạn xử lý (còn 30 phút)"
        body = (
            f"Kính gửi Thầy/Cô {homeroom_name},\n\n"
            f"Đơn xin nghỉ phép #{leave_req.code} của học sinh {student_name} (Lớp {class_name}) "
            f"sắp hết thời hạn 3 giờ xử lý theo quy định của nhà trường:\n"
            f"- Thời gian gửi đơn: {created_fmt}\n"
            f"- Hạn xử lý: {deadline_fmt} (còn khoảng 30 phút)\n"
            f"- Lý do nghỉ: {leave_req.reason}\n\n"
            f"Kính đề nghị Thầy/Cô sớm vào hệ thống xem xét phê duyệt hoặc từ chối đơn. "
            f"Nếu quá thời hạn trên mà đơn chưa được xử lý, hệ thống sẽ tự động chuyển sang trạng thái Đã duyệt.\n\n"
            f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
        )

        sent = cls.send_email_safe(
            subject=subject,
            plain_body=body,
            recipient_list=[homeroom_email],
        )

        cls.record_event_log(
            leave_request=leave_req,
            event_type="DEADLINE_REMINDER_SENT",
            title="Nhắc nhở Giáo viên chủ nhiệm khi còn 30 phút trước hạn",
            description=(
                f"Đã gửi email nhắc nhở tới Giáo viên chủ nhiệm {homeroom_name} ({homeroom_email}) "
                f"do đơn sắp hết hạn 3 giờ xử lý (hạn: {deadline_fmt})."
            ),
            actor_name="Hệ thống SchoolPro",
            actor_role="SYSTEM",
            badge_text="Nhắc nhở còn 30 phút",
            badge_color="orange",
            recipient_email=homeroom_email,
            email_sent=sent,
        )
        return sent
