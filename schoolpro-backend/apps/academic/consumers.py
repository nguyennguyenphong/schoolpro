"""
WebSocket Consumers for Academic Leave Requests real-time notifications and updates.
"""

import logging
from typing import Any
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from apps.academic.services.attendance_realtime import AttendanceRealtimeService
from apps.academic.services.attendance_session_service import AttendanceSessionService
from apps.academic.services.leave_request_realtime import LeaveRequestRealtimeService
from apps.academic.services.leave_request_service import LeaveRequestService
from apps.core.authentication import SchoolProJWTAuthentication

logger = logging.getLogger(__name__)


class LeaveRequestConsumer(AsyncJsonWebsocketConsumer):
    """
    Async JSON WebSocket consumer for student leave requests.
    Supports JWT token authentication via query string (?token=...) or Authorization header,
    automatic group subscription by user/student/class, and detail-level room subscriptions.
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.subscribed_groups: set[str] = set()
        self.user: Any = None

    @database_sync_to_async
    def _authenticate_and_resolve_groups(self, raw_token: str | None) -> tuple[Any, list[str]]:
        """
        Validates the JWT token (if provided) and resolves initial channel groups
        for the authenticated user, their student profile, and their school class.
        """
        user = self.scope.get("user")
        if raw_token:
            try:
                jwt_auth = SchoolProJWTAuthentication()
                validated_token = jwt_auth.get_validated_token(raw_token.encode("utf-8"))
                user = jwt_auth.get_user(validated_token)
            except Exception as exc:
                logger.debug("WebSocket JWT authentication failed: %s", exc)

        groups: set[str] = {LeaveRequestRealtimeService.GLOBAL_GROUP}

        if user and getattr(user, "is_authenticated", False):
            groups.add(LeaveRequestRealtimeService.get_user_group(user.id))
            student = LeaveRequestService.resolve_student(user)
            if student:
                groups.add(LeaveRequestRealtimeService.get_student_group(student.id))
                school_class = LeaveRequestService.resolve_student_class(student)
                if school_class:
                    groups.add(LeaveRequestRealtimeService.get_class_group(school_class.id))

        return user, sorted(groups)

    def _extract_token_from_scope(self) -> str | None:
        """
        Extracts JWT bearer token from query string (?token=...) or headers.
        """
        query_string = (self.scope.get("query_string") or b"").decode("utf-8", errors="ignore")
        query_params = parse_qs(query_string)
        if "token" in query_params and query_params["token"]:
            return query_params["token"][0].strip()

        headers = dict(self.scope.get("headers") or [])
        auth_header = headers.get(b"authorization", b"").decode("utf-8", errors="ignore")
        if auth_header.lower().startswith("bearer "):
            return auth_header[7:].strip()

        return None

    async def connect(self) -> None:
        """
        Accepts the WebSocket connection and subscribes the client to relevant leave request groups.
        """
        raw_token = self._extract_token_from_scope()
        user, initial_groups = await self._authenticate_and_resolve_groups(raw_token)
        self.user = user

        query_string = (self.scope.get("query_string") or b"").decode("utf-8", errors="ignore")
        query_params = parse_qs(query_string)

        extra_detail_id = (query_params.get("leaveRequestId") or [None])[0]
        if extra_detail_id:
            initial_groups.append(LeaveRequestRealtimeService.get_detail_group(extra_detail_id))

        extra_class_id = (query_params.get("classId") or [None])[0]
        if extra_class_id:
            initial_groups.append(LeaveRequestRealtimeService.get_class_group(extra_class_id))

        await self.accept()

        if self.channel_layer:
            for group_name in set(initial_groups):
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.subscribed_groups.add(group_name)

        await self.send_json(
            {
                "type": "connected",
                "groups": sorted(self.subscribed_groups),
                "timestamp": timezone.now().isoformat(),
            }
        )

    async def disconnect(self, close_code: int) -> None:
        """
        Removes the client from all subscribed channel groups on disconnect.
        """
        if self.channel_layer:
            for group_name in list(self.subscribed_groups):
                await self.channel_layer.group_discard(group_name, self.channel_name)
        self.subscribed_groups.clear()

    async def receive_json(self, content: dict[str, Any], **kwargs: Any) -> None:
        """
        Handles client commands such as heartbeat ping or detail room subscription.
        """
        action = str(content.get("action") or content.get("type") or "").lower()

        if action == "ping":
            await self.send_json(
                {
                    "type": "pong",
                    "timestamp": timezone.now().isoformat(),
                }
            )
            return

        if action == "subscribe_detail" and self.channel_layer:
            leave_request_id = str(content.get("leaveRequestId") or "").strip()
            if leave_request_id:
                group_name = LeaveRequestRealtimeService.get_detail_group(leave_request_id)
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.subscribed_groups.add(group_name)
                await self.send_json(
                    {
                        "type": "subscribed",
                        "leaveRequestId": leave_request_id,
                        "group": group_name,
                    }
                )
            return

        if action == "unsubscribe_detail" and self.channel_layer:
            leave_request_id = str(content.get("leaveRequestId") or "").strip()
            if leave_request_id:
                group_name = LeaveRequestRealtimeService.get_detail_group(leave_request_id)
                await self.channel_layer.group_discard(group_name, self.channel_name)
                self.subscribed_groups.discard(group_name)
                await self.send_json(
                    {
                        "type": "unsubscribed",
                        "leaveRequestId": leave_request_id,
                    }
                )

    async def leave_request_event(self, event: dict[str, Any]) -> None:
        """
        Handler for 'leave_request_event' messages dispatched via channel_layer.group_send.
        """
        payload = event.get("payload") or {}
        await self.send_json(
            {
                "type": "leave_request_event",
                "data": payload,
            }
        )


class AttendanceConsumer(AsyncJsonWebsocketConsumer):
    """
    Async JSON WebSocket consumer for real-time student attendance sessions,
    6-digit PIN / QR code broadcasts, countdown expirations, and GPS check-ins.
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.subscribed_groups: set[str] = set()
        self.user: Any = None

    @database_sync_to_async
    def _authenticate_and_resolve_groups(self, raw_token: str | None) -> tuple[Any, list[str]]:
        user = self.scope.get("user")
        if raw_token:
            try:
                jwt_auth = SchoolProJWTAuthentication()
                validated_token = jwt_auth.get_validated_token(raw_token.encode("utf-8"))
                user = jwt_auth.get_user(validated_token)
            except Exception as exc:
                logger.debug("Attendance WebSocket JWT authentication failed: %s", exc)

        groups: set[str] = {AttendanceRealtimeService.GLOBAL_GROUP}

        if user and getattr(user, "is_authenticated", False):
            groups.add(AttendanceRealtimeService.get_user_group(user.id))
            student = AttendanceSessionService.resolve_student(user)
            if student:
                groups.add(AttendanceRealtimeService.get_student_group(student.id))
                class_id = AttendanceSessionService.resolve_student_class_id(student, user)
                if class_id:
                    groups.add(AttendanceRealtimeService.get_class_group(class_id))

        return user, sorted(groups)

    def _extract_token_from_scope(self) -> str | None:
        query_string = (self.scope.get("query_string") or b"").decode("utf-8", errors="ignore")
        query_params = parse_qs(query_string)
        if "token" in query_params and query_params["token"]:
            return query_params["token"][0].strip()

        headers = dict(self.scope.get("headers") or [])
        auth_header = headers.get(b"authorization", b"").decode("utf-8", errors="ignore")
        if auth_header.lower().startswith("bearer "):
            return auth_header[7:].strip()

        return None

    async def connect(self) -> None:
        raw_token = self._extract_token_from_scope()
        user, initial_groups = await self._authenticate_and_resolve_groups(raw_token)
        self.user = user

        query_string = (self.scope.get("query_string") or b"").decode("utf-8", errors="ignore")
        query_params = parse_qs(query_string)

        extra_session_id = (query_params.get("sessionId") or [None])[0]
        if extra_session_id:
            initial_groups.append(AttendanceRealtimeService.get_session_group(extra_session_id))

        extra_class_id = (query_params.get("classId") or [None])[0]
        if extra_class_id:
            initial_groups.append(AttendanceRealtimeService.get_class_group(extra_class_id))

        await self.accept()

        if self.channel_layer:
            for group_name in set(initial_groups):
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.subscribed_groups.add(group_name)

        await self.send_json(
            {
                "type": "connected",
                "groups": sorted(self.subscribed_groups),
                "timestamp": timezone.now().isoformat(),
            }
        )

    async def disconnect(self, close_code: int) -> None:
        if self.channel_layer:
            for group_name in list(self.subscribed_groups):
                await self.channel_layer.group_discard(group_name, self.channel_name)
        self.subscribed_groups.clear()

    async def receive_json(self, content: dict[str, Any], **kwargs: Any) -> None:
        action = str(content.get("action") or content.get("type") or "").lower()

        if action == "ping":
            await self.send_json(
                {
                    "type": "pong",
                    "timestamp": timezone.now().isoformat(),
                }
            )
            return

        if action == "subscribe_session" and self.channel_layer:
            session_id = str(content.get("sessionId") or "").strip()
            if session_id:
                group_name = AttendanceRealtimeService.get_session_group(session_id)
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.subscribed_groups.add(group_name)
                await self.send_json(
                    {
                        "type": "subscribed",
                        "sessionId": session_id,
                        "group": group_name,
                    }
                )
            return

        if action == "unsubscribe_session" and self.channel_layer:
            session_id = str(content.get("sessionId") or "").strip()
            if session_id:
                group_name = AttendanceRealtimeService.get_session_group(session_id)
                await self.channel_layer.group_discard(group_name, self.channel_name)
                self.subscribed_groups.discard(group_name)
                await self.send_json(
                    {
                        "type": "unsubscribed",
                        "sessionId": session_id,
                    }
                )

    async def attendance_event(self, event: dict[str, Any]) -> None:
        payload = event.get("payload") or {}
        await self.send_json(
            {
                "type": "attendance_event",
                "data": payload,
            }
        )
