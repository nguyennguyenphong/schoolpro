"""
Unit tests for Leave Request business rules:
- BR-01: 3-hour continuous processing deadline from submission (submitted_at + 3 hours).
- BR-02: Homeroom teacher review validation (teacher_note mandatory on REJECT).
- BR-03: System auto-approval attribution (approvalMethod="AUTO", reviewed_by=None) vs manual (approvalMethod="MANUAL").
"""

from datetime import date, datetime, timedelta

import pytest
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.academic.serializers.attendance_serializers import ReviewLeaveRequestInputSerializer
from apps.academic.services.leave_request_service import LeaveRequestService
from apps.academic.services.leave_request_timetable_service import LeaveRequestTimetableService


def test_br01_approval_deadline_is_3_hours_continuous_from_submission():
    """
    BR-01: approval_deadline must be submitted_at + 3 hours, regardless of lesson schedule.
    """
    submitted_at = timezone.make_aware(datetime(2026, 10, 19, 8, 0, 0))
    first_lesson, deadline = LeaveRequestTimetableService.calculate_first_lesson_and_deadline(
        affected_lessons=[],
        fallback_start_date=date(2026, 10, 20),
        submitted_at=submitted_at,
    )
    expected_deadline = submitted_at + timedelta(hours=3)
    assert deadline == expected_deadline
    assert deadline.hour == 11
    assert deadline.minute == 0


def test_br01_submitted_at_night_calculates_into_next_day():
    """
    BR-01: 21:00 submitted_at gives 00:00 next day (continuous 180 minutes).
    """
    submitted_at = timezone.make_aware(datetime(2026, 10, 19, 21, 0, 0))
    first_lesson, deadline = LeaveRequestTimetableService.calculate_first_lesson_and_deadline(
        affected_lessons=[],
        fallback_start_date=date(2026, 10, 20),
        submitted_at=submitted_at,
    )
    expected_deadline = timezone.make_aware(datetime(2026, 10, 20, 0, 0, 0))
    assert deadline == expected_deadline


def test_br02_review_serializer_requires_teacher_note_on_reject():
    """
    BR-02: When GVCN rejects a request, teacher_note is strictly mandatory.
    """
    # Rejection without note should fail
    serializer = ReviewLeaveRequestInputSerializer(data={"action": "REJECT", "teacher_note": ""})
    with pytest.raises(ValidationError) as exc_info:
        serializer.is_valid(raise_exception=True)
    assert "teacher_note" in exc_info.value.detail

    # Rejection with note should pass
    serializer_valid = ReviewLeaveRequestInputSerializer(
        data={"action": "REJECT", "teacher_note": "Lý do không chính đáng, thiếu minh chứng."}
    )
    assert serializer_valid.is_valid() is True

    # Approval without note should pass
    serializer_approve = ReviewLeaveRequestInputSerializer(
        data={"action": "APPROVE", "teacher_note": ""}
    )
    assert serializer_approve.is_valid() is True


def test_br03_format_leave_request_approval_method():
    """
    BR-03: format_leave_request_item correctly reflects AUTO vs MANUAL approval method.
    """
    from types import SimpleNamespace

    # Mock an auto-approved leave request
    auto_req = SimpleNamespace(
        id="leave-1",
        code="LR-AUTO-01",
        student_id="student-1",
        student=None,
        school_class_id="class-1",
        school_class=None,
        guardian=None,
        requested_by=None,
        reviewed_by=None,
        reviewed_at=timezone.now(),
        start_date=date(2026, 10, 20),
        end_date=date(2026, 10, 20),
        reason="Em bị sốt xuất huyết.",
        leave_type="SICK",
        status="APPROVED",
        is_auto_approved=True,
        supporting_document_url=None,
        approval_deadline=timezone.now(),
        teacher_note="Hệ thống tự động duyệt.",
        metadata={"approvalMethod": "AUTO"},
        created_at=timezone.now() - timedelta(hours=4),
        updated_at=timezone.now(),
    )

    formatted = LeaveRequestService.format_leave_request_item(auto_req, include_logs=False)
    assert formatted["approvalMethod"] == "AUTO"
    assert formatted["isAutoApproved"] is True
    assert "Hệ thống" in formatted["reviewedByName"]

    # Mock a manual approved leave request
    manual_req = SimpleNamespace(
        id="leave-2",
        code="LR-MANUAL-01",
        student_id="student-2",
        student=None,
        school_class_id="class-1",
        school_class=None,
        guardian=None,
        requested_by=None,
        reviewed_by=SimpleNamespace(full_name="Thầy Nguyễn Văn Chủ Nhiệm"),
        reviewed_at=timezone.now(),
        start_date=date(2026, 10, 20),
        end_date=date(2026, 10, 20),
        reason="Em bị đau dạ dày.",
        leave_type="SICK",
        status="APPROVED",
        is_auto_approved=False,
        supporting_document_url=None,
        approval_deadline=timezone.now() + timedelta(hours=2),
        teacher_note="Đồng ý cho nghỉ.",
        metadata={"approvalMethod": "MANUAL"},
        created_at=timezone.now() - timedelta(hours=1),
        updated_at=timezone.now(),
    )

    formatted_manual = LeaveRequestService.format_leave_request_item(manual_req, include_logs=False)
    assert formatted_manual["approvalMethod"] == "MANUAL"
    assert formatted_manual["isAutoApproved"] is False
    assert formatted_manual["reviewedByName"] == "Thầy Nguyễn Văn Chủ Nhiệm"


