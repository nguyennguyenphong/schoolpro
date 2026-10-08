"""
Management command to seed comprehensive enterprise Roles for SchoolPro.
Table: "core"."roles"

Usage:
    python manage.py seed_roles
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.role import Role
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds comprehensive enterprise RBAC roles for K-12 education ecosystem."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding comprehensive Enterprise Roles (core.roles)...")
        )

        # Master list of all specialized educational and administrative roles
        roles_data = [
            # =========================================================================
            # 1. BOARD OF DIRECTORS & SYSTEM ADMINISTRATION
            # =========================================================================
            {
                "name": "Quản trị viên toàn quyền hệ thống",
                "description": "Full technical administration, security configuration, user permissions, and global data management",
                "badge_color": "#0F172A",  # Slate 900
                "icon": "shield-check",
                "priority": 100,
                "is_system": True,
                "metadata": {"group": "SYSTEM_ADMIN", "scope": "SYSTEM_WIDE"},
            },
            {
                "name": "Hiệu trưởng",
                "description": "School Principal - Overall strategic leadership, annual school plan approval, and executive decisions",
                "badge_color": "#1E293B",  # Slate 800
                "icon": "user-tie",
                "priority": 95,
                "is_system": True,
                "metadata": {"group": "LEADERSHIP", "scope": "SCHOOL_WIDE"},
            },
            {
                "name": "Phó Hiệu trưởng phụ trách Chuyên môn",
                "description": "Vice Principal (Academic Affairs) - Oversees curriculum, teaching schedules, examinations, and academic grading",
                "badge_color": "#1E3A8A",  # Blue 900
                "icon": "graduation-cap",
                "priority": 90,
                "is_system": True,
                "metadata": {"group": "LEADERSHIP", "scope": "ACADEMIC"},
            },
            {
                "name": "Phó Hiệu trưởng phụ trách Công tác học sinh",
                "description": "Vice Principal (Student Affairs) - Manages student discipline, emulation rankings, youth movements, and conduct evaluations",
                "badge_color": "#14532D",  # Green 900
                "icon": "award",
                "priority": 90,
                "is_system": True,
                "metadata": {"group": "LEADERSHIP", "scope": "STUDENT_AFFAIRS"},
            },
            {
                "name": "Thư ký Hội đồng trường",
                "description": "School Council Secretary - Records official faculty board meetings, council resolutions, and institutional archives",
                "badge_color": "#334155",  # Slate 700
                "icon": "file-text",
                "priority": 85,
                "is_system": True,
                "metadata": {"group": "LEADERSHIP", "scope": "GOVERNANCE"},
            },
            {
                "name": "Trưởng ban Thanh tra nhân dân",
                "description": "Head of People's Inspection Board - Supervises institutional compliance, policy adherence, and internal audit",
                "badge_color": "#475569",  # Slate 600
                "icon": "shield",
                "priority": 85,
                "is_system": False,
                "metadata": {"group": "LEADERSHIP", "scope": "INSPECTION"},
            },
            # =========================================================================
            # 2. ADMINISTRATIVE, SPECIALIZED & SUPPORT STAFF
            # =========================================================================
            {
                "name": "Giáo vụ trường học",
                "description": "Academic Registrar - Manages student records, enrollments, classroom assignments, official transcripts, and diplomas",
                "badge_color": "#0369A1",  # Sky 700
                "icon": "clipboard-list",
                "priority": 80,
                "is_system": True,
                "metadata": {"group": "ADMIN_STAFF", "scope": "REGISTRY"},
            },
            {
                "name": "Cán bộ Y tế học đường",
                "description": "School Healthcare Nurse - Manages student health profiles, medical leave requests, first aid, and periodic physical checkups",
                "badge_color": "#BE123C",  # Rose 700
                "icon": "heart-pulse",
                "priority": 75,
                "is_system": True,
                "metadata": {"group": "SPECIALIST_STAFF", "scope": "HEALTHCARE"},
            },
            {
                "name": "Cán bộ Thư viện",
                "description": "Librarian - Oversees textbook repositories, library borrowing/returning workflows, reference catalogs, and digital resources",
                "badge_color": "#7E22CE",  # Purple 700
                "icon": "book-open",
                "priority": 75,
                "is_system": True,
                "metadata": {"group": "SPECIALIST_STAFF", "scope": "LIBRARY"},
            },
            {
                "name": "Kế toán trường học",
                "description": "School Accountant - Manages tuition structures, fee invoicing, electronic billing records, and financial balance sheets",
                "badge_color": "#047857",  # Emerald 700
                "icon": "calculator",
                "priority": 75,
                "is_system": True,
                "metadata": {"group": "ADMIN_STAFF", "scope": "ACCOUNTING"},
            },
            {
                "name": "Thủ quỹ trường học",
                "description": "School Bursar/Cashier - Handles cash disbursements, receipt vouchers, tuition collection counters, and daily vault logs",
                "badge_color": "#059669",  # Emerald 600
                "icon": "banknotes",
                "priority": 70,
                "is_system": False,
                "metadata": {"group": "ADMIN_STAFF", "scope": "CASHIER"},
            },
            {
                "name": "Quản trị viên CNTT & Kỹ thuật",
                "description": "IT Systems Engineer - Administers network infrastructure, smart classroom devices, server systems, and technical hardware",
                "badge_color": "#4338CA",  # Indigo 700
                "icon": "server",
                "priority": 75,
                "is_system": True,
                "metadata": {"group": "TECHNICAL_STAFF", "scope": "IT_OPERATIONS"},
            },
            {
                "name": "Cán bộ Quản lý Thiết bị & Phòng Lab",
                "description": "Lab & Equipment Specialist - Maintains scientific laboratory assets, chemical supplies, and experimental apparatus",
                "badge_color": "#0891B2",  # Cyan 600
                "icon": "beaker",
                "priority": 70,
                "is_system": False,
                "metadata": {"group": "SPECIALIST_STAFF", "scope": "LABORATORY"},
            },
            {
                "name": "Giám thị / Quản sinh",
                "description": "Disciplinary Proctor - Monitors campus gates, student attire, gate punctuality, daily attendance logs, and infractions",
                "badge_color": "#C2410C",  # Orange 700
                "icon": "eye",
                "priority": 70,
                "is_system": True,
                "metadata": {"group": "ADMIN_STAFF", "scope": "DISCIPLINE"},
            },
            {
                "name": "Chuyên viên Tư vấn tâm lý học đường",
                "description": "School Counselor - Delivers psychological consultation, peer mediation, career orientation, and mental health counseling",
                "badge_color": "#0D9488",  # Teal 600
                "icon": "sparkles",
                "priority": 70,
                "is_system": False,
                "metadata": {"group": "SPECIALIST_STAFF", "scope": "COUNSELING"},
            },
            {
                "name": "Nhân viên Bảo vệ & An ninh",
                "description": "Campus Security Officer - Secures school perimeters, patrols school facilities, verifies visitors, and safeguards campus safety",
                "badge_color": "#374151",  # Gray 700
                "icon": "shield-exclamation",
                "priority": 60,
                "is_system": False,
                "metadata": {"group": "SUPPORT_STAFF", "scope": "SECURITY"},
            },
            {
                "name": "Nhân viên Hậu cần & Tạp vụ",
                "description": "Facility & Sanitation Staff - Oversees campus hygiene, public area sanitation, classroom utilities, and janitorial operations",
                "badge_color": "#4B5563",  # Gray 600
                "icon": "wrench",
                "priority": 60,
                "is_system": False,
                "metadata": {"group": "SUPPORT_STAFF", "scope": "LOGISTICS"},
            },
            # =========================================================================
            # 3. TEACHING & PEDAGOGICAL FACULTY
            # =========================================================================
            {
                "name": "Tổ trưởng chuyên môn",
                "description": "Head of Academic Department - Directs departmental subject syllabus, teacher assignments, and exam item review",
                "badge_color": "#1D4ED8",  # Blue 700
                "icon": "briefcase",
                "priority": 65,
                "is_system": True,
                "metadata": {"group": "FACULTY", "scope": "DEPARTMENT_HEAD"},
            },
            {
                "name": "Tổ phó chuyên môn",
                "description": "Deputy Head of Department - Assists department head with pedagogical supervision, lesson plan audits, and teacher mentoring",
                "badge_color": "#2563EB",  # Blue 600
                "icon": "briefcase",
                "priority": 62,
                "is_system": False,
                "metadata": {"group": "FACULTY", "scope": "DEPARTMENT_DEPUTY"},
            },
            {
                "name": "Giáo viên chủ nhiệm",
                "description": "Homeroom Teacher - Holistically leads assigned class, tracks daily attendance, assesses student conduct, and liaises with parents",
                "badge_color": "#3B82F6",  # Blue 500
                "icon": "user-check",
                "priority": 60,
                "is_system": True,
                "metadata": {"group": "FACULTY", "scope": "HOMEROOM"},
            },
            {
                "name": "Giáo viên bộ môn",
                "description": "Subject Teacher - Conducts lectures, logs class journals, enters exam scores, assigns homework, and designs online quizzes",
                "badge_color": "#60A5FA",  # Blue 400
                "icon": "book",
                "priority": 55,
                "is_system": True,
                "metadata": {"group": "FACULTY", "scope": "SUBJECT"},
            },
            # =========================================================================
            # 4. YOUTH UNION, PIONEER & EMULATION MOVEMENT
            # =========================================================================
            {
                "name": "Bí thư Đoàn trường",
                "description": "School Youth Union Secretary - Commands youth leagues, weekly emulation assessments, patriotic events, and volunteer campaigns",
                "badge_color": "#B91C1C",  # Red 700
                "icon": "flag",
                "priority": 55,
                "is_system": True,
                "metadata": {"group": "YOUTH_UNION", "scope": "UNION_SECRETARY"},
            },
            {
                "name": "Phó Bí thư Đoàn trường",
                "description": "Deputy Youth Union Secretary - Supports Youth Union governance, coordinates branch competitions, and student club programs",
                "badge_color": "#DC2626",  # Red 600
                "icon": "flag",
                "priority": 52,
                "is_system": False,
                "metadata": {"group": "YOUTH_UNION", "scope": "UNION_DEPUTY"},
            },
            {
                "name": "Ủy viên Ban Chấp hành Đoàn trường",
                "description": "Youth Union Executive Member - Supervises extracurricular activities, community projects, and youth membership development",
                "badge_color": "#E11D48",  # Rose 600
                "icon": "badge-check",
                "priority": 48,
                "is_system": False,
                "metadata": {"group": "YOUTH_UNION", "scope": "UNION_EXECUTIVE"},
            },
            {
                "name": "Cán bộ Đội Cờ đỏ / Sao đỏ",
                "description": "Student Emulation Inspector - Inspects morning assembly, student punctuality, uniform adherence, and records weekly demerits",
                "badge_color": "#EF4444",  # Red 500
                "icon": "star",
                "priority": 40,
                "is_system": False,
                "metadata": {"group": "YOUTH_UNION", "scope": "INSPECTOR"},
            },
            # =========================================================================
            # 5. CLASS STUDENT COMMITTEE LEADERSHIP
            # =========================================================================
            {
                "name": "Lớp trưởng",
                "description": "Class President (Monitor) - Represents the class body, conducts morning roll-calls, delivers class journals, and enforces order",
                "badge_color": "#D97706",  # Amber 600
                "icon": "crown",
                "priority": 38,
                "is_system": True,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "PRESIDENT"},
            },
            {
                "name": "Lớp phó học tập",
                "description": "Vice Monitor (Academic Affairs) - Tracks assignments, aids peers with coursework, encourages homework completion, and leads peer tutoring",
                "badge_color": "#F59E0B",  # Amber 500
                "icon": "sparkles",
                "priority": 35,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "ACADEMIC_VICE"},
            },
            {
                "name": "Lớp phó lao động và Đời sống",
                "description": "Vice Monitor (Labor & Sanitation) - Schedules classroom cleaning duties, inspects furniture preservation, and organizes sports teams",
                "badge_color": "#EA580C",  # Orange 600
                "icon": "check-square",
                "priority": 32,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "LABOR_VICE"},
            },
            {
                "name": "Lớp phó Văn - Thể - Mỹ",
                "description": "Vice Monitor (Culture & Arts) - Directs choir performances, sports tournaments, festival exhibitions, and team cohesion events",
                "badge_color": "#DB2777",  # Pink 600
                "icon": "music",
                "priority": 32,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "ARTS_VICE"},
            },
            {
                "name": "Bí thư Chi đoàn lớp",
                "description": "Class Youth Branch Secretary - Leads class youth members, manages member books, communicates union notices, and leads ideological meetings",
                "badge_color": "#F43F5E",  # Rose 500
                "icon": "flame",
                "priority": 34,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "BRANCH_SECRETARY"},
            },
            {
                "name": "Phó Bí thư Chi đoàn lớp",
                "description": "Class Deputy Youth Branch Secretary - Assists with class youth documentation, union dues collection, and volunteer initiatives",
                "badge_color": "#FB7185",  # Rose 400
                "icon": "flame",
                "priority": 30,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "BRANCH_DEPUTY"},
            },
            {
                "name": "Tổ trưởng tổ học tập",
                "description": "Study Group Leader - Supervises assigned squad members, collects exercise notebooks, and tallies intra-group emulation marks",
                "badge_color": "#CA8A04",  # Yellow 600
                "icon": "users-group",
                "priority": 28,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "GROUP_LEADER"},
            },
            {
                "name": "Tổ phó tổ học tập",
                "description": "Study Group Deputy Leader - Backs up group leader with attendance cross-checks, notebook pickups, and peer study groups",
                "badge_color": "#EAB308",  # Yellow 500
                "icon": "users",
                "priority": 25,
                "is_system": False,
                "metadata": {"group": "CLASS_COMMITTEE", "scope": "GROUP_DEPUTY"},
            },
            # =========================================================================
            # 6. GENERAL STUDENTS & GUARDIANS (PARENTS)
            # =========================================================================
            {
                "name": "Học sinh",
                "description": "Regular Student - Consults timetables, submits assignments, takes computer-based exams, checks gradebooks, and accesses digital learning content",
                "badge_color": "#16A34A",  # Green 600
                "icon": "academic-cap",
                "priority": 20,
                "is_system": True,
                "metadata": {"group": "GENERAL_STUDENT", "scope": "STUDENT"},
            },
            {
                "name": "Phụ huynh học sinh",
                "description": "Parent / Legal Guardian - Reviews electronic contact books, tracks attendance notifications, submits medical leaves, and pays tuition",
                "badge_color": "#64748B",  # Slate 500
                "icon": "users",
                "priority": 15,
                "is_system": True,
                "metadata": {"group": "GUARDIAN", "scope": "PARENT"},
            },
            {
                "name": "Trưởng ban đại diện Cha mẹ học sinh trường",
                "description": "President of School Parent Association - Represents all school parents, cooperates with administration on institutional programs",
                "badge_color": "#475569",  # Slate 600
                "icon": "heart-handshake",
                "priority": 22,
                "is_system": False,
                "metadata": {"group": "GUARDIAN", "scope": "SCHOOL_PARENT_PRESIDENT"},
            },
            {
                "name": "Trưởng ban đại diện Cha mẹ học sinh lớp",
                "description": "Class Parent Committee Representative - Coordinates between homeroom teacher and class parents for extracurricular funds and events",
                "badge_color": "#64748B",  # Slate 500
                "icon": "heart-handshake",
                "priority": 18,
                "is_system": False,
                "metadata": {"group": "GUARDIAN", "scope": "CLASS_PARENT_REPRESENTATIVE"},
            },
        ]

        with transaction.atomic():
            for r in roles_data:
                # Look up role by name to ensure idempotency
                role_obj = Role.objects.filter(name=r["name"]).first()
                created = False

                if not role_obj:
                    # Automatically generate a unique 12-digit random numeric code using the existing utility
                    unique_code = generate_unique_code(Role, "code")
                    role_obj = Role.objects.create(
                        id=uuid6.uuid7(),
                        code=unique_code,
                        name=r["name"],
                        description=r["description"],
                        badge_color=r["badge_color"],
                        icon=r["icon"],
                        priority=r["priority"],
                        is_system=r["is_system"],
                        is_active=True,
                        metadata=r["metadata"],
                    )
                    created = True
                else:
                    # Update fields to synchronize latest descriptions, badges, icons, priorities, and metadata
                    role_obj.description = r["description"]
                    role_obj.badge_color = r["badge_color"]
                    role_obj.icon = r["icon"]
                    role_obj.priority = r["priority"]
                    role_obj.is_system = r["is_system"]
                    role_obj.is_active = True
                    role_obj.metadata = r["metadata"]
                    role_obj.save(
                        update_fields=[
                            "description",
                            "badge_color",
                            "icon",
                            "priority",
                            "is_system",
                            "is_active",
                            "metadata",
                        ]
                    )

                status_msg = f"Created (Code: {role_obj.code})" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  [Priority: {role_obj.priority:>3}] Role: {role_obj.name:<45} ({status_msg})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(roles_data)} comprehensive Enterprise Roles!"
            )
        )
