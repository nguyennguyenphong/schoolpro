"""
Unit tests for Academic GradebookService:
- List subject grades and search/classification filtering
- Summary metrics calculation (GPA, rank, conduct, honor title)
- Granular subject grade details
- National electronic report card / e-transcript generation
- PDF export verification hash
"""

from apps.academic.services.gradebook_service import GradebookService


class TestGradebookService:
    def test_list_subject_grades_returns_full_curriculum(self):
        grades = GradebookService.list_subject_grades(user=None)
        assert len(grades) == 13
        math = next((g for g in grades if g["code"] == "MATH11"), None)
        assert math is not None
        assert math["name"] == "Toán học 11"
        assert math["averageScore"] == 8.8
        assert len(math["regularScores"]) == 4
        assert math["midtermScore"] is not None
        assert math["finalScore"] is not None

    def test_list_subject_grades_filters_by_search_query(self):
        # Search by subject code
        math_grades = GradebookService.list_subject_grades(user=None, search_query="MATH11")
        assert len(math_grades) == 1
        assert math_grades[0]["code"] == "MATH11"

        # Search by teacher name
        teacher_grades = GradebookService.list_subject_grades(
            user=None, search_query="Hoàng Văn Nam"
        )
        assert len(teacher_grades) == 1
        assert teacher_grades[0]["code"] == "MATH11"

    def test_list_subject_grades_filters_by_classification(self):
        feedback_grades = GradebookService.list_subject_grades(
            user=None, classification="feedback_only"
        )
        # Should return PE and GDQP
        assert len(feedback_grades) == 2
        for g in feedback_grades:
            assert g["evaluationType"] == "feedback"

        excellent_grades = GradebookService.list_subject_grades(
            user=None, classification="excellent"
        )
        assert len(excellent_grades) >= 10
        for g in excellent_grades:
            assert g["evaluationType"] == "score"
            assert g["averageScore"] >= 8.0

    def test_list_subject_grades_sorting(self):
        desc_grades = GradebookService.list_subject_grades(user=None, sort_by="gpa_desc")
        scored_desc = [g["averageScore"] for g in desc_grades if g.get("averageScore")]
        assert scored_desc == sorted(scored_desc, reverse=True)

        asc_grades = GradebookService.list_subject_grades(user=None, sort_by="gpa_asc")
        scored_asc = [g["averageScore"] for g in asc_grades if g.get("averageScore")]
        assert scored_asc == sorted(scored_asc)

    def test_get_grade_summary(self):
        summary = GradebookService.get_grade_summary(user=None)
        assert summary["gpa"] == 8.65
        assert summary["academicRank"] == "Học sinh Giỏi"
        assert summary["conductRank"] == "Tốt"
        assert summary["classPosition"] == 3
        assert summary["totalSubjectsCount"] == 13

    def test_get_subject_grade_detail(self):
        detail = GradebookService.get_subject_grade_detail(user=None, subject_id="grade-it")
        assert detail is not None
        assert detail["code"] == "IT11"
        assert detail["averageScore"] == 9.8
        assert detail["gradeLevel"] == "excellent"

        not_found = GradebookService.get_subject_grade_detail(user=None, subject_id="non-existent")
        assert not_found is None

    def test_get_transcript(self):
        transcript = GradebookService.get_transcript(user=None)
        assert transcript["studentCode"] == "SV202688"
        assert transcript["className"] == "11A1"
        assert transcript["gpa"] == 8.65
        assert len(transcript["subjects"]) == 13
        assert "digitalSignature" in transcript
        assert "SHA256:" in transcript["digitalSignature"]

    def test_export_transcript_pdf(self):
        pdf_info = GradebookService.export_transcript_pdf(user=None)
        assert pdf_info["success"] is True
        assert "fileName" in pdf_info
        assert "downloadUrl" in pdf_info
        assert "digitalSignature" in pdf_info

    def test_list_subject_grades_filters_by_semester(self):
        # Semester 1 (HK1) returns subjects
        hk1_grades = GradebookService.list_subject_grades(user=None, semester="HK1")
        assert len(hk1_grades) == 13

        # Semester 2 (HK2) where no exams occurred returns empty list for empty state
        hk2_grades = GradebookService.list_subject_grades(user=None, semester="HK2")
        assert len(hk2_grades) == 0

    def test_list_subject_grades_filters_by_academic_year(self):
        # Matching year returns subjects
        ay_grades = GradebookService.list_subject_grades(user=None, academic_year="2026-2027")
        assert len(ay_grades) == 13

        # Unknown year returns empty list for empty state
        unknown_grades = GradebookService.list_subject_grades(user=None, academic_year="2010-2011")
        assert len(unknown_grades) == 0
