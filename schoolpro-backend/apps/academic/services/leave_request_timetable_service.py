"""
Timetable & deadline calculation service for Academic Student Leave Requests.
Handles:
- Active weekday calculation from class timetable
- Affected lessons & deduplicated teacher notification recipient computation
- 3-hour pre-lesson approval deadline calculation
"""

from datetime import date, datetime, time, timedelta
from typing import Any

from django.utils import timezone

from apps.academic.models.timetable import Timetable
from apps.core.models.organization import SchoolClass


class LeaveRequestTimetableService:
    """
    Computes affected timetable lessons, deduplicated teacher recipients,
    and the 3-hour pre-lesson approval deadline for a leave request.
    """

    DAY_OF_WEEK_LABELS = {
        2: "Thứ Hai",
        3: "Thứ Ba",
        4: "Thứ Tư",
        5: "Thứ Năm",
        6: "Thứ Sáu",
        7: "Thứ Bảy",
        8: "Chủ Nhật",
    }

    AUTO_APPROVAL_HOURS_BEFORE_LESSON = 3

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
