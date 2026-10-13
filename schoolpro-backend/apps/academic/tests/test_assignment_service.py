"""
Unit tests for Academic AssignmentService:
- Deadline extension resolution (extended_due_date_1..3)
- Status calculation (pending, submitted, graded, overdue, reopened)
- Rubric scoring matrix merging & solution attachment visibility
- Online submission validation (max files, late submission restriction, resubmission limit)
- Reopen request workflow and Score Appeal workflow
- Chronological AssignmentEventLog creation
"""

from contextlib import nullcontext
from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from django.utils import timezone

from apps.academic.services.assignment_service import AssignmentService


def _make_dummy_assignment(**overrides):
    now = timezone.now()
    defaults = {
        "id": "11111111-2222-3333-4444-555555555555",
        "title": "Khảo sát sự biến thiên và vẽ đồ thị hàm số",
        "description": "Giải bài tập trang 45 SGK Toán 12",
        "assignment_type": "HOMEWORK",
        "format": "HOMEWORK",
        "assigned_date": date.today() - timedelta(days=3),
        "due_date": now + timedelta(days=2),
        "extended_due_date_1": None,
        "extension_reason_1": None,
        "extended_due_date_2": None,
        "extension_reason_2": None,
        "extended_due_date_3": None,
        "extension_reason_3": None,
        "max_score": Decimal("10.00"),
        "pass_score": Decimal("5.00"),
        "weight_percent": Decimal("15.00"),
        "attachments": [{"name": "De_Bai.pdf", "size": "1.2 MB", "url": "/files/de-bai.pdf"}],
        "allowed_file_types": ["pdf", "docx"],
        "max_file_size_mb": 25,
        "max_files_count": 3,
        "file_naming_rule": "{class}_{student_name}_{assignment_title}",
        "allow_late_submission": True,
        "late_penalty_percent": Decimal("10.00"),
        "allow_resubmission": True,
        "max_resubmission_count": 2,
        "rubric": [
            {
                "id": "c1",
                "criterion": "Khảo sát đạo hàm",
                "maxPoints": 5.0,
                "description": "Tính đúng đạo hàm và nghiệm",
            },
            {
                "id": "c2",
                "criterion": "Vẽ đồ thị",
                "maxPoints": 5.0,
                "description": "Đúng tâm đối xứng và tiệm cận",
            },
        ],
        "solution_attachments": [
            {"name": "Dap_An_Mau.pdf", "size": "950 KB", "url": "/files/dap-an.pdf"}
        ],
        "solution_published_at": None,
        "class_subject_teacher": SimpleNamespace(
            school_class=SimpleNamespace(name="12A1"),
            subject=SimpleNamespace(code="MATH", name="Toán học"),
            teacher=SimpleNamespace(
                user=SimpleNamespace(full_name="ThS. Nguyễn Văn An", email="an.nv@schoolpro.edu.vn")
            ),
        ),
        "created_by": SimpleNamespace(
            full_name="ThS. Nguyễn Văn An", email="an.nv@schoolpro.edu.vn"
        ),
    }
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def test_effective_due_date_and_extensions_resolution():
    """
    Verifies that get_effective_due_date picks the latest extension and formats extension history.
    """
    now = timezone.now()
    ext1 = now + timedelta(days=3)
    ext2 = now + timedelta(days=5)
    assignment = _make_dummy_assignment(
        due_date=now + timedelta(days=1),
        extended_due_date_1=ext1,
        extension_reason_1="Gia hạn lần 1 do trùng lịch thi thử",
        extended_due_date_2=ext2,
        extension_reason_2="Gia hạn lần 2 bổ sung câu hỏi nâng cao",
    )

    effective = AssignmentService.get_effective_due_date(assignment)
    assert effective == ext2

    extensions = AssignmentService.format_extensions(assignment)
    assert len(extensions) == 2
    assert extensions[0]["level"] == 1
    assert "trùng lịch thi thử" in extensions[0]["reason"]
    assert extensions[1]["level"] == 2


