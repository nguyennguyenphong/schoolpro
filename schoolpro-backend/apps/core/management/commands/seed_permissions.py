"""
Management command to seed comprehensive system Permissions for SchoolPro.
Table: "core"."permissions"

Naming format:
    [action]:[table_name]

Usage:
    python manage.py seed_permissions
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.permission import Permission
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds granular enterprise RBAC Permissions across all domain tables."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding System Permissions (core.permissions)..."))

        # Master permission catalog defined by [action]:[table_name]
        permissions_data = [
            # =========================================================================
            # 1. CORE DOMAIN: USERS & AUTHENTICATION (Table: users)
            # =========================================================================
            {
                "name": "create:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Tạo mới tài khoản người dùng trong hệ thống",
                "is_dangerous": False,
            },
            {
                "name": "read:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Xem danh sách và thông tin hồ sơ tài khoản người dùng",
                "is_dangerous": False,
            },
            {
                "name": "update:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Chỉnh sửa thông tin hồ sơ tài khoản người dùng",
                "is_dangerous": False,
            },
            {
                "name": "delete:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Xóa tài khoản người dùng khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "export:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Xuất dữ liệu danh sách người dùng ra tệp Excel/CSV",
                "is_dangerous": False,
            },
            {
                "name": "import:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Nhập dữ liệu tài khoản người dùng hàng loạt từ tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "lock:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Khóa quyền truy cập tài khoản người dùng",
                "is_dangerous": True,
            },
            {
                "name": "unlock:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Mở khóa truy cập tài khoản người dùng",
                "is_dangerous": True,
            },
            {
                "name": "archive:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Lưu trữ tài khoản người dùng đã tốt nghiệp hoặc rời trường",
                "is_dangerous": True,
            },
            {
                "name": "restore:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Khôi phục tài khoản người dùng từ kho lưu trữ",
                "is_dangerous": True,
            },
            {
                "name": "manage:users",
                "group_code": "USERS_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản lý chuyên sâu tài khoản người dùng",
                "is_dangerous": True,
            },
            # =========================================================================
            # 2. CORE DOMAIN: ROLES & RBAC (Table: roles)
            # =========================================================================
            {
                "name": "create:roles",
                "group_code": "ROLES_MGMT",
                "module": "CORE",
                "description": "Tạo mới vai trò bảo mật người dùng",
                "is_dangerous": False,
            },
            {
                "name": "read:roles",
                "group_code": "ROLES_MGMT",
                "module": "CORE",
                "description": "Xem danh sách và chi tiết cấu hình vai trò",
                "is_dangerous": False,
            },
            {
                "name": "update:roles",
                "group_code": "ROLES_MGMT",
                "module": "CORE",
                "description": "Chỉnh sửa thông tin vai trò người dùng",
                "is_dangerous": False,
            },
            {
                "name": "delete:roles",
                "group_code": "ROLES_MGMT",
                "module": "CORE",
                "description": "Xóa vai trò khỏi hệ thống phân quyền",
                "is_dangerous": True,
            },
            {
                "name": "manage:roles",
                "group_code": "ROLES_MGMT",
                "module": "CORE",
                "description": "Toàn quyền cấu hình và quản trị vai trò hệ thống",
                "is_dangerous": True,
            },
            # =========================================================================
            # 3. CORE DOMAIN: PERMISSIONS (Table: permissions)
            # =========================================================================
            {
                "name": "read:permissions",
                "group_code": "PERMISSIONS_MGMT",
                "module": "CORE",
                "description": "Xem danh sách quyền hạn chi tiết trong hệ thống",
                "is_dangerous": False,
            },
            {
                "name": "assign:permissions",
                "group_code": "PERMISSIONS_MGMT",
                "module": "CORE",
                "description": "Gán quyền hạn chi tiết cho từng vai trò",
                "is_dangerous": True,
            },
            {
                "name": "unassign:permissions",
                "group_code": "PERMISSIONS_MGMT",
                "module": "CORE",
                "description": "Thu hồi quyền hạn khỏi vai trò người dùng",
                "is_dangerous": True,
            },
            {
                "name": "manage:permissions",
                "group_code": "PERMISSIONS_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản trị phân bổ đặc quyền bảo mật",
                "is_dangerous": True,
            },
            # =========================================================================
            # 4. CORE DOMAIN: SCHOOL PROFILE (Table: schools)
            # =========================================================================
            {
                "name": "read:schools",
                "group_code": "SCHOOL_MGMT",
                "module": "CORE",
                "description": "Xem hồ sơ thông tin và cấu hình trường học",
                "is_dangerous": False,
            },
            {
                "name": "update:schools",
                "group_code": "SCHOOL_MGMT",
                "module": "CORE",
                "description": "Cập nhật thông tin địa chỉ, liên hệ và thương hiệu trường học",
                "is_dangerous": False,
            },
            {
                "name": "manage:schools",
                "group_code": "SCHOOL_MGMT",
                "module": "CORE",
                "description": "Toàn quyền thiết lập và cấu hình cơ sở giáo dục",
                "is_dangerous": True,
            },
            # =========================================================================
            # 5. CORE DOMAIN: CLASSES (Table: classes)
            # =========================================================================
            {
                "name": "create:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Tạo mới lớp học trong năm học",
                "is_dangerous": False,
            },
            {
                "name": "read:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Xem danh sách các lớp học và sĩ số học sinh",
                "is_dangerous": False,
            },
            {
                "name": "update:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Chỉnh sửa thông tin phòng học, tên lớp, chỉ tiêu",
                "is_dangerous": False,
            },
            {
                "name": "delete:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Xóa lớp học khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "export:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Xuất danh sách các lớp học ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "import:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Nhập danh sách lớp học hàng loạt từ tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "assign:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Phân công giáo viên chủ nhiệm cho lớp học",
                "is_dangerous": False,
            },
            {
                "name": "unassign:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Hủy phân công giáo viên chủ nhiệm khỏi lớp",
                "is_dangerous": True,
            },
            {
                "name": "archive:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Lưu trữ dữ liệu lớp học sau khi kết thúc năm học",
                "is_dangerous": True,
            },
            {
                "name": "duplicate:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Sao chép cấu trúc danh sách lớp sang năm học mới",
                "is_dangerous": False,
            },
            {
                "name": "manage:classes",
                "group_code": "CLASSES_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản trị cơ cấu tổ chức lớp học",
                "is_dangerous": True,
            },
            # =========================================================================
            # 6. CORE DOMAIN: STUDENTS (Table: students)
            # =========================================================================
            {
                "name": "create:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Tạo mới hồ sơ học sinh",
                "is_dangerous": False,
            },
            {
                "name": "read:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Xem hồ sơ lý lịch, thông tin cá nhân học sinh",
                "is_dangerous": False,
            },
            {
                "name": "update:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Chỉnh sửa thông tin hồ sơ lý lịch học sinh",
                "is_dangerous": False,
            },
            {
                "name": "delete:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Xóa hồ sơ học sinh khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "export:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Xuất danh sách học sinh kèm thông tin chi tiết ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "import:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Nhập danh sách học sinh hàng loạt từ tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "enroll:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Ghi danh học sinh vào lớp học hoặc môn học tự chọn",
                "is_dangerous": False,
            },
            {
                "name": "unenroll:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Hủy ghi danh học sinh khỏi lớp học",
                "is_dangerous": True,
            },
            {
                "name": "transfer:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Thực hiện chuyển lớp hoặc chuyển trường cho học sinh",
                "is_dangerous": True,
            },
            {
                "name": "promote:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Xét duyệt và thực hiện lên lớp niên khóa mới cho học sinh",
                "is_dangerous": True,
            },
            {
                "name": "archive:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Lưu trữ hồ sơ học sinh sau khi tốt nghiệp hoặc chuyển trường",
                "is_dangerous": True,
            },
            {
                "name": "restore:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Khôi phục hồ sơ học sinh từ kho lưu trữ",
                "is_dangerous": True,
            },
            {
                "name": "manage:students",
                "group_code": "STUDENTS_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản lý dữ liệu học sinh",
                "is_dangerous": True,
            },
            # =========================================================================
            # 7. CORE DOMAIN: TEACHERS (Table: teachers)
            # =========================================================================
            {
                "name": "create:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Tạo mới hồ sơ giáo viên trong trường",
                "is_dangerous": False,
            },
            {
                "name": "read:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Xem hồ sơ chuyên môn, bằng cấp và phân công giáo viên",
                "is_dangerous": False,
            },
            {
                "name": "update:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Cập nhật trình độ học vấn, bằng cấp và tổ chuyên môn giáo viên",
                "is_dangerous": False,
            },
            {
                "name": "delete:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Xóa hồ sơ giáo viên khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "export:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Xuất danh sách cán bộ giáo viên ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "import:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Nhập danh sách giáo viên hàng loạt từ tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "assign:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Phân công giáo viên vào tổ chuyên môn hoặc bộ môn giảng dạy",
                "is_dangerous": False,
            },
            {
                "name": "unassign:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Hủy phân công chuyên môn giáo viên",
                "is_dangerous": True,
            },
            {
                "name": "archive:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Lưu trữ hồ sơ giáo viên đã nghỉ hưu hoặc chuyển công tác",
                "is_dangerous": True,
            },
            {
                "name": "manage:teachers",
                "group_code": "TEACHERS_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản lý đội ngũ sư phạm",
                "is_dangerous": True,
            },
            # =========================================================================
            # 8. CORE DOMAIN: GUARDIANS (Table: guardians)
            # =========================================================================
            {
                "name": "create:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Tạo mới hồ sơ phụ huynh / người giám hộ",
                "is_dangerous": False,
            },
            {
                "name": "read:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Xem thông tin liên hệ và học sinh trực thuộc phụ huynh",
                "is_dangerous": False,
            },
            {
                "name": "update:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Cập nhật số điện thoại, địa chỉ của phụ huynh",
                "is_dangerous": False,
            },
            {
                "name": "delete:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Xóa hồ sơ phụ huynh khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "export:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Xuất danh bạ phụ huynh ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "share:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Chia sẻ bảng điểm, học bạ và báo cáo định kỳ cho phụ huynh",
                "is_dangerous": False,
            },
            {
                "name": "notify:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Gửi tin nhắn thông báo khẩn cấp hoặc định kỳ tới phụ huynh",
                "is_dangerous": False,
            },
            {
                "name": "manage:guardians",
                "group_code": "GUARDIANS_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản trị hồ sơ phụ huynh học sinh",
                "is_dangerous": True,
            },
            # =========================================================================
            # 9. CORE DOMAIN: TEACHING ASSIGNMENTS (Table: class_subject_teachers)
            # =========================================================================
            {
                "name": "create:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Tạo phân công giáo viên giảng dạy môn học cho lớp",
                "is_dangerous": False,
            },
            {
                "name": "read:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Xem danh sách phân công giảng dạy toàn trường",
                "is_dangerous": False,
            },
            {
                "name": "update:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Điều chỉnh số tiết trên tuần và phân công giảng dạy",
                "is_dangerous": False,
            },
            {
                "name": "delete:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Xóa phân công giảng dạy",
                "is_dangerous": True,
            },
            {
                "name": "assign:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Gán giáo viên bộ môn phụ trách lớp học cụ thể",
                "is_dangerous": False,
            },
            {
                "name": "unassign:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Hủy phân công giảng dạy môn học của giáo viên",
                "is_dangerous": True,
            },
            {
                "name": "duplicate:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Sao chép phân công giảng dạy sang học kỳ hoặc năm học mới",
                "is_dangerous": False,
            },
            {
                "name": "manage:class_subject_teachers",
                "group_code": "TEACHING_ASSIGN_MGMT",
                "module": "CORE",
                "description": "Toàn quyền quản lý phân công giảng dạy",
                "is_dangerous": True,
            },
            # =========================================================================
            # 10. MASTER DOMAIN: ACADEMIC YEARS & SEMESTERS (Tables: academic_years, semesters)
            # =========================================================================
            {
                "name": "create:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Khởi tạo năm học mới",
                "is_dangerous": False,
            },
            {
                "name": "read:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Xem danh sách năm học và niên khóa",
                "is_dangerous": False,
            },
            {
                "name": "update:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Chỉnh sửa khoảng thời gian bắt đầu và kết thúc năm học",
                "is_dangerous": False,
            },
            {
                "name": "delete:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Xóa năm học khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "lock:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Khóa dữ liệu năm học kết thúc để đóng sổ",
                "is_dangerous": True,
            },
            {
                "name": "unlock:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Mở khóa năm học để hiệu chỉnh dữ liệu",
                "is_dangerous": True,
            },
            {
                "name": "archive:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Lưu trữ dữ liệu năm học cũ",
                "is_dangerous": True,
            },
            {
                "name": "manage:academic_years",
                "group_code": "ACADEMIC_YEARS_MGMT",
                "module": "MASTER",
                "description": "Toàn quyền quản trị niên khóa và năm học",
                "is_dangerous": True,
            },
            {
                "name": "create:semesters",
                "group_code": "SEMESTERS_MGMT",
                "module": "MASTER",
                "description": "Khởi tạo học kỳ mới (Học kỳ 1, 2, hè)",
                "is_dangerous": False,
            },
            {
                "name": "read:semesters",
                "group_code": "SEMESTERS_MGMT",
                "module": "MASTER",
                "description": "Xem danh sách các học kỳ và mốc thời gian khóa sổ",
                "is_dangerous": False,
            },
            {
                "name": "update:semesters",
                "group_code": "SEMESTERS_MGMT",
                "module": "MASTER",
                "description": "Chỉnh sửa mốc thời gian học kỳ và hạn nhập điểm",
                "is_dangerous": False,
            },
            {
                "name": "lock:semesters",
                "group_code": "SEMESTERS_MGMT",
                "module": "MASTER",
                "description": "Khóa sổ điểm điện tử của học kỳ",
                "is_dangerous": True,
            },
            {
                "name": "unlock:semesters",
                "group_code": "SEMESTERS_MGMT",
                "module": "MASTER",
                "description": "Mở khóa sổ điểm điện tử của học kỳ để bổ sung điểm",
                "is_dangerous": True,
            },
            {
                "name": "manage:semesters",
                "group_code": "SEMESTERS_MGMT",
                "module": "MASTER",
                "description": "Toàn quyền quản trị học kỳ và thời hạn sổ điểm",
                "is_dangerous": True,
            },
            # =========================================================================
            # 11. MASTER DOMAIN: SUBJECTS & DEPARTMENTS (Tables: subjects, departments)
            # =========================================================================
            {
                "name": "create:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Tạo mới môn học trong chương trình giáo dục",
                "is_dangerous": False,
            },
            {
                "name": "read:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Xem danh mục các môn học",
                "is_dangerous": False,
            },
            {
                "name": "update:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Cập nhật tên, viết tắt và tổ quản lý môn học",
                "is_dangerous": False,
            },
            {
                "name": "delete:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Xóa môn học khỏi chương trình đào tạo",
                "is_dangerous": True,
            },
            {
                "name": "export:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Xuất danh mục môn học ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "import:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Nhập danh mục môn học từ tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "manage:subjects",
                "group_code": "SUBJECTS_MGMT",
                "module": "MASTER",
                "description": "Toàn quyền quản lý danh mục môn học",
                "is_dangerous": True,
            },
            {
                "name": "create:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Tạo mới tổ bộ môn / tổ chuyên môn",
                "is_dangerous": False,
            },
            {
                "name": "read:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Xem danh sách các tổ bộ môn và thành viên",
                "is_dangerous": False,
            },
            {
                "name": "update:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Chỉnh sửa tên tổ bộ môn và thông tin quản lý",
                "is_dangerous": False,
            },
            {
                "name": "delete:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Xóa tổ bộ môn khỏi hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "assign:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Bổ nhiệm tổ trưởng / tổ phó chuyên môn",
                "is_dangerous": False,
            },
            {
                "name": "unassign:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Bãi nhiệm chức vụ trong tổ chuyên môn",
                "is_dangerous": True,
            },
            {
                "name": "manage:departments",
                "group_code": "DEPARTMENTS_MGMT",
                "module": "MASTER",
                "description": "Toàn quyền quản trị cơ cấu tổ bộ môn",
                "is_dangerous": True,
            },
            # =========================================================================
            # 12. ACADEMIC DOMAIN: ROOMS & PERIODS (Tables: rooms, periods)
            # =========================================================================
            {
                "name": "create:rooms",
                "group_code": "ROOMS_MGMT",
                "module": "ACADEMIC",
                "description": "Thêm mới phòng học, phòng thí nghiệm hoặc hội trường",
                "is_dangerous": False,
            },
            {
                "name": "read:rooms",
                "group_code": "ROOMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem danh sách cơ sở vật chất phòng học và sức chứa",
                "is_dangerous": False,
            },
            {
                "name": "update:rooms",
                "group_code": "ROOMS_MGMT",
                "module": "ACADEMIC",
                "description": "Cập nhật sức chứa, thiết bị và trạng thái phòng học",
                "is_dangerous": False,
            },
            {
                "name": "delete:rooms",
                "group_code": "ROOMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xóa phòng học khỏi danh mục cơ sở vật chất",
                "is_dangerous": True,
            },
            {
                "name": "schedule:rooms",
                "group_code": "ROOMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xếp lịch sử dụng phòng học, phòng lab cho các lớp",
                "is_dangerous": False,
            },
            {
                "name": "manage:rooms",
                "group_code": "ROOMS_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị cơ sở vật chất phòng học",
                "is_dangerous": True,
            },
            {
                "name": "create:periods",
                "group_code": "PERIODS_MGMT",
                "module": "ACADEMIC",
                "description": "Thêm mới khung giờ tiết học",
                "is_dangerous": False,
            },
            {
                "name": "read:periods",
                "group_code": "PERIODS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem danh sách các tiết học sáng và chiều",
                "is_dangerous": False,
            },
            {
                "name": "update:periods",
                "group_code": "PERIODS_MGMT",
                "module": "ACADEMIC",
                "description": "Chỉnh sửa khung giờ bắt đầu và kết thúc tiết học",
                "is_dangerous": False,
            },
            {
                "name": "manage:periods",
                "group_code": "PERIODS_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản lý cấu hình khung giờ học tập",
                "is_dangerous": True,
            },
            # =========================================================================
            # 13. ACADEMIC DOMAIN: TIMETABLES (Table: timetables)
            # =========================================================================
            {
                "name": "create:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Tạo mục thời khóa biểu cho lớp học",
                "is_dangerous": False,
            },
            {
                "name": "read:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Xem lịch thời khóa biểu theo lớp, giáo viên hoặc phòng",
                "is_dangerous": False,
            },
            {
                "name": "update:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Điều chỉnh tiết học, môn học và giáo viên trong thời khóa biểu",
                "is_dangerous": False,
            },
            {
                "name": "delete:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Xóa lịch thời khóa biểu",
                "is_dangerous": True,
            },
            {
                "name": "schedule:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Thực hiện thuật toán xếp thời khóa biểu tự động hoặc thủ công",
                "is_dangerous": False,
            },
            {
                "name": "publish:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Công khai phát hành thời khóa biểu áp dụng chính thức",
                "is_dangerous": False,
            },
            {
                "name": "unpublish:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Thu hồi thời khóa biểu để tạm dừng áp dụng hoặc chỉnh sửa",
                "is_dangerous": True,
            },
            {
                "name": "duplicate:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Sao chép thời khóa biểu giữa các tuần hoặc học kỳ",
                "is_dangerous": False,
            },
            {
                "name": "export:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất thời khóa biểu ra tệp Excel hoặc định dạng in PDF",
                "is_dangerous": False,
            },
            {
                "name": "manage:timetables",
                "group_code": "TIMETABLES_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị thời khóa biểu nhà trường",
                "is_dangerous": True,
            },
            # =========================================================================
            # 14. ACADEMIC DOMAIN: ATTENDANCE (Tables: attendance, attendance_logs)
            # =========================================================================
            {
                "name": "create:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Tạo bản ghi điểm danh học sinh",
                "is_dangerous": False,
            },
            {
                "name": "read:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Xem báo cáo điểm danh chuyên cần của lớp học",
                "is_dangerous": False,
            },
            {
                "name": "update:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Cập nhật lại trạng thái điểm danh khi có lý do chính đáng",
                "is_dangerous": False,
            },
            {
                "name": "delete:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Xóa bản ghi điểm danh",
                "is_dangerous": True,
            },
            {
                "name": "attend:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Thực hiện thao tác điểm danh học sinh đầu giờ hoặc theo tiết",
                "is_dangerous": False,
            },
            {
                "name": "submit:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Gửi nộp bảng điểm danh lên ban giám hiệu / giám thị",
                "is_dangerous": False,
            },
            {
                "name": "approve:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Phê duyệt bảng tổng kết điểm danh chuyên cần",
                "is_dangerous": False,
            },
            {
                "name": "export:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất báo cáo chuyên cần ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "notify:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Tự động gửi thông báo vắng mặt tới phụ huynh học sinh",
                "is_dangerous": False,
            },
            {
                "name": "manage:attendance",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị hệ thống điểm danh chuyên cần",
                "is_dangerous": True,
            },
            {
                "name": "read:attendance_logs",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Xem nhật ký kiểm toán thay đổi dữ liệu điểm danh",
                "is_dangerous": False,
            },
            {
                "name": "export:attendance_logs",
                "group_code": "ATTENDANCE_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất nhật ký thay đổi điểm danh phục vụ kiểm tra",
                "is_dangerous": False,
            },
            # =========================================================================
            # 15. ACADEMIC DOMAIN: LEAVE REQUESTS (Table: leave_requests)
            # =========================================================================
            {
                "name": "create:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Lập đơn xin nghỉ phép (học sinh hoặc phụ huynh)",
                "is_dangerous": False,
            },
            {
                "name": "read:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Xem danh sách và chi tiết đơn xin nghỉ học",
                "is_dangerous": False,
            },
            {
                "name": "update:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Chỉnh sửa nội dung đơn xin nghỉ phép",
                "is_dangerous": False,
            },
            {
                "name": "delete:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Hủy đơn xin nghỉ phép khi chưa duyệt",
                "is_dangerous": True,
            },
            {
                "name": "submit:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Gửi đơn xin nghỉ phép cho giáo viên chủ nhiệm duyệt",
                "is_dangerous": False,
            },
            {
                "name": "approve:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Phê duyệt đơn xin nghỉ phép học sinh (GVCN hoặc Y tế)",
                "is_dangerous": False,
            },
            {
                "name": "reject:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Từ chối duyệt đơn xin nghỉ phép không hợp lệ",
                "is_dangerous": True,
            },
            {
                "name": "notify:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Gửi thông báo kết quả duyệt đơn cho phụ huynh học sinh",
                "is_dangerous": False,
            },
            {
                "name": "manage:leave_requests",
                "group_code": "LEAVE_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị đơn xin nghỉ học toàn trường",
                "is_dangerous": True,
            },
            # =========================================================================
            # 16. ACADEMIC DOMAIN: ASSIGNMENTS (Tables: assignments, assignment_submissions)
            # =========================================================================
            {
                "name": "create:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Tạo bài tập về nhà hoặc nhiệm vụ học tập mới",
                "is_dangerous": False,
            },
            {
                "name": "read:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem danh sách bài tập được giao và hạn nộp",
                "is_dangerous": False,
            },
            {
                "name": "update:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Chỉnh sửa nội dung đề bài và thời hạn nộp bài",
                "is_dangerous": False,
            },
            {
                "name": "delete:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Xóa bài tập đã giao",
                "is_dangerous": True,
            },
            {
                "name": "publish:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Phát hành bài tập công khai cho học sinh làm",
                "is_dangerous": False,
            },
            {
                "name": "unpublish:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Thu hồi bài tập về chế độ nháp",
                "is_dangerous": True,
            },
            {
                "name": "duplicate:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Nhân bản bài tập sang các lớp khác cùng khối",
                "is_dangerous": False,
            },
            {
                "name": "grade:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Chấm điểm bài làm nộp của học sinh",
                "is_dangerous": False,
            },
            {
                "name": "comment:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Nhận xét, phản hồi chi tiết về bài làm học sinh",
                "is_dangerous": False,
            },
            {
                "name": "export:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất thống kê kết quả làm bài tập ra Excel",
                "is_dangerous": False,
            },
            {
                "name": "manage:assignments",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản lý kho bài tập",
                "is_dangerous": True,
            },
            {
                "name": "submit:assignment_submissions",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Nộp bài làm bài tập (quyền của học sinh)",
                "is_dangerous": False,
            },
            {
                "name": "read:assignment_submissions",
                "group_code": "ASSIGNMENTS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem bài nộp và phản hồi từ giáo viên",
                "is_dangerous": False,
            },
            # =========================================================================
            # 17. ACADEMIC DOMAIN: EXAMINATIONS (Tables: exams, exam_submissions, exam_event_logs)
            # =========================================================================
            {
                "name": "create:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Tạo kỳ thi, đợt kiểm tra trực tuyến hoặc tự luận",
                "is_dangerous": False,
            },
            {
                "name": "read:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem danh sách các kỳ thi và lịch thi",
                "is_dangerous": False,
            },
            {
                "name": "update:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Chỉnh sửa cấu hình phòng thi, thời gian và đề thi",
                "is_dangerous": False,
            },
            {
                "name": "delete:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Hủy bỏ đợt thi",
                "is_dangerous": True,
            },
            {
                "name": "schedule:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xếp lịch thi và phân công giám thị phòng thi",
                "is_dangerous": False,
            },
            {
                "name": "publish:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Phát hành đề thi cho thí sinh bắt đầu làm bài",
                "is_dangerous": False,
            },
            {
                "name": "unpublish:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Thu hồi đề thi để sửa chữa hoặc bảo mật",
                "is_dangerous": True,
            },
            {
                "name": "lock:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Khóa bài thi sau khi hết giờ làm bài",
                "is_dangerous": True,
            },
            {
                "name": "unlock:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Mở khóa cho phép thí sinh đặc cách làm lại bài thi",
                "is_dangerous": True,
            },
            {
                "name": "grade:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Chấm điểm bài thi tự luận hoặc xét điểm phúc khảo",
                "is_dangerous": False,
            },
            {
                "name": "export:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất bảng điểm bài thi ra Excel",
                "is_dangerous": False,
            },
            {
                "name": "archive:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Lưu trữ bài thi và bài làm sau khi chấm xong",
                "is_dangerous": True,
            },
            {
                "name": "manage:exams",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị kỳ thi",
                "is_dangerous": True,
            },
            {
                "name": "submit:exam_submissions",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Nộp bài làm bài thi trực tuyến (thí sinh)",
                "is_dangerous": False,
            },
            {
                "name": "read:exam_submissions",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem chi tiết bài làm bài thi của học sinh",
                "is_dangerous": False,
            },
            {
                "name": "read:exam_event_logs",
                "group_code": "EXAMS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem nhật ký giám sát phòng thi và vi phạm chuyển tab",
                "is_dangerous": False,
            },
            # =========================================================================
            # 18. ACADEMIC DOMAIN: GRADES & SCOREBOOK (Tables: student_scores, score_types)
            # =========================================================================
            {
                "name": "create:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Nhập đầu điểm mới cho học sinh",
                "is_dangerous": False,
            },
            {
                "name": "read:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Xem sổ điểm điện tử và bảng điểm tổng kết",
                "is_dangerous": False,
            },
            {
                "name": "update:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Sửa đổi điểm số của học sinh khi có phê duyệt",
                "is_dangerous": False,
            },
            {
                "name": "delete:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Xóa bản ghi điểm số",
                "is_dangerous": True,
            },
            {
                "name": "grade:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Thực hiện thao tác vào điểm trong sổ điểm điện tử",
                "is_dangerous": False,
            },
            {
                "name": "comment:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Nhập lời nhận xét đánh giá học lực vào học bạ",
                "is_dangerous": False,
            },
            {
                "name": "lock:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Khóa sổ điểm sau thời hạn kết thúc học kỳ",
                "is_dangerous": True,
            },
            {
                "name": "unlock:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Mở khóa sổ điểm để sửa sai sót điểm (Ban Giám Hiệu duyệt)",
                "is_dangerous": True,
            },
            {
                "name": "submit:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Giáo viên gửi nộp bảng điểm bộ môn cho tổ trưởng/BGH",
                "is_dangerous": False,
            },
            {
                "name": "approve:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Ban Giám hiệu phê duyệt bảng điểm chính thức",
                "is_dangerous": False,
            },
            {
                "name": "publish:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Công bố điểm số và kết quả học tập cho học sinh/phụ huynh",
                "is_dangerous": False,
            },
            {
                "name": "unpublish:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Ẩn bảng điểm đã công bố để kiểm tra lại sai sót",
                "is_dangerous": True,
            },
            {
                "name": "export:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất sổ điểm và bảng điểm tổng kết ra tệp Excel",
                "is_dangerous": False,
            },
            {
                "name": "import:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Nhập điểm hàng loạt từ tệp Excel chuẩn Bộ GD&ĐT",
                "is_dangerous": False,
            },
            {
                "name": "manage:student_scores",
                "group_code": "GRADES_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị sổ điểm và học bạ điện tử",
                "is_dangerous": True,
            },
            # =========================================================================
            # 19. ACADEMIC DOMAIN: CLASS JOURNAL / SỔ ĐẦU BÀI (Table: journals)
            # =========================================================================
            {
                "name": "create:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Ghi sổ đầu bài điện tử sau tiết dạy",
                "is_dangerous": False,
            },
            {
                "name": "read:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Xem sổ đầu bài điện tử của các lớp học",
                "is_dangerous": False,
            },
            {
                "name": "update:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Chỉnh sửa nội dung tiết dạy và đánh giá tiết học",
                "is_dangerous": False,
            },
            {
                "name": "submit:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Nộp sổ đầu bài tuần cho ban giám thị duyệt",
                "is_dangerous": False,
            },
            {
                "name": "approve:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Phê duyệt và tổng kết sổ đầu bài tuần",
                "is_dangerous": False,
            },
            {
                "name": "comment:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Ghi nhận xét và xếp loại giờ dạy trong sổ đầu bài",
                "is_dangerous": False,
            },
            {
                "name": "export:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Xuất sổ đầu bài ra tệp Excel/PDF",
                "is_dangerous": False,
            },
            {
                "name": "manage:journals",
                "group_code": "JOURNALS_MGMT",
                "module": "ACADEMIC",
                "description": "Toàn quyền quản trị sổ đầu bài điện tử",
                "is_dangerous": True,
            },
            # =========================================================================
            # 20. EMULATION & DISCIPLINE (Tables: emulation_rules, disciplinary_records, awards)
            # =========================================================================
            {
                "name": "create:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Ghi nhận vi phạm nề nếp kỷ luật của học sinh",
                "is_dangerous": False,
            },
            {
                "name": "read:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Xem danh sách các vi phạm kỷ luật của học sinh và lớp",
                "is_dangerous": False,
            },
            {
                "name": "update:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Chỉnh sửa biên bản ghi nhận vi phạm",
                "is_dangerous": False,
            },
            {
                "name": "delete:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Xóa bỏ biên bản vi phạm kỷ luật",
                "is_dangerous": True,
            },
            {
                "name": "submit:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Gửi hồ sơ kỷ luật lên Hội đồng kỷ luật nhà trường",
                "is_dangerous": False,
            },
            {
                "name": "approve:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Phê duyệt quyết định xử lý kỷ luật học sinh",
                "is_dangerous": False,
            },
            {
                "name": "notify:disciplinary_records",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Gửi thông báo vi phạm nề nếp tới phụ huynh học sinh",
                "is_dangerous": False,
            },
            {
                "name": "create:awards",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Đề xuất khen thưởng cho học sinh và tập thể lớp",
                "is_dangerous": False,
            },
            {
                "name": "read:awards",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Xem danh sách các danh hiệu và thành tích khen thưởng",
                "is_dangerous": False,
            },
            {
                "name": "approve:awards",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Phê duyệt quyết định khen thưởng cấp trường",
                "is_dangerous": False,
            },
            {
                "name": "publish:awards",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Vinh danh và công bố bảng vàng khen thưởng toàn trường",
                "is_dangerous": False,
            },
            {
                "name": "manage:emulation",
                "group_code": "EMULATION_MGMT",
                "module": "EMULATION",
                "description": "Toàn quyền quản trị thi đua khen thưởng và kỷ luật",
                "is_dangerous": True,
            },
            # =========================================================================
            # 21. NOTIFICATION & CONTACT BOOK (Tables: announcements, contact_books)
            # =========================================================================
            {
                "name": "create:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Soạn thông báo hoặc tin tức mới của trường",
                "is_dangerous": False,
            },
            {
                "name": "read:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Xem các thông báo và tin tức học đường",
                "is_dangerous": False,
            },
            {
                "name": "update:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Chỉnh sửa nội dung bản tin thông báo",
                "is_dangerous": False,
            },
            {
                "name": "delete:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Xóa bản tin thông báo",
                "is_dangerous": True,
            },
            {
                "name": "publish:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Phát hành thông báo tới toàn trường, khối hoặc lớp",
                "is_dangerous": False,
            },
            {
                "name": "unpublish:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Gỡ bỏ thông báo đã phát hành",
                "is_dangerous": True,
            },
            {
                "name": "notify:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Bắn thông báo đẩy (Push/Email/SMS) tới người dùng",
                "is_dangerous": False,
            },
            {
                "name": "manage:announcements",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Toàn quyền quản trị kênh thông báo và truyền thông",
                "is_dangerous": True,
            },
            {
                "name": "create:contact_books",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Tạo sổ liên lạc điện tử định kỳ cho học sinh",
                "is_dangerous": False,
            },
            {
                "name": "read:contact_books",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Xem nội dung sổ liên lạc điện tử",
                "is_dangerous": False,
            },
            {
                "name": "comment:contact_books",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Ghi nhận xét của giáo viên chủ nhiệm vào sổ liên lạc",
                "is_dangerous": False,
            },
            {
                "name": "share:contact_books",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Gửi sổ liên lạc điện tử về cho phụ huynh ký nhận",
                "is_dangerous": False,
            },
            {
                "name": "manage:contact_books",
                "group_code": "COMMUNICATIONS_MGMT",
                "module": "NOTIFICATION",
                "description": "Toàn quyền quản trị sổ liên lạc điện tử",
                "is_dangerous": True,
            },
            # =========================================================================
            # 22. SYSTEM AUDIT & CONFIGURATION (Tables: audit_logs, configurations)
            # =========================================================================
            {
                "name": "read:audit_logs",
                "group_code": "SYSTEM_SECURITY",
                "module": "SYSTEM",
                "description": "Xem nhật ký truy vết hoạt động hệ thống",
                "is_dangerous": False,
            },
            {
                "name": "export:audit_logs",
                "group_code": "SYSTEM_SECURITY",
                "module": "SYSTEM",
                "description": "Xuất nhật ký kiểm toán hệ thống ra tệp Excel/CSV",
                "is_dangerous": False,
            },
            {
                "name": "archive:audit_logs",
                "group_code": "SYSTEM_SECURITY",
                "module": "SYSTEM",
                "description": "Lưu trữ nhật ký kiểm toán hệ thống cũ",
                "is_dangerous": True,
            },
            {
                "name": "read:configurations",
                "group_code": "SYSTEM_SETTINGS",
                "module": "SYSTEM",
                "description": "Xem tham số cấu hình chung của hệ thống",
                "is_dangerous": False,
            },
            {
                "name": "update:configurations",
                "group_code": "SYSTEM_SETTINGS",
                "module": "SYSTEM",
                "description": "Cập nhật tham số cấu hình hoạt động hệ thống",
                "is_dangerous": True,
            },
            {
                "name": "manage:system",
                "group_code": "SYSTEM_SETTINGS",
                "module": "SYSTEM",
                "description": "Toàn quyền quản trị cấu hình lõi hệ sinh thái SchoolPro",
                "is_dangerous": True,
            },
        ]

        with transaction.atomic():
            for p_info in permissions_data:
                # Idempotent lookup by name [action]:[table_name]
                perm_obj = Permission.objects.filter(name=p_info["name"]).first()
                created = False

                if not perm_obj:
                    # Automatically generate a unique 12-digit random numeric code using the existing utility
                    unique_code = generate_unique_code(Permission, "code")
                    perm_obj = Permission.objects.create(
                        id=uuid6.uuid7(),
                        code=unique_code,
                        name=p_info["name"],
                        group_code=p_info["group_code"],
                        module=p_info["module"],
                        description=p_info["description"],
                        is_dangerous=p_info["is_dangerous"],
                    )
                    created = True
                else:
                    # Synchronize attributes
                    perm_obj.group_code = p_info["group_code"]
                    perm_obj.module = p_info["module"]
                    perm_obj.description = p_info["description"]
                    perm_obj.is_dangerous = p_info["is_dangerous"]
                    perm_obj.save(
                        update_fields=[
                            "group_code",
                            "module",
                            "description",
                            "is_dangerous",
                        ]
                    )

                status_msg = f"Created (Code: {perm_obj.code})" if created else "Updated"
                flag_str = "⚠️ DANGEROUS" if perm_obj.is_dangerous else "SAFE"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  [{perm_obj.module:<10}] {perm_obj.name:<35} [{flag_str:<11}] ({status_msg})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(permissions_data)} comprehensive Permissions!"
            )
        )
