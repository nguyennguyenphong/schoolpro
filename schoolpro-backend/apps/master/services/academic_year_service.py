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
    ):
        """List academic years with filtering and search."""
        return self.repository.get_academic_years_list(
            school_id=school_id,
            is_current=is_current,
            is_locked=is_locked,
            search_query=search_query,
        )

    def get_academic_year_detail(
        self, identifier: UUID | str, school_id: UUID | str | None = None
    ) -> AcademicYear:
        """Retrieve academic year by UUID or code, scoped to school_id."""
        academic_year = self.repository.get_academic_year_detail(identifier)
        if not academic_year or (school_id and str(academic_year.school_id) != str(school_id)):
            raise ResourceNotFoundError(f"Không tìm thấy năm học với mã định danh: {identifier}")
        return academic_year
