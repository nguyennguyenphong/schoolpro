"""
AcademicYear Service.
Business logic layer for managing school AcademicYears.
"""

from uuid import UUID

from apps.master.models.academic_year import AcademicYear
from apps.master.repositories.academic_year_repository import AcademicYearRepository
from common.exceptions import ResourceNotFoundError


class AcademicYearService:
    """
    Domain service orchestrating business workflows for AcademicYears.
    """

    def __init__(self, repository: AcademicYearRepository | None = None):
        self.repository = repository or AcademicYearRepository()

    def get_academic_years(
        self,
        school_id: UUID | str | None = None,
        is_current: bool | None = None,
        is_locked: bool | None = None,
        search_query: str | None = None,
        search: str | None = None,
    ):
        """List academic years with filtering and search."""
        query = search if search is not None else search_query
        return self.repository.get_academic_years_list(
            school_id=school_id,
            is_current=is_current,
            is_locked=is_locked,
            search_query=query,
        )

    def list_academic_years(
        self,
        school_id: UUID | str | None = None,
        is_current: bool | None = None,
        is_locked: bool | None = None,
        search: str | None = None,
        search_query: str | None = None,
    ):
        """Alias for get_academic_years matching standard ViewSet conventions."""
        return self.get_academic_years(
            school_id=school_id,
            is_current=is_current,
            is_locked=is_locked,
            search_query=search_query,
            search=search,
        )

    def get_current_academic_year(self, school_id: UUID | str | None = None) -> AcademicYear | None:
        """Retrieve the current active academic year for a school."""
        return self.repository.get_current_academic_year(school_id=school_id)

    def get_academic_year_detail(
        self,
        identifier: UUID | str,
        school_id: UUID | str | None = None,
        raise_exception: bool = False,
    ) -> AcademicYear | None:
        """Retrieve academic year by UUID or code, optionally scoped to school_id."""
        academic_year = self.repository.get_academic_year_detail(identifier)
        if not academic_year or (school_id and str(academic_year.school_id) != str(school_id)):
            if raise_exception:
                raise ResourceNotFoundError(
                    f"Không tìm thấy năm học với mã định danh: {identifier}"
                )
            return None
        return academic_year
