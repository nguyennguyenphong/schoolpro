"""
Unit tests for Academic Attendance Sessions:
- 6-digit PIN code generation and validation
- QR code scan & image upload token extraction and validation
- Haversine GPS distance calculation and anti-cheat radius enforcement
- Strict session expiration enforcement
- Realtime WebSocket event broadcasting via transaction.on_commit
"""

from contextlib import nullcontext
from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from django.utils import timezone

from apps.academic.services.attendance_realtime import (
    AttendanceRealtimeEvent,
    AttendanceRealtimeService,
)
from apps.academic.services.attendance_session_service import AttendanceSessionService


def test_generate_six_digit_pin_format():
    """
    Verifies that generated PIN codes are strictly 6 numeric digits.
    """
    for _ in range(25):
        pin = AttendanceSessionService.generate_six_digit_pin()
        assert len(pin) == 6
        assert pin.isdigit()


def test_haversine_distance_calculation_accuracy():
    """
    Verifies Haversine distance calculation in meters between teacher and student coordinates.
    """
    # Identical coordinates -> 0.0m
    dist_zero = AttendanceSessionService.calculate_haversine_distance_meters(
        10.779785, 106.693182, 10.779785, 106.693182
    )
    assert dist_zero == 0.0

    # ~15 meters away (inside 50m classroom radius)
    dist_near = AttendanceSessionService.calculate_haversine_distance_meters(
        10.779785, 106.693182, 10.779890, 106.693250
    )
    assert 10.0 <= dist_near <= 20.0

    # ~250 meters away (outside 50m classroom radius)
    dist_far = AttendanceSessionService.calculate_haversine_distance_meters(
        10.779785, 106.693182, 10.782000, 106.693182
    )
    assert dist_far > 200.0


def test_extract_qr_token_or_pin_supports_raw_and_json_payloads():
    """
    Verifies QR code parser handles both raw token strings and JSON QR payloads.
    """
    tok, pin = AttendanceSessionService._extract_qr_token_or_pin(
        "SP_ATT_MATH11_20261012_849201_ABCD"
    )
    assert tok == "SP_ATT_MATH11_20261012_849201_ABCD"
    assert pin == ""

    tok_json, pin_json = AttendanceSessionService._extract_qr_token_or_pin(
        '{"qrToken": "SP_ATT_PHY11_20261012_652194", "pinCode": "652194"}'
    )
    assert tok_json == "SP_ATT_PHY11_20261012_652194"
    assert pin_json == "652194"


def test_student_checkin_rejects_expired_session():
    """
    Verifies that once expires_at has passed, check-in is rejected and session is marked EXPIRED.
    """
    now = timezone.now()
    expired_session = MagicMock()
    expired_session.id = "sess-uuid-1"
    expired_session.timetable_id = "tt-uuid-1"
    expired_session.school_class_id = "class-uuid-1"
    expired_session.session_date = date.today()
    expired_session.period = None
    expired_session.subject = SimpleNamespace(name="Toán học 11", code="MATH11")
    expired_session.teacher = SimpleNamespace(user=SimpleNamespace(full_name="ThS. Hoàng Văn Nam"))
    expired_session.room = SimpleNamespace(name="Phòng A203")
    expired_session.school_class = SimpleNamespace(name="10A1")
    expired_session.pin_code = "849201"
    expired_session.qr_token = "SP_ATT_MATH11_849201"
    expired_session.teacher_latitude = 10.779785
    expired_session.teacher_longitude = 106.693182
    expired_session.allowed_radius_meters = 50
    expired_session.duration_seconds = 300
    expired_session.opened_at = now - timedelta(minutes=10)
    expired_session.expires_at = now - timedelta(seconds=5)
    expired_session.status = "OPEN"
    expired_session.note = ""

    dummy_student = SimpleNamespace(
        id="student-uuid-1",
        user=SimpleNamespace(id="user-1", full_name="Đỗ Minh Quân"),
    )

    with (
        patch("django.db.transaction.atomic", return_value=nullcontext()),
        patch.object(AttendanceSessionService, "resolve_student", return_value=dummy_student),
        patch("apps.academic.models.attendance.AttendanceSession.objects") as mock_sess_mgr,
        patch("apps.academic.models.attendance.Attendance.objects") as mock_att_mgr,
        patch.object(AttendanceRealtimeService, "broadcast_event") as mock_broadcast,
    ):
        mock_sess_mgr.select_related.return_value.filter.return_value.first.return_value = (
            expired_session
        )
        mock_att_mgr.filter.return_value.first.return_value = None

        with pytest.raises(ValueError, match="hết thời gian hiệu lực"):
            AttendanceSessionService.student_check_in(
                user=dummy_student.user,
                data={
                    "recordId": "sess-uuid-1",
                    "method": "code",
                    "code": "849201",
                    "latitude": 10.779785,
                    "longitude": 106.693182,
                },
            )

        assert expired_session.status == "EXPIRED"
        assert expired_session.save.called
        assert mock_broadcast.called


