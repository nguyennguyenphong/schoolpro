"""
Management command to seed realistic Assignments, Submissions, Rubric evaluations,
and Event Logs for Class 10A1.

Usage:
    python manage.py seed_assignments
"""

from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.academic.models.assignment import (
    Assignment,
    AssignmentEventLog,
    AssignmentSubmission,
)
from apps.core.models.organization import (
    ClassSubjectTeacher,
    SchoolClass,
    StudentClassEnrollment,
)
from apps.core.models.profile import Student, Teacher
from apps.core.models.user import User
from apps.master.models.subject import Subject


class Command(BaseCommand):
    help = "Seeds realistic assignments, student submissions, rubric scores, and event logs for Class 10A1."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Assignments & Submissions (academic.assignments)...")
        )

        with transaction.atomic():
            school_class = (
                SchoolClass.objects.filter(name="10A1").first() or SchoolClass.objects.first()
            )
            if not school_class:
                self.stdout.write(
                    self.style.ERROR("No SchoolClass found. Please seed classes first.")
                )
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
                self.stdout.write(
                    self.style.ERROR(
                        "No ClassSubjectTeacher found. Please seed teachers and subjects first."
                    )
                )
                return

            creator = (
                csts[0].teacher.user
                if csts[0].teacher and csts[0].teacher.user
                else User.objects.first()
            )
            if not creator:
                return

            # Clear existing seeded assignments for this class to keep seeding idempotent
            Assignment.objects.filter(class_subject_teacher__school_class=school_class).delete()

            now = timezone.now()
            today = now.date()

            def pick_cst(idx: int) -> ClassSubjectTeacher:
                return csts[idx % len(csts)]

            # 1. Pending Homework (Due in 2 days, extended once)
            cst0 = pick_cst(0)
            a1 = Assignment.objects.create(
                class_subject_teacher=cst0,
                title="Bài tập chuyên đề: Khảo sát hàm số và ứng dụng đạo hàm",
                description=(
                    "Hoàn thành đầy đủ các bài tự luận từ Bài 1 đến Bài 6 trong phiếu bài tập đính kèm.\n"
                    "- Trình bày rõ ràng các bước lập bảng biến thiên và tìm cực trị.\n"
                    "- Vẽ đồ thị hàm số trên giấy kẻ ô ly hoặc xuất từ phần mềm GeoGebra.\n"
                    "- Nộp bản PDF hoặc ảnh chụp rõ nét theo đúng quy tắc đặt tên tệp."
                ),
                assignment_type="HOMEWORK",
                format="HOMEWORK",
                assigned_date=today - timedelta(days=3),
                due_date=now + timedelta(days=1),
                extended_due_date_1=now + timedelta(days=2, hours=4),
                extension_reason_1="Gia hạn thêm 1 ngày để học sinh hoàn thiện phần vẽ đồ thị GeoGebra.",
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("15.00"),
                allowed_file_types=["pdf", "docx", "jpg", "png"],
                max_file_size_mb=20,
                max_files_count=3,
                file_naming_rule="{class}_{student_name}_KhaoSatHamSo",
                allow_late_submission=True,
                late_penalty_percent=Decimal("10.00"),
                allow_resubmission=True,
                max_resubmission_count=3,
                attachments=[
                    {
                        "name": "Phieu_Bai_Tap_Khao_Sat_Ham_So_Chuyen_De_1.pdf",
                        "size": "1.8 MB",
                        "url": "/files/assignments/phieu-bai-tap-ham-so.pdf",
                    },
                    {
                        "name": "Huong_Dan_Trinh_Bay_Bang_Bien_Thien.docx",
                        "size": "640 KB",
                        "url": "/files/assignments/huong-dan-bang-bien-thien.docx",
                    },
                ],
                rubric=[
                    {
                        "id": "r1",
                        "criterion": "Tập xác định và đạo hàm",
                        "maxPoints": 2.5,
                        "description": "Tìm đúng tập xác định, tính chính xác đạo hàm y' và nghiệm của y' = 0.",
                    },
                    {
                        "id": "r2",
                        "criterion": "Bảng biến thiên và cực trị",
                        "maxPoints": 3.5,
                        "description": "Lập bảng biến thiên đầy đủ các giới hạn và kết luận đúng các điểm cực trị.",
                    },
                    {
                        "id": "r3",
                        "criterion": "Đồ thị và bài toán tương giao",
                        "maxPoints": 4.0,
                        "description": "Vẽ đồ thị chính xác tâm đối xứng và giải biện luận phương trình tiếp tuyến.",
                    },
                ],
                created_by=creator,
            )

            # 2. Pending Project (Due in 5 days)
            cst1 = pick_cst(1)
            Assignment.objects.create(
                class_subject_teacher=cst1,
                title="Dự án nhóm: Thiết kế poster và thuyết trình Bảo vệ môi trường biển",
                description=(
                    "Thực hiện bộ hồ sơ dự án học tập gồm:\n"
                    "1. Slide thuyết trình (định dạng PDF hoặc PPTX tối đa 15 trang).\n"
                    "2. Báo cáo tổng hợp số liệu thực trạng và giải pháp giảm thiểu rác thải nhựa.\n"
                    "3. Phân công nhiệm vụ từng thành viên trong nhóm."
                ),
                assignment_type="PROJECT",
                format="PROJECT",
                assigned_date=today - timedelta(days=5),
                due_date=now + timedelta(days=5),
                max_score=Decimal("10.00"),
                pass_score=Decimal("6.00"),
                weight_percent=Decimal("25.00"),
                allowed_file_types=["pdf", "pptx", "docx", "zip"],
                max_file_size_mb=50,
                max_files_count=5,
                file_naming_rule="{class}_{student_name}_DuAnMoiTruong",
                allow_late_submission=False,
                late_penalty_percent=Decimal("0.00"),
                allow_resubmission=True,
                max_resubmission_count=5,
                attachments=[
                    {
                        "name": "De_Cuong_Du_An_Bao_Ve_Moi_Truong_Bien.pdf",
                        "size": "2.4 MB",
                        "url": "/files/assignments/de-cuong-du-an.pdf",
                    }
                ],
                rubric=[
                    {
                        "id": "p1",
                        "criterion": "Nội dung khoa học và số liệu dẫn chứng",
                        "maxPoints": 4.0,
                        "description": "Số liệu cập nhật, trích dẫn nguồn uy tín, phân tích nguyên nhân sâu sắc.",
                    },
                    {
                        "id": "p2",
                        "criterion": "Thiết kế trực quan & sáng tạo",
                        "maxPoints": 3.0,
                        "description": "Bố cục slide/poster hài hòa, hình ảnh sắc nét, thông điệp rõ ràng.",
                    },
                    {
                        "id": "p3",
                        "criterion": "Tính khả thi của giải pháp đề xuất",
                        "maxPoints": 3.0,
                        "description": "Giải pháp thực tế, áp dụng được tại trường học và địa phương.",
                    },
                ],
                created_by=creator,
            )

            # 3. Submitted Essay (Waiting for teacher grading, still within deadline so student can resubmit)
            cst2 = pick_cst(2)
            a3 = Assignment.objects.create(
                class_subject_teacher=cst2,
                title="Bài viết nghị luận xã hội: Trách nhiệm của thế hệ trẻ trong kỷ nguyên số",
                description=(
                    "Viết bài văn nghị luận xã hội (khoảng 600 - 800 chữ) trình bày suy nghĩ của anh/chị "
                    "về vai trò làm chủ công nghệ và giữ gìn bản sắc văn hóa dân tộc của học sinh hiện nay."
                ),
                assignment_type="ESSAY",
                format="ESSAY",
                assigned_date=today - timedelta(days=6),
                due_date=now + timedelta(days=1),
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("20.00"),
                allowed_file_types=["pdf", "docx"],
                max_file_size_mb=15,
                max_files_count=2,
                file_naming_rule="{class}_{student_name}_NghiLuanXaHoi",
                allow_late_submission=True,
                late_penalty_percent=Decimal("10.00"),
                allow_resubmission=True,
                max_resubmission_count=3,
                attachments=[
                    {
                        "name": "Goi_Y_Dan_Y_Nghi_Luan_Xa_Hoi_Ky_Nguyen_So.pdf",
                        "size": "920 KB",
                        "url": "/files/assignments/dan-y-nghi-luan.pdf",
                    }
                ],
                created_by=creator,
            )

            # 4. Graded Homework with Rubric Scores & Solution Attachments
            cst3 = pick_cst(3)
            a4 = Assignment.objects.create(
                class_subject_teacher=cst3,
                title="Đề cương ôn tập kiểm tra định kỳ: Dao động cơ và Sóng cơ học",
                description=(
                    "Giải chi tiết 20 câu trắc nghiệm định lượng và 3 bài toán tự luận tổng hợp "
                    "về con lắc lò xo, tổng hợp dao động điều hòa và giao thoa sóng mặt nước."
                ),
                assignment_type="REVISION",
                format="QUIZ",
                assigned_date=today - timedelta(days=12),
                due_date=now - timedelta(days=5),
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("15.00"),
                allowed_file_types=["pdf", "docx", "jpg", "png"],
                max_file_size_mb=25,
                max_files_count=4,
                file_naming_rule="{class}_{student_name}_OnTapDaoDongCo",
                allow_late_submission=True,
                late_penalty_percent=Decimal("10.00"),
                allow_resubmission=False,
                max_resubmission_count=1,
                attachments=[
                    {
                        "name": "De_Cuong_Dao_Dong_Va_Song_Co_Hoc.pdf",
                        "size": "2.1 MB",
                        "url": "/files/assignments/de-cuong-vat-ly.pdf",
                    }
                ],
                rubric=[
                    {
                        "id": "v1",
                        "criterion": "Phần trắc nghiệm định lượng (20 câu)",
                        "maxPoints": 5.0,
                        "description": "Mỗi câu trả lời đúng và có giải thích công thức ngắn gọn đạt 0.25 điểm.",
                    },
                    {
                        "id": "v2",
                        "criterion": "Bài toán năng lượng con lắc lò xo",
                        "maxPoints": 2.5,
                        "description": "Biến đổi đúng hệ thức độc lập thời gian và tính chính xác vận tốc cực đại.",
                    },
                    {
                        "id": "v3",
                        "criterion": "Bài toán cực đại giao thoa sóng",
                        "maxPoints": 2.5,
                        "description": "Xác định đúng số đường hypebol cực đại và cực tiểu trên đoạn thẳng nối hai nguồn.",
                    },
                ],
                solution_attachments=[
                    {
                        "name": "Dap_An_Chi_Tiet_Va_Thang_Diem_Dao_Dong_Co.pdf",
                        "size": "1.6 MB",
                        "url": "/files/solutions/dap-an-dao-dong-co.pdf",
                    }
                ],
                solution_published_at=now - timedelta(days=3),
                created_by=creator,
            )

            # 5. Overdue Assignment (Not submitted, expired -> must wait for teacher extension)
            cst4 = pick_cst(4)
            Assignment.objects.create(
                class_subject_teacher=cst4,
                title="Bài tập thực hành: Phân tích cấu trúc ngữ pháp Academic Reading Unit 4",
                description=(
                    "Hoàn thành bảng phân tích từ vựng học thuật (Collocations & Phrasal Verbs) "
                    "và trả lời câu hỏi đọc hiểu Reading Passage 2 trong tài liệu đính kèm."
                ),
                assignment_type="HOMEWORK",
                format="HOMEWORK",
                assigned_date=today - timedelta(days=8),
                due_date=now - timedelta(days=1, hours=6),
                max_score=Decimal("10.00"),
                pass_score=Decimal("5.00"),
                weight_percent=Decimal("10.00"),
                allowed_file_types=["pdf", "docx", "xlsx"],
                max_file_size_mb=15,
                max_files_count=2,
                file_naming_rule="{class}_{student_name}_ReadingUnit4",
                allow_late_submission=False,
                late_penalty_percent=Decimal("15.00"),
                allow_resubmission=True,
                max_resubmission_count=2,
                attachments=[
                    {
                        "name": "Academic_Reading_Unit_4_Worksheet.pdf",
                        "size": "1.5 MB",
                        "url": "/files/assignments/reading-unit-4.pdf",
                    }
                ],
                created_by=creator,
            )

            # Seed creation & extension logs for a1
            first_student = students[0]
            AssignmentEventLog.objects.create(
                assignment=a1,
                student=first_student,
                actor=cst0.teacher.user if cst0.teacher else creator,
                event_type="CREATED",
                title="Giáo viên giao bài tập mới",
                description="Đã phát hành đề bài và phiếu hướng dẫn làm bài.",
            )
            AssignmentEventLog.objects.create(
                assignment=a1,
                student=first_student,
                actor=cst0.teacher.user if cst0.teacher else creator,
                event_type="EXTENDED_1",
                title="Gia hạn thời hạn nộp bài lần 1",
                description="Gia hạn thêm 1 ngày để học sinh hoàn thiện phần vẽ đồ thị GeoGebra.",
            )

            # Seed submissions for all active students in the class for a3 and a4
            for stu in students:
                stu_name = stu.user.full_name if stu.user else "HocSinh"
                sub3 = AssignmentSubmission.objects.create(
                    assignment=a3,
                    student=stu,
                    attempt_number=1,
                    submission_status="SUBMITTED",
                    status="SUBMITTED",
                    submitted_at=now - timedelta(hours=14),
                    is_late=False,
                    late_minutes=0,
                    content_text=(
                        "Em xin gửi bài làm nghị luận xã hội về trách nhiệm của người trẻ trong kỷ nguyên số. "
                        "Bài viết gồm 3 phần: Mở bài, Thân bài (4 luận điểm chính kèm dẫn chứng thực tiễn) và Kết bài."
                    ),
                    attachments=[
                        {
                            "id": "sub-file-301",
                            "name": f"{school_class.name}_{stu_name}_NghiLuanXaHoi.pdf",
                            "size": "1.1 MB",
                            "sizeBytes": 1153433,
                            "type": "pdf",
                            "url": "/files/submissions/bai-lam-nghi-luan.pdf",
                            "uploadedAt": (now - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"),
                        }
                    ],
                )
                AssignmentEventLog.objects.create(
                    assignment=a3,
                    submission=sub3,
                    student=stu,
                    actor=stu.user,
                    event_type="SUBMITTED",
                    title="Học sinh đã nộp bài làm (Lần 1)",
                    description="Đã tải lên 1 tệp đính kèm đúng thời hạn quy định.",
                )

                sub4 = AssignmentSubmission.objects.create(
                    assignment=a4,
                    student=stu,
                    attempt_number=1,
                    submission_status="GRADED",
                    status="GRADED",
                    submitted_at=now - timedelta(days=6),
                    is_late=False,
                    late_minutes=0,
                    raw_score=Decimal("9.00"),
                    score=Decimal("9.00"),
                    final_score=Decimal("9.00"),
                    rubric_scores={
                        "v1": {
                            "earnedPoints": 4.75,
                            "comment": "Đúng 19/20 câu, nhầm đơn vị đổi từ cm sang m ở câu 17.",
                        },
                        "v2": {
                            "earnedPoints": 2.5,
                            "comment": "Lời giải chặt chẽ, trình bày rõ ràng.",
                        },
                        "v3": {
                            "earnedPoints": 1.75,
                            "comment": "Tìm đúng điều kiện k nhưng kết luận dư 2 điểm ở hai nguồn.",
                        },
                    },
                    feedback=(
                        "Bài làm rất tốt, nắm vững bản chất vật lý và trình bày khoa học. "
                        "Em lưu ý không lấy dấu bằng tại vị trí hai nguồn S1, S2 khi đếm cực đại giao thoa nhé!"
                    ),
                    graded_by=cst3.teacher.user if cst3.teacher else creator,
                    graded_at=now - timedelta(days=3),
                    attachments=[
                        {
                            "id": "sub-file-401",
                            "name": f"{school_class.name}_{stu_name}_OnTapDaoDongCo.pdf",
                            "size": "2.3 MB",
                            "sizeBytes": 2411724,
                            "type": "pdf",
                            "url": "/files/submissions/bai-giai-vat-ly.pdf",
                            "uploadedAt": (now - timedelta(days=6)).strftime("%Y-%m-%d %H:%M"),
                        }
                    ],
                )
                AssignmentEventLog.objects.create(
                    assignment=a4,
                    submission=sub4,
                    student=stu,
                    actor=cst3.teacher.user if cst3.teacher else creator,
                    event_type="GRADED",
                    title="Giáo viên đã chấm điểm và công bố đáp án mẫu",
                    description="Điểm tổng kết: 9.0/10.0. Đã đính kèm bảng chấm tiêu chí Rubric.",
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"✔ Seeded 5 assignments and submissions for {len(students)} students in Class {school_class.name}."
                )
            )
