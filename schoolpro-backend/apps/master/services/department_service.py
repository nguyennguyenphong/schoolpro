"""
Department Service.
Business logic layer for managing educational subject departments and administrative divisions.
Implements validation, member assignment/unassignment, status toggles, and deletion safety checks.
"""

import logging
from typing import Any
from uuid import UUID

from django.db import transaction

from apps.core.models.profile import Staff, Teacher
from apps.core.models.user import User
from apps.master.models.department import Department
from apps.master.models.school import School
from apps.master.models.subject import Subject
from apps.master.repositories.department_repository import DepartmentRepository
from common.exceptions import BusinessLogicError, ResourceNotFoundError

logger = logging.getLogger(__name__)


class DepartmentService:
    """
    Domain service orchestrating business workflows for Departments.
    """

    def __init__(self, repository: DepartmentRepository | None = None):
        self.repository = repository or DepartmentRepository()

    def get_departments(
        self,
        school_id: UUID | str | None = None,
        department_type: str | None = None,
        is_active: bool | None = None,
        search_query: str | None = None,
    ):
        """
        List departments with annotations, filtering, and search.
        """
        return self.repository.get_departments_list(
            school_id=school_id,
            department_type=department_type,
            is_active=is_active,
            search_query=search_query,
        )

    def get_department_detail(
        self, department_id: UUID | str, school_id: UUID | str | None = None
    ) -> Department:
        """
        Retrieve department by ID, optionally verifying school_id, or raise ResourceNotFoundError.
        """
        department = self.repository.get_department_detail(department_id)
        if not department or (school_id and str(department.school_id) != str(school_id)):
            raise ResourceNotFoundError(
                f"Không tìm thấy phòng/tổ chuyên môn với ID: {department_id}"
            )
        return department

    def get_summary(self, school_id: UUID | str | None = None) -> dict[str, int]:
        """
        Retrieve department metrics and counts.
        """
        return self.repository.get_summary_statistics(school_id=school_id)

    @transaction.atomic
    def create_department(
        self, validated_data: dict[str, Any], default_school_id: UUID | str | None = None
    ) -> Department:
        """
        Create a new department with unique code validation and leader checks.
        """
        school_id = validated_data.get("school_id") or default_school_id
        if not school_id:
            # Fallback to the first available active school if not provided
            first_school = School.objects.filter(is_active=True).first() or School.objects.first()
            if not first_school:
                raise BusinessLogicError(
                    "Hệ thống chưa thiết lập trường học. Không thể tạo phòng ban."
                )
            school_id = first_school.id

        code = validated_data["code"].strip().upper()
        name = validated_data["name"].strip()
        department_type = validated_data.get("department_type", "SUBJECT").strip().upper()
        leader_teacher_id = validated_data.get("leader_teacher_id")
        vice_leader_id = validated_data.get("vice_leader_id")
        is_active = validated_data.get("is_active", True)

        # 1. Unique code check in the same school
        existing = Department.objects.filter(school_id=school_id, code=code).first()
        if existing:
            raise BusinessLogicError(f"Mã tổ/phòng ban '{code}' đã tồn tại trong trường học.")

        # 2. Leader validity check
        if leader_teacher_id:
            leader_user = User.objects.filter(id=leader_teacher_id).first()
            if not leader_user:
                raise ResourceNotFoundError(
                    f"Không tìm thấy người dùng làm trưởng bộ phận với ID: {leader_teacher_id}"
                )

        if vice_leader_id:
            vice_user = User.objects.filter(id=vice_leader_id).first()
            if not vice_user:
                raise ResourceNotFoundError(
                    f"Không tìm thấy người dùng làm phó bộ phận với ID: {vice_leader_id}"
                )

        department = Department.objects.create(
            school_id=school_id,
            code=code,
            name=name,
            department_type=department_type,
            leader_teacher_id=leader_teacher_id,
            vice_leader_id=vice_leader_id,
            is_active=is_active,
        )

        logger.info(
            "Created Department %s (%s) successfully for school %s",
            department.code,
            department.name,
            school_id,
        )
        return self.get_department_detail(department.id)

    @transaction.atomic
    def update_department(
        self,
        department_id: UUID | str,
        validated_data: dict[str, Any],
        school_id: UUID | str | None = None,
    ) -> Department:
        """
        Update an existing department with validation checks.
        """
        department = Department.objects.filter(id=department_id).first()
        if not department or (school_id and str(department.school_id) != str(school_id)):
            raise ResourceNotFoundError(
                f"Không tìm thấy phòng/tổ chuyên môn với ID: {department_id}"
            )

        if "code" in validated_data:
            code = validated_data["code"].strip().upper()
            duplicate = (
                Department.objects.filter(school_id=department.school_id, code=code)
                .exclude(id=department.id)
                .first()
            )
            if duplicate:
                raise BusinessLogicError(
                    f"Mã tổ/phòng ban '{code}' đã được sử dụng bởi phòng ban khác."
                )
            department.code = code

        if "name" in validated_data:
            department.name = validated_data["name"].strip()

        if "department_type" in validated_data:
            department.department_type = validated_data["department_type"].strip().upper()

        if "is_active" in validated_data:
            department.is_active = validated_data["is_active"]

        if "leader_teacher_id" in validated_data:
            leader_id = validated_data["leader_teacher_id"]
            if leader_id:
                if not User.objects.filter(id=leader_id).exists():
                    raise ResourceNotFoundError(
                        f"Không tìm thấy người dùng trưởng bộ phận ID: {leader_id}"
                    )
            department.leader_teacher_id = leader_id

        if "vice_leader_id" in validated_data:
            vice_id = validated_data["vice_leader_id"]
            if vice_id:
                if not User.objects.filter(id=vice_id).exists():
                    raise ResourceNotFoundError(
                        f"Không tìm thấy người dùng phó bộ phận ID: {vice_id}"
                    )
            department.vice_leader_id = vice_id

        department.save()
        logger.info("Updated Department %s (%s)", department.code, department.name)
        return self.get_department_detail(department.id, school_id=school_id)

    @transaction.atomic
    def delete_department(
        self, department_id: UUID | str, school_id: UUID | str | None = None
    ) -> dict[str, str]:
        """
        Safely delete a department, preventing deletion if active teachers, staff, or subjects are assigned.
        """
        department = Department.objects.filter(id=department_id).first()
        if not department or (school_id and str(department.school_id) != str(school_id)):
            raise ResourceNotFoundError(
                f"Không tìm thấy phòng/tổ chuyên môn với ID: {department_id}"
            )

        teachers_count = department.teachers.count()
        staff_count = department.staff.count()
        subjects_count = department.subjects.count()

        if teachers_count > 0 or staff_count > 0 or subjects_count > 0:
            reasons = []
            if teachers_count > 0:
                reasons.append(f"{teachers_count} giáo viên")
            if staff_count > 0:
                reasons.append(f"{staff_count} cán bộ/nhân viên")
            if subjects_count > 0:
                reasons.append(f"{subjects_count} môn học")
            detail_msg = f"Không thể xóa phòng/tổ '{department.name}' vì đang liên kết với: {', '.join(reasons)}. Vui lòng chuyển các thành viên hoặc môn học sang đơn vị khác trước."
            raise BusinessLogicError(detail_msg)

        dept_name = department.name
        dept_code = department.code
        department.delete()

        logger.info("Deleted Department %s (%s)", dept_code, dept_name)
        return {"message": f"Đã xóa thành công phòng/tổ chuyên môn '{dept_name}'."}

    @transaction.atomic
    def assign_members(
        self,
        department_id: UUID | str,
        teacher_ids: list[UUID | str] | None = None,
        staff_ids: list[UUID | str] | None = None,
        subject_ids: list[UUID | str] | None = None,
        school_id: UUID | str | None = None,
    ) -> Department:
        """
        Assign existing teachers, staff, or subjects to this department.
        """
        department = Department.objects.filter(id=department_id).first()
        if not department or (school_id and str(department.school_id) != str(school_id)):
            raise ResourceNotFoundError(
                f"Không tìm thấy phòng/tổ chuyên môn với ID: {department_id}"
            )

        if teacher_ids:
            Teacher.objects.filter(id__in=teacher_ids).update(department=department)

        if staff_ids:
            Staff.objects.filter(id__in=staff_ids).update(department=department)

        if subject_ids:
            Subject.objects.filter(id__in=subject_ids).update(department=department)

        logger.info(
            "Assigned members/subjects to department %s (%s)", department.code, department.name
        )
        return self.get_department_detail(department.id, school_id=school_id)

    @transaction.atomic
    def remove_member(
        self,
        department_id: UUID | str,
        member_type: str,
        member_id: UUID | str,
        school_id: UUID | str | None = None,
    ) -> Department:
        """
        Unlink a teacher, staff, or subject from this department.
        """
        department = Department.objects.filter(id=department_id).first()
        if not department or (school_id and str(department.school_id) != str(school_id)):
            raise ResourceNotFoundError(
                f"Không tìm thấy phòng/tổ chuyên môn với ID: {department_id}"
            )

        m_type = member_type.lower()
        if m_type == "teacher":
            Teacher.objects.filter(id=member_id, department=department).update(department=None)
        elif m_type == "staff":
            Staff.objects.filter(id=member_id, department=department).update(department=None)
        elif m_type == "subject":
            Subject.objects.filter(id=member_id, department=department).update(department=None)
        else:
            raise BusinessLogicError("member_type phải là một trong: 'teacher', 'staff', 'subject'")

        logger.info("Unlinked %s %s from department %s", m_type, member_id, department.code)
        return self.get_department_detail(department.id, school_id=school_id)
