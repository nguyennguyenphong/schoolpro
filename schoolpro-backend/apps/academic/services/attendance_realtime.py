"""
Realtime broadcasting and synchronization service for Academic Attendance.
Handles:
- WebSocket event dispatching via Django Channels layer using transaction.on_commit
- Group routing for Students, Subject Teachers, Homeroom Teachers, and Session viewers
- Lightweight delta synchronization state and automatic session expiration checks
"""

import logging
from datetime import datetime
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from apps.academic.models.attendance import Attendance, AttendanceLog, AttendanceSession

logger = logging.getLogger(__name__)


class AttendanceRealtimeEvent:
    """
    Standardized realtime event constants for the Attendance domain.
    """

    SESSION_OPENED = "ATTENDANCE_SESSION_OPENED"
    SESSION_UPDATED = "ATTENDANCE_SESSION_UPDATED"
    SESSION_EXPIRED = "ATTENDANCE_SESSION_EXPIRED"
    SESSION_CLOSED = "ATTENDANCE_SESSION_CLOSED"
    CODE_REGENERATED = "ATTENDANCE_CODE_REGENERATED"
    STUDENT_CHECKED_IN = "ATTENDANCE_STUDENT_CHECKED_IN"
    STATUS_UPDATED = "ATTENDANCE_STATUS_UPDATED"


