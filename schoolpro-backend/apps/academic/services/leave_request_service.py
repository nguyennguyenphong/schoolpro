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
import os
import threading
from datetime import date, datetime, time, timedelta
from html import escape
from io import BytesIO
from typing import Any

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.academic.models.attendance import (
    Attendance,
    AttendanceLog,
    LeaveRequest,
    LeaveRequestEventLog,
)
from apps.academic.models.timetable import Timetable
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

    DAY_OF_WEEK_LABELS = {
        2: "Thứ Hai",
        3: "Thứ Ba",
        4: "Thứ Tư",
        5: "Thứ Năm",
        6: "Thứ Sáu",
        7: "Thứ Bảy",
        8: "Chủ Nhật",
    }

    MAX_ALLOWED_DAYS_PER_YEAR = 45
    AUTO_APPROVAL_HOURS_BEFORE_LESSON = 3

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
        """
        Calculates number of leave days.
        If single day and morning/afternoon shift is selected, counts as 0.5 day, otherwise integer days.
        """
        if end_date < start_date:
            return 0.0
        total_days = (end_date - start_date).days + 1
        if total_days == 1 and session_shift in ("morning", "afternoon"):
            return 0.5
        return float(total_days)

    @classmethod
    def get_active_weekdays_for_class(
        cls,
        school_class: SchoolClass | None,
        session_shift: str = "all_day",
    ) -> list[int]:
        """
        Returns sorted list of active timetable day_of_week integers (2=Mon ... 8=Sun)
        for the given class and session_shift.
        """
        if not school_class:
            return []

        qs = Timetable.objects.filter(school_class=school_class).select_related("period")
        active_dows: set[int] = set()
        for slot in qs:
            period = slot.period
            if not period or getattr(period, "is_break", False):
                continue
            p_shift = (getattr(period, "shift", "MORNING") or "MORNING").upper()
            if session_shift == "morning" and p_shift == "AFTERNOON":
                continue
            if session_shift == "afternoon" and p_shift == "MORNING":
                continue
            active_dows.add(slot.day_of_week)

        return sorted(active_dows)

    @classmethod
    def compute_affected_lessons_for_class(
        cls,
        school_class: SchoolClass | None,
        start_date: date,
        end_date: date,
        session_shift: str = "all_day",
        selected_lesson_keys: list[str] | None = None,
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        """
        Queries the class timetable across [start_date, end_date] and returns:
        1. affected_lessons: list of lesson slots impacted by the leave request
        2. notified_teachers: deduplicated list of teachers (if Homeroom Teacher is also a
           Subject Teacher, they are merged into a single recipient entry so they only receive one notification).
        """
        if not school_class or end_date < start_date:
            return [], []

        homeroom_teacher = getattr(school_class, "homeroom_teacher", None)
        homeroom_user = getattr(homeroom_teacher, "user", None) if homeroom_teacher else None
        homeroom_teacher_id = str(homeroom_teacher.id) if homeroom_teacher else ""
        homeroom_email = (homeroom_user.email or "").strip().lower() if homeroom_user else ""

        slots = list(
            Timetable.objects.filter(school_class=school_class)
            .select_related(
                "period",
                "room",
                "class_subject_teacher",
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher",
                "class_subject_teacher__teacher__user",
            )
            .order_by("day_of_week", "period__period_no")
        )

        slots_by_dow: dict[int, list[Timetable]] = {}
        for slot in slots:
            slots_by_dow.setdefault(slot.day_of_week, []).append(slot)

        selected_set = set(selected_lesson_keys) if selected_lesson_keys else None
        affected_lessons: list[dict[str, Any]] = []
        max_span_days = min((end_date - start_date).days + 1, 14)

        for offset in range(max_span_days):
            curr_date = start_date + timedelta(days=offset)
            dow = curr_date.weekday() + 2  # Monday=0 -> 2, Sunday=6 -> 8
            day_slots = slots_by_dow.get(dow, [])

            for slot in day_slots:
                period = slot.period
                if not period or getattr(period, "is_break", False):
                    continue

                period_shift = (getattr(period, "shift", "MORNING") or "MORNING").upper()
                period_no = getattr(period, "period_no", 1) or 1

                if session_shift == "morning" and period_shift == "AFTERNOON":
                    continue
                if session_shift == "afternoon" and period_shift == "MORNING":
                    continue

                lesson_key = f"{curr_date.strftime('%Y-%m-%d')}_{slot.id}"
                if selected_set is not None and (
                    lesson_key not in selected_set and str(slot.id) not in selected_set
                ):
                    continue

                cst = slot.class_subject_teacher
                subject = getattr(cst, "subject", None) if cst else None
                teacher = getattr(cst, "teacher", None) if cst else None
                teacher_user = getattr(teacher, "user", None) if teacher else None
                room = slot.room

                start_str = (
                    period.start_time.strftime("%H:%M")
                    if getattr(period, "start_time", None)
                    else "07:15"
                )
                end_str = (
                    period.end_time.strftime("%H:%M")
                    if getattr(period, "end_time", None)
                    else "08:00"
                )

                affected_lessons.append(
                    {
                        "lessonKey": lesson_key,
                        "timetableId": str(slot.id),
                        "date": curr_date.strftime("%Y-%m-%d"),
                        "dayOfWeek": dow,
                        "dayOfWeekLabel": cls.DAY_OF_WEEK_LABELS.get(dow, f"Thứ {dow}"),
                        "periodNumber": period_no,
                        "periodName": period.name or f"Tiết {period_no}",
                        "shift": "morning" if period_shift == "MORNING" else "afternoon",
                        "startTime": start_str,
                        "endTime": end_str,
                        "subjectId": str(subject.id) if subject else "",
                        "subjectName": subject.name if subject else "Môn học",
                        "teacherId": str(teacher.id) if teacher else "",
                        "teacherName": teacher_user.full_name
                        if teacher_user
                        else "Giáo viên bộ môn",
                        "teacherEmail": teacher_user.email if teacher_user else "",
                        "roomName": room.name if room else "",
                    }
                )

        # Deduplicate teachers: If Homeroom Teacher is also a Subject Teacher, merge into a single recipient
        teachers_map: dict[str, dict[str, Any]] = {}
        for lesson in affected_lessons:
            t_id = lesson["teacherId"]
            t_email = (lesson["teacherEmail"] or "").strip().lower()
            t_key = t_email or t_id or lesson["teacherName"]
            if not t_key:
                continue

            is_also_homeroom = bool(
                (homeroom_teacher_id and t_id == homeroom_teacher_id)
                or (homeroom_email and t_email == homeroom_email)
            )

            if t_key not in teachers_map:
                teachers_map[t_key] = {
                    "teacherId": t_id,
                    "teacherName": lesson["teacherName"],
                    "teacherEmail": lesson["teacherEmail"],
                    "subjects": [],
                    "lessonCount": 0,
                    "periodsSummary": [],
                    "role": "HOMEROOM_AND_SUBJECT_TEACHER"
                    if is_also_homeroom
                    else "SUBJECT_TEACHER",
                    "isHomeroomTeacher": is_also_homeroom,
                    "canApprove": is_also_homeroom,
                    "notificationStatus": "NOTIFIED",
                }
            entry = teachers_map[t_key]
            if lesson["subjectName"] not in entry["subjects"]:
                entry["subjects"].append(lesson["subjectName"])
            entry["lessonCount"] += 1
            period_label = (
                f"{lesson['dayOfWeekLabel']} ({datetime.strptime(lesson['date'], '%Y-%m-%d').strftime('%d/%m')}) "
                f"- Tiết {lesson['periodNumber']} ({lesson['subjectName']})"
            )
            if period_label not in entry["periodsSummary"]:
                entry["periodsSummary"].append(period_label)

        notified_teachers = list(teachers_map.values())
        return affected_lessons, notified_teachers

    @classmethod
    def calculate_first_lesson_and_deadline(
        cls,
        affected_lessons: list[dict[str, Any]],
        fallback_start_date: date,
    ) -> tuple[datetime, datetime]:
        """
        Determines the exact start datetime of the earliest affected lesson and
        calculates the approval deadline = (first_lesson_start - 3 hours).
        """
        tz = timezone.get_current_timezone()
        earliest_dt: datetime | None = None

        for lesson in affected_lessons:
            try:
                lesson_date = datetime.strptime(lesson["date"], "%Y-%m-%d").date()
                start_parts = str(lesson.get("startTime") or "07:15").split(":")
                lesson_time = time(int(start_parts[0]), int(start_parts[1]))
                candidate = timezone.make_aware(datetime.combine(lesson_date, lesson_time), tz)
                if earliest_dt is None or candidate < earliest_dt:
                    earliest_dt = candidate
            except Exception:
                continue

        if earliest_dt is None:
            earliest_dt = timezone.make_aware(
                datetime.combine(fallback_start_date, time(7, 15)), tz
            )

        deadline_dt = earliest_dt - timedelta(hours=cls.AUTO_APPROVAL_HOURS_BEFORE_LESSON)
        return earliest_dt, deadline_dt

    @classmethod
    def _send_email_safe(
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
        Persists a chronological LeaveRequestEventLog entry in the database.
        """
        log_time = created_at or timezone.now()
        return LeaveRequestEventLog.objects.create(
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

        # Check if homeroom teacher is also in notified_teachers
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
                f"Hạn phê duyệt trước {deadline_fmt} (trước giờ diễn ra môn học 3 giờ)."
            )
        else:
            hr_title = "Gửi thông báo & Email yêu cầu phê duyệt tới Giáo viên chủ nhiệm"
            hr_desc = (
                f"Đã gửi thông báo và email tới Giáo viên chủ nhiệm {homeroom_name} ({homeroom_email or 'N/A'}). "
                f"Hạn phê duyệt trước {deadline_fmt} (trước giờ diễn ra môn học 3 giờ)."
            )

        email_subject_hr = f"[SchoolPro] Đơn xin nghỉ phép #{leave_req.code} - Học sinh {student_name} (Lớp {class_name})"
        email_body_hr = (
            f"Kính gửi Thầy/Cô {homeroom_name},\n\n"
            f"Học sinh {student_name} ({student_code}) - Lớp {class_name} vừa đăng ký đơn xin nghỉ phép.\n"
            f"- Mã đơn: {leave_req.code}\n"
            f"- Thời gian nghỉ: {date_range_fmt}\n"
            f"- Số tiết học xin nghỉ: {len(affected_lessons)} tiết\n"
            f"- Lý do: {leave_req.reason}\n"
            f"- Hạn phê duyệt: Trước {deadline_fmt} (trước giờ diễn ra môn học 3 giờ).\n"
            f"Lưu ý: Nếu quá thời hạn trên mà đơn chưa được duyệt, hệ thống sẽ tự động phê duyệt đơn.\n\n"
            f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
        )
        sent_hr = cls._send_email_safe(
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
                    cls._send_email_safe(
                        subject=f"[SchoolPro] Thông báo học sinh đăng ký nghỉ môn {subj_str} - Lớp {class_name}",
                        plain_body=(
                            f"Kính gửi Thầy/Cô {t['teacherName']},\n\n"
                            f"Học sinh {student_name} ({student_code}) - Lớp {class_name} đã đăng ký xin nghỉ phép "
                            f"vào thời gian {date_range_fmt} có tiết môn {subj_str} ({t['lessonCount']} tiết).\n"
                            f"- Mã đơn: {leave_req.code}\n"
                            f"- Lý do: {leave_req.reason}\n"
                            f"- Đơn đang chờ Giáo viên chủ nhiệm ({homeroom_name}) phê duyệt (hạn trước {deadline_fmt}).\n\n"
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
        Triggered when a leave request is approved (either by Homeroom Teacher or Auto-Approval Engine)
        or rejected by Homeroom Teacher:
        1. Sends email to Student (and Guardian) about approval/rejection.
        2. Sends notification & email to Subject Teachers confirming the approved absence.
        """
        meta = leave_req.metadata if isinstance(leave_req.metadata, dict) else {}
        affected_lessons = meta.get("affectedLessons") or []
        notified_teachers = meta.get("notifiedTeachers") or []
        if not notified_teachers:
            affected_lessons, notified_teachers = cls.compute_affected_lessons_for_class(
                school_class=leave_req.school_class,
                start_date=leave_req.start_date,
                end_date=leave_req.end_date,
                session_shift=meta.get("sessionShift", "all_day"),
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
        status_vi = "ĐÃ PHÊ DUYỆT" if leave_req.status == "APPROVED" else "TỪ CHỐI"
        approver_label = (
            "Hệ thống tự động phê duyệt (quá hạn 3 giờ trước giờ học)"
            if is_auto
            else f"Giáo viên chủ nhiệm {leave_req.reviewed_by.full_name if leave_req.reviewed_by else homeroom_name}"
        )

        # 1. Email to Student
        student_subject = (
            f"[SchoolPro] Thông báo kết quả đơn xin nghỉ phép #{leave_req.code}: {status_vi}"
        )
        student_body = (
            f"Chào em {student_name} (Lớp {class_name}),\n\n"
            f"Đơn xin nghỉ phép #{leave_req.code} của em (thời gian: {date_range_fmt}) đã được xử lý:\n"
            f"- Trạng thái: {status_vi}\n"
            f"- Người xử lý: {approver_label}\n"
            f"- Ghi chú: {leave_req.teacher_note or 'Đồng ý cho học sinh nghỉ học có phép.'}\n\n"
            f"Trân trọng,\nHệ thống Quản lý Học vụ SchoolPro"
        )
        sent_student = cls._send_email_safe(
            subject=student_subject,
            plain_body=student_body,
            recipient_list=[student_email] if student_email else [],
        )

        cls.record_event_log(
            leave_request=leave_req,
            event_type="STUDENT_EMAIL_SENT",
            title="Gửi Email thông báo kết quả duyệt đơn tới Học sinh",
            description=(
                f"Đã gửi email xác nhận trạng thái '{status_vi}' tới học sinh {student_name} "
                f"({student_email or 'Tài khoản học sinh'})."
            ),
            actor_name="Hệ thống Quản lý Học vụ",
            actor_role="SYSTEM",
            badge_text="Đã gửi Email Học sinh",
            badge_color="blue",
            recipient_email=student_email,
            email_sent=sent_student,
            created_at=review_time + timedelta(seconds=1),
        )

        # 2. If Approved, notify Subject Teachers about the finalized approval
        if leave_req.status == "APPROVED" and notified_teachers:
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
                    cls._send_email_safe(
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
    def check_and_auto_approve_overdue_requests(cls, qs: Any = None) -> int:
        """
        Automatically approves any PENDING leave request whose approval_deadline
        (3 hours before the first affected lesson) has passed without Homeroom Teacher action.
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

            first_lesson_dt, deadline_dt = cls.calculate_first_lesson_and_deadline(
                affected_lessons=affected_lessons,
                fallback_start_date=req.start_date,
            )

            if not req.approval_deadline:
                req.approval_deadline = deadline_dt
                req.save(update_fields=["approval_deadline"])

            effective_deadline = req.approval_deadline or deadline_dt
            if now >= effective_deadline:
                with transaction.atomic():
                    homeroom_teacher = getattr(req.school_class, "homeroom_teacher", None)
                    homeroom_user = (
                        getattr(homeroom_teacher, "user", None)
                        if homeroom_teacher
                        else req.requested_by
                    )

                    req.status = "APPROVED"
                    req.is_auto_approved = True
                    req.reviewed_by = homeroom_user
                    req.reviewed_at = effective_deadline
                    if not req.teacher_note:
                        req.teacher_note = (
                            "Hệ thống tự động phê duyệt đơn do đã đến hạn 03 giờ trước thời gian "
                            "diễn ra tiết học đầu tiên mà Giáo viên chủ nhiệm chưa kịp thao tác."
                        )
                    meta["isAutoApproved"] = True
                    meta["autoApprovedAt"] = effective_deadline.astimezone(
                        timezone.get_current_timezone()
                    ).strftime("%Y-%m-%d %H:%M")
                    req.metadata = meta
                    req.save()

                    # Populate excused attendance records
                    curr_d = req.start_date
                    while curr_d <= req.end_date:
                        if curr_d.weekday() != 6:
                            att, created = Attendance.objects.get_or_create(
                                student_id=req.student_id,
                                attendance_date=curr_d,
                                period_id=None,
                                defaults={
                                    "school_class_id": req.school_class_id,
                                    "status": "ABSENT_EXCUSED",
                                    "method": "SYSTEM_AUTO",
                                    "excuse_reason": f"Đơn xin nghỉ phép #{req.code} (Tự động duyệt): {req.reason}",
                                    "recorded_by": homeroom_user,
                                },
                            )
                            if not created and att.status != "ABSENT_EXCUSED":
                                prev_st = att.status
                                att.status = "ABSENT_EXCUSED"
                                att.excuse_reason = (
                                    f"Đơn xin nghỉ phép #{req.code} (Tự động duyệt): {req.reason}"
                                )
                                att.save()
                                AttendanceLog.objects.create(
                                    attendance=att,
                                    student_id=req.student_id,
                                    previous_status=prev_st,
                                    new_status="ABSENT_EXCUSED",
                                    action="AUTO_APPROVED_LEAVE",
                                    reason=f"Tự động duyệt đơn #{req.code}",
                                    performed_by=homeroom_user,
                                )
                        curr_d += timedelta(days=1)

                    cls.record_event_log(
                        leave_request=req,
                        event_type="AUTO_APPROVED",
                        title="Hệ thống tự động phê duyệt đơn xin nghỉ phép",
                        description=(
                            f"Đã quá hạn phê duyệt (trước thời gian diễn ra môn học {cls.AUTO_APPROVAL_HOURS_BEFORE_LESSON} giờ). "
                            f"Hệ thống tự động phê duyệt đơn và ghi nhận Vắng có phép."
                        ),
                        actor_name="Hệ thống Tự động Phê duyệt (Auto-Approval)",
                        actor_role="SYSTEM",
                        badge_text="Tự động duyệt",
                        badge_color="success",
                        created_at=effective_deadline,
                    )

                    cls.send_approval_notifications(req, is_auto=True)
                    auto_approved_count += 1

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
                    f"(trước giờ diễn ra môn học 3 giờ)."
                )
            else:
                hr_title = "Gửi thông báo & Email yêu cầu phê duyệt tới Giáo viên chủ nhiệm"
                hr_desc = (
                    f"Đã gửi thông báo và email tới Giáo viên chủ nhiệm {homeroom_name} ({homeroom_email or 'N/A'}). "
                    f"Hạn phê duyệt trước {deadline_fmt} (trước giờ diễn ra môn học 3 giờ)."
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
                            or "Đã đến hạn 03 giờ trước giờ diễn ra môn học, hệ thống tự động phê duyệt đơn."
                        ),
                        actor_name="Hệ thống Tự động Phê duyệt",
                        actor_role="SYSTEM",
                        badge_text="Tự động duyệt",
                        badge_color="success",
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
            reviewed_by_name = "Hệ thống tự động duyệt (Quá hạn 3 giờ trước giờ học)"
        elif item.reviewed_by:
            reviewed_by_name = item.reviewed_by.full_name
        elif item.status in ("APPROVED", "REJECTED") and homeroom_user:
            reviewed_by_name = homeroom_user.full_name

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
            "classId": str(item.school_class_id),
            "className": school_class.name if school_class else "10A1",
            "leaveType": cls.LEAVE_TYPE_DB_TO_UI.get(item.leave_type, "other"),
            "leaveTypeCode": item.leave_type,
            "status": cls.STATUS_DB_TO_UI.get(item.status, "pending"),
            "statusCode": item.status,
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

        first_lesson_dt, deadline_dt = cls.calculate_first_lesson_and_deadline(
            affected_lessons=affected_lessons,
            fallback_start_date=start_date,
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
        return cls.get_leave_request_detail(user, str(leave_req.id))

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

        return cls.get_leave_request_detail(user, str(leave_req.id))

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
        return cls.get_leave_request_detail(user, str(leave_req.id))

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
        qs = LeaveRequest.objects.select_related("student", "school_class")
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

        req_id = leave_req.id
        leave_req.delete()
        logger.info("Deleted leave request %s by user %s", req_id, user.id)

    @classmethod
    def _register_vietnamese_fonts(cls) -> tuple[str, str, str]:
        """
        Registers Unicode TTF fonts (Times New Roman / DejaVu / Arial) with ReportLab
        so Vietnamese diacritics render accurately in generated PDF files.
        """
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont

        registered = pdfmetrics.getRegisteredFontNames()
        if "VN-Serif" in registered and "VN-Serif-Bold" in registered:
            return "VN-Serif", "VN-Serif-Bold", "VN-Serif-Italic"

        candidates = [
            (
                "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
                "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
                "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
            ),
            (
                "/System/Library/Fonts/Supplemental/Arial.ttf",
                "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                "/System/Library/Fonts/Supplemental/Arial Italic.ttf",
            ),
            (
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            ),
            (
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
            ),
        ]

        for reg_path, bold_path, italic_path in candidates:
            if os.path.exists(reg_path):
                pdfmetrics.registerFont(TTFont("VN-Serif", reg_path))
                pdfmetrics.registerFont(
                    TTFont("VN-Serif-Bold", bold_path if os.path.exists(bold_path) else reg_path)
                )
                pdfmetrics.registerFont(
                    TTFont(
                        "VN-Serif-Italic",
                        italic_path if os.path.exists(italic_path) else reg_path,
                    )
                )
                return "VN-Serif", "VN-Serif-Bold", "VN-Serif-Italic"

        return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"

    @classmethod
    def generate_leave_request_pdf(cls, user: Any, leave_request_id: str) -> tuple[bytes, str]:
        """
        Fetches the latest leave request data from the database and generates
        an official A4 Vietnamese administrative PDF document.
        Returns (pdf_bytes, filename).
        """
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

        item = cls.get_leave_request_detail(user=user, leave_request_id=leave_request_id)
        font_reg, font_bold, font_italic = cls._register_vietnamese_fonts()

        leave_type_labels = {
            "sick": "Nghỉ ốm / Khám chữa bệnh",
            "family_affair": "Việc gia đình",
            "bereavement": "Việc hiếu / Tang chế",
            "official_competition": "Thi đấu / Công tác trường",
            "other": "Lý do khác",
        }
        status_labels = {
            "pending": "Chờ phê duyệt",
            "approved": "Đã phê duyệt (Tự động)" if item.get("isAutoApproved") else "Đã phê duyệt",
            "rejected": "Từ chối phê duyệt",
            "cancelled": "Đã hủy đơn",
        }
        shift_labels = {
            "all_day": "Nghỉ cả ngày",
            "morning": "Nghỉ buổi sáng",
            "afternoon": "Nghỉ buổi chiều",
        }

        leave_type_text = leave_type_labels.get(item["leaveType"], "Xin nghỉ phép")
        status_text = status_labels.get(item["status"], item["status"])
        shift_text = shift_labels.get(item["sessionShift"], "Nghỉ cả ngày")

        def fmt_date(d_str: str) -> str:
            try:
                return datetime.strptime(d_str, "%Y-%m-%d").strftime("%d/%m/%Y")
            except ValueError:
                return d_str

        start_fmt = fmt_date(item["startDate"])
        end_fmt = fmt_date(item["endDate"])
        date_range_text = (
            f"Ngày {start_fmt}"
            if item["startDate"] == item["endDate"]
            else f"Từ ngày {start_fmt} đến hết ngày {end_fmt}"
        )

        now_local = timezone.now().astimezone(timezone.get_current_timezone())
        created_dt = now_local
        if item.get("createdAt"):
            try:
                created_dt = datetime.strptime(item["createdAt"][:16], "%Y-%m-%d %H:%M")
            except ValueError:
                created_dt = now_local

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=22 * mm,
            rightMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=f"Đơn xin phép nghỉ học - {item['code']}",
        )

        style_center = ParagraphStyle(
            "VNCenter",
            fontName=font_reg,
            fontSize=11.5,
            leading=16,
            alignment=TA_CENTER,
        )
        style_center_bold = ParagraphStyle(
            "VNCenterBold",
            fontName=font_bold,
            fontSize=11.5,
            leading=16,
            alignment=TA_CENTER,
        )
        style_right_italic = ParagraphStyle(
            "VNRightItalic",
            fontName=font_italic,
            fontSize=11.5,
            leading=16,
            alignment=TA_RIGHT,
        )
        style_title = ParagraphStyle(
            "VNTitle",
            fontName=font_bold,
            fontSize=16,
            leading=22,
            alignment=TA_CENTER,
        )
        style_subtitle = ParagraphStyle(
            "VNSubtitle",
            fontName=font_italic,
            fontSize=11,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#374151"),
        )
        style_body = ParagraphStyle(
            "VNBody",
            fontName=font_reg,
            fontSize=11.5,
            leading=17,
            alignment=TA_JUSTIFY,
        )
        style_body_bold = ParagraphStyle(
            "VNBodyBold",
            fontName=font_bold,
            fontSize=11.5,
            leading=17,
        )

        story: list[Any] = []

        # 1. Header Table (School Name & National Motto)
        header_data = [
            [
                Paragraph("TRƯỜNG Trung học phổ thông SCHOOLPRO", style_center_bold),
                Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", style_center_bold),
            ],
            [
                Paragraph(
                    f"LỚP: <b>{escape(str(item.get('className') or '10A1'))}</b><br/>"
                    f"<font size='10'>Mã đơn: {escape(str(item.get('code') or ''))}</font>",
                    style_center,
                ),
                Paragraph("<u>Độc lập - Tự do - Hạnh phúc</u>", style_center_bold),
            ],
        ]
        header_table = Table(header_data, colWidths=[72 * mm, 98 * mm])
        header_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(header_table)
        story.append(Spacer(1, 3 * mm))

        # 2. Date Line
        story.append(
            Paragraph(
                f"Ngày {created_dt.strftime('%d')} tháng {created_dt.strftime('%m')} năm {created_dt.strftime('%Y')}",
                style_right_italic,
            )
        )
        story.append(Spacer(1, 3 * mm))

        # 3. Title
        story.append(Paragraph("ĐƠN XIN PHÉP NGHỈ HỌC", style_title))
        story.append(
            Paragraph(
                f"(Phân loại: {escape(leave_type_text)} • Trạng thái: {escape(status_text)})",
                style_subtitle,
            )
        )
        story.append(Spacer(1, 4 * mm))

        # 4. Salutation
        homeroom_name = escape(str(item.get("homeroomTeacherName") or "Giáo viên chủ nhiệm"))
        class_name = escape(str(item.get("className") or "10A1"))
        story.append(
            Paragraph(
                "<b>Kính gửi:</b> - Ban Giám hiệu Trường Trung học phổ thông SchoolPro",
                style_body,
            )
        )
        story.append(
            Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"- Thầy/Cô Giáo viên chủ nhiệm lớp {class_name}: <b>{homeroom_name}</b> (Người xét duyệt)",
                style_body,
            )
        )
        story.append(
            Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"- Quý Thầy/Cô giáo bộ môn giảng dạy lớp {class_name}",
                style_body,
            )
        )
        story.append(Spacer(1, 3 * mm))

        # 5. Student & Guardian Info
        student_name = escape(str(item.get("studentName") or ""))
        student_code = escape(str(item.get("studentCode") or ""))
        guardian_name = escape(str(item.get("guardianName") or "Phụ huynh học sinh"))
        guardian_rel = escape(str(item.get("guardianRelationship") or "Phụ huynh"))
        guardian_phone = escape(str(item.get("guardianPhone") or ""))

        story.append(
            Paragraph(
                f"Em tên là: <b>{student_name}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"Mã số học sinh: <b>{student_code}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                f"Lớp: <b>{class_name}</b>",
                style_body,
            )
        )
        guardian_line = f"Họ và tên Phụ huynh xác nhận: <b>{guardian_name}</b> ({guardian_rel})"
        if guardian_phone:
            guardian_line += f" — SĐT: <b>{guardian_phone}</b>"
        story.append(Paragraph(guardian_line, style_body))
        story.append(Spacer(1, 3 * mm))

        # 6. Leave Request Details Box
        story.append(
            Paragraph(
                "Nay em làm đơn này kính xin Thầy/Cô cho phép em được nghỉ học với thông tin cụ thể như sau:",
                style_body,
            )
        )
        story.append(Spacer(1, 2 * mm))

        affected_subjects_str = (
            ", ".join(item.get("affectedSubjects") or []) or "Theo thời khóa biểu"
        )
        info_rows = [
            [
                Paragraph("<b>Thời gian xin nghỉ:</b>", style_body),
                Paragraph(escape(date_range_text), style_body),
            ],
            [
                Paragraph("<b>Số ngày &amp; Ca nghỉ:</b>", style_body),
                Paragraph(
                    f"<b>{item.get('totalDays', 1)} ngày</b> ({escape(shift_text)})",
                    style_body,
                ),
            ],
            [
                Paragraph("<b>Các môn học xin nghỉ:</b>", style_body),
                Paragraph(escape(affected_subjects_str), style_body),
            ],
        ]
        info_table = Table(info_rows, colWidths=[48 * mm, 122 * mm])
        info_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        story.append(info_table)
        story.append(Spacer(1, 3 * mm))

        # 7. Reason & Commitment
        reason_html = escape(str(item.get("reason") or "")).replace("\n", "<br/>")
        story.append(Paragraph("<b>Lý do xin nghỉ học chi tiết:</b>", style_body_bold))
        story.append(Paragraph(reason_html, style_body))
        story.append(Spacer(1, 2.5 * mm))

        commitment_html = escape(
            str(
                item.get("commitment")
                or "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học."
            )
        )
        story.append(Paragraph("<b>Lời hứa và cam kết của học sinh:</b>", style_body_bold))
        story.append(Paragraph(commitment_html, style_body))
        story.append(Spacer(1, 3 * mm))

        if item.get("teacherNote"):
            reviewer = escape(str(item.get("reviewedByName") or homeroom_name))
            note_html = escape(str(item.get("teacherNote"))).replace("\n", "<br/>")
            story.append(
                Paragraph(
                    f"<b>Ý kiến phê duyệt ({reviewer}):</b>",
                    style_body_bold,
                )
            )
            story.append(Paragraph(f'<i>"{note_html}"</i>', style_body))
            story.append(Spacer(1, 3 * mm))

        story.append(Spacer(1, 4 * mm))

        # 8. Signature Block
        reviewer_display = escape(
            str(item.get("reviewedByName") or item.get("homeroomTeacherName") or "")
        )
        sig_data = [
            [
                Paragraph("<b>XÁC NHẬN CỦA PHỤ HUYNH</b>", style_center_bold),
                Paragraph("<b>GIÁO VIÊN CHỦ NHIỆM</b>", style_center_bold),
                Paragraph("<b>HỌC SINH LÀM ĐƠN</b>", style_center_bold),
            ],
            [
                Paragraph("<i>(Ký và ghi rõ họ tên)</i>", style_subtitle),
                Paragraph(f"<i>({escape(status_text)})</i>", style_subtitle),
                Paragraph("<i>(Ký và ghi rõ họ tên)</i>", style_subtitle),
            ],
            [
                Spacer(1, 16 * mm),
                Spacer(1, 16 * mm),
                Spacer(1, 16 * mm),
            ],
            [
                Paragraph(f"<b>{guardian_name}</b>", style_center_bold),
                Paragraph(f"<b>{reviewer_display}</b>", style_center_bold),
                Paragraph(f"<b>{student_name}</b>", style_center_bold),
            ],
        ]
        sig_table = Table(sig_data, colWidths=[56 * mm, 58 * mm, 56 * mm])
        sig_table.setStyle(
            TableStyle(
                [
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(sig_table)
        story.append(Spacer(1, 6 * mm))

        story.append(
            Paragraph(
                f"<font size='9' color='#64748B'>Trích xuất từ Hệ thống Quản lý Học vụ SchoolPro • "
                f"Mã đơn: {escape(str(item.get('code') or ''))} • "
                f"Thời gian xuất: {now_local.strftime('%H:%M %d/%m/%Y')}</font>",
                style_center,
            )
        )

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        safe_code = str(item.get("code") or "DON").replace("#", "").replace("/", "-")
        filename = f"Don_Xin_Nghi_Phep_{safe_code}.pdf"
        return pdf_bytes, filename
