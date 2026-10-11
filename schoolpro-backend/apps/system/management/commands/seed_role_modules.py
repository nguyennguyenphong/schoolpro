"""
Management command to seed RoleModule dashboard card mappings.
Table: "sys"."role_modules"

Maps all 37 enterprise roles to their personalized, role-tailored dashboard functional modules and cards.
Usage:
    python manage.py seed_role_modules
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.role import Role
from apps.system.models.module import Module, RoleModule


class Command(BaseCommand):
    help = "Seeds role-specific dashboard module card accesses and default layouts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Role-Module Layouts (sys.role_modules)..."))

        # Pre-fetch all available modules indexed by route for fast mapping
        all_modules = {m.route: m for m in Module.objects.all()}
        if not all_modules:
            self.stdout.write(self.style.ERROR("No modules found. Please run seed_modules first!"))
            return

        # Pre-fetch all roles indexed by name
        all_roles = {r.name: r for r in Role.objects.all()}
        if not all_roles:
            self.stdout.write(self.style.ERROR("No roles found. Please run seed_roles first!"))
            return

        # Helper shorthand to define module layout specs
        def card(
            route: str, pinned: bool = False, col_span: int = 1, order: int = 0, badge: str = None
        ):
            return {
                "route": route,
                "is_pinned": pinned,
                "col_span": col_span,
                "order": order,
                "custom_badge": badge,
            }

        # Route definitions shortcuts
        ROUTE_TIMETABLE = "/student/timetable"
        ROUTE_LEAVE_REQUEST = "/student/leave-requests"
        ROUTE_MATERIALS = "/student/materials"
        ROUTE_ASSIGNMENTS = "/student/assignments"
        ROUTE_EXAMS = "/student/exams"
        ROUTE_GRADEBOOK = "/student/gradebook"
        ROUTE_REMINDERS = "/student/reminders"
        ROUTE_NOTICES = "/student/notices"
        ROUTE_EVALUATIONS = "/student/evaluations"
        ROUTE_FACILITY_ISSUE = "/student/evaluations/facility"
        ROUTE_EMULATION = "/student/emulation"
        ROUTE_CONTACT_BOOK = "/student/contact-book"
        ROUTE_CLUBS = "/student/clubs"
        ROUTE_FEES = "/student/fees"
        ROUTE_ATTENDANCE = "/student/attendance"
        ROUTE_TRACK = "/student/track"
        ROUTE_ONLINE_TEST = "/student/online-test"
        ROUTE_JOURNAL = "/teacher/journal"
        ROUTE_TEACHER_GRADES = "/teacher/grades"
        ROUTE_TEACHER_ATTENDANCE = "/teacher/attendance"
        ROUTE_HOMEROOM = "/teacher/homeroom"
        ROUTE_DUTY = "/supervisor/duty"
        ROUTE_DISCIPLINE = "/supervisor/discipline"
        ROUTE_ANALYTICS = "/principal/analytics"
        ROUTE_CERTIFICATE = "/general/certificate"
        ROUTE_ADMIN_SYSTEM = "/admin/system"
        ROUTE_FINANCE_ACCOUNTING = "/finance/accounting"
        ROUTE_FINANCE_CASHIER = "/finance/cashier"
        ROUTE_STAFF_MEDICAL = "/staff/medical"
        ROUTE_STAFF_LIBRARY = "/staff/library"
        ROUTE_STAFF_LAB = "/staff/lab"
        ROUTE_STAFF_COUNSELING = "/staff/counseling"
        ROUTE_STAFF_SECURITY = "/staff/security"
        ROUTE_YOUTH_UNION = "/youth/union"
        ROUTE_ACADEMIC_DEPT = "/academic/department"
        ROUTE_PARENT_PORTAL = "/parent/portal"

        # Common reusable card packages
        STUDENT_COMMON_CARDS = [
            card(ROUTE_TIMETABLE, pinned=True, col_span=1, order=1, badge="Lịch học"),
            card(ROUTE_LEAVE_REQUEST, pinned=False, col_span=1, order=2, badge="Gửi đơn"),
            card(ROUTE_ATTENDANCE, pinned=False, col_span=1, order=3, badge="Điểm danh"),
            card(ROUTE_ASSIGNMENTS, pinned=True, col_span=1, order=4, badge="Bài tập"),
            card(ROUTE_ONLINE_TEST, pinned=False, col_span=1, order=5, badge="Online"),
            card(ROUTE_EXAMS, pinned=False, col_span=1, order=6, badge="Sắp tới"),
            card(ROUTE_GRADEBOOK, pinned=True, col_span=1, order=7, badge="Điểm số"),
            card(ROUTE_MATERIALS, pinned=False, col_span=1, order=8, badge="18"),
            card(ROUTE_TRACK, pinned=False, col_span=1, order=9, badge="Tổ hợp"),
            card(ROUTE_NOTICES, pinned=False, col_span=1, order=10, badge="10"),
            card(ROUTE_CONTACT_BOOK, pinned=False, col_span=1, order=11, badge="Mới"),
            card(ROUTE_REMINDERS, pinned=False, col_span=1, order=12, badge="4"),
            card(ROUTE_EMULATION, pinned=False, col_span=1, order=13, badge="Hạng"),
            card(ROUTE_CLUBS, pinned=False, col_span=1, order=14, badge="Hoạt động"),
            card(ROUTE_FEES, pinned=False, col_span=1, order=15, badge="Học phí"),
            card(ROUTE_CERTIFICATE, pinned=False, col_span=1, order=16, badge="Chứng chỉ"),
            card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=17, badge="Sửa chữa"),
            card(ROUTE_EVALUATIONS, pinned=False, col_span=1, order=18, badge="Khảo sát"),
        ]

        TEACHER_COMMON_CARDS = [
            card(ROUTE_JOURNAL, pinned=True, col_span=1, order=1, badge="Sổ đầu bài"),
            card(ROUTE_TEACHER_GRADES, pinned=True, col_span=2, order=2, badge="Nhập điểm"),
            card(ROUTE_TEACHER_ATTENDANCE, pinned=True, col_span=1, order=3, badge="Điểm danh"),
            card(ROUTE_TIMETABLE, pinned=True, col_span=1, order=4, badge="Lịch dạy"),
            card(ROUTE_ASSIGNMENTS, pinned=False, col_span=1, order=5),
            card(ROUTE_EXAMS, pinned=False, col_span=1, order=6),
            card(ROUTE_MATERIALS, pinned=False, col_span=1, order=7),
            card(ROUTE_NOTICES, pinned=False, col_span=1, order=8),
            card(ROUTE_ACADEMIC_DEPT, pinned=False, col_span=1, order=9),
            card(ROUTE_REMINDERS, pinned=False, col_span=1, order=10),
            card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=11),
        ]

        LEADERSHIP_COMMON_CARDS = [
            card(ROUTE_ANALYTICS, pinned=True, col_span=2, order=1, badge="Toàn trường"),
            card(ROUTE_NOTICES, pinned=True, col_span=1, order=2, badge="Thông báo"),
            card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=3),
            card(ROUTE_TEACHER_GRADES, pinned=False, col_span=1, order=4),
            card(ROUTE_HOMEROOM, pinned=False, col_span=1, order=5),
            card(ROUTE_ATTENDANCE, pinned=False, col_span=1, order=6),
            card(ROUTE_DUTY, pinned=False, col_span=1, order=7),
            card(ROUTE_DISCIPLINE, pinned=False, col_span=1, order=8),
            card(ROUTE_FEES, pinned=False, col_span=1, order=9),
            card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=10),
        ]

        # Explicit role module configuration for all 37 roles
        role_modules_map = {
            # 1. SYSTEM ADMIN & IT
            "Quản trị viên toàn quyền hệ thống": [
                card(ROUTE_ADMIN_SYSTEM, pinned=True, col_span=2, order=1, badge="Hệ thống"),
                card(ROUTE_ANALYTICS, pinned=True, col_span=2, order=2, badge="Thống kê"),
                card(ROUTE_NOTICES, pinned=True, col_span=1, order=3),
                card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=4),
                card(ROUTE_TEACHER_GRADES, pinned=False, col_span=1, order=5),
                card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=6),
                card(ROUTE_FEES, pinned=False, col_span=1, order=7),
                card(ROUTE_FINANCE_ACCOUNTING, pinned=False, col_span=1, order=8),
            ],
            "Quản trị viên CNTT & Kỹ thuật": [
                card(ROUTE_ADMIN_SYSTEM, pinned=True, col_span=2, order=1, badge="Kỹ thuật"),
                card(ROUTE_FACILITY_ISSUE, pinned=True, col_span=1, order=2, badge="Báo hỏng"),
                card(ROUTE_STAFF_LAB, pinned=False, col_span=1, order=3),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=4),
            ],
            # 2. EXECUTIVE BOARD & LEADERSHIP
            "Hiệu trưởng": LEADERSHIP_COMMON_CARDS,
            "Phó Hiệu trưởng phụ trách Chuyên môn": [
                card(ROUTE_ANALYTICS, pinned=True, col_span=2, order=1, badge="Chuyên môn"),
                card(ROUTE_ACADEMIC_DEPT, pinned=True, col_span=1, order=2, badge="Tổ bộ môn"),
                card(ROUTE_TEACHER_GRADES, pinned=True, col_span=1, order=3, badge="Bảng điểm"),
                card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=4),
                card(ROUTE_EXAMS, pinned=False, col_span=1, order=5),
                card(ROUTE_JOURNAL, pinned=False, col_span=1, order=6),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=7),
            ],
            "Phó Hiệu trưởng phụ trách Công tác học sinh": [
                card(ROUTE_ANALYTICS, pinned=True, col_span=2, order=1, badge="Nề nếp"),
                card(ROUTE_DUTY, pinned=True, col_span=1, order=2, badge="Trực ban"),
                card(ROUTE_DISCIPLINE, pinned=True, col_span=1, order=3, badge="Kỷ luật"),
                card(ROUTE_EMULATION, pinned=False, col_span=1, order=4),
                card(ROUTE_YOUTH_UNION, pinned=False, col_span=1, order=5),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=6),
            ],
            "Thư ký Hội đồng trường": [
                card(ROUTE_NOTICES, pinned=True, col_span=2, order=1, badge="Nghị quyết"),
                card(ROUTE_ANALYTICS, pinned=False, col_span=1, order=2),
                card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=3),
                card(ROUTE_REMINDERS, pinned=False, col_span=1, order=4),
            ],
            "Trưởng ban Thanh tra nhân dân": [
                card(ROUTE_ANALYTICS, pinned=True, col_span=2, order=1, badge="Thanh tra"),
                card(ROUTE_TEACHER_GRADES, pinned=False, col_span=1, order=2),
                card(ROUTE_DUTY, pinned=False, col_span=1, order=3),
                card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=4),
            ],
            # 3. SPECIALIST & ADMINISTRATIVE STAFF
            "Giáo vụ trường học": [
                card(ROUTE_GRADEBOOK, pinned=True, col_span=2, order=1, badge="Học bạ"),
                card(ROUTE_TIMETABLE, pinned=True, col_span=1, order=2, badge="Thời khóa biểu"),
                card(ROUTE_TRACK, pinned=False, col_span=1, order=3),
                card(ROUTE_EXAMS, pinned=False, col_span=1, order=4),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=5),
            ],
            "Cán bộ Y tế học đường": [
                card(ROUTE_STAFF_MEDICAL, pinned=True, col_span=2, order=1, badge="Y tế"),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=2),
                card(ROUTE_REMINDERS, pinned=False, col_span=1, order=3),
                card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=4),
            ],
            "Cán bộ Thư viện": [
                card(ROUTE_STAFF_LIBRARY, pinned=True, col_span=2, order=1, badge="Thư viện"),
                card(ROUTE_MATERIALS, pinned=False, col_span=1, order=2),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=3),
                card(ROUTE_REMINDERS, pinned=False, col_span=1, order=4),
            ],
            "Kế toán trường học": [
                card(ROUTE_FINANCE_ACCOUNTING, pinned=True, col_span=2, order=1, badge="Kế toán"),
                card(ROUTE_FEES, pinned=True, col_span=1, order=2, badge="Học phí"),
                card(ROUTE_FINANCE_CASHIER, pinned=False, col_span=1, order=3),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=4),
            ],
            "Thủ quỹ trường học": [
                card(ROUTE_FINANCE_CASHIER, pinned=True, col_span=2, order=1, badge="Thủ quỹ"),
                card(ROUTE_FEES, pinned=True, col_span=1, order=2, badge="Thu học phí"),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=3),
            ],
            "Cán bộ Quản lý Thiết bị & Phòng Lab": [
                card(ROUTE_STAFF_LAB, pinned=True, col_span=2, order=1, badge="Thiết bị & Lab"),
                card(ROUTE_FACILITY_ISSUE, pinned=True, col_span=1, order=2, badge="Báo hỏng"),
                card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=3),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=4),
            ],
            "Giám thị / Quản sinh": [
                card(ROUTE_DUTY, pinned=True, col_span=2, order=1, badge="Trực ban"),
                card(ROUTE_DISCIPLINE, pinned=True, col_span=1, order=2, badge="Kỷ luật"),
                card(ROUTE_EMULATION, pinned=False, col_span=1, order=3),
                card(ROUTE_TEACHER_ATTENDANCE, pinned=False, col_span=1, order=4),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=5),
            ],
            "Chuyên viên Tư vấn tâm lý học đường": [
                card(ROUTE_STAFF_COUNSELING, pinned=True, col_span=2, order=1, badge="Tư vấn"),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=2),
                card(ROUTE_REMINDERS, pinned=False, col_span=1, order=3),
            ],
            "Nhân viên Bảo vệ & An ninh": [
                card(ROUTE_STAFF_SECURITY, pinned=True, col_span=2, order=1, badge="An ninh"),
                card(ROUTE_FACILITY_ISSUE, pinned=False, col_span=1, order=2),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=3),
            ],
            "Nhân viên Hậu cần & Tạp vụ": [
                card(
                    ROUTE_FACILITY_ISSUE, pinned=True, col_span=2, order=1, badge="Cơ sở vật chất"
                ),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=2),
                card(ROUTE_REMINDERS, pinned=False, col_span=1, order=3),
            ],
            # 4. FACULTY TEACHERS
            "Tổ trưởng chuyên môn": TEACHER_COMMON_CARDS
            + [card(ROUTE_ACADEMIC_DEPT, pinned=True, col_span=1, order=0, badge="Tổ trưởng")],
            "Tổ phó chuyên môn": TEACHER_COMMON_CARDS
            + [card(ROUTE_ACADEMIC_DEPT, pinned=True, col_span=1, order=0, badge="Tổ phó")],
            "Giáo viên chủ nhiệm": TEACHER_COMMON_CARDS
            + [
                card(ROUTE_HOMEROOM, pinned=True, col_span=2, order=0, badge="Lớp chủ nhiệm"),
                card(ROUTE_CONTACT_BOOK, pinned=True, col_span=1, order=12, badge="Sổ liên lạc"),
            ],
            "Giáo viên bộ môn": TEACHER_COMMON_CARDS,
            # 5. YOUTH UNION & RED FLAG
            "Bí thư Đoàn trường": [
                card(ROUTE_YOUTH_UNION, pinned=True, col_span=2, order=1, badge="Đoàn trường"),
                card(ROUTE_CLUBS, pinned=True, col_span=1, order=2, badge="Câu lạc bộ"),
                card(ROUTE_DUTY, pinned=False, col_span=1, order=3),
                card(ROUTE_EMULATION, pinned=False, col_span=1, order=4),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=5),
            ],
            "Phó Bí thư Đoàn trường": [
                card(ROUTE_YOUTH_UNION, pinned=True, col_span=2, order=1, badge="Phó Bí thư"),
                card(ROUTE_CLUBS, pinned=True, col_span=1, order=2),
                card(ROUTE_DUTY, pinned=False, col_span=1, order=3),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=4),
            ],
            "Ủy viên Ban Chấp hành Đoàn trường": [
                card(ROUTE_YOUTH_UNION, pinned=True, col_span=1, order=1),
                card(ROUTE_CLUBS, pinned=True, col_span=1, order=2),
                card(ROUTE_DUTY, pinned=False, col_span=1, order=3),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=4),
            ],
            "Cán bộ Đội Cờ đỏ / Sao đỏ": [
                card(ROUTE_DUTY, pinned=True, col_span=2, order=1, badge="Đội cờ đỏ"),
                card(ROUTE_EMULATION, pinned=True, col_span=1, order=2, badge="Nề nếp"),
                card(ROUTE_DISCIPLINE, pinned=False, col_span=1, order=3),
                card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=4),
                card(ROUTE_GRADEBOOK, pinned=False, col_span=1, order=5),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=6),
            ],
            # 6. CLASS COMMITTEE
            "Lớp trưởng": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_EMULATION, pinned=True, col_span=1, order=0, badge="Lớp trưởng"),
                card(ROUTE_ATTENDANCE, pinned=True, col_span=1, order=0, badge="Điểm danh lớp"),
            ],
            "Lớp phó học tập": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_GRADEBOOK, pinned=True, col_span=1, order=0, badge="Học tập"),
                card(ROUTE_MATERIALS, pinned=True, col_span=1, order=0, badge="Tài liệu lớp"),
            ],
            "Lớp phó lao động và Đời sống": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_FACILITY_ISSUE, pinned=True, col_span=1, order=0, badge="Trực nhật"),
            ],
            "Lớp phó Văn - Thể - Mỹ": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_CLUBS, pinned=True, col_span=1, order=0, badge="Văn thể mỹ"),
            ],
            "Bí thư Chi đoàn lớp": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_YOUTH_UNION, pinned=True, col_span=1, order=0, badge="Chi đoàn"),
            ],
            "Phó Bí thư Chi đoàn lớp": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_YOUTH_UNION, pinned=True, col_span=1, order=0, badge="Chi đoàn"),
            ],
            "Tổ trưởng tổ học tập": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_EMULATION, pinned=True, col_span=1, order=0, badge="Tổ trưởng"),
            ],
            "Tổ phó tổ học tập": STUDENT_COMMON_CARDS
            + [
                card(ROUTE_EMULATION, pinned=True, col_span=1, order=0, badge="Tổ phó"),
            ],
            # 7. GENERAL STUDENTS
            "Học sinh": STUDENT_COMMON_CARDS,
            # 8. PARENTS & GUARDIANS
            "Phụ huynh học sinh": [
                card(ROUTE_PARENT_PORTAL, pinned=True, col_span=2, order=1, badge="Sổ liên lạc"),
                card(ROUTE_GRADEBOOK, pinned=True, col_span=1, order=2, badge="Bảng điểm"),
                card(ROUTE_ATTENDANCE, pinned=True, col_span=1, order=3, badge="Chuyên cần"),
                card(ROUTE_FEES, pinned=True, col_span=1, order=4, badge="Học phí"),
                card(ROUTE_TIMETABLE, pinned=False, col_span=1, order=5),
                card(ROUTE_NOTICES, pinned=False, col_span=1, order=6),
                card(ROUTE_EMULATION, pinned=False, col_span=1, order=7),
            ],
            "Trưởng ban đại diện Cha mẹ học sinh trường": [
                card(ROUTE_PARENT_PORTAL, pinned=True, col_span=2, order=1, badge="Ban ĐD Trường"),
                card(ROUTE_NOTICES, pinned=True, col_span=1, order=2, badge="Thông báo"),
                card(ROUTE_GRADEBOOK, pinned=False, col_span=1, order=3),
                card(ROUTE_FEES, pinned=False, col_span=1, order=4),
                card(ROUTE_ANALYTICS, pinned=False, col_span=1, order=5),
            ],
            "Trưởng ban đại diện Cha mẹ học sinh lớp": [
                card(ROUTE_PARENT_PORTAL, pinned=True, col_span=2, order=1, badge="Ban ĐD Lớp"),
                card(ROUTE_NOTICES, pinned=True, col_span=1, order=2, badge="Thông báo lớp"),
                card(ROUTE_GRADEBOOK, pinned=False, col_span=1, order=3),
                card(ROUTE_FEES, pinned=False, col_span=1, order=4),
                card(ROUTE_ATTENDANCE, pinned=False, col_span=1, order=5),
            ],
        }

        total_roles_processed = 0
        total_mappings_created = 0
        total_mappings_updated = 0

        with transaction.atomic():
            for role_name, card_list in role_modules_map.items():
                role = all_roles.get(role_name)
                if not role:
                    self.stdout.write(
                        self.style.WARNING(f"Role '{role_name}' not found, skipping...")
                    )
                    continue

                total_roles_processed += 1
                role_created_count = 0
                role_updated_count = 0

                for card_spec in card_list:
                    module = all_modules.get(card_spec["route"])
                    if not module:
                        continue

                    rm_obj, created = RoleModule.objects.update_or_create(
                        role=role,
                        module=module,
                        defaults={
                            "is_visible": True,
                            "is_pinned_default": card_spec.get("is_pinned", False),
                            "order_no": card_spec.get("order", 0),
                            "grid_col_span": card_spec.get("col_span", 1),
                            "grid_row_span": 1,
                            "can_hide": not card_spec.get("is_pinned", False),
                            "custom_badge": card_spec.get("custom_badge"),
                        },
                    )

                    if created:
                        role_created_count += 1
                        total_mappings_created += 1
                    else:
                        role_updated_count += 1
                        total_mappings_updated += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Role: {role.name:<45} "
                        f"({len(card_list)} modules - {role_created_count} created, {role_updated_count} updated)"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded RoleModule mappings! "
                f"Roles: {total_roles_processed}/37, "
                f"Total cards created: {total_mappings_created}, "
                f"Updated: {total_mappings_updated}"
            )
        )