class AttendanceRealtimeService:
    """
    Orchestrates real-time notifications and state synchronization across WebSocket
    channel groups and delta-sync endpoints for student attendance.
    """

    GLOBAL_GROUP = "attendance_global"

    @staticmethod
    def get_user_group(user_id: str | Any) -> str:
        """Returns channel group name for a specific user account."""
        return f"attendance_user_{str(user_id)}"

    @staticmethod
    def get_student_group(student_id: str | Any) -> str:
        """Returns channel group name for a specific student profile."""
        return f"attendance_student_{str(student_id)}"

    @staticmethod
    def get_class_group(class_id: str | Any) -> str:
        """Returns channel group name for a specific school class."""
        return f"attendance_class_{str(class_id)}"

    @staticmethod
    def get_session_group(session_id: str | Any) -> str:
        """Returns channel group name for viewers of a specific attendance session."""
        return f"attendance_session_{str(session_id)}"

    @classmethod
    def resolve_target_groups(
        cls,
        session: AttendanceSession | None = None,
        attendance: Attendance | None = None,
        session_id: str | None = None,
        student_id: str | None = None,
        class_id: str | None = None,
        extra_user_ids: list[str] | None = None,
    ) -> list[str]:
        """
        Determines all deduplicated channel groups that should receive an update
        for a given attendance session or student check-in mutation.
        """
        groups: set[str] = {cls.GLOBAL_GROUP}

        sess_id = (
            session_id
            or (str(session.id) if session else None)
            or (str(attendance.session_id) if attendance and attendance.session_id else None)
        )
        if sess_id:
            groups.add(cls.get_session_group(sess_id))

        st_id = student_id or (str(attendance.student_id) if attendance else None)
        if st_id:
            groups.add(cls.get_student_group(st_id))

        cls_id = (
            class_id
            or (str(session.school_class_id) if session else None)
            or (str(attendance.school_class_id) if attendance else None)
        )
        if cls_id:
            groups.add(cls.get_class_group(cls_id))

        if session:
            if session.created_by_id:
                groups.add(cls.get_user_group(session.created_by_id))
            teacher = getattr(session, "teacher", None)
            teacher_user_id = getattr(teacher, "user_id", None) if teacher else None
            if teacher_user_id:
                groups.add(cls.get_user_group(teacher_user_id))

        if attendance:
            if attendance.recorded_by_id:
                groups.add(cls.get_user_group(attendance.recorded_by_id))
            student = getattr(attendance, "student", None)
            student_user_id = getattr(student, "user_id", None) if student else None
            if student_user_id:
                groups.add(cls.get_user_group(student_user_id))

        if extra_user_ids:
            for uid in extra_user_ids:
                if uid:
                    groups.add(cls.get_user_group(uid))

        return sorted(groups)

    @classmethod
    def _dispatch_to_groups(
        cls,
        groups: list[str],
        payload: dict[str, Any],
    ) -> None:
        """
        Sends the realtime payload to all target Django Channels groups.
        Fails gracefully if channel layer is not configured or temporarily unreachable.
        """
        try:
            channel_layer = get_channel_layer()
            if not channel_layer:
                return

            send_fn = async_to_sync(channel_layer.group_send)
            for group_name in groups:
                send_fn(
                    group_name,
                    {
                        "type": "attendance_event",
                        "payload": payload,
                    },
                )
        except Exception as exc:
            logger.warning("Attendance realtime channel broadcast warning: %s", exc)

    @classmethod
    def broadcast_event(
        cls,
        event_type: str,
        session: AttendanceSession | None = None,
        attendance: Attendance | None = None,
        session_id: str | None = None,
        student_id: str | None = None,
        class_id: str | None = None,
        record_data: dict[str, Any] | None = None,
        session_data: dict[str, Any] | None = None,
        message: str = "",
        actor_name: str = "",
    ) -> None:
        """
        Schedules a WebSocket broadcast via transaction.on_commit so that
        connected clients only receive the event after the database transaction commits.
        """
        sess_id = (
            session_id
            or (str(session.id) if session else None)
            or (str(attendance.session_id) if attendance and attendance.session_id else "")
            or ""
        )
        rec_id = (
            str(attendance.id)
            if attendance
            else (str(record_data.get("id")) if record_data else "")
        )

        groups = cls.resolve_target_groups(
            session=session,
            attendance=attendance,
            session_id=sess_id or None,
            student_id=student_id,
            class_id=class_id,
        )

        tz = timezone.get_current_timezone()
        now_str = timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")

        payload: dict[str, Any] = {
            "eventType": event_type,
            "sessionId": sess_id,
            "recordId": rec_id,
            "pinCode": getattr(session, "pin_code", "") if session else "",
            "status": (
                record_data.get("status")
                if record_data and record_data.get("status")
                else (getattr(session, "status", "").lower() if session else "")
            ),
            "message": message,
            "actorName": actor_name,
            "timestamp": now_str,
            "record": record_data,
            "session": session_data,
        }

        def _on_commit() -> None:
            cls._dispatch_to_groups(groups=groups, payload=payload)

        try:
            transaction.on_commit(_on_commit)
        except Exception:
            cls._dispatch_to_groups(groups=groups, payload=payload)

    @classmethod
    def get_sync_snapshot(
        cls,
        user: Any,
        date_str: str | None = None,
        class_id: str | None = None,
        student_id: str | None = None,
        session_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Computes a lightweight synchronization snapshot for the current user or viewed date.
        Also executes automatic expiration check on open sessions where expires_at <= now.
        """
        from apps.academic.services.attendance_session_service import AttendanceSessionService

        AttendanceSessionService.ensure_schema()

        target_date = AttendanceSessionService.parse_target_date(date_str)
        student = AttendanceSessionService.resolve_student(user)
        resolved_class_id = class_id or (
            AttendanceSessionService.resolve_student_class_id(student, user)
        )
        resolved_student_id = student_id or (str(student.id) if student else None)

        expired_now_count = AttendanceSessionService.expire_overdue_sessions(
            class_id=resolved_class_id,
            session_date=target_date,
        )

        session_qs = AttendanceSession.objects.filter(session_date=target_date)
        if resolved_class_id:
            session_qs = session_qs.filter(school_class_id=resolved_class_id)
        if session_id:
            session_qs = session_qs.filter(id=session_id)

        att_qs = Attendance.objects.filter(attendance_date=target_date)
        if resolved_student_id:
            att_qs = att_qs.filter(student_id=resolved_student_id)
        elif resolved_class_id:
            att_qs = att_qs.filter(school_class_id=resolved_class_id)

        open_sessions_count = session_qs.filter(status="OPEN").count()
        expired_sessions_count = session_qs.filter(status="EXPIRED").count()
        total_sessions_count = session_qs.count()

        present_count = att_qs.filter(status__in=["PRESENT", "LATE"]).count()
        absent_count = att_qs.filter(status="ABSENT_UNEXCUSED").count()
        excused_count = att_qs.filter(status="ABSENT_EXCUSED").count()
        total_att_count = att_qs.count()

        sess_agg = session_qs.aggregate(
            latest_updated=Max("updated_at"),
            latest_created=Max("created_at"),
            latest_expires=Max("expires_at"),
        )
        att_agg = att_qs.aggregate(latest_recorded=Max("recorded_at"))
        log_agg = AttendanceLog.objects.filter(
            attendance_id__in=att_qs.values_list("id", flat=True)
        ).aggregate(latest_log=Max("created_at"))

        candidates: list[datetime] = [
            dt
            for dt in [
                sess_agg.get("latest_updated"),
                sess_agg.get("latest_created"),
                att_agg.get("latest_recorded"),
                log_agg.get("latest_log"),
            ]
            if dt is not None
        ]
        latest_dt = max(candidates) if candidates else None

        tz = timezone.get_current_timezone()
        last_updated_str = (
            latest_dt.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S.%f") if latest_dt else ""
        )

        # Include pin_codes and radii in syncVersion so any regeneration or radius change triggers sync
        active_Meta = list(
            session_qs.order_by("id").values_list(
                "id", "status", "pin_code", "allowed_radius_meters", "expires_at"
            )
        )
        active_sig = "|".join(
            f"{sid}:{st}:{pin}:{rad}:{int(exp.timestamp()) if exp else 0}"
            for sid, st, pin, rad, exp in active_Meta
        )

        sync_version = (
            f"{target_date.isoformat()}:{total_sessions_count}:{open_sessions_count}:"
            f"{expired_sessions_count}:{total_att_count}:{present_count}:{absent_count}:"
            f"{excused_count}:{active_sig}:{last_updated_str}"
        )

        return {
            "syncVersion": sync_version,
            "lastUpdatedAt": last_updated_str,
            "expiredNowCount": expired_now_count,
            "date": target_date.isoformat(),
            "counts": {
                "totalSessions": total_sessions_count,
                "openSessions": open_sessions_count,
                "expiredSessions": expired_sessions_count,
                "presentCount": present_count,
                "absentCount": absent_count,
                "excusedCount": excused_count,
            },
            "serverTime": timezone.now().astimezone(tz).isoformat(),
        }
