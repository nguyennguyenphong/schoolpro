"""
Management command to seed comprehensive academic Gradebook data (ReportCards, StudentScores, StudentTermSummaries)
complying with MOET Circular 22 (Thông tư 22/2021/TT-BGDĐT).
Table: "academic"."report_cards", "academic"."student_scores", "academic"."student_term_summaries"

Usage:
    python manage.py seed_gradebook
"""

import logging
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.grading import ReportCard, ScoreType, StudentScore, StudentTermSummary
from apps.core.models.organization import ClassSubjectTeacher
from apps.core.models.profile import Student
from apps.master.models.academic_year import AcademicYear
from apps.master.models.semester import Semester

logger = logging.getLogger(__name__)


# Standard score profiles for 10A1 subjects conforming to MOET Circular 22
_SUBJECT_SCORE_TEMPLATES = {
    "Toán": {
        "evaluationType": "score",
        "regularScores": [
            {"name": "Kiểm tra miệng (Đại số)", "score": 9.0, "date": "2026-09-18", "weight": 1},
            {
                "name": "15 phút số 1 (Mệnh đề & Tập hợp)",
                "score": 8.5,
                "date": "2026-10-08",
                "weight": 1,
            },
            {
                "name": "15 phút số 2 (Bất phương trình)",
                "score": 9.0,
                "date": "2026-11-04",
                "weight": 1,
            },
            {"name": "Thực hành Hệ thức lượng", "score": 8.5, "date": "2026-11-25", "weight": 1},
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.5,
            "date": "2026-11-12",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 9.0,
            "date": "2026-12-22",
            "weight": 3,
        },
        "averageScore": 8.8,
        "comment": "Tư duy giải toán chặt chẽ, tiếp thu nhanh các dạng bài hình học không gian nâng cao. Cần duy trì phong độ.",
    },
    "Ngữ văn": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Kiểm tra miệng (Thần thoại)",
                "score": 8.0,
                "date": "2026-09-24",
                "weight": 1,
            },
            {"name": "15 phút (Nghị luận xã hội)", "score": 8.5, "date": "2026-10-14", "weight": 1},
            {
                "name": "Viết bài số 1 (Văn học dân gian)",
                "score": 8.0,
                "date": "2026-11-18",
                "weight": 1,
            },
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.5,
            "date": "2026-11-10",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 8.5,
            "date": "2026-12-24",
            "weight": 3,
        },
        "averageScore": 8.4,
        "comment": "Cảm thụ văn học sâu sắc, bài viết có cấu trúc mạch lạc, dẫn chứng phong phú và sáng tạo.",
    },
    "Ngoại ngữ 1": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Speaking Assessment (Unit 1)",
                "score": 9.0,
                "date": "2026-09-29",
                "weight": 1,
            },
            {
                "name": "15-min Vocabulary & Grammar",
                "score": 8.5,
                "date": "2026-10-15",
                "weight": 1,
            },
            {"name": "Writing Task (Ecosystem)", "score": 9.0, "date": "2026-11-19", "weight": 1},
        ],
        "midtermScore": {
            "name": "Mid-term Examination",
            "score": 8.5,
            "date": "2026-11-13",
            "weight": 2,
        },
        "finalScore": {
            "name": "End-of-term Examination",
            "score": 9.0,
            "date": "2026-12-23",
            "weight": 3,
        },
        "averageScore": 8.8,
        "comment": "Khả năng giao tiếp tiếng Anh tự nhiên, từ vựng phong phú, phát âm chuẩn và làm bài thi rất tốt.",
    },
    "Vật lí": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Kiểm tra miệng (Chuyển động thẳng)",
                "score": 8.5,
                "date": "2026-09-22",
                "weight": 1,
            },
            {
                "name": "15 phút (Động học chất điểm)",
                "score": 8.5,
                "date": "2026-10-16",
                "weight": 1,
            },
            {
                "name": "Báo cáo thực hành đo sai số",
                "score": 8.5,
                "date": "2026-11-18",
                "weight": 1,
            },
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.5,
            "date": "2026-11-14",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 8.5,
            "date": "2026-12-24",
            "weight": 3,
        },
        "averageScore": 8.5,
        "comment": "Nắm vững lý thuyết hiện tượng cơ học và nhiệt học, kỹ năng thao tác thí nghiệm thực hành chính xác.",
    },
    "Hóa học": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Miệng (Nguyên tử & Bảng tuần hoàn)",
                "score": 8.0,
                "date": "2026-09-25",
                "weight": 1,
            },
            {"name": "15 phút (Liên kết hóa học)", "score": 8.5, "date": "2026-10-20", "weight": 1},
            {"name": "Báo cáo thực hành chuẩn độ", "score": 8.0, "date": "2026-11-20", "weight": 1},
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.0,
            "date": "2026-11-10",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 8.5,
            "date": "2026-12-22",
            "weight": 3,
        },
        "averageScore": 8.2,
        "comment": "Nắm vững cấu tạo nguyên tử và bảng tuần hoàn, kỹ năng tính toán bài toán hóa học chính xác.",
    },
    "Sinh học": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Kiểm tra miệng (Tế bào học)",
                "score": 8.5,
                "date": "2026-09-26",
                "weight": 1,
            },
            {
                "name": "15 phút (Thành phần hóa học)",
                "score": 9.0,
                "date": "2026-10-18",
                "weight": 1,
            },
            {"name": "Thực hành quan sát hiển vi", "score": 8.5, "date": "2026-11-17", "weight": 1},
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.5,
            "date": "2026-11-11",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 8.5,
            "date": "2026-12-23",
            "weight": 3,
        },
        "averageScore": 8.6,
        "comment": "Hiểu sâu về cấu trúc tế bào và cơ chế trao đổi chất. Tích cực phát biểu xây dựng bài.",
    },
    "Lịch sử": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Kiểm tra miệng (Hiện thực lịch sử)",
                "score": 8.5,
                "date": "2026-09-23",
                "weight": 1,
            },
            {
                "name": "15 phút (Văn minh phương Đông)",
                "score": 8.5,
                "date": "2026-10-19",
                "weight": 1,
            },
            {
                "name": "Dự án Di sản văn hóa dân tộc",
                "score": 9.0,
                "date": "2026-11-21",
                "weight": 1,
            },
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.5,
            "date": "2026-11-15",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 8.5,
            "date": "2026-12-25",
            "weight": 3,
        },
        "averageScore": 8.6,
        "comment": "Nắm chắc các mốc lịch sử dân tộc và thế giới, phân tích sự kiện có chiều sâu và góc nhìn đa chiều.",
    },
    "Địa lí": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Kiểm tra miệng (Bản đồ địa lí)",
                "score": 8.0,
                "date": "2026-09-24",
                "weight": 1,
            },
            {
                "name": "15 phút (Khí quyển & Thủy quyển)",
                "score": 8.5,
                "date": "2026-10-22",
                "weight": 1,
            },
            {"name": "Vẽ biểu đồ và nhận xét", "score": 8.5, "date": "2026-11-19", "weight": 1},
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1",
            "score": 8.0,
            "date": "2026-11-17",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1",
            "score": 8.5,
            "date": "2026-12-26",
            "weight": 3,
        },
        "averageScore": 8.3,
        "comment": "Kỹ năng đọc bản đồ địa lí và phân tích biểu đồ số liệu tốt. Trình bày bài thi cẩn thận.",
    },
    "Tin học": {
        "evaluationType": "score",
        "regularScores": [
            {
                "name": "Thực hành Lập trình Python cơ bản",
                "score": 10.0,
                "date": "2026-09-30",
                "weight": 1,
            },
            {
                "name": "15 phút (Cấu trúc rẽ nhánh & lặp)",
                "score": 9.5,
                "date": "2026-10-21",
                "weight": 1,
            },
            {
                "name": "Bài tập lớn: Dự án Quản lý mini",
                "score": 9.5,
                "date": "2026-11-26",
                "weight": 1,
            },
        ],
        "midtermScore": {
            "name": "Kiểm tra Giữa kỳ 1 (Thực hành máy)",
            "score": 9.5,
            "date": "2026-11-13",
            "weight": 2,
        },
        "finalScore": {
            "name": "Kiểm tra Cuối kỳ 1 (Thuật toán)",
            "score": 10.0,
            "date": "2026-12-26",
            "weight": 3,
        },
        "averageScore": 9.8,
        "comment": "Xuất sắc! Nắm vững thuật toán và cấu trúc dữ liệu, kỹ năng lập trình giải quyết bài toán tối ưu.",
    },
    "Giáo dục thể chất": {
        "evaluationType": "feedback",
        "regularScores": [],
        "midtermScore": None,
        "finalScore": None,
        "averageScore": None,
        "subject_eval": "pass",
        "comment": "Đạt yêu cầu xuất sắc. Thể lực tốt, kỹ thuật động tác chuẩn xác, tinh thần đồng đội cao.",
    },
    "Giáo dục quốc phòng và an ninh": {
        "evaluationType": "feedback",
        "regularScores": [],
        "midtermScore": None,
        "finalScore": None,
        "averageScore": None,
        "subject_eval": "pass",
        "comment": "Đạt yêu cầu. Chấp hành nghiêm điều lệnh đội ngũ, thành thạo kỹ năng băng bó cứu thương.",
    },
    "Hoạt động trải nghiệm, hướng nghiệp": {
        "evaluationType": "feedback",
        "regularScores": [],
        "midtermScore": None,
        "finalScore": None,
        "averageScore": None,
        "subject_eval": "pass",
        "comment": "Đạt yêu cầu xuất sắc. Tích cực tham gia các diễn đàn hướng nghiệp và hoạt động trải nghiệm thực tế.",
    },
}


