"""
Semester Service.
Business logic layer for managing academic Semesters.
"""

from uuid import UUID

from apps.master.models.semester import Semester
from apps.master.repositories.semester_repository import SemesterRepository
from common.exceptions import ResourceNotFoundError


class SemesterService:
    """
    Domain service orchestrating business workflows for Semesters.
    """

    def __init__(self, repository: SemesterRepository | None = None):
        self.repository = repository or SemesterRepository()

    def get_semesters(
        self,
        school_id: UUID | str | None = None,
        academic_year_id: UUID | str | None = None,
        order_no: int | None = None,
        is_current: bool | None = None,
        is_locked: bool | None = None,
        search_query: str | None = None,
    ):
        """List semesters with filtering and search."""
        return self.repository.get_semesters_list(
            school_id=school_id,
            academic_year_id=academic_year_id,
            order_no=order_no,
            is_current=is_current,
            is_locked=is_locked,
            search_query=search_query,
        )

    def get_semester_detail(
        self, identifier: UUID | str, school_id: UUID | str | None = None
    ) -> Semester:
        """Retrieve semester by UUID or code, scoped to school_id."""
        semester = self.repository.get_semester_detail(identifier)
        if not semester or (school_id and str(semester.academic_year.school_id) != str(school_id)):
            raise ResourceNotFoundError(f"Không tìm thấy học kỳ với mã định danh: {identifier}")
        return semester
