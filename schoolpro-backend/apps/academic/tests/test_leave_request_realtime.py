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
    Verifies that the Celery task delegates to LeaveRequestService.check_and_auto_approve_overdue_requests
    and LeaveRequestService.check_and_send_deadline_reminders.
    """
    with (
        patch(
            "apps.academic.services.leave_request_service.LeaveRequestService.check_and_auto_approve_overdue_requests",
            return_value=2,
        ) as mock_check,
        patch(
            "apps.academic.services.leave_request_service.LeaveRequestService.check_and_send_deadline_reminders",
            return_value=1,
        ) as mock_remind,
    ):
        result = auto_approve_overdue_leave_requests_task()
        assert result["status"] == "success"
        assert result["auto_approved_count"] == 2
        assert result["reminders_sent"] == 1
        mock_check.assert_called_once_with(qs=None)
        mock_remind.assert_called_once()


def test_dynamic_export_template_renders_custom_filename_html_css_word_and_pdf():
    """
    Verifies that LeaveRequestPdfService uses ExportTemplate ("sys"."export_templates")
    for custom filename patterns, CSS, HTML, Word, and PDF exports.
    """
    from apps.academic.services.leave_request_pdf_service import LeaveRequestPdfService
    from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType

    custom_tpl = ExportTemplate(
        code="CUSTOM_LEAVE_TPL_2026",
        name="Biểu mẫu nghỉ phép tùy chỉnh",
        template_type=TemplateType.LEAVE_REQUEST,
        file_format=FileFormat.HTML_PRINT,
        header_content="<header class='custom-hdr'>{{school_name}} - {{code}}</header>",
        content="<main class='custom-body'>Học sinh: {{student_name}} ({{student_code}}) - Lý do: {{reason}}</main>",
        footer_content="<footer>GVCN: {{homeroom_teacher_name}}</footer>",
        style_content=".custom-hdr { color: #1d4ed8; font-weight: bold; }",
        watermark_text="BẢN SAO {{code}}",
        page_size="A4",
        page_orientation="PORTRAIT",
        margins={"top": "15mm", "right": "15mm", "bottom": "15mm", "left": "20mm"},
        sample_data={
            "filename_pattern": "DonNghi_{{student_code}}_{{code}}",
            "school_name": "TRƯỜNG THPT CHUYÊN SCHOOLPRO",
            "document_title": "ĐƠN XIN NGHỈ HỌC TÙY CHỈNH",
        },
    )

    sample_item = {
        "id": "leave-001",
        "code": "261012999888",
        "studentName": "Đỗ Minh Quân",
        "studentCode": "HS202601",
        "className": "10A1",
        "leaveType": "sick",
        "status": "approved",
        "sessionShift": "all_day",
        "startDate": "2026-10-15",
        "endDate": "2026-10-15",
        "totalDays": 1,
        "reason": "Nghỉ khám sức khỏe định kỳ",
        "homeroomTeacherName": "Nguyễn Thị Mai",
        "guardianName": "Đỗ Văn Hùng",
        "guardianRelationship": "Bố",
        "guardianPhone": "0912345678",
        "affectedSubjects": ["Toán", "Vật lý"],
    }

    with patch.object(LeaveRequestPdfService, "resolve_export_template", return_value=custom_tpl):
        # 1. HTML export
        html_bytes, html_filename, html_mime = LeaveRequestPdfService.export_from_item(
            sample_item, output_format="HTML"
        )
        html_text = html_bytes.decode("utf-8")
        assert html_filename == "DonNghi_HS202601_261012999888.html"
        assert "text/html" in html_mime
        assert "TRƯỜNG THPT CHUYÊN SCHOOLPRO - 261012999888" in html_text
        assert ".custom-hdr { color: #1d4ed8; font-weight: bold; }" in html_text
        assert "BẢN SAO 261012999888" in html_text

        # 2. Word (.doc) export
        word_bytes, word_filename, word_mime = LeaveRequestPdfService.export_from_item(
            sample_item, output_format="WORD"
        )
        assert word_filename == "DonNghi_HS202601_261012999888.doc"
        assert word_mime == "application/msword"
        assert b"urn:schemas-microsoft-com:office:word" in word_bytes

        # 3. PDF export honoring custom filename_pattern & template metadata
        pdf_bytes, pdf_filename, pdf_mime = LeaveRequestPdfService.export_from_item(
            sample_item, output_format="PDF"
        )
        assert pdf_filename == "DonNghi_HS202601_261012999888.pdf"
        assert pdf_mime == "application/pdf"
        assert pdf_bytes.startswith(b"%PDF")
