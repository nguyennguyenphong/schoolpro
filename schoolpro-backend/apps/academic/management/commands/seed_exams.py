"""
Management command to seed realistic Examination Papers, Question Bank items,
Dynamic Google Form-like questions, and Student Submissions for Class 10A1.

Usage:
    python manage.py seed_exams
"""

from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.academic.models.exam import (
    Exam,
    ExamEventLog,
    ExamQuestion,
    ExamSubmission,
    ExamSubmissionAnswer,
    QuestionBank,
)
from apps.academic.models.grading import ScoreType
from apps.core.models.organization import (
    ClassSubjectTeacher,
    SchoolClass,
    StudentClassEnrollment,
)
from apps.core.models.profile import Student, Teacher
from apps.core.models.user import User
from apps.master.models.grade import Grade
from apps.master.models.subject import Subject


class Command(BaseCommand):
    help = "Seeds standard exams, question bank repository, dynamic questions, and student submissions."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Exams, Question Bank & Submissions (academic.exams)...")
        )

        with transaction.atomic():
            school_class = (
                SchoolClass.objects.filter(name="10A1").first() or SchoolClass.objects.first()
            )
            if not school_class:
                self.stdout.write(self.style.ERROR("No SchoolClass found. Please seed classes first."))
                return

            grade = school_class.grade or Grade.objects.first()
            if not grade:
                self.stdout.write(self.style.ERROR("No Grade found. Please seed grades first."))
                return

            enrollments = (
                StudentClassEnrollment.objects.filter(school_class=school_class, status="ACTIVE")
                .select_related("student", "student__user")
                .all()
            )
            students = [e.student for e in enrollments if e.student]
            if not students:
                students = list(Student.objects.select_related("user").all()[:5])

            if not students:
                self.stdout.write(self.style.ERROR("No Student found. Please seed students first."))
                return

            csts = list(
                ClassSubjectTeacher.objects.filter(school_class=school_class).select_related(
                    "subject", "teacher__user"
                )
            )
            if not csts:
                teacher = Teacher.objects.select_related("user").first()
                subjects = list(Subject.objects.all()[:5])
                for subj in subjects:
                    if teacher:
                        cst_obj, _ = ClassSubjectTeacher.objects.get_or_create(
                            school_class=school_class,
                            subject=subj,
                            defaults={"teacher": teacher},
                        )
                        csts.append(cst_obj)

            if not csts:
                self.stdout.write(self.style.ERROR("No ClassSubjectTeacher found."))
                return

            # Score types
            st_regular = ScoreType.objects.filter(name__icontains="thường xuyên").first()
            st_midterm = ScoreType.objects.filter(name__icontains="giữa kỳ").first()
            default_st = st_midterm or st_regular or ScoreType.objects.first()

            creator = (
                csts[0].teacher.user
                if csts[0].teacher and csts[0].teacher.user
                else User.objects.first()
            )

            # Clear existing exams for this class to keep seeding idempotent
            Exam.objects.filter(class_subject_teacher__school_class=school_class).delete()

            now = timezone.now()
            today = now.date()

            def pick_cst(idx: int) -> ClassSubjectTeacher:
                return csts[idx % len(csts)]

            # =========================================================================
            # EXAM 1: Tin học 10 - Cấu trúc dữ liệu & Tư duy thuật toán (Pending / Ongoing)
            # =========================================================================
            cst_it = next((c for c in csts if "tin" in c.subject.name.lower()), pick_cst(0))
            exam1 = Exam.objects.create(
                class_subject_teacher=cst_it,
                score_type=st_midterm or default_st,
                title="Đề thi Trắc nghiệm Giữa kỳ: Cấu trúc dữ liệu & Thuật toán 10",
                exam_date=today,
                start_time=now - timedelta(days=2),
                end_time=now + timedelta(days=7),
                duration_minutes=45,
                format="MIXED",
                status="PUBLISHED",
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("20.00"),
                shuffle_questions=False,
                shuffle_answers=False,
                allow_review=True,
                max_attempts=1,
                description=(
                    "Bài kiểm tra trực tuyến định dạng Google Form đánh giá năng lực tư duy thuật toán.\n"
                    "- Gồm 9 câu hỏi đa dạng: trắc nghiệm chọn 1, chọn nhiều, điền số, điền từ, đúng/sai, tự luận ngắn và thang đo đánh giá.\n"
                    "- Học sinh làm bài nghiêm túc, chú ý các câu hỏi có dấu * bắt buộc."
                ),
                created_by=creator,
            )

            # Question Bank items & Exam Questions for Exam 1
            q_defs_1 = [
                {
                    "content": "Cấu trúc dữ liệu nào hoạt động theo nguyên lý LIFO (Last In First Out)?",
                    "type": "radio",
                    "db_type": "SINGLE_CHOICE",
                    "difficulty": "RECOGNITION",
                    "options": [
                        "Queue (Hàng đợi)",
                        "Stack (Ngăn xếp)",
                        "Array (Mảng tĩnh)",
                        "Binary Search Tree (Cây nhị phân tìm kiếm)",
                    ],
                    "correct": "Stack (Ngăn xếp)",
                    "explanation": "Stack hoạt động theo cơ chế vào sau - ra trước (LIFO), các thao tác push/pop đều diễn ra tại đỉnh ngăn xếp.",
                    "points": Decimal("1.00"),
                    "required": True,
                    "section": "Phần 1: Cấu trúc dữ liệu cơ bản",
                },
                {
                    "content": "Độ phức tạp thời gian của giải thuật Tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp gồm n phần tử là:",
                    "type": "radio",
                    "db_type": "SINGLE_CHOICE",
                    "difficulty": "COMPREHENSION",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                    "correct": "O(log n)",
                    "explanation": "Mỗi bước so sánh của Binary Search chia đôi không gian tìm kiếm, do đó số bước thực hiện tối đa là log2(n).",
                    "points": Decimal("1.00"),
                    "required": True,
                    "section": "Phần 1: Cấu trúc dữ liệu cơ bản",
                },
                {
                    "content": "Những thuật toán sắp xếp nào sau đây có độ phức tạp thời gian trung bình là O(n log n)?",
                    "type": "checkbox",
                    "db_type": "MULTIPLE_CHOICE",
                    "difficulty": "APPLICATION",
                    "options": [
                        "Merge Sort (Sắp xếp trộn)",
                        "Quick Sort (Sắp xếp nhanh)",
                        "Bubble Sort (Sắp xếp nổi bọt)",
                        "Heap Sort (Sắp xếp vun đống)",
                    ],
                    "correct": [
                        "Merge Sort (Sắp xếp trộn)",
                        "Quick Sort (Sắp xếp nhanh)",
                        "Heap Sort (Sắp xếp vun đống)",
                    ],
                    "explanation": "Merge Sort, Quick Sort và Heap Sort đều có độ phức tạp trung bình là O(n log n). Bubble Sort có độ phức tạp trung bình là O(n^2).",
                    "points": Decimal("1.50"),
                    "required": True,
                    "section": "Phần 2: Giải thuật sắp xếp",
                },
                {
                    "content": "Chọn cấu trúc dữ liệu thích hợp nhất để triển khai bộ đệm in ấn (Print Spooler) hoặc hàng đợi tác vụ:",
                    "type": "select",
                    "db_type": "SINGLE_CHOICE",
                    "difficulty": "COMPREHENSION",
                    "options": [
                        "Queue (FIFO - First In First Out)",
                        "Stack (LIFO - Last In First Out)",
                        "Binary Search Tree",
                        "Hash Table",
                    ],
                    "correct": "Queue (FIFO - First In First Out)",
                    "explanation": "Hàng đợi (Queue) xử lý tác vụ theo thứ tự đến trước - phục vụ trước (FIFO).",
                    "points": Decimal("1.00"),
                    "required": True,
                    "section": "Phần 2: Giải thuật sắp xếp",
                },
                {
                    "content": "Cho một cây nhị phân đầy đủ có độ cao h = 3 (với nút gốc ở mức 0). Hãy nhập số lượng nút lá tối đa của cây này:",
                    "type": "input",
                    "db_type": "FILL_BLANK",
                    "difficulty": "APPLICATION",
                    "options": [],
                    "correct": "8",
                    "explanation": "Số lượng nút lá tối đa ở mức h = 3 là 2^3 = 8 nút lá.",
                    "points": Decimal("1.50"),
                    "required": True,
                    "placeholder": "Nhập số nguyên kết quả...",
                    "section": "Phần 3: Điền khuyết & Logic",
                },
                {
                    "content": "Nhập tên cấu trúc dữ liệu thường được sử dụng trong giải thuật Duyệt đồ thị theo chiều rộng (BFS):",
                    "type": "input",
                    "db_type": "FILL_BLANK",
                    "difficulty": "RECOGNITION",
                    "options": [],
                    "correct": "Queue",
                    "explanation": "BFS sử dụng Hàng đợi (Queue - FIFO) để lưu vết các đỉnh kề cần thăm theo từng lớp khoảng cách.",
                    "points": Decimal("1.00"),
                    "required": True,
                    "placeholder": "VD: Queue hoặc Hàng đợi",
                    "section": "Phần 3: Điền khuyết & Logic",
                },
                {
                    "content": "Thuật toán Dijkstra có thể hoạt động chính xác trên đồ thị có trọng số cạnh âm:",
                    "type": "boolean",
                    "db_type": "TRUE_FALSE",
                    "difficulty": "COMPREHENSION",
                    "options": [],
                    "correct": False,
                    "explanation": "Sai. Giải thuật Dijkstra giả định rằng việc thêm một cạnh không bao giờ làm giảm tổng chi phí, do đó không áp dụng được cho đồ thị có trọng số âm (phải dùng Bellman-Ford).",
                    "points": Decimal("1.00"),
                    "required": True,
                    "section": "Phần 4: Đồ thị & Tự luận ngắn",
                },
                {
                    "content": "Trình bày ngắn gọn ưu điểm của Bảng băm (Hash Table) so với Cây nhị phân tìm kiếm cân bằng (AVL Tree):",
                    "type": "textarea",
                    "db_type": "ESSAY",
                    "difficulty": "APPLICATION",
                    "options": [],
                    "correct": "Bảng băm tra cứu O(1)",
                    "explanation": "Bảng băm có độ phức tạp tra cứu trung bình là O(1), nhanh hơn O(log n) của AVL Tree.",
                    "points": Decimal("1.00"),
                    "required": False,
                    "placeholder": "Nhập câu trả lời tóm tắt của em...",
                    "section": "Phần 4: Đồ thị & Tự luận ngắn",
                },
                {
                    "content": "Đánh giá mức độ hiểu biết và tự tin của em về giải thuật Đồ thị (Dijkstra, BFS, DFS):",
                    "type": "rating",
                    "db_type": "SINGLE_CHOICE",
                    "difficulty": "RECOGNITION",
                    "options": [],
                    "correct": 5,
                    "explanation": "Khảo sát tự đánh giá năng lực của học sinh.",
                    "points": Decimal("1.00"),
                    "required": False,
                    "section": "Phần 5: Khảo sát & Phản hồi",
                },
            ]

            for idx, qd in enumerate(q_defs_1, start=1):
                qb = QuestionBank.objects.create(
                    subject=cst_it.subject,
                    grade=grade,
                    code=f"QB-CS-{idx:03d}",
                    chapter_name="Cấu trúc dữ liệu & Thuật toán",
                    difficulty_level=qd["difficulty"],
                    question_type=qd["db_type"],
                    content=qd["content"],
                    options=qd["options"],
                    correct_answers=qd["correct"] if isinstance(qd["correct"], list) else [qd["correct"]],
                    solution_explanation=qd["explanation"],
                    default_score=qd["points"],
                    author=creator,
                    status="APPROVED",
                )
                ExamQuestion.objects.create(
                    exam=exam1,
                    question=qb,
                    order_no=idx,
                    section_name=qd["section"],
                    score_weight=qd["points"],
                    paper_code="STANDARD",
                    shuffled_options=qd["options"],
                    metadata={
                        "type": qd["type"],
                        "required": qd["required"],
                        "placeholder": qd.get("placeholder", ""),
                        "ratingMax": 5,
                    },
                )

            # Audit event for Exam 1
            ExamEventLog.objects.create(
                exam=exam1,
                actor=creator,
                event_type="PUBLISHED",
                title="Giáo viên phát hành đề thi trắc nghiệm",
                description="Đề thi đã được mở cho học sinh lớp 10A1.",
                severity="INFO",
            )

            # =========================================================================
            # EXAM 2: Toán 10 - Đề thi Giữa kỳ (Completed / Graded with sample submission)
            # =========================================================================
            cst_math = next((c for c in csts if "toán" in c.subject.name.lower()), pick_cst(1))
            exam2 = Exam.objects.create(
                class_subject_teacher=cst_math,
                score_type=st_midterm or default_st,
                title="Đề thi Trắc nghiệm Giữa kỳ: Toán học 10 - Đại số & Lượng giác",
                exam_date=today - timedelta(days=10),
                start_time=now - timedelta(days=15),
                end_time=now - timedelta(days=5),
                duration_minutes=60,
                format="MIXED",
                status="COMPLETED",
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("20.00"),
                shuffle_questions=False,
                shuffle_answers=False,
                allow_review=True,
                max_attempts=1,
                description="Đề thi đánh giá giữa học kỳ 1 môn Toán học 10.",
                created_by=creator,
            )

            q_defs_2 = [
                {
                    "content": "Cho hàm số f(x) = x^2 - 4x + 3. Tọa độ đỉnh I của parabol là:",
                    "type": "radio",
                    "db_type": "SINGLE_CHOICE",
                    "options": ["I(2; -1)", "I(-2; 15)", "I(1; 0)", "I(4; 3)"],
                    "correct": "I(2; -1)",
                    "explanation": "Hoành độ đỉnh x = -b/(2a) = 2. Tung độ y = f(2) = -1. Vậy I(2; -1).",
                    "points": Decimal("2.50"),
                    "required": True,
                },
                {
                    "content": "Những giá trị nào sau đây của x thỏa mãn bất phương trình x^2 - 5x + 6 <= 0?",
                    "type": "checkbox",
                    "db_type": "MULTIPLE_CHOICE",
                    "options": ["x = 2", "x = 2.5", "x = 3", "x = 4"],
                    "correct": ["x = 2", "x = 2.5", "x = 3"],
                    "explanation": "Nghiệm của bpt là đoạn [2; 3], do đó x = 2, 2.5, 3 đều thỏa mãn.",
                    "points": Decimal("2.50"),
                    "required": True,
                },
                {
                    "content": "Giá trị của sin(30 độ) bằng:",
                    "type": "select",
                    "db_type": "SINGLE_CHOICE",
                    "options": ["1/2", "căn(2)/2", "căn(3)/2", "1"],
                    "correct": "1/2",
                    "explanation": "sin(30°) = 1/2.",
                    "points": Decimal("2.50"),
                    "required": True,
                },
                {
                    "content": "Tập xác định của hàm số y = 1 / (x - 5) là tập số thực R loại bỏ phần tử nào? Hãy nhập số đó:",
                    "type": "input",
                    "db_type": "FILL_BLANK",
                    "options": [],
                    "correct": "5",
                    "explanation": "Mẫu số x - 5 != 0 <=> x != 5.",
                    "points": Decimal("2.50"),
                    "required": True,
                    "placeholder": "Nhập số...",
                },
            ]

            eq_list_2 = []
            for idx, qd in enumerate(q_defs_2, start=1):
                qb = QuestionBank.objects.create(
                    subject=cst_math.subject,
                    grade=grade,
                    code=f"QB-MATH-{idx:03d}",
                    chapter_name="Hàm số bậc hai & Lượng giác",
                    difficulty_level="COMPREHENSION",
                    question_type=qd["db_type"],
                    content=qd["content"],
                    options=qd["options"],
                    correct_answers=[qd["correct"]] if not isinstance(qd["correct"], list) else qd["correct"],
                    solution_explanation=qd["explanation"],
                    default_score=qd["points"],
                    author=creator,
                    status="APPROVED",
                )
                eq = ExamQuestion.objects.create(
                    exam=exam2,
                    question=qb,
                    order_no=idx,
                    score_weight=qd["points"],
                    paper_code="STANDARD",
                    shuffled_options=qd["options"],
                    metadata={"type": qd["type"], "required": qd["required"]},
                )
                eq_list_2.append(eq)

            # Create submissions for students so they see real results
            sample_answers = {
                str(eq_list_2[0].id): "I(2; -1)",
                str(eq_list_2[1].id): ["x = 2", "x = 2.5", "x = 3"],
                str(eq_list_2[2].id): "1/2",
                str(eq_list_2[3].id): "5",
            }
            for st in students:
                sub = ExamSubmission.objects.create(
                    exam=exam2,
                    student=st,
                    paper_code="STANDARD",
                    attempt_number=1,
                    started_at=now - timedelta(days=6, hours=1),
                    submitted_at=now - timedelta(days=6),
                    duration_seconds=42 * 60,
                    auto_score=Decimal("10.00"),
                    total_score=Decimal("10.00"),
                    status="GRADED",
                    metadata={"answers": sample_answers},
                )
                for eq in eq_list_2:
                    ans_val = sample_answers[str(eq.id)]
                    ExamSubmissionAnswer.objects.create(
                        submission=sub,
                        exam_question=eq,
                        selected_answers=ans_val if isinstance(ans_val, list) else [ans_val],
                        text_response=str(ans_val),
                        is_correct=True,
                        awarded_score=eq.score_weight,
                    )

            # =========================================================================
            # EXAM 3: Ngoại ngữ 1 - Kiểm tra 15 phút (Expired)
            # =========================================================================
            cst_eng = next((c for c in csts if "ngoại ngữ" in c.subject.name.lower() or "tiếng anh" in c.subject.name.lower()), pick_cst(2))
            exam3 = Exam.objects.create(
                class_subject_teacher=cst_eng,
                score_type=st_regular or default_st,
                title="Bài kiểm tra 15 phút: Tiếng Anh 10 - Unit 1 & Unit 2 Vocabulary",
                exam_date=today - timedelta(days=20),
                start_time=now - timedelta(days=25),
                end_time=now - timedelta(days=15),
                duration_minutes=15,
                format="MIXED",
                status="COMPLETED",
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("10.00"),
                shuffle_questions=True,
                allow_review=True,
                description="Kiểm tra thường xuyên từ vựng và ngữ pháp Unit 1 và Unit 2.",
                created_by=creator,
            )

            q_defs_3 = [
                {
                    "content": "Choose the word whose underlined part is pronounced differently from the others:",
                    "type": "radio",
                    "db_type": "SINGLE_CHOICE",
                    "options": ["A. takes", "B. hopes", "C. likes", "D. rides"],
                    "correct": "D. rides",
                    "explanation": "/s/ vs /z/ ending sound rule.",
                    "points": Decimal("5.00"),
                    "required": True,
                },
                {
                    "content": "She ______ to school by bicycle every morning.",
                    "type": "radio",
                    "db_type": "SINGLE_CHOICE",
                    "options": ["A. go", "B. goes", "C. is going", "D. went"],
                    "correct": "B. goes",
                    "explanation": "Present simple tense for daily routine with third-person singular.",
                    "points": Decimal("5.00"),
                    "required": True,
                },
            ]
            for idx, qd in enumerate(q_defs_3, start=1):
                qb = QuestionBank.objects.create(
                    subject=cst_eng.subject,
                    grade=grade,
                    code=f"QB-ENG-{idx:03d}",
                    chapter_name="Grammar & Phonetics",
                    difficulty_level="RECOGNITION",
                    question_type=qd["db_type"],
                    content=qd["content"],
                    options=qd["options"],
                    correct_answers=[qd["correct"]],
                    solution_explanation=qd["explanation"],
                    default_score=qd["points"],
                    author=creator,
                    status="APPROVED",
                )
                ExamQuestion.objects.create(
                    exam=exam3,
                    question=qb,
                    order_no=idx,
                    score_weight=qd["points"],
                    paper_code="STANDARD",
                    shuffled_options=qd["options"],
                    metadata={"type": qd["type"], "required": qd["required"]},
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"🎉 Successfully seeded 3 realistic standard exams for Class 10A1 ({school_class.name})!\n"
                f"   - Exam 1: {exam1.title} (PUBLISHED - 9 Dynamic Question Types: radio, checkbox, input, textarea, select, rating, boolean)\n"
                f"   - Exam 2: {exam2.title} (COMPLETED - with 10.0 scored submissions & feedback)\n"
                f"   - Exam 3: {exam3.title} (COMPLETED - 15-minute quick test)"
            )
        )
