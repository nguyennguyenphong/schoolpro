"""
Management command to seed System Modules.
Table: "sys"."modules"

Usage:
    python manage.py seed_modules
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.system.models import Module
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds System Modules and RoleModule dashboard cards."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding System Modules (sys.modules & role_modules)...")
        )

        modules_data = [
            # =================================================================
            # 1. NHÓM HỌC SINH (Student Dashboard & Học vụ hằng ngày)
            # =================================================================
            {
                "name": "Thời khóa biểu",
                "short_name": "Thời khóa biểu",
                "description": "Tra cứu lịch học tuần, ca sáng/chiều, phòng học và giảng viên",
                "icon": "calendar",
                "route": "/student/timetable",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#10B981",
                "default_badge": "Hôm nay",
                "order": 1,
            },
            {
                "name": "Xin nghỉ phép",
                "short_name": "Xin nghỉ phép",
                "description": "Tạo đơn xin nghỉ phép trực tuyến, gửi trực tiếp tới giáo viên chủ nhiệm/giáo viên bộ môn duyệt",
                "icon": "leave",
                "route": "/student/leave-requests",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#06B6D4",
                "default_badge": "Gửi đơn",
                "order": 2,
            },
            {
                "name": "Điểm danh chuyên cần",
                "short_name": "Điểm danh",
                "description": "Theo dõi tình trạng chuyên cần, vắng có phép, vắng không phép",
                "icon": "check",
                "route": "/student/attendance",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#14B8A6",
                "default_badge": "Điểm danh",
                "order": 3,
            },
            {
                "name": "Bài tập & Đồ án",
                "short_name": "Bài tập",
                "description": "Danh sách bài tập về nhà, nộp bài trực tuyến và nhận xét GV",
                "icon": "edit",
                "route": "/student/assignments",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#E11D48",
                "default_badge": "Bài tập",
                "order": 4,
            },
            {
                "name": "Khảo thí Trắc nghiệm",
                "short_name": "Thi online",
                "description": "Làm bài kiểm tra trực tuyến, trắc nghiệm tính giờ",
                "icon": "check-circle",
                "route": "/student/online-test",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#F43F5E",
                "default_badge": "Online",
                "order": 5,
            },
            {
                "name": "Bài kiểm tra & Phòng thi",
                "short_name": "Kiểm tra",
                "description": "Lịch thi định kỳ, trắc nghiệm trực tuyến, số báo danh",
                "icon": "file",
                "route": "/student/exams",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#DB2777",
                "default_badge": "Sắp tới",
                "order": 6,
            },
            {
                "name": "Bảng điểm & Học bạ",
                "short_name": "Bảng điểm",
                "description": "Xem điểm thường xuyên, giữa kỳ, cuối kỳ và xếp loại học lực",
                "icon": "chart",
                "route": "/student/gradebook",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#7C3AED",
                "default_badge": "Điểm số",
                "order": 7,
            },
            {
                "name": "Tài liệu môn học",
                "short_name": "Tài liệu",
                "description": "Giáo trình điện tử, slide bài giảng, đề cương ôn tập tải về",
                "icon": "download",
                "route": "/student/materials",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#9333EA",
                "default_badge": "18",
                "order": 8,
            },
            {
                "name": "Tổ hợp môn GDPT & THPT",
                "short_name": "Tổ hợp môn",
                "description": "Thông tin ban học tập, cụm chuyên đề lựa chọn theo chương trình mới",
                "icon": "layers",
                "route": "/student/track",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#6366F1",
                "default_badge": "Tổ hợp",
                "order": 9,
            },
            {
                "name": "Thông báo nhà trường",
                "short_name": "Thông báo",
                "description": "Tin tức chính thức từ BGH, Đoàn trường và Giáo viên chủ nhiệm",
                "icon": "info",
                "route": "/student/notices",
                "module_type": "CARD",
                "category": "COMMUNICATION",
                "default_color": "#3B82F6",
                "default_badge": "10",
                "order": 10,
            },
            {
                "name": "Sổ liên lạc điện tử",
                "short_name": "Sổ liên lạc",
                "description": "Xem phiếu nhận xét định kỳ từ GVCN và ký xác nhận",
                "icon": "book",
                "route": "/student/contact-book",
                "module_type": "CARD",
                "category": "COMMUNICATION",
                "default_color": "#0284C7",
                "default_badge": "Mới",
                "order": 11,
            },
            {
                "name": "Nhắc nhở học tập",
                "short_name": "Nhắc nhở",
                "description": "Hạn nộp bài, lịch trực nhật, lịch họp chi đoàn",
                "icon": "clock",
                "route": "/student/reminders",
                "module_type": "CARD",
                "category": "COMMUNICATION",
                "default_color": "#CA8A04",
                "default_badge": "4",
                "order": 12,
            },
            {
                "name": "Thi đua cá nhân & Tổ lớp",
                "short_name": "Thi đua",
                "description": "Điểm nề nếp, điểm cộng học tập, xếp hạng thi đua trong lớp",
                "icon": "user",
                "route": "/student/emulation",
                "module_type": "CARD",
                "category": "EMULATION",
                "default_color": "#D97706",
                "default_badge": "Hạng",
                "order": 13,
            },
            {
                "name": "Câu lạc bộ & Ngoại khóa",
                "short_name": "CLB Đoàn",
                "description": "Đăng ký tham gia CLB, hoạt động tình nguyện, ngày hội STEM",
                "icon": "users",
                "route": "/student/clubs",
                "module_type": "CARD",
                "category": "EMULATION",
                "default_color": "#8B5CF6",
                "default_badge": "Hoạt động",
                "order": 14,
            },
            {
                "name": "Học phí & Khoản thu",
                "short_name": "Học phí",
                "description": "Tra cứu hóa đơn học phí, bảo hiểm y tế và thanh toán online",
                "icon": "settings",
                "route": "/student/fees",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#0D9488",
                "default_badge": "Học phí",
                "order": 15,
            },
            {
                "name": "Chứng chỉ & Thành tích",
                "short_name": "Chứng chỉ",
                "description": "Tổng hợp chứng chỉ và thành tích của bạn, lớp, trường trong suốt quá trình học tập",
                "icon": "certificate",
                "route": "/general/certificate",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#0F172A",
                "default_badge": "Chứng chỉ",
                "order": 16,
            },
            {
                "name": "Đánh giá & Báo hỏng cơ sở vật chất",
                "short_name": "Báo hỏng",
                "description": "Phản ánh tình trạng máy chiếu, quạt, bàn ghế phòng học",
                "icon": "tool",
                "route": "/student/evaluations/facility",
                "module_type": "CARD",
                "category": "EVALUATION",
                "default_color": "#64748B",
                "default_badge": "Sửa chữa",
                "order": 17,
            },
            {
                "name": "Khảo sát & Đánh giá",
                "short_name": "Đánh giá",
                "description": "Khảo sát chất lượng giờ dạy cuối kỳ và đánh giá cơ sở vật chất",
                "icon": "edit",
                "route": "/student/evaluations",
                "module_type": "CARD",
                "category": "EVALUATION",
                "default_color": "#EA580C",
                "default_badge": "Khảo sát",
                "order": 18,
            },

            # =================================================================
            # 2. NHÓM GIÁO VIÊN & GIẢNG DẠY (Teacher & Homeroom)
            # =================================================================
            {
                "name": "Sổ đầu bài điện tử",
                "short_name": "Sổ đầu bài",
                "description": "Ghi nhận bài học, sĩ số, nhận xét và xếp loại tiết học A/B/C/D",
                "icon": "book",
                "route": "/teacher/journal",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#10B981",
                "default_badge": "Ký sổ",
                "order": 19,
            },
            {
                "name": "Sổ điểm điện tử",
                "short_name": "Nhập điểm",
                "description": "Nhập điểm thường xuyên, giữa kỳ, cuối kỳ theo chuẩn TT22",
                "icon": "edit",
                "route": "/teacher/grades",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#3B82F6",
                "default_badge": "Sổ điểm",
                "order": 20,
            },
            {
                "name": "Điểm danh lớp học",
                "short_name": "Điểm danh",
                "description": "Điểm danh chuyên cần theo tiết hoặc theo buổi học",
                "icon": "check",
                "route": "/teacher/attendance",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#059669",
                "default_badge": "Điểm danh",
                "order": 21,
            },
            {
                "name": "Quản lý lớp chủ nhiệm",
                "short_name": "Lớp chủ nhiệm",
                "description": "Theo dõi học lực, hạnh kiểm, ban cán sự lớp và liên hệ CMHS",
                "icon": "user",
                "route": "/teacher/homeroom",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#7C3AED",
                "default_badge": "Chủ nhiệm",
                "order": 22,
            },
            {
                "name": "Tổ chuyên môn & Phân công",
                "short_name": "Tổ chuyên môn",
                "description": "Quản lý kế hoạch bài dạy, duyệt giáo án, sinh hoạt chuyên môn và thao giảng",
                "icon": "layers",
                "route": "/academic/department",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#4F46E5",
                "default_badge": "Chuyên môn",
                "order": 23,
            },

            # =================================================================
            # 3. NHÓM GIÁM THỊ & THI ĐUA KỶ LUẬT (Supervisor & Youth Union)
            # =================================================================
            {
                "name": "Chấm nề nếp & Cờ đỏ",
                "short_name": "Trực ban",
                "description": "Sổ trực ban giám thị, ghi nhận vi phạm trang phục, trễ giờ",
                "icon": "clipboard",
                "route": "/supervisor/duty",
                "module_type": "CARD",
                "category": "EMULATION",
                "default_color": "#D97706",
                "default_badge": "Trực ban",
                "order": 24,
            },
            {
                "name": "Quản lý Kỷ luật trường",
                "short_name": "Kỷ luật",
                "description": "Lập biên bản vi phạm, gửi thông báo đến PH, mời họp hội đồng",
                "icon": "alert-triangle",
                "route": "/supervisor/discipline",
                "module_type": "CARD",
                "category": "EMULATION",
                "default_color": "#DC2626",
                "default_badge": "Xử lý",
                "order": 25,
            },
            {
                "name": "Công tác Đoàn & Phong trào",
                "short_name": "Đoàn trường",
                "description": "Quản lý hồ sơ đoàn viên, phong trào thanh niên tình nguyện và rèn luyện đạo đức",
                "icon": "flag",
                "route": "/youth/union",
                "module_type": "CARD",
                "category": "EMULATION",
                "default_color": "#2563EB",
                "default_badge": "Đoàn TN",
                "order": 26,
            },

            # =================================================================
            # 4. NHÓM BAN GIÁM HIỆU & QUẢN TRỊ (Principal & System Admin)
            # =================================================================
            {
                "name": "Báo cáo toàn diện",
                "short_name": "Analytics",
                "description": "Thống kê tổng thể chất lượng dạy & học, tỷ lệ đỗ, nề nếp toàn trường",
                "icon": "chart",
                "route": "/principal/analytics",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#1E293B",
                "default_badge": "Báo cáo",
                "order": 27,
            },
            {
                "name": "Quản trị hệ thống & Bảo mật",
                "short_name": "Quản trị",
                "description": "Cấu hình hệ thống, phân quyền người dùng, quản trị bảo mật và nhật ký kiểm toán",
                "icon": "settings",
                "route": "/admin/system",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#0F172A",
                "default_badge": "Admin",
                "order": 28,
            },

            # =================================================================
            # 5. NHÓM TÀI CHÍNH & KẾ TOÁN (Finance & Cashier)
            # =================================================================
            {
                "name": "Kế toán & Quản lý Thu chi",
                "short_name": "Kế toán",
                "description": "Lập biểu học phí, quản lý hóa đơn điện tử, lập báo cáo quyết toán tài chính",
                "icon": "dollar-sign",
                "route": "/finance/accounting",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#059669",
                "default_badge": "Tài chính",
                "order": 29,
            },
            {
                "name": "Thủ quỹ & Thu ngân",
                "short_name": "Thủ quỹ",
                "description": "Quản lý sổ quỹ tiền mặt, tiếp nhận học phí trực tiếp và đối soát thanh toán",
                "icon": "credit-card",
                "route": "/finance/cashier",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#0D9488",
                "default_badge": "Sổ quỹ",
                "order": 30,
            },

            # =================================================================
            # 6. NHÓM CÁN BỘ PHÒNG BAN & HẬU CẦN (Specialist Staff)
            # =================================================================
            {
                "name": "Y tế học đường & Sức khỏe",
                "short_name": "Y tế",
                "description": "Quản lý hồ sơ sức khỏe học sinh, phát thuốc, sơ cứu và theo dõi dịch bệnh",
                "icon": "heart-pulse",
                "route": "/staff/medical",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#E11D48",
                "default_badge": "Sức khỏe",
                "order": 31,
            },
            {
                "name": "Quản lý Thư viện & Mượn sách",
                "short_name": "Thư viện",
                "description": "Quản lý kho sách giáo khoa, tài liệu tham khảo, thẻ bạn đọc và mượn trả",
                "icon": "book-open",
                "route": "/staff/library",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#7C3AED",
                "default_badge": "Mượn trả",
                "order": 32,
            },
            {
                "name": "Quản lý Thiết bị & Phòng Lab",
                "short_name": "Phòng Lab",
                "description": "Quản lý thiết bị thí nghiệm, đồ dùng dạy học, hóa chất và đăng ký phòng thực hành",
                "icon": "cpu",
                "route": "/staff/lab",
                "module_type": "CARD",
                "category": "ACADEMIC",
                "default_color": "#0284C7",
                "default_badge": "Thiết bị",
                "order": 33,
            },
            {
                "name": "Tư vấn tâm lý học đường",
                "short_name": "Tâm lý",
                "description": "Tiếp nhận tham vấn tâm lý học sinh, hướng nghiệp và hỗ trợ giải tỏa áp lực",
                "icon": "message-circle",
                "route": "/staff/counseling",
                "module_type": "CARD",
                "category": "COMMUNICATION",
                "default_color": "#D97706",
                "default_badge": "Tư vấn",
                "order": 34,
            },
            {
                "name": "An ninh & Bảo vệ trường học",
                "short_name": "An ninh",
                "description": "Kiểm soát ra vào cổng trường, quản lý khách liên hệ và bảo đảm an toàn khuôn viên",
                "icon": "shield",
                "route": "/staff/security",
                "module_type": "CARD",
                "category": "MANAGEMENT",
                "default_color": "#475569",
                "default_badge": "An ninh",
                "order": 35,
            },

            # =================================================================
            # 7. NHÓM PHỤ HUYNH HỌC SINH (Parent Portal)
            # =================================================================
            {
                "name": "Cổng thông tin Phụ huynh",
                "short_name": "Cổng PHHS",
                "description": "Theo dõi kết quả học tập, điểm danh, nộp học phí và trao đổi trực tiếp với GVCN",
                "icon": "users",
                "route": "/parent/portal",
                "module_type": "CARD",
                "category": "COMMUNICATION",
                "default_color": "#0284C7",
                "default_badge": "Gia đình",
                "order": 36,
            },
        ]

        with transaction.atomic():
            created_count = 0
            updated_count = 0

            for module_data in modules_data:
                module = Module.objects.filter(route=module_data["route"]).first()
                created = False

                if not module:
                    module = Module.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(Module, field_name="code"),
                        name=module_data["name"],
                        short_name=module_data["short_name"],
                        description=module_data["description"],
                        icon=module_data["icon"],
                        route=module_data["route"],
                        module_type=module_data["module_type"],
                        category=module_data["category"],
                        default_color=module_data["default_color"],
                        default_badge=module_data["default_badge"],
                        is_mobile_visible=True,
                        is_desktop_visible=True,
                        is_active=True,
                        default_order_no=module_data["order"],
                    )
                    created = True
                    created_count += 1
                else:
                    module.name = module_data["name"]
                    module.short_name = module_data["short_name"]
                    module.description = module_data["description"]
                    module.icon = module_data["icon"]
                    module.module_type = module_data["module_type"]
                    module.category = module_data["category"]
                    module.default_color = module_data["default_color"]
                    module.default_badge = module_data["default_badge"]
                    module.default_order_no = module_data["order"]
                    module.is_active = True
                    module.save(
                        update_fields=[
                            "name",
                            "short_name",
                            "description",
                            "icon",
                            "module_type",
                            "category",
                            "default_color",
                            "default_badge",
                            "default_order_no",
                            "is_active",
                        ]
                    )
                    updated_count += 1

                status_msg = "Created" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  [#{module.default_order_no:02d}] {module.code} - {module.name} ({status_msg})"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded System Modules! "
                f"Created: {created_count}, "
                f"Updated: {updated_count}, "
                f"Total: {len(modules_data)}"
            )
        )