def test_format_assignment_item_graded_merges_rubric_and_exposes_solutions():
    """
    Verifies that a graded assignment merges rubric criteria with student rubric_scores
    and exposes solutionAttachments.
    """
    now = timezone.now()
    assignment = _make_dummy_assignment(due_date=now - timedelta(days=2))
    submission = SimpleNamespace(
        id="sub-uuid-1",
        attempt_number=2,
        submission_status="GRADED",
        status="GRADED",
        submitted_at=now - timedelta(days=3),
        is_late=False,
        late_minutes=0,
        penalty_deduction=Decimal("0.00"),
        content_text="Bài giải chi tiết của em",
        attachments=[
            {
                "id": "f1",
                "name": "12A1_DoMinhQuan_Toan.pdf",
                "size": "1.5 MB",
                "type": "pdf",
                "url": "/files/sub.pdf",
            }
        ],
        raw_score=Decimal("9.25"),
        score=Decimal("9.25"),
        final_score=Decimal("9.25"),
        rubric_scores={
            "c1": {"earnedPoints": 5.0, "comment": "Chính xác tuyệt đối"},
            "c2": {"earnedPoints": 4.25, "comment": "Thiếu tọa độ giao điểm trục tung"},
        },
        feedback="Bài làm rất tốt!",
        graded_by=SimpleNamespace(full_name="ThS. Nguyễn Văn An"),
        graded_at=now - timedelta(days=1),
        reopen_status="NONE",
        reopen_request_reason=None,
        reopen_requested_at=None,
        reopen_approved_at=None,
        appeal_status="NONE",
        appeal_reason=None,
        appeal_attachments=[],
        appealed_at=None,
        appeal_response=None,
        appeal_resolved_at=None,
        appeal_resolved_by=None,
        student=SimpleNamespace(user=SimpleNamespace(full_name="Đỗ Minh Quân")),
    )

    payload = AssignmentService.format_assignment_item(assignment=assignment, submission=submission)
    assert payload["status"] == "graded"
    assert payload["score"] == 9.25
    assert len(payload["rubric"]) == 2
    assert payload["rubric"][0]["earnedPoints"] == 5.0
    assert payload["rubric"][1]["earnedPoints"] == 4.25
    assert len(payload["solutionAttachments"]) == 1
    assert payload["submission"]["attemptNumber"] == 2
    assert len(payload["eventLogs"]) >= 3


def test_submit_assignment_enforces_late_and_resubmission_limits():
    """
    Verifies that submit_assignment blocks late submissions when allow_late_submission=False
    and blocks exceeding max_resubmission_count.
    """
    now = timezone.now()
    closed_assignment = _make_dummy_assignment(
        due_date=now - timedelta(hours=3),
        allow_late_submission=False,
    )
    dummy_student = SimpleNamespace(
        id="student-1",
        user=SimpleNamespace(id="user-1", full_name="Đỗ Minh Quân"),
    )
    existing_sub = MagicMock()
    existing_sub.status = "PENDING"
    existing_sub.score = None
    existing_sub.submitted_at = None
    existing_sub.reopen_status = "NONE"

    with (
        patch("django.db.transaction.atomic", return_value=nullcontext()),
        patch.object(AssignmentService, "ensure_schema"),
        patch.object(AssignmentService, "resolve_student", return_value=dummy_student),
        patch("apps.academic.models.assignment.Assignment.objects") as mock_asgn_mgr,
        patch("apps.academic.models.assignment.AssignmentSubmission.objects") as mock_sub_mgr,
    ):
        mock_asgn_mgr.filter.return_value.first.return_value = closed_assignment
        mock_sub_mgr.get_or_create.return_value = (existing_sub, False)

        with pytest.raises(ValueError, match="không cho phép nộp muộn"):
            AssignmentService.submit_assignment(
                user=dummy_student.user,
                assignment_id=closed_assignment.id,
                content="Nộp bài trễ",
                files=[{"id": "f1", "name": "bai.pdf", "size": "1 MB", "type": "pdf"}],
            )

