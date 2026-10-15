"""
Unit tests for Academic ExamService:
- List exams and summary calculation
- Dynamic question structure resolution (radio, checkbox, input, rating, boolean)
- Required field validation (Google Form style)
- Automated scoring and grading calculation
- Submission persistence and review
"""

import pytest

from apps.academic.services.exam_service import ExamService


class TestExamService:
    def test_list_exams_returns_seeded_data(self):
        exams = ExamService.list_exams(user=None)
        assert len(exams) >= 3
        first_exam = exams[0]
        assert "id" in first_exam
        assert "questions" in first_exam
        assert len(first_exam["questions"]) > 0

    def test_get_summary_returns_metrics(self):
        summary = ExamService.get_summary(user=None)
        assert "total" in summary
        assert "pendingCount" in summary
        assert "completedCount" in summary
        assert "expiredCount" in summary
        assert summary["total"] >= 3

    def test_get_exam_detail_contains_dynamic_question_fields(self):
        detail = ExamService.get_exam_detail("exam-001", user=None)
        assert detail is not None
        assert detail["title"] == "Đề thi Trắc nghiệm Giữa kỳ: Cấu trúc dữ liệu & Giải thuật"

        questions = detail["questions"]
        types = {q["type"] for q in questions}
        # Verify variety of question types
        assert "radio" in types
        assert "checkbox" in types
        assert "input" in types
        assert "rating" in types

        # Check points and required flags
        for q in questions:
            assert "points" in q
            assert q["points"] > 0
            assert "required" in q

    def test_submit_exam_validates_required_questions(self):
        # Empty answers should raise ValueError because questions are required
        with pytest.raises(ValueError, match="Vui lòng hoàn thành câu hỏi bắt buộc"):
            ExamService.submit_exam("exam-001", user=None, answers={})

    def test_submit_exam_scores_correctly(self):
        # Submit correct answers for exam-001
        answers = {
            "q-1": "Stack (Ngăn xếp)",
            "q-2": "O(log n)",
            "q-3": [
                "Merge Sort (Sắp xếp trộn)",
                "Quick Sort (Sắp xếp nhanh)",
                "Heap Sort (Sắp xếp vun đống)",
            ],
            "q-4": ["Đồ thị (Graph)", "Cây nhị phân (Binary Tree)"],
            "q-5": "8",
            "q-6": "Queue",
            "q-7": "Va chạm băm (Hash Collision)",
            "q-8": 5,
        }

        result = ExamService.submit_exam("exam-001", user=None, answers=answers)
        assert result["score"] == 10.0
        assert result["isPassed"] is True
        assert len(result["breakdown"]) == 8

        # Verify submission can be re-fetched
        sub = ExamService.get_submission("exam-001", user=None)
        assert sub is not None
        assert sub["score"] == 10.0

    def test_submit_exam_allow_incomplete_bypasses_required_validation(self):
        # Empty answers with allow_incomplete=True does not raise ValueError
        result = ExamService.submit_exam("exam-001", user=None, answers={}, allow_incomplete=True)
        assert result["score"] == 0.0
        assert result["isPassed"] is False
        assert len(result["breakdown"]) == 8

    def test_score_release_modes(self):
        # Hidden score mode
        exam_hidden = {"scoreReleaseMode": "hidden"}
        assert ExamService.is_score_released(exam_hidden) is False

        # Scheduled score mode in future
        exam_future = {"scoreReleaseMode": "scheduled", "scoreReleaseDate": "2099-01-01 08:00"}
        assert ExamService.is_score_released(exam_future) is False

        # Scheduled score mode in past
        exam_past = {"scoreReleaseMode": "scheduled", "scoreReleaseDate": "2020-01-01 08:00"}
        assert ExamService.is_score_released(exam_past) is True

        # Immediate score mode
        exam_imm = {"scoreReleaseMode": "immediate"}
        assert ExamService.is_score_released(exam_imm) is True
