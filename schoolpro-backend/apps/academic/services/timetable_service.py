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
        except Exception as e:
            logger.warning(f"Unable to resolve student class for user {user.id}: {e}")

        # Fallback to the first class that has timetables configured
        first_timetable = Timetable.objects.first()
        if first_timetable:
            return str(first_timetable.school_class_id)

        return None

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
        class_id = cls.get_student_class_id(user)
        if not class_id:
            return []

        # Parse selected date or default to today
        today = timezone.localdate()
        if selected_date_str:
            try:
                target_date = datetime.strptime(selected_date_str, "%Y-%m-%d").date()
            except ValueError:
                target_date = today
        else:
            target_date = today

        # Calculate Monday of the targeted week (ISO week start)
        week_start = target_date - timedelta(days=target_date.weekday())
        now_time = timezone.localtime().time()

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
            slot_date_str = slot_date.strftime("%Y-%m-%d")

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
                "classCode": school_class.code if school_class else "10A1",
                "credits": getattr(cst, "periods_per_week", 2) or 2,
                "dayOfWeek": item.day_of_week,
                "date": slot_date_str,
                "periods": f"Tiết {item.period.period_no}",
                "startTime": start_str,
                "endTime": end_str,
                "shift": item.period.shift.lower(),
                "room": room.name if room else "Phòng học",
                "building": room.building if room and room.building else "Dãy nhà B",
                "campus": "Trường THPT SchoolPro",
                "instructorName": teacher_user.full_name if teacher_user else "Giáo viên",
                "instructorEmail": teacher_user.email if teacher_user else "",
                "instructorPhone": getattr(teacher_user, "phone_number", "") or "",
                "classType": item.class_type.lower() if item.class_type else "theory",
                "status": slot_status,
                "attendanceStatus": attendance_status,
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

        return slots

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