def test_student_checkin_rejects_out_of_radius_coordinates():
    """
    Verifies 100% anti-cheat geofencing: students outside teacher's allowed_radius_meters cannot check in.
    """
    now = timezone.now()
    active_session = MagicMock()
    active_session.id = "sess-uuid-2"
    active_session.timetable_id = "tt-uuid-2"
    active_session.school_class_id = "class-uuid-1"
    active_session.session_date = date.today()
    active_session.period = None
    active_session.subject = SimpleNamespace(name="Toán học 11", code="MATH11")
    active_session.pin_code = "849201"
    active_session.qr_token = "SP_ATT_MATH11_849201"
    active_session.teacher_latitude = 10.779785
    active_session.teacher_longitude = 106.693182
    active_session.allowed_radius_meters = 50
    active_session.opened_at = now - timedelta(minutes=1)
    active_session.expires_at = now + timedelta(minutes=5)
    active_session.status = "OPEN"

    dummy_student = SimpleNamespace(
        id="student-uuid-1",
        user=SimpleNamespace(id="user-1", full_name="Đỗ Minh Quân"),
    )

    with (
        patch("django.db.transaction.atomic", return_value=nullcontext()),
        patch.object(AttendanceSessionService, "resolve_student", return_value=dummy_student),
        patch("apps.academic.models.attendance.AttendanceSession.objects") as mock_sess_mgr,
        patch("apps.academic.models.attendance.Attendance.objects") as mock_att_mgr,
    ):
        mock_sess_mgr.select_related.return_value.filter.return_value.first.return_value = (
            active_session
        )
        mock_att_mgr.filter.return_value.first.return_value = None

        # Student is ~350 meters away while allowed radius is 50m
        with pytest.raises(ValueError, match="vượt quá bán kính quét tối đa"):
            AttendanceSessionService.student_check_in(
                user=dummy_student.user,
                data={
                    "recordId": "sess-uuid-2",
                    "method": "qr_scan",
                    "qrData": "SP_ATT_MATH11_849201",
                    "latitude": 10.783000,
                    "longitude": 106.693182,
                },
            )


def test_attendance_realtime_broadcast_dispatches_via_on_commit():
    """
    Verifies AttendanceRealtimeService resolves groups and dispatches via transaction.on_commit.
    """
    dummy_session = SimpleNamespace(
        id="sess-uuid-99",
        school_class_id="class-uuid-10",
        pin_code="654321",
        status="OPEN",
        created_by_id="teacher-user-1",
        teacher=SimpleNamespace(user_id="teacher-user-1"),
    )

    with (
        patch("django.db.transaction.on_commit", side_effect=lambda fn: fn()) as mock_commit,
        patch.object(AttendanceRealtimeService, "_dispatch_to_groups") as mock_dispatch,
    ):
        AttendanceRealtimeService.broadcast_event(
            event_type=AttendanceRealtimeEvent.SESSION_OPENED,
            session=dummy_session,
            student_id="student-uuid-1",
            message="Giáo viên đã mở cổng điểm danh",
            actor_name="ThS. Hoàng Văn Nam",
        )

        assert mock_commit.called
        assert mock_dispatch.called
        _, kwargs = mock_dispatch.call_args
        groups = kwargs["groups"]
        payload = kwargs["payload"]

        assert "attendance_global" in groups
        assert "attendance_session_sess-uuid-99" in groups
        assert "attendance_class_class-uuid-10" in groups
        assert "attendance_student_student-uuid-1" in groups
        assert "attendance_user_teacher-user-1" in groups
        assert payload["eventType"] == AttendanceRealtimeEvent.SESSION_OPENED
        assert payload["pinCode"] == "654321"
