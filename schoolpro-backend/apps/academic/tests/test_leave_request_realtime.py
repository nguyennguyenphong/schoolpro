"""
Unit tests for Academic Leave Request Realtime broadcasting and Celery tasks.
"""

from types import SimpleNamespace
from unittest.mock import patch

from apps.academic.services.leave_request_realtime import (
    LeaveRequestRealtimeEvent,
    LeaveRequestRealtimeService,
)
from apps.academic.tasks.leave_request_tasks import auto_approve_overdue_leave_requests_task


def test_resolve_target_groups_deduplicates_and_includes_all_roles():
    """
    Verifies that resolve_target_groups builds deduplicated channel groups for
    global, detail, student, class, requester, student user, and homeroom teacher.
    """
    dummy_leave = SimpleNamespace(
        id="leave-uuid-123",
        student_id="student-uuid-456",
        school_class_id="class-uuid-789",
        requested_by_id="user-student-1",
        student=SimpleNamespace(user_id="user-student-1"),
        school_class=SimpleNamespace(
            homeroom_teacher=SimpleNamespace(user_id="user-homeroom-99"),
        ),
    )

    groups = LeaveRequestRealtimeService.resolve_target_groups(
        leave_request=dummy_leave,
        extra_user_ids=["user-subject-teacher-2"],
    )

    assert "leave_requests_global" in groups
    assert "leave_request_detail_leave-uuid-123" in groups
    assert "leave_requests_student_student-uuid-456" in groups
    assert "leave_requests_class_class-uuid-789" in groups
    assert "leave_requests_user_user-student-1" in groups
    assert "leave_requests_user_user-homeroom-99" in groups
    assert "leave_requests_user_user-subject-teacher-2" in groups
    assert len(groups) == len(set(groups))


def test_broadcast_event_dispatches_via_on_commit():
    """
    Verifies that broadcast_event schedules group dispatch with standardized payload.
    """
    dummy_leave = SimpleNamespace(
        id="leave-uuid-001",
        code="123456789012",
        status="APPROVED",
        is_auto_approved=True,
        student_id="student-uuid-1",
        school_class_id="class-uuid-1",
        requested_by_id="user-1",
        student=None,
        school_class=None,
    )

    with (
        patch("django.db.transaction.on_commit", side_effect=lambda fn: fn()) as mock_commit,
        patch.object(LeaveRequestRealtimeService, "_dispatch_to_groups") as mock_dispatch,
    ):
        LeaveRequestRealtimeService.broadcast_event(
            event_type=LeaveRequestRealtimeEvent.AUTO_APPROVED,
            leave_request=dummy_leave,
            message="Tự động phê duyệt",
            actor_name="Hệ thống",
        )

        assert mock_commit.called
        assert mock_dispatch.called
        _, kwargs = mock_dispatch.call_args
        payload = kwargs["payload"]
        assert payload["eventType"] == LeaveRequestRealtimeEvent.AUTO_APPROVED
        assert payload["leaveRequestId"] == "leave-uuid-001"
        assert payload["code"] == "123456789012"
        assert payload["status"] == "approved"
        assert payload["isAutoApproved"] is True


def test_auto_approve_overdue_leave_requests_task_invokes_service():
    """
    Verifies that the Celery task delegates to LeaveRequestService.check_and_auto_approve_overdue_requests.
    """
    with patch(
        "apps.academic.services.leave_request_service.LeaveRequestService.check_and_auto_approve_overdue_requests",
        return_value=2,
    ) as mock_check:
        result = auto_approve_overdue_leave_requests_task()
        assert result["status"] == "success"
        assert result["auto_approved_count"] == 2
        mock_check.assert_called_once_with(qs=None)
