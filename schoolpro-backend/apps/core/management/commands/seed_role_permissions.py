"""
Management command to map and seed RolePermissions for all 37 enterprise Roles.
Table: "core"."role_permissions"

Usage:
    python manage.py seed_role_permissions
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.permission import Permission, RolePermission
from apps.core.models.role import Role


class Command(BaseCommand):
    help = "Seeds granular RBAC RolePermission mappings for all 37 educational Roles."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Role Permissions (core.role_permissions)..."))

        # Helper cache of permissions by name
        all_perms = {p.name: p for p in Permission.objects.all()}
        if not all_perms:
            self.stdout.write(
                self.style.ERROR(
                    "Error: No permissions found in database. Run 'seed_permissions' first."
                )
            )
            return

        def get_perms(patterns):
            """Returns a list of Permission objects matching exact names or prefixes."""
            result = []
            for pat in patterns:
                if pat == "*":
                    result.extend(all_perms.values())
                elif pat.endswith(":*"):
                    prefix = pat.split(":*")[0] + ":"
                    result.extend([p for name, p in all_perms.items() if name.startswith(prefix)])
                elif pat.startswith("*:"):
                    suffix = ":" + pat.split("*:")[1]
                    result.extend([p for name, p in all_perms.items() if name.endswith(suffix)])
                elif pat in all_perms:
                    result.append(all_perms[pat])
            return list(set(result))

        # Comprehensive role-to-permission mapping rules
        role_permission_rules = {
            # 1. Leadership & Governance
            "Quản trị viên toàn quyền hệ thống": ["*"],
            "Hiệu trưởng": [
                "read:*",
                "approve:*",
                "publish:*",
                "export:*",
                "manage:schools",
                "lock:academic_years",
                "unlock:academic_years",
                "lock:semesters",
                "unlock:semesters",
                "approve:student_scores",
                "unlock:student_scores",
                "publish:student_scores",
                "approve:journals",
                "approve:disciplinary_records",
                "approve:awards",
                "publish:awards",
            ],
            "Phó Hiệu trưởng phụ trách Chuyên môn": [
                "read:*",
                "export:*",
                "manage:timetables",
                "schedule:timetables",
                "publish:timetables",
                "unpublish:timetables",
                "duplicate:timetables",
                "manage:exams",
                "schedule:exams",
                "publish:exams",
                "lock:exams",
                "unlock:exams",
                "manage:assignments",
                "publish:assignments",
                "approve:student_scores",
                "unlock:student_scores",
                "publish:student_scores",
                "approve:journals",
            ],
            "Phó Hiệu trưởng phụ trách Công tác học sinh": [
                "read:*",
                "export:*",
                "approve:disciplinary_records",
                "approve:awards",
                "publish:awards",
                "approve:leave_requests",
                "approve:attendance",
                "publish:announcements",
                "manage:emulation",
            ],
            "Thư ký Hội đồng trường": [
                "read:schools",
                "read:classes",
                "read:teachers",
                "read:students",
                "read:student_scores",
                "export:students",
                "export:teachers",
                "export:student_scores",
                "read:announcements",
                "publish:announcements",
            ],
            "Trưởng ban Thanh tra nhân dân": [
                "read:schools",
                "read:teachers",
                "read:students",
                "read:student_scores",
                "read:attendance",
                "read:journals",
                "read:audit_logs",
                "export:audit_logs",
            ],
            # 2. Administrative & Specialized Staff
            "Giáo vụ trường học": [
                "manage:students",
                "manage:classes",
                "manage:timetables",
                "export:students",
                "import:students",
                "enroll:students",
                "unenroll:students",
                "transfer:students",
                "promote:students",
                "archive:students",
                "restore:students",
                "export:classes",
                "import:classes",
                "read:student_scores",
                "export:student_scores",
            ],
            "Cán bộ Y tế học đường": [
                "read:students",
                "read:classes",
                "read:leave_requests",
                "approve:leave_requests",
                "reject:leave_requests",
                "notify:leave_requests",
            ],
            "Cán bộ Thư viện": [
                "read:students",
                "read:teachers",
                "read:classes",
                "read:subjects",
                "read:announcements",
            ],
            "Kế toán trường học": [
                "read:students",
                "read:classes",
                "read:schools",
                "export:students",
                "read:announcements",
            ],
            "Thủ quỹ trường học": [
                "read:students",
                "read:classes",
                "export:students",
            ],
            "Quản trị viên CNTT & Kỹ thuật": [
                "read:audit_logs",
                "export:audit_logs",
                "archive:audit_logs",
                "read:configurations",
                "update:configurations",
                "read:users",
                "lock:users",
                "unlock:users",
                "manage:system",
            ],
            "Cán bộ Quản lý Thiết bị & Phòng Lab": [
                "read:rooms",
                "schedule:rooms",
                "update:rooms",
                "read:subjects",
                "read:timetables",
            ],
            "Giám thị / Quản sinh": [
                "read:students",
                "read:classes",
                "attend:attendance",
                "read:attendance",
                "read:attendance_logs",
                "create:disciplinary_records",
                "read:disciplinary_records",
                "update:disciplinary_records",
                "submit:disciplinary_records",
                "notify:disciplinary_records",
                "read:journals",
            ],
            "Chuyên viên Tư vấn tâm lý học đường": [
                "read:students",
                "read:classes",
                "read:attendance",
                "read:disciplinary_records",
            ],
            "Nhân viên Bảo vệ & An ninh": [
                "read:rooms",
                "read:classes",
            ],
            "Nhân viên Hậu cần & Tạp vụ": [
                "read:rooms",
                "read:classes",
            ],
            # 3. Teaching Faculty
            "Tổ trưởng chuyên môn": [
                "read:subjects",
                "read:class_subject_teachers",
                "assign:class_subject_teachers",
                "unassign:class_subject_teachers",
                "approve:student_scores",
                "read:student_scores",
                "read:exams",
                "approve:journals",
                "read:assignments",
            ],
            "Tổ phó chuyên môn": [
                "read:subjects",
                "read:class_subject_teachers",
                "read:student_scores",
                "read:exams",
                "read:journals",
            ],
            "Giáo viên chủ nhiệm": [
                "read:students",
                "update:students",
                "read:classes",
                "read:attendance",
                "attend:attendance",
                "submit:attendance",
                "read:leave_requests",
                "approve:leave_requests",
                "reject:leave_requests",
                "comment:student_scores",
                "read:student_scores",
                "create:contact_books",
                "read:contact_books",
                "comment:contact_books",
                "share:contact_books",
                "notify:guardians",
                "create:disciplinary_records",
                "read:disciplinary_records",
                "create:awards",
                "read:awards",
            ],
            "Giáo viên bộ môn": [
                "read:classes",
                "read:students",
                "grade:student_scores",
                "submit:student_scores",
                "read:student_scores",
                "create:assignments",
                "update:assignments",
                "publish:assignments",
                "grade:assignments",
                "comment:assignments",
                "read:assignment_submissions",
                "create:exams",
                "update:exams",
                "grade:exams",
                "read:exam_submissions",
                "create:journals",
                "update:journals",
                "submit:journals",
                "attend:attendance",
                "read:timetables",
            ],
            # 4. Youth Union & Emulation Movement
            "Bí thư Đoàn trường": [
                "read:students",
                "read:classes",
                "create:awards",
                "read:awards",
                "approve:awards",
                "publish:awards",
                "create:disciplinary_records",
                "read:disciplinary_records",
                "submit:disciplinary_records",
                "create:announcements",
                "publish:announcements",
                "manage:emulation",
            ],
            "Phó Bí thư Đoàn trường": [
                "read:students",
                "read:classes",
                "create:awards",
                "read:awards",
                "create:disciplinary_records",
                "read:disciplinary_records",
                "publish:announcements",
            ],
            "Ủy viên Ban Chấp hành Đoàn trường": [
                "read:students",
                "read:classes",
                "create:awards",
                "read:awards",
                "create:disciplinary_records",
                "read:disciplinary_records",
                "read:announcements",
            ],
            "Cán bộ Đội Cờ đỏ / Sao đỏ": [
                "read:classes",
                "read:students",
                "create:disciplinary_records",
                "read:disciplinary_records",
            ],
            # 5. Class Student Committee Leadership
            "Lớp trưởng": [
                "read:students",
                "attend:attendance",
                "submit:attendance",
                "create:journals",
                "read:journals",
                "read:timetables",
                "read:announcements",
            ],
            "Lớp phó học tập": [
                "read:students",
                "read:assignments",
                "read:timetables",
                "read:announcements",
            ],
            "Lớp phó lao động và Đời sống": [
                "read:classes",
                "read:timetables",
                "read:announcements",
            ],
            "Lớp phó Văn - Thể - Mỹ": [
                "read:classes",
                "read:announcements",
            ],
            "Bí thư Chi đoàn lớp": [
                "read:students",
                "create:awards",
                "read:awards",
                "read:announcements",
            ],
            "Phó Bí thư Chi đoàn lớp": [
                "read:students",
                "read:announcements",
            ],
            "Tổ trưởng tổ học tập": [
                "read:students",
                "read:assignments",
            ],
            "Tổ phó tổ học tập": [
                "read:students",
                "read:assignments",
            ],
            # 6. General Students & Guardians
            "Học sinh": [
                "read:timetables",
                "read:student_scores",
                "read:assignments",
                "submit:assignment_submissions",
                "read:assignment_submissions",
                "read:exams",
                "submit:exam_submissions",
                "read:exam_submissions",
                "create:leave_requests",
                "read:leave_requests",
                "read:announcements",
            ],
            "Phụ huynh học sinh": [
                "read:student_scores",
                "read:attendance",
                "create:leave_requests",
                "read:leave_requests",
                "read:contact_books",
                "read:announcements",
            ],
            "Trưởng ban đại diện Cha mẹ học sinh trường": [
                "read:student_scores",
                "read:attendance",
                "read:contact_books",
                "read:announcements",
            ],
            "Trưởng ban đại diện Cha mẹ học sinh lớp": [
                "read:student_scores",
                "read:attendance",
                "read:contact_books",
                "read:announcements",
            ],
        }

        with transaction.atomic():
            for role_name, patterns in role_permission_rules.items():
                role_obj = Role.objects.filter(name=role_name).first()
                if not role_obj:
                    self.stdout.write(
                        self.style.WARNING(f"Role '{role_name}' not found, skipping...")
                    )
                    continue

                matched_perms = get_perms(patterns)
                assigned_count = 0

                for perm in matched_perms:
                    rp, created = RolePermission.objects.get_or_create(
                        role=role_obj,
                        permission=perm,
                    )
                    if created:
                        assigned_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Role: {role_obj.name:<45} -> {len(matched_perms):>3} permissions mapped (+{assigned_count} new)"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully seeded comprehensive RolePermissions for all 37 roles!"
            )
        )
