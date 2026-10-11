"""
Realtime broadcasting and synchronization service for Academic Leave Requests.
Handles:
- WebSocket event dispatching via Django Channels layer using transaction.on_commit
- Group routing for Students, Homeroom Teachers, Subject Teachers, and Detail viewers
- Lightweight delta synchronization state for resilient fallback and multi-tab sync
"""

import logging
from datetime import datetime
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from apps.academic.models.attendance import LeaveRequest, LeaveRequestEventLog

logger = logging.getLogger(__name__)


class LeaveRequestRealtimeEvent:
    """
    Standardized realtime event constants for the Leave Request domain.
    """

    CREATED = "LEAVE_REQUEST_CREATED"
    UPDATED = "LEAVE_REQUEST_UPDATED"
    CANCELLED = "LEAVE_REQUEST_CANCELLED"
    DELETED = "LEAVE_REQUEST_DELETED"
    REVIEWED = "LEAVE_REQUEST_REVIEWED"
    AUTO_APPROVED = "LEAVE_REQUEST_AUTO_APPROVED"
    LOG_CREATED = "LEAVE_REQUEST_LOG_CREATED"


class LeaveRequestRealtimeService:
    """
    Orchestrates real-time notifications and state synchronization across WebSocket
    channel groups and delta-sync endpoints for student leave requests.
    """

    GLOBAL_GROUP = "leave_requests_global"

    @staticmethod
    def get_user_group(user_id: str | Any) -> str:
        """Returns channel group name for a specific user account."""
        return f"leave_requests_user_{str(user_id)}"

    @staticmethod
    def get_student_group(student_id: str | Any) -> str:
        """Returns channel group name for a specific student profile."""
        return f"leave_requests_student_{str(student_id)}"

    @staticmethod
    def get_class_group(class_id: str | Any) -> str:
        """Returns channel group name for a specific school class."""
        return f"leave_requests_class_{str(class_id)}"

    @staticmethod
    def get_detail_group(leave_request_id: str | Any) -> str:
        """Returns channel group name for viewers of a specific leave request."""
        return f"leave_request_detail_{str(leave_request_id)}"

    @classmethod
    def resolve_target_groups(
        cls,
        leave_request: LeaveRequest | None = None,
        leave_request_id: str | None = None,
        student_id: str | None = None,
        class_id: str | None = None,
        extra_user_ids: list[str] | None = None,
    ) -> list[str]:
        """
        Determines all deduplicated channel groups that should receive an update
        for a given leave request mutation.
        """
        groups: set[str] = {cls.GLOBAL_GROUP}

        req_id = leave_request_id or (str(leave_request.id) if leave_request else None)
        if req_id:
            groups.add(cls.get_detail_group(req_id))

        st_id = student_id or (str(leave_request.student_id) if leave_request else None)
        if st_id:
            groups.add(cls.get_student_group(st_id))

        cls_id = class_id or (str(leave_request.school_class_id) if leave_request else None)
        if cls_id:
            groups.add(cls.get_class_group(cls_id))

        if leave_request:
            if leave_request.requested_by_id:
                groups.add(cls.get_user_group(leave_request.requested_by_id))

            student = getattr(leave_request, "student", None)
            student_user_id = getattr(student, "user_id", None) if student else None
            if student_user_id:
                groups.add(cls.get_user_group(student_user_id))

            school_class = getattr(leave_request, "school_class", None)
            homeroom_teacher = (
                getattr(school_class, "homeroom_teacher", None) if school_class else None
            )
            homeroom_user_id = (
                getattr(homeroom_teacher, "user_id", None) if homeroom_teacher else None
            )
            if homeroom_user_id:
                groups.add(cls.get_user_group(homeroom_user_id))

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
                        "type": "leave_request_event",
                        "payload": payload,
                    },
                )
        except Exception as exc:
            logger.warning("Realtime channel broadcast warning: %s", exc)

    @classmethod
    def broadcast_event(
        cls,
        event_type: str,
        leave_request: LeaveRequest | None = None,
        leave_request_id: str | None = None,
        student_id: str | None = None,
        class_id: str | None = None,
        item_data: dict[str, Any] | None = None,
        log_data: dict[str, Any] | None = None,
        message: str = "",
        actor_name: str = "",
    ) -> None:
        """
        Schedules a WebSocket broadcast via transaction.on_commit so that
        connected clients only receive the event after the database transaction commits.
        """
        req_id = leave_request_id or (str(leave_request.id) if leave_request else "")
        req_code = getattr(leave_request, "code", "") if leave_request else ""
        if not req_code and item_data:
            req_code = str(item_data.get("code") or item_data.get("requestCode") or "")

        status_code = getattr(leave_request, "status", "") if leave_request else ""
        status_ui = status_code.lower() if status_code else ""
        if item_data and item_data.get("status"):
            status_ui = str(item_data["status"])

        is_auto = (
            bool(getattr(leave_request, "is_auto_approved", False)) if leave_request else False
        )
        if item_data and "isAutoApproved" in item_data:
            is_auto = bool(item_data["isAutoApproved"])

        groups = cls.resolve_target_groups(
            leave_request=leave_request,
            leave_request_id=req_id,
            student_id=student_id,
            class_id=class_id,
        )

        tz = timezone.get_current_timezone()
        now_str = timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")

        payload: dict[str, Any] = {
            "eventType": event_type,
            "leaveRequestId": req_id,
            "code": req_code,
            "status": status_ui,
            "isAutoApproved": is_auto,
            "message": message,
            "actorName": actor_name,
            "timestamp": now_str,
            "item": item_data,
            "eventLog": log_data,
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
        class_id: str | None = None,
        student_id: str | None = None,
        leave_request_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Computes a lightweight synchronization snapshot for the current user or viewed leave request.
        Also executes overdue 3-hour pre-lesson auto-approval check so time-based transitions
        are reflected in real time.
        """
        from apps.academic.services.leave_request_service import LeaveRequestService

        qs = LeaveRequest.objects.select_related(
            "student",
            "student__user",
            "school_class",
            "school_class__homeroom_teacher",
            "school_class__homeroom_teacher__user",
        )

        if leave_request_id:
            qs = qs.filter(id=leave_request_id)
        elif student_id:
            qs = qs.filter(student_id=student_id)
        elif class_id:
            qs = qs.filter(school_class_id=class_id)
        else:
            student = LeaveRequestService.resolve_student(user)
            if student:
                qs = qs.filter(student=student)
            else:
                qs = qs.none()

        auto_approved_count = LeaveRequestService.check_and_auto_approve_overdue_requests(qs)

        total_count = qs.count()
        pending_count = qs.filter(status="PENDING").count()
        approved_count = qs.filter(status="APPROVED").count()
        rejected_count = qs.filter(status="REJECTED").count()
        cancelled_count = qs.filter(status="CANCELLED").count()

        agg = qs.aggregate(latest_updated=Max("updated_at"), latest_created=Max("created_at"))
        latest_req_dt: datetime | None = agg.get("latest_updated") or agg.get("latest_created")

        req_ids = list(qs.values_list("id", flat=True))
        latest_log_dt: datetime | None = None
        total_logs_count = 0
        if req_ids:
            log_qs = LeaveRequestEventLog.objects.filter(leave_request_id__in=req_ids)
            total_logs_count = log_qs.count()
            latest_log_dt = log_qs.aggregate(latest_log=Max("created_at")).get("latest_log")

        latest_dt = latest_req_dt
        if latest_log_dt and (not latest_dt or latest_log_dt > latest_dt):
            latest_dt = latest_log_dt

        tz = timezone.get_current_timezone()
        last_updated_str = (
            latest_dt.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S.%f") if latest_dt else ""
        )

        sync_version = (
            f"{total_count}:{pending_count}:{approved_count}:{rejected_count}:"
            f"{cancelled_count}:{total_logs_count}:{last_updated_str}"
        )

        detail_item: dict[str, Any] | None = None
        if leave_request_id and req_ids:
            try:
                detail_item = LeaveRequestService.get_leave_request_detail(
                    user=user,
                    leave_request_id=leave_request_id,
                )
            except Exception:
                detail_item = None

        return {
            "syncVersion": sync_version,
            "lastUpdatedAt": last_updated_str,
            "autoApprovedNowCount": auto_approved_count,
            "counts": {
                "total": total_count,
                "pendingCount": pending_count,
                "approvedCount": approved_count,
                "rejectedCount": rejected_count,
                "cancelledCount": cancelled_count,
                "eventLogsCount": total_logs_count,
            },
            "detailItem": detail_item,
            "serverTime": timezone.now().astimezone(tz).strftime("%Y-%m-%d %H:%M:%S"),
        }
