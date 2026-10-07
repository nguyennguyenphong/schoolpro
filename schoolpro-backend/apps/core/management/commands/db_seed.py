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

        # Table-level seed commands ordered strictly by Foreign Key DAG
        seed_pipeline = [
            # 1. Identity & Institutional Foundations
            ("seed_roles", "Core: Roles & System Permissions"),
            ("seed_schools", "Master: School Profile"),
            ("seed_academic_years", "Master: Academic Year"),
            ("seed_semesters", "Master: Semesters"),
            ("seed_users", "Core: Superadmin User & Role Assignment"),
            # 2. Master Lookups & Academic Infrastructures
            ("seed_lookup_types", "Master: Lookup Types"),
            ("seed_lookup_values", "Master: Lookup Values"),
            ("seed_grades", "Master: Grades (Khối 10, 11, 12)"),
            ("seed_rooms", "Academic: Rooms & Facilities"),
            ("seed_periods", "Academic: Periods (Tiết học)"),
            ("seed_departments", "Master: Departments (Tổ bộ môn)"),
            ("seed_subjects", "Master: Subjects (Môn học)"),
            ("seed_score_types", "Academic: Score Types (Đầu điểm TT22)"),
            # 3. Organization, Teaching Assignment & Profiles
            ("seed_teachers", "Core: Teachers & Accounts"),
            ("seed_classes", "Core: Classes (Lớp học)"),
            ("seed_class_subject_teachers", "Core: ClassSubjectTeacher (Phân công giảng dạy)"),
            ("seed_students", "Core: Students & Accounts"),
            ("seed_student_enrollments", "Core: StudentClassEnrollments (Phân lớp học sinh)"),
            ("seed_guardians", "Core: Guardians & Accounts (Phụ huynh)"),
            # 4. Academic Daily Operations
            ("seed_timetables", "Academic: Timetables (Thời khóa biểu)"),
            ("seed_attendances", "Academic: Attendance & Attendance Logs"),
            ("seed_leave_requests", "Academic: Leave Requests (Đơn xin nghỉ phép)"),
            ("seed_assignments", "Academic: Assignments & Submissions (Bài tập)"),
            ("seed_exams", "Academic: Exams, Submissions & Event Logs (Thi cử)"),
            # 5. System UI & Dashboard Modules
            ("seed_modules", "System: Dynamic Modules & Dashboard Cards"),
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
