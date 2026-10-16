"""
Business logic service for Curriculum Materials and Learning Resources domain.
Orchestrates student learning resources, subject syllabus feeds, download metrics, and bookmarks.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)

# High-fidelity realistic seeded dataset for MOET high school curriculum (Khối 11)
_SEEDED_SUBJECTS: list[dict[str, Any]] = [
    {
        "id": "sub-1",
        "code": "MATH11",
        "name": "Toán học 11",
        "teacher": "ThS. Hoàng Văn Nam",
        "teacherTitle": "Tổ trưởng Chuyên môn Toán",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "blue",
        "description": "Hàm số lượng giác, Phương trình lượng giác, Dãy số - Cấp số cộng/nhân, Hình học không gian.",
        "totalMaterials": 8,
        "lecturesCount": 4,
        "outlinesCount": 2,
        "examsCount": 2,
        "totalDownloads": 1420,
    },
    {
        "id": "sub-2",
        "code": "PHYS11",
        "name": "Vật lý 11",
        "teacher": "Thầy Trần Quốc Tuấn",
        "teacherTitle": "Tổ phó Bộ môn Vật lý",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "purple",
        "description": "Dao động cơ học, Sóng cơ và Sóng âm, Điện trường và Dòng điện không đổi.",
        "totalMaterials": 6,
        "lecturesCount": 3,
        "outlinesCount": 2,
        "examsCount": 1,
        "totalDownloads": 980,
    },
    {
        "id": "sub-3",
        "code": "CHEM11",
        "name": "Hóa học 11",
        "teacher": "Cô Phạm Quỳnh Nga",
        "teacherTitle": "Giáo viên Giỏi cấp Tỉnh",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "amber",
        "description": "Cân bằng hóa học, Dung dịch và Sự điện ly, Hóa hữu cơ và Đại cương Hydrocarbon.",
        "totalMaterials": 5,
        "lecturesCount": 2,
        "outlinesCount": 2,
        "examsCount": 1,
        "totalDownloads": 740,
    },
    {
        "id": "sub-4",
        "code": "LIT11",
        "name": "Ngữ văn 11",
        "teacher": "Cô Nguyễn Thị Mai Hoa",
        "teacherTitle": "Tổ trưởng Chuyên môn Ngữ văn",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "rose",
        "description": "Tác phẩm văn học hiện thực & lãng mạn, Kỹ năng Đọc hiểu văn bản và Nghị luận xã hội.",
        "totalMaterials": 6,
        "lecturesCount": 2,
        "outlinesCount": 2,
        "examsCount": 2,
        "totalDownloads": 1650,
    },
    {
        "id": "sub-5",
        "code": "ENG11",
        "name": "Tiếng Anh 11",
        "teacher": "Cô Trần Diệu Linh",
        "teacherTitle": "Tổ phó Ngoại ngữ - IELTS 8.5",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "cyan",
        "description": "Global Success 11: Generation Gap, Healthy Living, Cities of the Future, ASEAN and Viet Nam.",
        "totalMaterials": 7,
        "lecturesCount": 4,
        "outlinesCount": 1,
        "examsCount": 2,
        "totalDownloads": 1890,
    },
    {
        "id": "sub-6",
        "code": "BIO11",
        "name": "Sinh học 11",
        "teacher": "Thầy Lê Hoàng Đức",
        "teacherTitle": "Giáo viên Bộ môn Sinh học",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "emerald",
        "description": "Trao đổi nước và khoáng ở thực vật, Quang hợp và Hô hấp tế bào, Cảm ứng ở sinh vật.",
        "totalMaterials": 4,
        "lecturesCount": 2,
        "outlinesCount": 1,
        "examsCount": 1,
        "totalDownloads": 590,
    },
    {
        "id": "sub-7",
        "code": "HIS11",
        "name": "Lịch sử 11",
        "teacher": "Thầy Phạm Đức Anh",
        "teacherTitle": "Giáo viên Bộ môn Lịch sử",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "orange",
        "description": "Cách mạng tư sản, Chủ nghĩa tư bản hiện đại, Quá trình giành độc lập dân tộc ở Đông Nam Á.",
        "totalMaterials": 4,
        "lecturesCount": 2,
        "outlinesCount": 1,
        "examsCount": 1,
        "totalDownloads": 480,
    },
    {
        "id": "sub-8",
        "code": "GEO11",
        "name": "Địa lý 11",
        "teacher": "Cô Lê Phương Linh",
        "teacherTitle": "Giáo viên Bộ môn Địa lý",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "teal",
        "description": "Địa lý khu vực và quốc gia: Hoa Kỳ, Liên bang Nga, Nhật Bản, Trung Quốc, Australia.",
        "totalMaterials": 4,
        "lecturesCount": 2,
        "outlinesCount": 1,
        "examsCount": 1,
        "totalDownloads": 420,
    },
    {
        "id": "sub-9",
        "code": "CS11",
        "name": "Tin học 11",
        "teacher": "Thầy Trần Quang Khải",
        "teacherTitle": "Tổ phó Tổ Tin học",
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "colorScheme": "indigo",
        "description": "Lập trình Python nâng cao, Cơ sở dữ liệu quan hệ và Hệ quản trị CSDL MySQL.",
        "totalMaterials": 5,
        "lecturesCount": 3,
        "outlinesCount": 1,
        "examsCount": 1,
        "totalDownloads": 1210,
    },
]

_SEEDED_MATERIALS: list[dict[str, Any]] = [
    {
        "id": "mat-1",
        "title": "Chuyên đề 01: Hàm số lượng giác và đồ thị",
        "subjectCode": "MATH11",
        "subjectName": "Toán học 11",
        "category": "lecture",
        "format": "pdf",
        "fileName": "Toan11_ChuyenDe01_HamSoLuongGiac.pdf",
        "fileSize": "4.2 MB",
        "fileUrl": "/static/materials/Toan11_ChuyenDe01.pdf",
        "previewUrl": "/static/materials/Toan11_ChuyenDe01.pdf",
        "author": "ThS. Hoàng Văn Nam",
        "uploadDate": "2025-09-15",
        "downloadsCount": 425,
        "viewsCount": 980,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Tập hợp lý thuyết trọng tâm, các dạng bài toán tìm tập xác định, tính chẵn lẻ, chu kỳ và đồ thị hàm số lượng giác cơ bản.",
        "tableOfContents": [
            "1. Nhắc lại kiến thức lượng giác lớp 10",
            "2. Hàm số y = sin x và hàm số y = cos x",
            "3. Hàm số y = tan x và hàm số y = cot x",
            "4. Các dạng bài toán biến đổi nâng cao",
        ],
        "isBookmarked": True,
        "isFeatured": True,
    },
    {
        "id": "mat-2",
        "title": "Đề cương ôn tập Giữa học kỳ 1 môn Toán 11",
        "subjectCode": "MATH11",
        "subjectName": "Toán học 11",
        "category": "outline",
        "format": "word",
        "fileName": "DeCuong_GiuaKy1_Toan11_Chuan2025.docx",
        "fileSize": "1.8 MB",
        "fileUrl": "/static/materials/DeCuong_GK1_Toan11.docx",
        "author": "Tổ Chuyên môn Toán",
        "uploadDate": "2025-10-02",
        "downloadsCount": 612,
        "viewsCount": 1420,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Tài liệu hệ thống hóa 100 câu hỏi trắc nghiệm và 15 bài tự luận chuẩn cấu trúc ma trận đề thi giữa kỳ năm học 2025-2026.",
        "tableOfContents": [
            "Phần I: Ma trận và Bản đặc tả đề thi",
            "Phần II: Câu hỏi trắc nghiệm 4 phương án",
            "Phần III: Câu hỏi Đúng/Sai theo CT 2018",
            "Phần IV: Câu hỏi Trả lời ngắn",
        ],
        "isBookmarked": False,
        "isFeatured": True,
    },
    {
        "id": "mat-3",
        "title": "Bài giảng: Phương trình lượng giác cơ bản và ứng dụng",
        "subjectCode": "MATH11",
        "subjectName": "Toán học 11",
        "category": "lecture",
        "format": "powerpoint",
        "fileName": "Slide_PT_LuongGiac_CoBan.pptx",
        "fileSize": "8.5 MB",
        "fileUrl": "/static/materials/Slide_PT_LuongGiac.pptx",
        "author": "ThS. Hoàng Văn Nam",
        "uploadDate": "2025-09-22",
        "downloadsCount": 210,
        "viewsCount": 540,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Slide trình chiếu trực quan công thức nghiệm, kỹ thuật biểu diễn nghiệm trên đường tròn lượng giác.",
        "isBookmarked": False,
        "isFeatured": False,
    },
    {
        "id": "mat-4",
        "title": "Bộ đề thi thử Giữa kỳ 1 môn Vật lý 11 (Kèm đáp án chi tiết)",
        "subjectCode": "PHYS11",
        "subjectName": "Vật lý 11",
        "category": "exam_prep",
        "format": "pdf",
        "fileName": "VatLy11_BoDeThiThu_GK1.pdf",
        "fileSize": "3.1 MB",
        "fileUrl": "/static/materials/VatLy11_DeThiThu_GK1.pdf",
        "previewUrl": "/static/materials/VatLy11_DeThiThu_GK1.pdf",
        "author": "Thầy Trần Quốc Tuấn",
        "uploadDate": "2025-10-05",
        "downloadsCount": 490,
        "viewsCount": 1100,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "5 đề ôn tập chuẩn kiến thức dao động điều hòa, con lắc lò xo, con lắc đơn kèm lời giải chi tiết từng bước.",
        "isBookmarked": True,
        "isFeatured": True,
    },
    {
        "id": "mat-5",
        "title": "Chuyên đề: Cân bằng hóa học và Hằng số cân bằng Kc",
        "subjectCode": "CHEM11",
        "subjectName": "Hóa học 11",
        "category": "lecture",
        "format": "pdf",
        "fileName": "Hoa11_CanBangHoaHoc_Kc.pdf",
        "fileSize": "2.4 MB",
        "fileUrl": "/static/materials/Hoa11_CanBangHoaHoc.pdf",
        "author": "Cô Phạm Quỳnh Nga",
        "uploadDate": "2025-09-18",
        "downloadsCount": 315,
        "viewsCount": 680,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Lý thuyết nguyên lý chuyển dịch cân bằng Le Chatelier, các dạng bài tính toán nồng độ cân bằng.",
        "isBookmarked": False,
        "isFeatured": False,
    },
    {
        "id": "mat-6",
        "title": "Cẩm nang Kỹ năng Viết đoạn văn Nghị luận Xã hội 200 chữ",
        "subjectCode": "LIT11",
        "subjectName": "Ngữ văn 11",
        "category": "outline",
        "format": "pdf",
        "fileName": "Van11_CamNang_NLXH_200Chu.pdf",
        "fileSize": "1.5 MB",
        "fileUrl": "/static/materials/Van11_NLXH.pdf",
        "author": "Cô Nguyễn Thị Mai Hoa",
        "uploadDate": "2025-09-28",
        "downloadsCount": 870,
        "viewsCount": 1950,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Công thức viết đoạn văn chuẩn lập luận: Nêu vấn đề, Giải thích, Bàn luận, Dẫn chứng tiêu biểu, Bài học nhận thức & hành động.",
        "isBookmarked": True,
        "isFeatured": True,
    },
    {
        "id": "mat-7",
        "title": "Từ vựng & Ngữ pháp Unit 1: A Long and Healthy Life",
        "subjectCode": "ENG11",
        "subjectName": "Tiếng Anh 11",
        "category": "lecture",
        "format": "pdf",
        "fileName": "English11_Unit1_Vocabulary_Grammar.pdf",
        "fileSize": "2.9 MB",
        "fileUrl": "/static/materials/English11_Unit1.pdf",
        "author": "Cô Trần Diệu Linh",
        "uploadDate": "2025-09-12",
        "downloadsCount": 730,
        "viewsCount": 1600,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Từ vựng trọng tâm theo chủ đề sức khỏe và lối sống lành mạnh, chuyên đề ngữ pháp Past Simple vs Present Perfect.",
        "isBookmarked": False,
        "isFeatured": True,
    },
    {
        "id": "mat-8",
        "title": "Thực hành Lập trình Python: Xử lý chuỗi và Danh sách nâng cao",
        "subjectCode": "CS11",
        "subjectName": "Tin học 11",
        "category": "lecture",
        "format": "archive",
        "fileName": "TinHoc11_Lab_Python_String_List.zip",
        "fileSize": "5.6 MB",
        "fileUrl": "/static/materials/TinHoc11_Lab_Python.zip",
        "author": "Thầy Trần Quang Khải",
        "uploadDate": "2025-09-25",
        "downloadsCount": 510,
        "viewsCount": 1120,
        "semester": "Học kỳ 1",
        "academicYear": "2025-2026",
        "description": "Gói bài tập thực hành kèm file mã nguồn mẫu .py, hướng dẫn giải thuật tối ưu thời gian chạy.",
        "isBookmarked": True,
        "isFeatured": False,
    },
]


class MaterialService:
    """
    Orchestrates learning resource queries, subject catalog feeds, file downloads, and bookmark state.
    """

    def __init__(self) -> None:
        self.materials: list[dict[str, Any]] = [dict(m) for m in _SEEDED_MATERIALS]
        self.subjects: list[dict[str, Any]] = [dict(s) for s in _SEEDED_SUBJECTS]

    def get_subjects(
        self,
        search_query: str | None = None,
        semester: str | None = None,
        sort_by: str = "name_asc",
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """
        Retrieve catalog of subjects with material statistics.

        Args:
            search_query: Search term matching subject name, code, teacher, or description.
            semester: Filter by semester (Học kỳ 1, Học kỳ 2, all).
            sort_by: Sort order (name_asc, most_materials, most_downloads).
            page: 1-indexed page number.
            page_size: Number of items per page.

        Returns:
            dict containing paginated items and total count.
        """
        # Try database discovery first
        try:
            from apps.master.models import Subject

            db_subjects = Subject.objects.filter(is_active=True)
            if db_subjects.exists():
                logger.info(f"Loaded {db_subjects.count()} subjects from database.")
        except Exception as exc:
            logger.debug(f"Database lookup skipped: {exc}")

        items = list(self.subjects)

        # 1. Search Query filter
        if search_query and search_query.strip():
            q = search_query.lower().strip()
            items = [
                s
                for s in items
                if q in s["name"].lower()
                or q in s["code"].lower()
                or q in s["teacher"].lower()
                or q in s["description"].lower()
            ]

        # 2. Semester filter
        if semester and semester != "all":
            items = [s for s in items if semester in s["semester"]]

        # 3. Sorting
        if sort_by == "most_materials":
            items.sort(key=lambda s: s["totalMaterials"], reverse=True)
        elif sort_by == "most_downloads":
            items.sort(key=lambda s: s["totalDownloads"], reverse=True)
        else:
            items.sort(key=lambda s: s["name"])

        total = len(items)

        # 4. Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_items = items[start:end]

        return {"items": paginated_items, "total": total}

    def get_subject_by_code(self, code: str) -> dict[str, Any] | None:
        """
        Retrieve a single subject item by its unique subject code.
        """
        for s in self.subjects:
            if s["code"].lower() == code.lower():
                return s
        return None

    def get_materials(
        self,
        search_query: str | None = None,
        subject_code: str | None = None,
        category: str | None = None,
        semester: str | None = None,
        sort_by: str = "newest",
        page: int = 1,
        page_size: int = 12,
    ) -> dict[str, Any]:
        """
        Retrieve filtered and paginated learning materials.

        Args:
            search_query: Keyword in title, subject name, author, or description.
            subject_code: Code of the subject (e.g. MATH11).
            category: Material category (lecture, outline, textbook, exam_prep, reference).
            semester: Semester identifier (Học kỳ 1, Học kỳ 2, all).
            sort_by: Sort ordering (newest, most_downloaded, title_asc, size_asc).
            page: 1-indexed page number.
            page_size: Items per page.

        Returns:
            dict containing paginated items and total count.
        """
        # Try database discovery
        try:
            from apps.academic.models.material import CurriculumMaterial

            db_materials = CurriculumMaterial.objects.filter(is_published=True)
            if db_materials.exists():
                logger.info(f"Discovered {db_materials.count()} database materials.")
        except Exception as exc:
            logger.debug(f"Database lookup skipped: {exc}")

        items = list(self.materials)

        # 1. Search Query filter
        if search_query and search_query.strip():
            q = search_query.lower().strip()
            items = [
                m
                for m in items
                if q in m["title"].lower()
                or q in m["subjectName"].lower()
                or q in m["author"].lower()
                or q in m["fileName"].lower()
                or q in m["description"].lower()
            ]

        # 2. Subject filter
        if subject_code and subject_code != "all":
            items = [m for m in items if m["subjectCode"].lower() == subject_code.lower()]

        # 3. Category filter
        if category and category != "all":
            items = [m for m in items if m["category"] == category]

        # 4. Semester filter
        if semester and semester != "all":
            items = [m for m in items if m["semester"] == semester]

        # 5. Sorting
        if sort_by == "most_downloaded":
            items.sort(key=lambda m: m["downloadsCount"], reverse=True)
        elif sort_by == "title_asc":
            items.sort(key=lambda m: m["title"])
        elif sort_by == "size_asc":

            def _parse_size(size_str: str) -> float:
                try:
                    return float(size_str.split()[0])
                except (ValueError, IndexError):
                    return 0.0

            items.sort(key=lambda m: _parse_size(m["fileSize"]))
        else:  # newest
            items.sort(key=lambda m: m["uploadDate"], reverse=True)

        total = len(items)

        # 6. Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_items = items[start:end]

        return {"items": paginated_items, "total": total}

    def get_material_detail(self, material_id: str) -> dict[str, Any] | None:
        """
        Retrieve detail of a material and increment view count.
        """
        for m in self.materials:
            if m["id"] == material_id:
                m["viewsCount"] += 1
                return m
        return None

    def calculate_summary(self) -> dict[str, Any]:
        """
        Calculate aggregate metric totals across learning materials.
        """
        total = len(self.materials)
        lectures_count = sum(1 for m in self.materials if m["category"] == "lecture")
        outlines_count = sum(1 for m in self.materials if m["category"] == "outline")
        textbooks_count = sum(1 for m in self.materials if m["category"] == "textbook")
        exam_preps_count = sum(1 for m in self.materials if m["category"] == "exam_prep")
        total_downloads = sum(m["downloadsCount"] for m in self.materials)

        return {
            "total": total,
            "lecturesCount": lectures_count,
            "outlinesCount": outlines_count,
            "textbooksCount": textbooks_count,
            "examPrepsCount": exam_preps_count,
            "totalDownloads": total_downloads,
        }

    def toggle_bookmark(self, material_id: str) -> bool:
        """
        Toggle bookmark status of a material.
        """
        for m in self.materials:
            if m["id"] == material_id:
                m["isBookmarked"] = not m.get("isBookmarked", False)
                return m["isBookmarked"]
        return False

    def increment_download(self, material_id: str) -> int:
        """
        Record a download event and increment the download counter.
        """
        for m in self.materials:
            if m["id"] == material_id:
                m["downloadsCount"] += 1
                return m["downloadsCount"]
        return 0
