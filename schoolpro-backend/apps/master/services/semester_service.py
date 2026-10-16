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
        search: str | None = None,
    ):
        """List semesters with filtering and search."""
        query = search if search is not None else search_query
        return self.repository.get_semesters_list(
            school_id=school_id,
            academic_year_id=academic_year_id,
            order_no=order_no,
            is_current=is_current,
            is_locked=is_locked,
            search_query=query,
        )

    def list_semesters(
        self,
        school_id: UUID | str | None = None,
        academic_year_id: UUID | str | None = None,
        order_no: int | None = None,
        is_current: bool | None = None,
        is_locked: bool | None = None,
        search: str | None = None,
        search_query: str | None = None,
    ):
        """Alias for get_semesters matching standard ViewSet conventions."""
        return self.get_semesters(
            school_id=school_id,
            academic_year_id=academic_year_id,
            order_no=order_no,
            is_current=is_current,
            is_locked=is_locked,
            search_query=search_query,
            search=search,
        )

    def get_current_semester(
        self,
        school_id: UUID | str | None = None,
        academic_year_id: UUID | str | None = None,
    ) -> Semester | None:
        """Retrieve the current active semester for a school or academic year."""
        return self.repository.get_current_semester(
            school_id=school_id,
            academic_year_id=academic_year_id,
        )

    def get_semester_detail(
        self,
        identifier: UUID | str,
        school_id: UUID | str | None = None,
        raise_exception: bool = False,
    ) -> Semester | None:
        """Retrieve semester by UUID or code, optionally scoped to school_id."""
        semester = self.repository.get_semester_detail(identifier)
        if not semester or (school_id and str(semester.academic_year.school_id) != str(school_id)):
            if raise_exception:
                raise ResourceNotFoundError(f"Không tìm thấy học kỳ với mã định danh: {identifier}")
            return None
        return semester
