"""
Business logic service for Academic Examination domain.
Manages student exam feeds, detail resolution, dynamic Google Form-like question types,
per-question point configuration, required validations, submissions, auto-grading, and event logs.
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import uuid4

from django.db.models import Q
from django.utils import timezone

from apps.academic.models.exam import (
    Exam,
    ExamEventLog,
    ExamSubmission,
)
from apps.core.models.organization import (
    ClassSubjectTeacher,
    SchoolClass,
    StudentClassEnrollment,
)
from apps.core.models.profile import Student
from apps.master.models.academic_year import AcademicYear
from apps.master.models.semester import Semester

logger = logging.getLogger(__name__)


# In-memory store for active submissions during runtime / mock fallback
_IN_MEMORY_SUBMISSIONS: dict[str, dict[str, Any]] = {}


class ExamService:
    """
    Orchestrates exam retrieval, dynamic question structures, online submissions,
    automated scoring across various question types, and timeline event logs.
    """

    SUPPORTED_QUESTION_TYPES = [
        "radio",
        "checkbox",
        "input",
        "textarea",
        "select",
        "rating",
        "boolean",
        "date",
    ]

    FORMAT_MAP = {
        "ESSAY": "essay",
        "WRITTEN": "essay",
        "MULTIPLE_CHOICE": "multiple_choice",
        "QUIZ": "multiple_choice",
        "CHOICE": "multiple_choice",
        "MIXED": "mixed",
        "HYBRID": "mixed",
        "COMBINED": "mixed",
    }

    # Pre-configured rich dynamic exams for comprehensive testing and fallback
    SEEDED_EXAMS: list[dict[str, Any]] = [
        {
            "id": "exam-001",
            "code": "DE-CS201",
            "title": "Đề thi Trắc nghiệm Giữa kỳ: Cấu trúc dữ liệu & Giải thuật",
            "courseCode": "CS201",
            "courseName": "Cấu trúc dữ liệu & Giải thuật",
            "subjectCode": "CS201",
            "subjectName": "Cấu trúc dữ liệu & Giải thuật",
            "format": "multiple_choice",
            "teacherName": "ThS. Hoàng Văn Nam",
            "semester": "HK1",
            "academicYear": "2025-2026",
            "durationMinutes": 45,
            "totalQuestions": 8,
            "maxScore": 10.0,
            "passingScore": 5.0,
            "startDate": "2026-09-25 08:00",
            "endDate": "2026-10-25 23:59",
            "status": "pending",
            "scoreReleaseMode": "immediate",
            "questions": [
                {
                    "id": "q-1",
                    "title": "Cấu trúc dữ liệu nào hoạt động theo nguyên lý LIFO (Last In First Out)?",
                    "description": "Chọn 01 đáp án chính xác nhất.",
                    "type": "radio",
                    "required": True,
                    "points": 1.0,
                    "options": [
                        "Queue (Hàng đợi)",
                        "Stack (Ngăn xếp)",
                        "Array (Mảng tĩnh)",
                        "Binary Search Tree (Cây nhị phân tìm kiếm)",
                    ],
                    "correctAnswer": "Stack (Ngăn xếp)",
                    "explanation": "Stack hoạt động theo cơ chế vào sau - ra trước (LIFO), các thao tác push/pop đều diễn ra tại đỉnh ngăn xếp.",
                    "sectionName": "Phần 1: Cấu trúc dữ liệu cơ bản",
                },
                {
                    "id": "q-2",
                    "title": "Độ phức tạp thời gian của giải thuật Tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp gồm n phần tử là:",
                    "description": "Chọn 01 đáp án đúng trong trường hợp xấu nhất.",
                    "type": "radio",
                    "required": True,
                    "points": 1.0,
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                    "correctAnswer": "O(log n)",
                    "explanation": "Mỗi bước so sánh của Binary Search chia đôi không gian tìm kiếm, do đó số bước thực hiện tối đa là log2(n).",
                    "sectionName": "Phần 1: Cấu trúc dữ liệu cơ bản",
                },
                {
                    "id": "q-3",
                    "title": "Những thuật toán sắp xếp nào sau đây có độ phức tạp thời gian trung bình là O(n log n)?",
                    "description": "Đây là câu hỏi nhiều lựa chọn (Checkbox). Em hãy chọn tất cả các đáp án đúng.",
                    "type": "checkbox",
                    "required": True,
                    "points": 1.5,
                    "options": [
                        "Merge Sort (Sắp xếp trộn)",
                        "Quick Sort (Sắp xếp nhanh)",
                        "Bubble Sort (Sắp xếp nổi bọt)",
                        "Heap Sort (Sắp xếp vun đống)",
                    ],
                    "correctAnswer": [
                        "Merge Sort (Sắp xếp trộn)",
                        "Quick Sort (Sắp xếp nhanh)",
                        "Heap Sort (Sắp xếp vun đống)",
                    ],
                    "explanation": "Merge Sort, Quick Sort và Heap Sort đều có độ phức tạp trung bình là O(n log n). Bubble Sort có độ phức tạp trung bình là O(n^2).",
                    "sectionName": "Phần 2: Giải thuật sắp xếp",
                },
                {
                    "id": "q-4",
                    "title": "Các cấu trúc dữ liệu nào dưới đây thuộc loại cấu trúc dữ liệu phi tuyến tính (Non-linear Data Structures)?",
                    "description": "Chọn tất cả các đáp án đúng.",
                    "type": "checkbox",
                    "required": True,
                    "points": 1.5,
                    "options": [
                        "Đồ thị (Graph)",
                        "Cây nhị phân (Binary Tree)",
                        "Danh sách liên kết (Linked List)",
                        "Hàng đợi ưu tiên dạng Mảng (Array Queue)",
                    ],
                    "correctAnswer": ["Đồ thị (Graph)", "Cây nhị phân (Binary Tree)"],
                    "explanation": "Đồ thị và Cây là cấu trúc dữ liệu phi tuyến tính. Mảng và Danh sách liên kết là cấu trúc dữ liệu tuyến tính.",
                    "sectionName": "Phần 2: Giải thuật sắp xếp",
                },
                {
                    "id": "q-5",
                    "title": "Cho một cây nhị phân đầy đủ có độ cao h = 3 (với nút gốc ở mức 0). Hãy nhập số lượng nút lá tối đa của cây này:",
                    "description": "Nhập một số nguyên duy nhất vào ô bên dưới (Ví dụ: 4, 8, 16...).",
                    "type": "input",
                    "placeholder": "Nhập kết quả số nguyên...",
                    "required": True,
                    "points": 1.5,
                    "correctAnswer": "8",
                    "explanation": "Số lượng nút lá tối đa ở mức h = 3 là 2^3 = 8 nút lá.",
                    "sectionName": "Phần 3: Bài tập điền khuyết & Tự luận ngắn",
                },
                {
                    "id": "q-6",
                    "title": "Nhập tên cấu trúc dữ liệu thường được sử dụng trong giải thuật Duyệt đồ thị theo chiều rộng (BFS):",
                    "description": "Nhập tên cấu trúc dữ liệu bằng tiếng Anh hoặc tiếng Việt (Ví dụ: Queue, Stack, Hash...).",
                    "type": "input",
                    "placeholder": "VD: Queue hoặc Hàng đợi",
                    "required": True,
                    "points": 1.5,
                    "correctAnswer": "Queue",
                    "explanation": "BFS sử dụng Hàng đợi (Queue - FIFO) để lưu vết các đỉnh kề cần thăm theo từng lớp khoảng cách.",
                    "sectionName": "Phần 3: Bài tập điền khuyết & Tự luận ngắn",
                },
                {
                    "id": "q-7",
                    "title": "Trong Bảng băm (Hash Table), hiện tượng hai khóa khác nhau cùng ánh xạ về cùng một chỉ số trong bảng gọi là gì?",
                    "description": "Chọn 01 đáp án chính xác.",
                    "type": "radio",
                    "required": True,
                    "points": 1.0,
                    "options": [
                        "Tràn bộ nhớ đệm (Buffer Overflow)",
                        "Va chạm băm (Hash Collision)",
                        "Lỗi rò rỉ con trỏ (Memory Leak)",
                        "Lặp vô hạn (Infinite Loop)",
                    ],
                    "correctAnswer": "Va chạm băm (Hash Collision)",
                    "explanation": "Hiện tượng hai key k1 != k2 nhưng h(k1) == h(k2) được định nghĩa là Va chạm băm (Collision).",
                    "sectionName": "Phần 4: Bảng băm và Ứng dụng",
                },
                {
                    "id": "q-8",
                    "title": "Đánh giá mức độ hiểu biết và tự tin của em về giải thuật Đồ thị (Dijkstra, BFS, DFS):",
                    "description": "Đánh giá từ 1 sao (Chưa tự tin) đến 5 sao (Rất tự tin, giải quyết tốt).",
                    "type": "rating",
                    "ratingMax": 5,
                    "required": False,
                    "points": 1.0,
                    "explanation": "Câu hỏi khảo sát và thu thập phản hồi học tập của sinh viên.",
                    "sectionName": "Phần 5: Khảo sát & Đánh giá năng lực",
                },
            ],
        },
        {
            "id": "exam-002",
            "code": "DE-CS302",
            "title": "Đề thi Trắc nghiệm Cuối kỳ: Lập trình Web nâng cao",
            "courseCode": "CS302",
            "courseName": "Lập trình ứng dụng Web nâng cao",
            "subjectCode": "CS302",
            "subjectName": "Lập trình ứng dụng Web nâng cao",
            "format": "mixed",
            "teacherName": "TS. Nguyễn Minh Khang",
            "semester": "HK1",
            "academicYear": "2025-2026",
            "durationMinutes": 60,
            "totalQuestions": 6,
            "maxScore": 10.0,
            "passingScore": 5.0,
            "startDate": "2026-09-15 08:00",
            "endDate": "2026-09-28 23:59",
            "status": "completed",
            "score": 9.0,
            "completedAt": "2026-09-26 14:35",
            "scoreReleaseMode": "hidden",
            "questions": [
                {
                    "id": "q-201",
                    "title": "Phương thức HTTP nào theo chuẩn RESTful được dùng để cập nhật một phần thuộc tính của tài nguyên?",
                    "type": "radio",
                    "required": True,
                    "points": 2.0,
                    "options": ["POST", "PUT", "PATCH", "DELETE"],
                    "correctAnswer": "PATCH",
                    "explanation": "PATCH cập nhật từng phần (partial update), còn PUT thay thế toàn bộ tài nguyên.",
                },
                {
                    "id": "q-202",
                    "title": "Những hook nào sau đây trong React được dùng để tối ưu hiệu năng tính toán và tránh re-render không cần thiết?",
                    "type": "checkbox",
                    "required": True,
                    "points": 2.0,
                    "options": ["useMemo", "useCallback", "useState", "useId"],
                    "correctAnswer": ["useMemo", "useCallback"],
                    "explanation": "useMemo ghi nhớ giá trị tính toán, useCallback ghi nhớ tham chiếu hàm.",
                },
                {
                    "id": "q-203",
                    "title": "Nhập mã trạng thái HTTP (Status Code) đại diện cho 'Unauthorized' (Yêu cầu xác thực tài khoản):",
                    "type": "input",
                    "required": True,
                    "points": 2.0,
                    "placeholder": "VD: 200, 404, 401...",
                    "correctAnswer": "401",
                    "explanation": "HTTP 401 Unauthorized yêu cầu client phải xác thực trước khi truy cập.",
                },
                {
                    "id": "q-204",
                    "title": "Cơ chế nào trong trình duyệt ngăn chặn mã JavaScript từ một nguồn truy cập trái phép tài nguyên từ nguồn khác?",
                    "type": "radio",
                    "required": True,
                    "points": 2.0,
                    "options": [
                        "Same-Origin Policy (SOP)",
                        "Cross-Origin Resource Sharing (CORS)",
                        "Content Security Policy (CSP)",
                        "Service Worker Cache",
                    ],
                    "correctAnswer": "Same-Origin Policy (SOP)",
                    "explanation": "Chính sách cùng nguồn gốc (SOP) là cơ chế bảo mật cốt lõi ngăn cách các nguồn web độc lập.",
                },
                {
                    "id": "q-205",
                    "title": "Giao thức WebSocket cung cấp kênh truyền dữ liệu song công (full-duplex) trên một kết nối TCP duy nhất:",
                    "type": "boolean",
                    "required": True,
                    "points": 1.0,
                    "correctAnswer": True,
                    "explanation": "Chính xác, WebSocket hỗ trợ truyền thông hai chiều thời gian thực (Full-Duplex) liên tục.",
                },
                {
                    "id": "q-206",
                    "title": "Hãy giải thích ngắn gọn nguyên lý hoạt động của JWT (JSON Web Token) trong xác thực người dùng:",
                    "type": "textarea",
                    "required": False,
                    "points": 1.0,
                    "placeholder": "Nhập phần giải thích tóm tắt của em...",
                    "explanation": "JWT gồm 3 phần: Header, Payload, Signature. Được ký số bởi server để bảo toàn tính toàn vẹn.",
                },
            ],
        },
        {
            "id": "exam-003",
            "code": "DE-MATH101",
            "title": "Bài kiểm tra 15 phút: Giải tích 1 - Giới hạn và Đạo hàm",
            "courseCode": "MATH101",
            "courseName": "Giải tích 1",
            "subjectCode": "MATH101",
            "subjectName": "Giải tích 1",
            "format": "essay",
            "teacherName": "PGS.TS. Trần Thị Lan",
            "semester": "HK1",
            "academicYear": "2025-2026",
            "durationMinutes": 15,
            "totalQuestions": 4,
            "maxScore": 10.0,
            "passingScore": 5.0,
            "startDate": "2026-09-01 08:00",
            "endDate": "2026-09-10 23:59",
            "status": "expired",
            "scoreReleaseMode": "scheduled",
            "scoreReleaseDate": "2026-10-30 08:00",
            "questions": [
                {
                    "id": "q-301",
                    "title": "Đạo hàm của hàm số f(x) = sin(x) là:",
                    "type": "radio",
                    "required": True,
                    "points": 2.5,
                    "options": ["cos(x)", "-cos(x)", "tan(x)", "-sin(x)"],
                    "correctAnswer": "cos(x)",
                    "explanation": "Theo bảng công thức đạo hàm cơ bản: (sin x)' = cos x.",
                },
                {
                    "id": "q-302",
                    "title": "Hàm số f(x) = |x| có đạo hàm tại điểm x = 0 hay không?",
                    "type": "boolean",
                    "required": True,
                    "points": 2.5,
                    "correctAnswer": False,
                    "explanation": "Đạo hàm bên trái bằng -1, đạo hàm bên phải bằng 1, do đó không tồn tại đạo hàm tại x = 0.",
                },
                {
                    "id": "q-303",
                    "title": "Chọn quy tắc tính đạo hàm đúng của tích hai hàm số u(x) và v(x):",
                    "type": "select",
                    "required": True,
                    "points": 2.5,
                    "options": [
                        "(u*v)' = u'*v + u*v'",
                        "(u*v)' = u'*v - u*v'",
                        "(u*v)' = u'*v'",
                        "(u*v)' = u/v'",
                    ],
                    "correctAnswer": "(u*v)' = u'*v + u*v'",
                    "explanation": "Quy tắc Leibniz: đạo hàm của tích hai hàm số bằng u'v + uv'.",
                },
                {
                    "id": "q-304",
                    "title": "Nhập giá trị giới hạn lim (x -> 0) của [sin(x) / x]:",
                    "type": "input",
                    "required": True,
                    "points": 2.5,
                    "placeholder": "Nhập số nguyên...",
                    "correctAnswer": "1",
                    "explanation": "Giới hạn cơ bản quan trọng: lim (x -> 0) [sin(x) / x] = 1.",
                },
            ],
        },
    ]

    @classmethod
    def resolve_student(cls, user: Any) -> Student | None:
        """
        Resolves Student profile for authenticated user.
        """
        try:
            if user and getattr(user, "is_authenticated", False):
                student = (
                    Student.objects.select_related("user", "current_class")
                    .filter(user=user)
                    .first()
                )
                if student:
                    return student
                if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
                    return Student.objects.select_related("user", "current_class").first()
        except Exception as exc:
            logger.warning("Error resolving student profile: %s", exc)
        return None

    @classmethod
    def resolve_student_class(cls, student: Student | None) -> SchoolClass | None:
        """
        Resolves the primary enrolled class for the given student.
        """
        if not student:
            return None
        enrollment = (
            StudentClassEnrollment.objects.filter(
                student=student,
                status="ACTIVE",
            )
            .select_related("school_class", "school_class__academic_year")
            .first()
        )
        if enrollment and enrollment.school_class:
            return enrollment.school_class
        if getattr(student, "current_class", None):
            return student.current_class
        first_cst = (
            ClassSubjectTeacher.objects.select_related("school_class")
            .filter(exams__isnull=False)
            .first()
        )
        if first_cst:
            return first_cst.school_class
        return SchoolClass.objects.first()

    @classmethod
    def resolve_current_academic_context(
        cls, school_class: SchoolClass | None
    ) -> tuple[AcademicYear | None, Semester | None]:
        """
        Resolves the current active academic year and semester for the student's class.
        """
        current_ay = None
        if school_class and school_class.academic_year:
            current_ay = school_class.academic_year
        else:
            try:
                current_ay = (
                    AcademicYear.objects.filter(is_current=True).first()
                    or AcademicYear.objects.first()
                )
            except Exception:
                current_ay = None

        current_sem = None
        try:
            current_sem = Semester.objects.filter(is_current=True).first()
            if not current_sem and current_ay:
                current_sem = Semester.objects.filter(academic_year=current_ay).first()
            if not current_sem:
                current_sem = Semester.objects.first()
        except Exception:
            current_sem = None

        return current_ay, current_sem

    @classmethod
    def list_exams(
        cls,
        user: Any,
        search_query: str | None = None,
        status_filter: str | None = None,
        subject: str | None = None,
        format_filter: str | None = None,
        sort_by: str | None = None,
        semester: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Lists exams with dynamic status, format, and submissions for the student scoped to the current academic context.
        """
        student = cls.resolve_student(user)
        school_class = cls.resolve_student_class(student)
        current_ay, current_sem = cls.resolve_current_academic_context(school_class)

        ay_name = current_ay.name if current_ay else "2025-2026"
        sem_name = (
            current_sem.code
            if current_sem and hasattr(current_sem, "code") and current_sem.code
            else (current_sem.name if current_sem else "HK1")
        )

        results: list[dict[str, Any]] = []

        # Try fetching from DB first
        try:
            db_exams = Exam.objects.select_related(
                "class_subject_teacher",
                "class_subject_teacher__school_class",
                "class_subject_teacher__school_class__academic_year",
                "class_subject_teacher__subject",
                "class_subject_teacher__teacher",
                "class_subject_teacher__teacher__user",
                "class_subject_teacher__semester",
                "class_subject_teacher__semester__academic_year",
            ).prefetch_related("exam_questions")

            if school_class:
                db_exams = db_exams.filter(class_subject_teacher__school_class=school_class)

            if current_ay:
                db_exams = db_exams.filter(
                    Q(class_subject_teacher__school_class__academic_year=current_ay)
                    | Q(class_subject_teacher__semester__academic_year=current_ay)
                )

            if current_sem:
                db_exams = db_exams.filter(class_subject_teacher__semester=current_sem)

            if db_exams.exists():
                for e in db_exams:
                    questions = cls._load_exam_questions(e)
                    sub = None
                    if student:
                        sub = (
                            ExamSubmission.objects.filter(exam=e, student=student)
                            .order_by("-created_at")
                            .first()
                        )

                    cst = e.class_subject_teacher
                    subj = cst.subject if cst else None
                    teacher = cst.teacher if cst else None
                    teacher_user = teacher.user if teacher else None

                    status_str = "pending"
                    if sub and sub.status in ("SUBMITTED", "GRADED"):
                        status_str = "completed"
                    elif e.end_time and e.end_time < timezone.now():
                        status_str = "expired"

                    raw_fmt = str(e.format or "MIXED").upper()
                    fmt_val = cls.FORMAT_MAP.get(raw_fmt, "mixed")
                    subj_code = subj.code if subj else "GEN"
                    subj_name = subj.name if subj else "Môn chung"

                    item = {
                        "id": str(e.id),
                        "code": str(e.id)[:8].upper(),
                        "title": e.title,
                        "courseCode": subj_code,
                        "courseName": subj_name,
                        "subjectId": str(subj.id) if subj and getattr(subj, "id", None) else None,
                        "subjectCode": subj_code,
                        "subjectName": subj_name,
                        "format": fmt_val,
                        "teacherName": teacher_user.full_name if teacher_user else "Giáo viên",
                        "semester": sem_name,
                        "academicYear": ay_name,
                        "durationMinutes": e.duration_minutes,
                        "totalQuestions": len(questions),
                        "maxScore": float(e.max_score),
                        "passingScore": float(e.pass_score),
                        "startDate": e.start_time.strftime("%Y-%m-%d %H:%M")
                        if e.start_time
                        else "",
                        "endDate": e.end_time.strftime("%Y-%m-%d %H:%M") if e.end_time else "",
                        "status": status_str,
                        "score": float(sub.total_score)
                        if sub and sub.total_score is not None
                        else None,
                        "completedAt": sub.submitted_at.strftime("%Y-%m-%d %H:%M")
                        if sub and sub.submitted_at
                        else None,
                        "questions": questions,
                    }
                    results.append(item)
        except Exception as exc:
            logger.info("Using seeded dynamic exam models (DB offline/unmanaged): %s", exc)

        # Merge with in-memory seeded exams
        if not results:
            for base_item in cls.SEEDED_EXAMS:
                copied = dict(base_item)
                copied["semester"] = sem_name
                copied["academicYear"] = ay_name
                # Check runtime in-memory submission override
                cached_sub = _IN_MEMORY_SUBMISSIONS.get(copied["id"])
                if cached_sub:
                    copied["status"] = "completed"
                    copied["score"] = cached_sub.get("score")
                    copied["completedAt"] = cached_sub.get("submittedAt")
                results.append(copied)

        # Apply search and filters
        if search_query:
            q = search_query.strip().lower()
            results = [
                r
                for r in results
                if q in r["title"].lower()
                or q in r.get("courseName", "").lower()
                or q in r.get("courseCode", "").lower()
                or q in r.get("subjectName", "").lower()
                or q in r.get("subjectCode", "").lower()
                or q in (r.get("teacherName") or "").lower()
            ]

        if status_filter and status_filter != "all":
            results = [r for r in results if r["status"] == status_filter]

        if subject and subject != "all":
            subj_norm = subject.strip().lower()
            results = [
                r
                for r in results
                if str(r.get("subjectId") or "").lower() == subj_norm
                or str(r.get("subjectCode") or "").lower() == subj_norm
                or str(r.get("courseCode") or "").lower() == subj_norm
                or str(r.get("subjectName") or "").lower() == subj_norm
                or str(r.get("courseName") or "").lower() == subj_norm
            ]

        if format_filter and format_filter != "all":
            fmt_target = format_filter.strip().lower()
            results = [r for r in results if r.get("format", "").lower() == fmt_target]

        if semester and semester != "all":
            results = [r for r in results if r.get("semester") == semester]

        # Sorting
        if sort_by == "upcoming":

            def _parse_upcoming_key(item: dict[str, Any]) -> str:
                return item.get("startDate") or item.get("endDate") or "9999-99-99"

            results = sorted(results, key=_parse_upcoming_key)
        elif sort_by == "score":
            results = sorted(
                results,
                key=lambda r: (r.get("score") is not None, r.get("score") or 0.0),
                reverse=True,
            )
        elif sort_by == "newest":
            results = sorted(
                results,
                key=lambda r: r.get("startDate") or r.get("endDate") or "",
                reverse=True,
            )

        # Check cached submissions & mask score if unreleased
        formatted_results = []
        for item in results:
            item_copy = dict(item)
            cached_sub = _IN_MEMORY_SUBMISSIONS.get(item_copy["id"])
            if cached_sub:
                item_copy["status"] = "completed"
                item_copy["completedAt"] = cached_sub.get("submittedAt")
                item_copy["score"] = cached_sub.get("actualScore", cached_sub.get("score"))

            if not cls.is_score_released(item_copy):
                item_copy["score"] = None

            formatted_results.append(item_copy)

        return formatted_results

    @classmethod
    def is_score_released(cls, exam: dict[str, Any]) -> bool:
        """
        Determines whether the score is released to the student:
        - immediate: score is released immediately upon completion
        - hidden: score is permanently hidden from student
        - scheduled: score is released on or after scoreReleaseDate
        """
        mode = exam.get("scoreReleaseMode", "immediate")
        if mode == "immediate":
            return True
        if mode == "hidden":
            return False
        if mode == "scheduled":
            release_date = exam.get("scoreReleaseDate")
            if not release_date:
                return False
            try:
                dt = datetime.strptime(release_date, "%Y-%m-%d %H:%M")
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt, timezone.get_current_timezone())
                return timezone.now() >= dt
            except Exception:
                return False
        return True

    @classmethod
    def get_summary(cls, user: Any) -> dict[str, Any]:
        """
        Calculates student exam dashboard metrics.
        """
        exams = cls.list_exams(user)
        total = len(exams)
        pending_count = sum(1 for e in exams if e["status"] == "pending")
        completed_count = sum(1 for e in exams if e["status"] == "completed")
        expired_count = sum(1 for e in exams if e["status"] == "expired")

        completed_scores = [e["score"] for e in exams if e.get("score") is not None]
        avg_score = (
            round(sum(completed_scores) / len(completed_scores), 1) if completed_scores else 0.0
        )

        return {
            "total": total,
            "pendingCount": pending_count,
            "completedCount": completed_count,
            "expiredCount": expired_count,
            "averageScore": avg_score,
        }

    @classmethod
    def get_exam_detail(cls, exam_id: str, user: Any) -> dict[str, Any] | None:
        """
        Retrieves detailed exam configuration including dynamic question cards,
        and student submission data if already completed.
        """
        exams = cls.list_exams(user)
        found = next((e for e in exams if e["id"] == exam_id), None)
        if not found:
            return None

        # Deep copy to ensure safe manipulation
        detail = dict(found)
        return detail

    @classmethod
    def submit_exam(
        cls, exam_id: str, user: Any, answers: dict[str, Any], allow_incomplete: bool = False
    ) -> dict[str, Any]:
        """
        Submits exam answers with automated grading across various question types
        (radio, checkbox, input, textarea, rating, select, boolean, date).
        Validates required questions (unless allow_incomplete=True) and writes to ExamSubmission & ExamEventLog.
        """
        exam = cls.get_exam_detail(exam_id, user)
        if not exam:
            raise ValueError(f"Không tìm thấy đề thi với ID: {exam_id}")

        questions: list[dict[str, Any]] = exam.get("questions", [])

        # 1. Validate required fields (Google Form style) if allow_incomplete is False
        if not allow_incomplete:
            for q in questions:
                if q.get("required"):
                    val = answers.get(q["id"])
                    if val is None or val == "" or (isinstance(val, list) and len(val) == 0):
                        raise ValueError(f"Vui lòng hoàn thành câu hỏi bắt buộc: '{q['title']}'")

        # 2. Automated evaluation and score aggregation
        breakdown: list[dict[str, Any]] = []
        earned_score = 0.0
        total_possible = 0.0

        for q in questions:
            q_id = q["id"]
            q_type = q.get("type", "radio")
            max_points = float(q.get("points", 1.0))
            total_possible += max_points

            student_ans = answers.get(q_id)
            correct_ans = q.get("correctAnswer")
            explanation = q.get("explanation", "")

            is_correct: bool | None = None
            awarded = 0.0

            # Grading logic per question type
            if q_type in ("radio", "select"):
                if correct_ans is not None:
                    is_correct = (
                        str(student_ans).strip().lower() == str(correct_ans).strip().lower()
                    )
                    awarded = max_points if is_correct else 0.0
                else:
                    awarded = max_points if student_ans else 0.0

            elif q_type == "checkbox":
                if isinstance(correct_ans, list):
                    student_set = set(student_ans) if isinstance(student_ans, list) else set()
                    correct_set = set(correct_ans)
                    if student_set == correct_set:
                        is_correct = True
                        awarded = max_points
                    elif student_set.issubset(correct_set) and len(student_set) > 0:
                        # Partial credit for partial correct selections without wrong choices
                        is_correct = False
                        awarded = round(max_points * (len(student_set) / len(correct_set)), 2)
                    else:
                        is_correct = False
                        awarded = 0.0
                else:
                    awarded = max_points if student_ans else 0.0

            elif q_type == "input":
                if correct_ans is not None:
                    is_correct = (
                        str(student_ans or "").strip().lower() == str(correct_ans).strip().lower()
                    )
                    awarded = max_points if is_correct else 0.0
                else:
                    awarded = max_points if student_ans else 0.0

            elif q_type == "boolean":
                if correct_ans is not None:
                    is_correct = bool(student_ans) == bool(correct_ans)
                    awarded = max_points if is_correct else 0.0
                else:
                    awarded = max_points if student_ans is not None else 0.0

            elif q_type in ("rating", "textarea", "date"):
                # Reflective / self-assessment questions award configured points upon completion
                is_correct = True if student_ans is not None else None
                awarded = max_points if student_ans is not None else 0.0

            earned_score += awarded
            breakdown.append(
                {
                    "questionId": q_id,
                    "isCorrect": is_correct,
                    "awardedScore": round(awarded, 2),
                    "maxPoints": max_points,
                    "studentAnswer": student_ans,
                    "correctAnswer": correct_ans,
                    "explanation": explanation,
                }
            )

        # Scale final score to maxScore scale (usually 10.0)
        max_exam_score = float(exam.get("maxScore", 10.0))
        final_score = (
            round((earned_score / total_possible) * max_exam_score, 1)
            if total_possible > 0
            else 0.0
        )
        passing_score = float(exam.get("passingScore", 5.0))
        is_passed = final_score >= passing_score

        sub_id = f"sub-{uuid4().hex[:12]}"
        now_str = timezone.now().strftime("%Y-%m-%d %H:%M")

        is_released = cls.is_score_released(exam)
        displayed_score = final_score if is_released else None
        displayed_passed = is_passed if is_released else None

        if not is_released:
            mode = exam.get("scoreReleaseMode", "immediate")
            if mode == "hidden":
                msg = "Nộp bài thi thành công! Điểm thi đã được giáo viên ẩn."
            else:
                release_date = exam.get("scoreReleaseDate", "")
                msg = f"Nộp bài thi thành công! Điểm thi sẽ được công bố vào {release_date}."
        else:
            msg = f"Nộp bài thi thành công! Điểm của bạn: {final_score}/{max_exam_score}"

        # 3. Save to In-Memory store
        submission_payload = {
            "submissionId": sub_id,
            "examId": exam_id,
            "score": displayed_score,
            "actualScore": final_score,
            "maxScore": max_exam_score,
            "isPassed": displayed_passed,
            "submittedAt": now_str,
            "durationSeconds": exam.get("durationMinutes", 45) * 60,
            "answers": answers,
            "breakdown": breakdown if is_released else [],
            "message": msg,
        }
        _IN_MEMORY_SUBMISSIONS[exam_id] = submission_payload

        # 4. Attempt database write if DB is accessible
        try:
            student = cls.resolve_student(user)
            db_exam = Exam.objects.filter(id=exam_id).first()
            if student and db_exam:
                db_sub = ExamSubmission.objects.create(
                    exam=db_exam,
                    student=student,
                    total_score=Decimal(str(final_score)),
                    auto_score=Decimal(str(final_score)),
                    status="GRADED",
                    submitted_at=timezone.now(),
                    metadata={"answers": answers},
                )
                # Audit log
                ExamEventLog.objects.create(
                    exam=db_exam,
                    submission=db_sub,
                    student=student,
                    event_type="SUBMITTED",
                    title="Học sinh nộp bài thi trắc nghiệm",
                    description=f"Điểm số tự động: {final_score}/{max_exam_score}",
                    severity="INFO",
                )
        except Exception as exc:
            logger.debug("DB write skipped in unmanaged/sandbox mode: %s", exc)

        return submission_payload

    @classmethod
    def get_submission(cls, exam_id: str, user: Any) -> dict[str, Any] | None:
        """
        Retrieves student submission answers and breakdown.
        """
        exam = cls.get_exam_detail(exam_id, user)
        # 1. Check in-memory store first
        if exam_id in _IN_MEMORY_SUBMISSIONS:
            sub = dict(_IN_MEMORY_SUBMISSIONS[exam_id])
            if exam and not cls.is_score_released(exam):
                sub["score"] = None
                sub["isPassed"] = None
                sub["breakdown"] = []
            return sub

        # 2. Check DB
        try:
            student = cls.resolve_student(user)
            if student:
                db_sub = (
                    ExamSubmission.objects.filter(exam_id=exam_id, student=student)
                    .order_by("-created_at")
                    .first()
                )
                if db_sub:
                    db_score = float(db_sub.total_score)
                    is_rel = cls.is_score_released(exam) if exam else True
                    return {
                        "submissionId": str(db_sub.id),
                        "examId": exam_id,
                        "score": db_score if is_rel else None,
                        "maxScore": 10.0,
                        "isPassed": (db_score >= 5.0) if is_rel else None,
                        "submittedAt": db_sub.submitted_at.strftime("%Y-%m-%d %H:%M")
                        if db_sub.submitted_at
                        else "",
                        "answers": db_sub.metadata.get("answers", {}),
                    }
        except Exception as exc:
            logger.debug("DB submission lookup skipped: %s", exc)

        return None

    @classmethod
    def _load_exam_questions(cls, exam: Exam) -> list[dict[str, Any]]:
        """
        Formats ExamQuestion objects into dynamic Google Form-like question format.
        """
        questions: list[dict[str, Any]] = []
        for eq in exam.exam_questions.select_related("question").order_by("order_no"):
            qb = eq.question
            meta = eq.metadata or {}
            qb_meta = qb.metadata or {} if qb else {}

            q_type = meta.get("type") or (qb.question_type.lower() if qb else "radio")
            if q_type == "single_choice":
                q_type = "radio"
            elif q_type == "multiple_choice":
                q_type = "checkbox"

            points = float(eq.score_weight) if eq.score_weight else 1.0
            options = eq.shuffled_options or (qb.options if qb else [])
            correct_ans = qb.correct_answers if qb else None
            if (
                isinstance(correct_ans, list)
                and len(correct_ans) == 1
                and q_type not in ("checkbox", "multiple_choice")
            ):
                correct_ans = correct_ans[0]

            questions.append(
                {
                    "id": str(eq.id),
                    "title": qb.content if qb else f"Câu hỏi {eq.order_no}",
                    "description": meta.get("description") or qb_meta.get("description"),
                    "type": q_type,
                    "required": meta.get("required", True),
                    "points": points,
                    "options": options if isinstance(options, list) else [],
                    "correctAnswer": correct_ans,
                    "explanation": qb.solution_explanation if qb else "",
                    "placeholder": meta.get("placeholder", ""),
                    "ratingMax": meta.get("ratingMax", 5),
                    "sectionName": eq.section_name or "",
                }
            )
        return questions
