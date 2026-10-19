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

    def test_list_exams_filter_by_format(self):
        mc_exams = ExamService.list_exams(user=None, format_filter="multiple_choice")
        assert len(mc_exams) >= 1
        assert all(e["format"] == "multiple_choice" for e in mc_exams)

        essay_exams = ExamService.list_exams(user=None, format_filter="essay")
        assert len(essay_exams) >= 1
        assert all(e["format"] == "essay" for e in essay_exams)

        mixed_exams = ExamService.list_exams(user=None, format_filter="mixed")
        assert len(mixed_exams) >= 1
        assert all(e["format"] == "mixed" for e in mixed_exams)

    def test_list_exams_filter_by_subject(self):
        cs_exams = ExamService.list_exams(user=None, subject="CS201")
        assert len(cs_exams) >= 1
        assert all(
            "CS201" in (e.get("courseCode", "") + e.get("subjectCode", "")) for e in cs_exams
        )

        math_exams = ExamService.list_exams(user=None, subject="MATH101")
        assert len(math_exams) >= 1
        assert all(
            "MATH101" in (e.get("courseCode", "") + e.get("subjectCode", "")) for e in math_exams
        )

    def test_list_exams_sort_options(self):
        # Sort by upcoming
        upcoming_exams = ExamService.list_exams(user=None, sort_by="upcoming")
        assert len(upcoming_exams) >= 3

        # Sort by score
        score_exams = ExamService.list_exams(user=None, sort_by="score")
        assert len(score_exams) >= 3
        # First one should have the highest score if any has score
        scored_items = [e for e in score_exams if e.get("score") is not None]
        if len(scored_items) > 1:
            assert scored_items[0]["score"] >= scored_items[1]["score"]

    def test_list_exams_academic_context_metadata(self):
        exams = ExamService.list_exams(user=None)
        assert len(exams) >= 3
        for e in exams:
            assert "semester" in e
            assert "academicYear" in e
            assert "format" in e
            assert "subjectCode" in e
            assert "subjectName" in e

    def test_viewset_list_returns_paginated_response(self):
        from unittest.mock import MagicMock

        from rest_framework.test import APIRequestFactory, force_authenticate

        from apps.academic.views.exam_views import StudentExamViewSet

        factory = APIRequestFactory()
        request = factory.get("/api/v1/academic/exams/?pageSize=20&page=1")
        user = MagicMock()
        user.is_authenticated = True
        user.is_staff = True
        force_authenticate(request, user=user)

        view = StudentExamViewSet.as_view({"get": "list"})
        response = view(request)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert "data" in response.data
        assert "items" in response.data["data"]
        assert "total" in response.data["data"]
        assert "page" in response.data["data"]
        assert "pageSize" in response.data["data"]
        assert response.data["data"]["pageSize"] == 20

    def test_viewset_list_allowed_page_size_enforcement(self):
        from unittest.mock import MagicMock

        from rest_framework.test import APIRequestFactory, force_authenticate

        from apps.academic.views.exam_views import StudentExamViewSet

        factory = APIRequestFactory()
        # Non-allowed page size (e.g. 7 or 9) must default to 10
        request = factory.get("/api/v1/academic/exams/?pageSize=9&page=1")
        user = MagicMock()
        user.is_authenticated = True
        user.is_staff = True
        force_authenticate(request, user=user)

        view = StudentExamViewSet.as_view({"get": "list"})
        response = view(request)
        assert response.status_code == 200
        assert response.data["data"]["pageSize"] == 10

    def test_viewset_list_format_filter_does_not_trigger_content_negotiation_404(self):
        from unittest.mock import MagicMock

        from rest_framework.test import APIClient

        client = APIClient()
        user = MagicMock()
        user.is_authenticated = True
        user.is_staff = True
        client.force_authenticate(user=user)

        # DRF default content negotiation would treat format=multiple_choice as renderer suffix and raise Http404
        # ExamContentNegotiation ensures this returns 200 OK
        response = client.get(
            "/api/v1/academic/exams/?format=multiple_choice&sortBy=upcoming&page=1&pageSize=10"
        )
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["pageSize"] == 10

    def test_viewset_list_out_of_bounds_page_fallback(self):
        from unittest.mock import MagicMock

        from rest_framework.test import APIClient

        client = APIClient()
        user = MagicMock()
        user.is_authenticated = True
        user.is_staff = True
        client.force_authenticate(user=user)

        response = client.get("/api/v1/academic/exams/?page=999&pageSize=10")
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["page"] == 1
