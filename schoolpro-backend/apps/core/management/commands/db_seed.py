"""
Master Database Seeder for SchoolPro Backend.
Executes individual table seed commands in topological dependency order.

Usage:
    python manage.py db_seed
"""

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Runs all modular database seeders in exact topological dependency order."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=================================================="))
        self.stdout.write(self.style.NOTICE(" 🌱 STARTING COMPREHENSIVE SCHOOLPRO DATABASE SEED"))
        self.stdout.write(self.style.NOTICE("==================================================\n"))

        # Master Core & Foundation seed pipeline ordered strictly by Foreign Key DAG
        seed_pipeline = [
            # 1. Identity, Security & RBAC Foundations
            ("seed_roles", "Core: Roles (37 vai trò hệ thống)"),
            ("seed_permissions", "Core: Permissions (Danh mục quyền hạn)"),
            ("seed_role_permissions", "Core: Role-Permission Matrix (Phân quyền RBAC)"),
            ("seed_modules", "System: Dynamic System Modules (Danh mục chức năng)"),
            (
                "seed_role_modules",
                "System: Role-Module Dashboard Layouts (Bố cục Dashboard 37 Roles)",
            ),
            # 2. Master Institutional Data & Lookups
            ("seed_schools", "Master: School Profile (Hồ sơ pháp nhân trường học)"),
            ("seed_academic_years", "Master: Academic Year (Năm học)"),
            ("seed_semesters", "Master: Semesters (Học kỳ)"),
            ("seed_grades", "Master: Grades (Khối 10, 11, 12)"),
            ("seed_departments", "Master: Departments (Tổ chuyên môn & Tổ văn phòng)"),
            ("seed_subjects", "Master: Subjects (Môn học Giáo dục phổ thông 2018)"),
            ("seed_positions", "Master: Positions (Danh mục chức vụ & hệ số phụ cấp)"),
            ("seed_lookup_types", "Master: Lookup Types (Danh mục tra cứu)"),
            ("seed_lookup_values", "Master: Lookup Values (Giá trị tra cứu)"),
            # 3. Academic Physical & Operational Infrastructure
            ("seed_rooms", "Academic: Rooms & Facilities (115 phòng học & Cơ sở vật chất)"),
            ("seed_periods", "Academic: Periods (Tiết học ca sáng/chiều)"),
            ("seed_score_types", "Academic: Score Types (Đầu điểm TT22/TT-BGDĐT)"),
            # 4. Identity Accounts, Profiles & Baseline Classes
            ("seed_users", "Core: 37 Enterprise Users (Tài khoản người dùng)"),
            ("seed_staff", "Core: Staff Profiles (16 Cán bộ nhân viên văn phòng & BGH)"),
            ("seed_teachers", "Core: Teacher Profiles (50 Giáo viên - 5 Giáo viên/Tổ chuyên môn)"),
            ("seed_classes", "Core: School Classes (70 Lớp: 10A1-10A24, 11A1-11A23, 12A1-12A23)"),
            ("seed_students", "Core: Student Profiles (10 Học sinh lớp 10A1)"),
            ("seed_class_groups", "Core: Class Groups (Tổ học tập & trực nhật lớp 10A1)"),
            ("seed_guardians", "Core: Guardian Profiles (3 Phụ huynh học sinh)"),
            # 5. Academic Timetables, Leave Requests & Assignments
            (
                "seed_class_timetable",
                "Academic: Class 10A1 Timetable & Subject Teachers (Thời khóa biểu & Phân công giảng dạy)",
            ),
            (
                "seed_leave_requests",
                "Academic: Student Leave Requests (Đơn xin nghỉ phép & Nhật ký duyệt)",
            ),
            (
                "seed_assignments",
                "Academic: Assignments & Submissions (Bài tập, Bài nộp, Rubric & Nhật ký)",
            ),
            (
                "seed_exams",
                "Academic: Exams & Question Bank (Đề thi trắc nghiệm, Ngân hàng câu hỏi, Bài nộp & Chấm điểm)",
            ),
        ]

        total_steps = len(seed_pipeline)

        for idx, (cmd_name, description) in enumerate(seed_pipeline, start=1):
            self.stdout.write(
                self.style.NOTICE(f"[{idx}/{total_steps}] Seeding: {description} ({cmd_name})...")
            )
            try:
                call_command(cmd_name)
                self.stdout.write("")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error occurred during '{cmd_name}': {e}"))
                raise e

        self.stdout.write(self.style.SUCCESS("=================================================="))
        self.stdout.write(self.style.SUCCESS(" 🎉 ALL DATABASE SEEDERS COMPLETED SUCCESSFULLY!"))
        self.stdout.write(self.style.SUCCESS("=================================================="))