def test_academic_context_resolution_and_defaults(monkeypatch):
    """
    Verifies resolve_academic_context fallback mechanics when user has no active student.
    """
    from types import SimpleNamespace
    from unittest.mock import MagicMock

    from apps.master.models.academic_year import AcademicYear
    from apps.master.models.semester import Semester

    mock_year_qs = MagicMock()
    mock_year_qs.first.return_value = None
    mock_year_qs.order_by.return_value = mock_year_qs
    monkeypatch.setattr(AcademicYear.objects, "filter", MagicMock(return_value=mock_year_qs))
    monkeypatch.setattr(AcademicYear.objects, "order_by", MagicMock(return_value=mock_year_qs))

    mock_sem_qs = MagicMock()
    mock_sem_qs.first.return_value = None
    mock_sem_qs.order_by.return_value = mock_sem_qs
    monkeypatch.setattr(Semester.objects, "filter", MagicMock(return_value=mock_sem_qs))
    monkeypatch.setattr(Semester.objects, "order_by", MagicMock(return_value=mock_sem_qs))

    mock_user = SimpleNamespace(id="u-nonstudent", is_staff=False, is_superuser=False)
    student, school_class, academic_year, semester = LeaveRequestService.resolve_academic_context(
        user=mock_user,
        student_id=None,
        class_id=None,
        academic_year_id=None,
        semester_id=None,
    )
    assert student is None
    assert academic_year is None
    assert semester is None


def test_leave_request_print_template_and_context():
    """
    Verifies that the printed leave request:
    - Never mentions automation/auto-approval (status_label has no '(Tự động)').
    - Explicitly displays homeroom teacher's name as reviewer and in recipient.
    - Approval checkboxes show '☑ Đồng ý cho nghỉ' only when approved, and unchecked otherwise.
    - Header does not have class line under School name.
    - Main container uses <main class="page">.
    """
    from apps.academic.services.leave_request_pdf_service import LeaveRequestPdfService
    from apps.system.services.export_template_service import (
        DEFAULT_LEAVE_REQUEST_CONTENT,
        DEFAULT_LEAVE_REQUEST_FOOTER,
        DEFAULT_LEAVE_REQUEST_HEADER,
    )

    # 1. Header checks
    assert '<main class="page">' in DEFAULT_LEAVE_REQUEST_HEADER
    assert "Lớp:" not in DEFAULT_LEAVE_REQUEST_HEADER
    assert "</main>" in DEFAULT_LEAVE_REQUEST_FOOTER

    # 2. Content recipient and student block layout
    assert "{{homeroom_teacher_name}}" in DEFAULT_LEAVE_REQUEST_CONTENT
    assert (
        "Mã học sinh: <strong>{{student_code}}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lớp: <strong>{{class_name}}</strong>"
        in DEFAULT_LEAVE_REQUEST_CONTENT
    )

    # 3. Approved leave request context
    item_approved = {
        "status": "approved",
        "isAutoApproved": True,
        "homeroomTeacherName": "Cô Nguyễn Thị Mai",
        "teacherNote": "Hệ thống tự động phê duyệt do quá hạn 3 giờ",
        "studentName": "Đỗ Minh Quân",
        "studentCode": "HS2026001",
        "studentDob": "2010-03-21",
        "className": "10A1",
        "startDate": "2026-10-19",
        "endDate": "2026-10-19",
    }
    ctx_approved = LeaveRequestPdfService.build_template_context(item_approved)
    assert ctx_approved["status_label"] == "Đã phê duyệt"
    assert "Tự động" not in ctx_approved["status_label"]
    assert "Hệ thống tự động" not in ctx_approved["teacher_note_display"]
    assert "☑ Đồng ý cho nghỉ" in ctx_approved["approval_checkboxes"]
    assert ctx_approved["reviewer_name"] == "Cô Nguyễn Thị Mai"

    # 4. Pending leave request context
    item_pending = {
        "status": "pending",
        "isAutoApproved": False,
        "homeroomTeacherName": "Cô Nguyễn Thị Mai",
        "studentName": "Đỗ Minh Quân",
    }
    ctx_pending = LeaveRequestPdfService.build_template_context(item_pending)
    assert ctx_pending["status_label"] == "Chờ phê duyệt"
    assert "☐ Đồng ý cho nghỉ" in ctx_pending["approval_checkboxes"]
    assert "☑" not in ctx_pending["approval_checkboxes"]
