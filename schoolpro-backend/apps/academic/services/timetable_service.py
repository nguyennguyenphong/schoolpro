"""
Business logic service for Academic Timetable domain.
Handles student class schedule extraction, week matrix mapping, and summary metrics.
"""

import logging
from datetime import datetime, timedelta
from typing import Any

from django.utils import timezone

from apps.academic.models.timetable import Timetable
from apps.core.models.organization import StudentClassEnrollment
from apps.core.models.profile import Student

logger = logging.getLogger(__name__)


class TimetableService:
    """
    Orchestrates timetable querying, dynamic weekly date mapping, and metrics.
    """

    @staticmethod
    def get_student_class_id(user: Any) -> str | None:
        """
        Resolves the primary active class ID for the authenticated student user.
        Falls back to the first available class with timetable if not explicitly enrolled.
        """
        try:
            student = Student.objects.filter(user=user).first()
            if student:
                enrollment = (
                    StudentClassEnrollment.objects.filter(
                        student=student,
                        status="ACTIVE",
                    )
                    .select_related("school_class")
                    .first()
                )
                if enrollment:
                    return str(enrollment.school_class_id)
                # Fallback to current_class field on Student profile
                if getattr(student, "current_class_id", None):
                    return str(student.current_class_id)
        except Exception as e:
            logger.warning(f"Unable to resolve student class for user {user.id}: {e}")

        # Fallback to the first class that has timetables configured
        first_timetable = Timetable.objects.first()
        if first_timetable:
            return str(first_timetable.school_class_id)

        return None

    @staticmethod
    def resolve_student(user: Any, class_id: str | None = None) -> Student | None:
        """
        Resolves the Student profile for the authenticated user, falling back to an enrolled
        student with leave requests in dev/testing mode if user is staff/superuser.
        """
        try:
            student = Student.objects.filter(user=user).first()
            if student:
                return student
            if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
                from apps.academic.services.leave_request_service import LeaveRequestService

                resolved = LeaveRequestService.resolve_student(user)
                if resolved:
                    return resolved
            if class_id:
                enrollment = (
                    StudentClassEnrollment.objects.filter(
                        school_class_id=class_id,
                        status="ACTIVE",
                    )
                    .select_related("student")
                    .first()
                )
                if enrollment and enrollment.student:
                    return enrollment.student
        except Exception as exc:
            logger.warning("Unable to resolve student profile for timetable: %s", exc)
        return None

    @staticmethod
    def _match_slot_leave_request(
        slot_id: str,
        slot_date,
        slot_date_str: str,
        slot_shift: str,
        leave_requests: list[Any],
    ) -> Any | None:
        """
        Matches a timetable slot against active student leave requests (APPROVED or PENDING)
        overlapping the target week. Prioritizes APPROVED requests over PENDING ones.
        """
        matched_pending = None
        for req in leave_requests:
            if not (req.start_date <= slot_date <= req.end_date):
                continue

            meta = req.metadata if isinstance(req.metadata, dict) else {}
            req_shift = str(meta.get("sessionShift", "all_day") or "all_day").lower()
            selected_keys = meta.get("selectedLessonKeys")
            affected_lessons = meta.get("affectedLessons")

            lesson_key = f"{slot_date_str}_{slot_id}"
            is_matched = False

            if isinstance(selected_keys, list) and len(selected_keys) > 0:
                selected_set = {str(k) for k in selected_keys}
                if lesson_key in selected_set or slot_id in selected_set:
                    is_matched = True
            elif isinstance(affected_lessons, list) and len(affected_lessons) > 0:
                for lesson in affected_lessons:
                    if not isinstance(lesson, dict):
                        continue
                    if str(lesson.get("lessonKey")) == lesson_key or (
                        str(lesson.get("date")) == slot_date_str
                        and str(lesson.get("timetableId")) == slot_id
                    ):
                        is_matched = True
                        break
                if not is_matched and req_shift in ("all_day", slot_shift):
                    is_matched = True
            else:
                if req_shift in ("all_day", slot_shift):
                    is_matched = True

            if is_matched:
                if req.status == "APPROVED":
                    return req
                if matched_pending is None:
                    matched_pending = req

        return matched_pending

    @classmethod
    def get_weekly_schedule_context(
        cls,
        user: Any,
        selected_date_str: str | None = None,
        search_query: str | None = None,
        shift_filter: str | None = None,
        class_type_filter: str | None = None,
        status_filter: str | None = None,
    ) -> dict[str, Any]:
        """
        Retrieves timetable slots dynamically mapped to the week of the selected date,
        along with active academic year and semester boundary metadata.
        """
        from apps.academic.models.attendance import Attendance, LeaveRequest
        from apps.academic.services.leave_request_service import LeaveRequestService
        from apps.master.models import AcademicYear, Semester

        class_id = cls.get_student_class_id(user)
        student = cls.resolve_student(user, class_id=class_id)
        today = timezone.localdate()

        # Parse selected date or default to today
        if selected_date_str:
            try:
                target_date = datetime.strptime(selected_date_str, "%Y-%m-%d").date()
            except ValueError:
                target_date = today
        else:
            target_date = today

        # Calculate Monday of the targeted week (ISO week start)
        week_start = target_date - timedelta(days=target_date.weekday())
        week_end = week_start + timedelta(days=6)
        now_time = timezone.localtime().time()

        # Resolve academic year matching target date, or current academic year
        academic_year = (
            AcademicYear.objects.filter(
                start_date__lte=target_date, end_date__gte=target_date
            ).first()
            or AcademicYear.objects.filter(is_current=True).first()
            or AcademicYear.objects.order_by("-start_date").first()
        )

        # Resolve semester matching target date, or current semester
        semester = (
            Semester.objects.filter(start_date__lte=target_date, end_date__gte=target_date).first()
            or Semester.objects.filter(is_current=True).first()
            or Semester.objects.order_by("-start_date").first()
        )

        # Determine if target week falls outside the semester or academic year
        is_outside_academic_year = False
        is_outside_semester = False
        vacation_reason = None

        if academic_year:
            if target_date < academic_year.start_date or target_date > academic_year.end_date:
                is_outside_academic_year = True
                vacation_reason = "Thời gian đã chọn nằm ngoài năm học hiện tại."

        if semester:
            if target_date < semester.start_date or target_date > semester.end_date:
                is_outside_semester = True
                if not vacation_reason:
                    vacation_reason = "Thời gian đã chọn nằm ngoài khung thời gian học kỳ (Kỳ nghỉ hè hoặc nghỉ giữa kỳ)."

        meta_info = {
            "academicYear": {
                "id": str(academic_year.id),
                "name": academic_year.name,
                "code": academic_year.code,
                "startDate": academic_year.start_date.strftime("%Y-%m-%d"),
                "endDate": academic_year.end_date.strftime("%Y-%m-%d"),
                "isCurrent": academic_year.is_current,
            }
            if academic_year
            else None,
            "semester": {
                "id": str(semester.id),
                "name": semester.name,
                "code": semester.code,
                "startDate": semester.start_date.strftime("%Y-%m-%d"),
                "endDate": semester.end_date.strftime("%Y-%m-%d"),
                "isCurrent": semester.is_current,
            }
            if semester
            else None,
            "selectedWeek": {
                "startDate": week_start.strftime("%Y-%m-%d"),
                "endDate": week_end.strftime("%Y-%m-%d"),
                "selectedDate": target_date.strftime("%Y-%m-%d"),
                "isOutside": is_outside_academic_year or is_outside_semester,
                "vacationReason": vacation_reason,
            },
        }

        if not class_id:
            return {"slots": [], "meta": meta_info}

        # Query active leave requests and excused attendance records for this student in the target week
        active_leave_requests: list[LeaveRequest] = []
        excused_attendance_dates: set[str] = set()
        if student:
            student_leave_qs = LeaveRequest.objects.filter(
                student=student,
                status__in=["APPROVED", "PENDING"],
                start_date__lte=week_end,
                end_date__gte=week_start,
            ).select_related(
                "student",
                "student__user",
                "school_class",
                "school_class__homeroom_teacher",
                "school_class__homeroom_teacher__user",
            )
            LeaveRequestService.check_and_auto_approve_overdue_requests(student_leave_qs)
            active_leave_requests = list(
                LeaveRequest.objects.filter(
                    student=student,
                    status__in=["APPROVED", "PENDING"],
                    start_date__lte=week_end,
                    end_date__gte=week_start,
                ).order_by("-status", "-created_at")
            )
            excused_attendance_dates = {
                att_date.strftime("%Y-%m-%d")
                for att_date in Attendance.objects.filter(
                    student=student,
                    school_class_id=class_id,
                    attendance_date__gte=week_start,
                    attendance_date__lte=week_end,
                    status="ABSENT_EXCUSED",
                ).values_list("attendance_date", flat=True)
            }

        # Query active recurring slots for the class
        queryset = (
            Timetable.objects.filter(school_class_id=class_id)
            .select_related(
                "period",
                "room",
                "school_class",
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher__user",
            )
            .order_by("day_of_week", "period__start_time")
        )

        slots: list[dict[str, Any]] = []

        for item in queryset:
            # Map day of week (2 = Monday -> 8 = Sunday) to target week date
            day_offset = item.day_of_week - 2
            slot_date = week_start + timedelta(days=day_offset)

            # Check if this specific slot date is within timetable effective bounds
            if item.effective_from and slot_date < item.effective_from:
                continue
            if item.effective_to and slot_date > item.effective_to:
                continue

            # Check if within semester bounds if semester exists
            if semester and (slot_date < semester.start_date or slot_date > semester.end_date):
                continue

            slot_date_str = slot_date.strftime("%Y-%m-%d")
            slot_shift = item.period.shift.lower()

            start_t = item.period.start_time
            end_t = item.period.end_time
            start_str = start_t.strftime("%H:%M")
            end_str = end_t.strftime("%H:%M")

            # Determine dynamic status based on current time
            if slot_date < today or (slot_date == today and now_time > end_t):
                slot_status = "completed"
                attendance_status = "present"
            elif slot_date == today and start_t <= now_time <= end_t:
                slot_status = "ongoing"
                attendance_status = "present"
            else:
                slot_status = "upcoming"
                attendance_status = "not_yet"

            # Check if student is on leave for this slot/shift/day
            matched_leave = cls._match_slot_leave_request(
                slot_id=str(item.id),
                slot_date=slot_date,
                slot_date_str=slot_date_str,
                slot_shift=slot_shift,
                leave_requests=active_leave_requests,
            )

            is_on_leave = False
            leave_status = None
            leave_session_shift = None
            leave_type = None
            leave_reason = None
            leave_request_code = None

            if matched_leave is not None:
                is_on_leave = True
                attendance_status = "excused"
                leave_status = "approved" if matched_leave.status == "APPROVED" else "pending"
                req_meta = (
                    matched_leave.metadata if isinstance(matched_leave.metadata, dict) else {}
                )
                leave_session_shift = str(
                    req_meta.get("sessionShift", "all_day") or "all_day"
                ).lower()
                leave_type = LeaveRequestService.LEAVE_TYPE_DB_TO_UI.get(
                    matched_leave.leave_type, "other"
                )
                leave_reason = matched_leave.reason or ""
                leave_request_code = matched_leave.code or ""
            elif slot_date_str in excused_attendance_dates:
                is_on_leave = True
                attendance_status = "excused"
                leave_status = "approved"
                leave_session_shift = "all_day"

            cst = item.class_subject_teacher
            subject = getattr(cst, "subject", None)
            teacher = getattr(cst, "teacher", None)
            teacher_user = getattr(teacher, "user", None) if teacher else None
            room = item.room
            school_class = item.school_class

            slot_data = {
                "id": str(item.id),
                "courseCode": subject.code if subject else "HP01",
                "courseName": subject.name if subject else "Học phần",
                "classCode": school_class.name if school_class else "10A1",
                "className": school_class.name if school_class else "10A1",
                "credits": getattr(cst, "periods_per_week", 2) or 2,
                "dayOfWeek": item.day_of_week,
                "date": slot_date_str,
                "periods": f"Tiết {item.period.period_no}",
                "startTime": start_str,
                "endTime": end_str,
                "shift": slot_shift,
                "room": room.name if room else "Phòng học",
                "building": room.building if room and room.building else "Dãy nhà B",
                "instructorName": teacher_user.full_name if teacher_user else "Giáo viên",
                "instructorEmail": teacher_user.email if teacher_user else "",
                "instructorPhone": getattr(teacher_user, "phone_number", "") or "",
                "classType": item.class_type.lower() if item.class_type else "theory",
                "status": slot_status,
                "attendanceStatus": attendance_status,
                "isOnLeave": is_on_leave,
                "leaveStatus": leave_status,
                "leaveSessionShift": leave_session_shift,
                "leaveType": leave_type,
                "leaveReason": leave_reason,
                "leaveRequestCode": leave_request_code,
                "onlineUrl": item.online_url if item.is_online else None,
                "lessonTopic": item.lesson_topic or "",
                "notes": item.notes or "",
                "colorTheme": item.color_theme or "blue",
            }

            # Apply filters
            if shift_filter and shift_filter != "all" and slot_data["shift"] != shift_filter:
                continue
            if (
                class_type_filter
                and class_type_filter != "all"
                and slot_data["classType"] != class_type_filter
            ):
                continue
            if status_filter and status_filter != "all" and slot_data["status"] != status_filter:
                continue
            if search_query and search_query.strip():
                q = search_query.strip().lower()
                matched = (
                    q in slot_data["courseName"].lower()
                    or q in slot_data["courseCode"].lower()
                    or q in slot_data["room"].lower()
                    or q in slot_data["instructorName"].lower()
                )
                if not matched:
                    continue

            slots.append(slot_data)

        return {"slots": slots, "meta": meta_info}

    @classmethod
    def get_weekly_slots(
        cls,
        user: Any,
        selected_date_str: str | None = None,
        search_query: str | None = None,
        shift_filter: str | None = None,
        class_type_filter: str | None = None,
        status_filter: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieves timetable slots dynamically mapped to the week of the selected date.
        """
        result = cls.get_weekly_schedule_context(
            user=user,
            selected_date_str=selected_date_str,
            search_query=search_query,
            shift_filter=shift_filter,
            class_type_filter=class_type_filter,
            status_filter=status_filter,
        )
        return result["slots"]

    @classmethod
    def calculate_summary(cls, slots: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Computes aggregate metrics from the provided timetable slot list.
        """
        total_sessions = len(slots)
        total_theory = sum(1 for s in slots if s.get("classType") == "theory")
        total_practice = sum(1 for s in slots if s.get("classType") == "practice")
        upcoming = sum(1 for s in slots if s.get("status") == "upcoming")
        ongoing = sum(1 for s in slots if s.get("status") == "ongoing")
        completed = sum(1 for s in slots if s.get("status") == "completed")

        course_codes = {s.get("courseCode") for s in slots if s.get("courseCode")}
        total_credits = sum(
            next((s.get("credits", 2) for s in slots if s.get("courseCode") == code), 2)
            for code in course_codes
        )

        present_count = sum(1 for s in slots if s.get("attendanceStatus") == "present")
        attendance_rate = round((present_count / completed) * 100) if completed > 0 else 100

        return {
            "totalSessions": total_sessions,
            "totalCredits": total_credits,
            "totalTheorySessions": total_theory,
            "totalPracticeSessions": total_practice,
            "attendanceRate": attendance_rate,
            "upcomingSessions": upcoming,
            "ongoingSessions": ongoing,
            "completedSessions": completed,
        }

    @classmethod
    def get_course_options(cls, user: Any) -> list[dict[str, str]]:
        """
        Retrieves unique subject options for the student's current class timetable.
        """
        slots = cls.get_weekly_slots(user)
        seen: dict[str, str] = {}
        for s in slots:
            code = s.get("courseCode")
            name = s.get("courseName")
            if code and name and code not in seen:
                seen[code] = name
        return [{"code": code, "name": name} for code, name in seen.items()]