class Command(BaseCommand):
    help = "Seeds comprehensive academic gradebook data (ReportCards, StudentScores, StudentTermSummaries) per MOET Circular 22."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE(
                "Seeding Gradebook Data (ReportCard, StudentScore, StudentTermSummary)..."
            )
        )

        ay = AcademicYear.objects.filter(is_current=True).first() or AcademicYear.objects.first()
        sem = (
            Semester.objects.filter(academic_year=ay, is_current=True).first()
            or Semester.objects.filter(academic_year=ay).first()
        )

        if not ay or not sem:
            self.stdout.write(
                self.style.ERROR(
                    "AcademicYear or Semester not found. Please seed master data first."
                )
            )
            return

        # Fetch score types
        st_tx = (
            ScoreType.objects.filter(name__icontains="thường xuyên").first()
            or ScoreType.objects.first()
        )
        st_gk = (
            ScoreType.objects.filter(name__icontains="giữa kỳ").first() or ScoreType.objects.first()
        )
        st_ck = (
            ScoreType.objects.filter(name__icontains="cuối kỳ").first() or ScoreType.objects.first()
        )

        students = list(
            Student.objects.filter(current_class__name="10A1").select_related(
                "current_class", "user"
            )
        )
        if not students:
            self.stdout.write(self.style.ERROR("No students found in Class 10A1."))
            return

        self.stdout.write(
            f"Found {len(students)} students in Class 10A1. Processing semester: {sem.name}..."
        )

        csts = list(
            ClassSubjectTeacher.objects.filter(
                school_class=students[0].current_class,
                semester=sem,
            ).select_related("subject", "teacher__user")
        )

        if not csts:
            # Fallback to any semester CSTs for 10A1
            csts = list(
                ClassSubjectTeacher.objects.filter(
                    school_class=students[0].current_class,
                ).select_related("subject", "teacher__user")
            )

        self.stdout.write(f"Found {len(csts)} ClassSubjectTeacher assignments for 10A1.")

        created_rc_count = 0
        created_score_count = 0
        created_summary_count = 0

        with transaction.atomic():
            for student_idx, student in enumerate(students):
                # Variance offset for students so they have slightly different realistic scores
                offset = Decimal(str(round((student_idx * -0.15) if student_idx > 0 else 0.0, 2)))

                total_score_sum = Decimal("0.0")
                score_subject_count = 0

                for cst in csts:
                    s_name = cst.subject.name
                    template = _SUBJECT_SCORE_TEMPLATES.get(s_name)
                    if not template:
                        # Match loosely if name has minor difference
                        for k, v in _SUBJECT_SCORE_TEMPLATES.items():
                            if k.lower() in s_name.lower() or s_name.lower() in k.lower():
                                template = v
                                break

                    if not template:
                        continue

                    eval_type = template["evaluationType"]
                    entered_user = (
                        cst.teacher.user if (cst.teacher and cst.teacher.user) else student.user
                    )

                    if eval_type == "feedback":
                        # Feedback-based subject (PE, GDQP, HĐTN)
                        rc, created = ReportCard.objects.update_or_create(
                            student=student,
                            subject=cst.subject,
                            semester=sem,
                            academic_year=ay,
                            defaults={
                                "school_class": student.current_class,
                                "average_score": None,
                                "subject_eval": "pass",
                                "academic_rating": "PASS",
                                "conduct_rating": "EXCELLENT",
                                "honor_title": "Đạt",
                                "rank_in_class": student_idx + 1,
                                "teacher_comment": template["comment"],
                                "score_details": {
                                    "evaluationType": "feedback",
                                    "regularScores": [],
                                    "feedbackResult": "pass",
                                    "gradeLevel": "pass",
                                    "classAverage": None,
                                    "highestScore": None,
                                },
                            },
                        )
                        if created:
                            created_rc_count += 1

                        if st_tx:
                            StudentScore.objects.update_or_create(
                                student=student,
                                class_subject_teacher=cst,
                                semester=sem,
                                score_type=st_tx,
                                defaults={
                                    "comment_result": "PASSED",
                                    "score_value": None,
                                    "score_date": "2026-11-20",
                                    "entered_by": entered_user,
                                    "note": template["comment"],
                                },
                            )
                            created_score_count += 1

                    else:
                        # Score-based subject
                        base_avg = Decimal(str(template["averageScore"]))
                        adjusted_avg = max(Decimal("5.0"), min(Decimal("10.0"), base_avg + offset))

                        regular_scores_data = []
                        for idx, rs in enumerate(template["regularScores"]):
                            rs_val = max(
                                Decimal("5.0"),
                                min(Decimal("10.0"), Decimal(str(rs["score"])) + offset),
                            )
                            score_id = f"tx-{idx + 1}-{cst.subject.code}-{student.student_code}"
                            regular_scores_data.append(
                                {
                                    "id": score_id,
                                    "name": rs["name"],
                                    "score": float(rs_val),
                                    "date": rs["date"],
                                    "weight": rs["weight"],
                                }
                            )

                            if st_tx:
                                StudentScore.objects.update_or_create(
                                    student=student,
                                    class_subject_teacher=cst,
                                    semester=sem,
                                    score_type=st_tx,
                                    defaults={
                                        "score_value": rs_val,
                                        "comment_result": None,
                                        "score_date": rs["date"],
                                        "entered_by": entered_user,
                                        "note": rs["name"],
                                    },
                                )
                                created_score_count += 1

                        midterm_val = None
                        midterm_data = None
                        if template.get("midtermScore"):
                            ms = template["midtermScore"]
                            midterm_val = max(
                                Decimal("5.0"),
                                min(Decimal("10.0"), Decimal(str(ms["score"])) + offset),
                            )
                            midterm_data = {
                                "id": f"gk-{cst.subject.code}-{student.student_code}",
                                "name": ms["name"],
                                "score": float(midterm_val),
                                "date": ms["date"],
                                "weight": ms["weight"],
                            }
                            if st_gk:
                                StudentScore.objects.update_or_create(
                                    student=student,
                                    class_subject_teacher=cst,
                                    semester=sem,
                                    score_type=st_gk,
                                    defaults={
                                        "score_value": midterm_val,
                                        "comment_result": None,
                                        "score_date": ms["date"],
                                        "entered_by": entered_user,
                                        "note": ms["name"],
                                    },
                                )
                                created_score_count += 1

                        final_val = None
                        final_data = None
                        if template.get("finalScore"):
                            fs = template["finalScore"]
                            final_val = max(
                                Decimal("5.0"),
                                min(Decimal("10.0"), Decimal(str(fs["score"])) + offset),
                            )
                            final_data = {
                                "id": f"ck-{cst.subject.code}-{student.student_code}",
                                "name": fs["name"],
                                "score": float(final_val),
                                "date": fs["date"],
                                "weight": fs["weight"],
                            }
                            if st_ck:
                                StudentScore.objects.update_or_create(
                                    student=student,
                                    class_subject_teacher=cst,
                                    semester=sem,
                                    score_type=st_ck,
                                    defaults={
                                        "score_value": final_val,
                                        "comment_result": None,
                                        "score_date": fs["date"],
                                        "entered_by": entered_user,
                                        "note": fs["name"],
                                    },
                                )
                                created_score_count += 1

                        class_avg = float(max(Decimal("6.0"), adjusted_avg - Decimal("0.8")))
                        highest_val = float(min(Decimal("10.0"), adjusted_avg + Decimal("0.7")))
                        grade_level = (
                            "excellent"
                            if adjusted_avg >= Decimal("8.0")
                            else ("good" if adjusted_avg >= Decimal("6.5") else "average")
                        )

                        acad_rating_code = (
                            "OUTSTANDING"
                            if adjusted_avg >= Decimal("9.0")
                            else (
                                "GOOD"
                                if adjusted_avg >= Decimal("8.0")
                                else ("FAIR" if adjusted_avg >= Decimal("6.5") else "PASS")
                            )
                        )

                        rc, created = ReportCard.objects.update_or_create(
                            student=student,
                            subject=cst.subject,
                            semester=sem,
                            academic_year=ay,
                            defaults={
                                "school_class": student.current_class,
                                "average_score": adjusted_avg,
                                "subject_eval": "pass",
                                "academic_rating": acad_rating_code,
                                "conduct_rating": "EXCELLENT",
                                "honor_title": "Học sinh Giỏi"
                                if adjusted_avg >= Decimal("8.0")
                                else "Học sinh Khá",
                                "rank_in_class": student_idx + 1,
                                "teacher_comment": template["comment"],
                                "score_details": {
                                    "evaluationType": "score",
                                    "regularScores": regular_scores_data,
                                    "midtermScore": midterm_data,
                                    "finalScore": final_data,
                                    "classAverage": class_avg,
                                    "highestScore": highest_val,
                                    "gradeLevel": grade_level,
                                },
                            },
                        )
                        if created:
                            created_rc_count += 1

                        total_score_sum += adjusted_avg
                        score_subject_count += 1

                # Calculate overall Term Summary
                if score_subject_count > 0:
                    term_gpa = round(total_score_sum / Decimal(str(score_subject_count)), 2)
                    acad_term_code = (
                        "OUTSTANDING"
                        if term_gpa >= Decimal("9.0")
                        else (
                            "GOOD"
                            if term_gpa >= Decimal("8.0")
                            else ("FAIR" if term_gpa >= Decimal("6.5") else "PASS")
                        )
                    )
                    honor_title = (
                        "Học sinh Giỏi Học kỳ 1 | Khối 10"
                        if term_gpa >= Decimal("8.0")
                        else "Học sinh Tiên tiến Học kỳ 1"
                    )

                    StudentTermSummary.objects.update_or_create(
                        student=student,
                        semester=sem,
                        academic_year=ay,
                        defaults={
                            "school_class": student.current_class,
                            "term_type": "SEMESTER",
                            "gpa_score": term_gpa,
                            "academic_rating": acad_term_code,
                            "conduct_rating": "EXCELLENT",
                            "honor_title": honor_title,
                            "rank_in_class": student_idx + 1,
                            "rank_in_grade": student_idx + 1,
                            "excused_absences": 0,
                            "unexcused_absences": 0,
                            "is_promoted": True,
                            "homeroom_remarks": (
                                f"Học sinh {student.user.full_name} chăm ngoan, lễ phép, có ý thức tự giác và kỷ luật học tập rất cao. "
                                f"Tiếp thu bài nhanh, tư duy logic sắc bén ở các môn khoa học tự nhiên và có tiến bộ vượt bậc ở môn Ngoại ngữ 1. "
                                f"Tích cực tham gia các hoạt động tập thể của lớp {student.current_class.name}."
                            ),
                        },
                    )
                    created_summary_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded Gradebook data: {created_rc_count} ReportCards, "
                f"{created_score_count} StudentScores, {created_summary_count} StudentTermSummaries."
            )
        )
