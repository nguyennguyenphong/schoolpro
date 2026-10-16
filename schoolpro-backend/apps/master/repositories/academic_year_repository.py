"""
AcademicYear Repository.
Data access layer for AcademicYear master reference entity.
"""

from uuid import UUID

from django.db.models import Q, QuerySet

from apps.master.models.academic_year import AcademicYear
from common.repositories.base import BaseRepository


class AcademicYearRepository(BaseRepository[AcademicYear]):
    """
    Repository for AcademicYear master entity with optimized relational queries.
    """

    def __init__(self):
        super().__init__(AcademicYear)

    def get_queryset(self) -> QuerySet[AcademicYear]:
        """Base queryset with select_related for school."""
        return self.model_class.objects.select_related("school").all()

    def get_academic_years_list(
        self,
        school_id: UUID | str | None = None,
        is_current: bool | None = None,
        is_locked: bool | None = None,
        search_query: str | None = None,
    ) -> QuerySet[AcademicYear]:
        """Filter academic years list by school, current status, lock status, and search term."""
        qs = self.get_queryset()

        if school_id:
            s_str = str(school_id).strip()
            if s_str.lower() not in ("all", "none", "null", "undefined", ""):
                try:
                    UUID(s_str)
                    qs = qs.filter(school_id=s_str)
                except ValueError:
                    qs = qs.filter(school__code__iexact=s_str)

        if is_current is not None:
            qs = qs.filter(is_current=is_current)

        if is_locked is not None:
            qs = qs.filter(is_locked=is_locked)

        if search_query and search_query.strip():
            term = search_query.strip()
            qs = qs.filter(Q(code__icontains=term) | Q(name__icontains=term))

        return qs.order_by("-start_date", "code")

    def get_current_academic_year(self, school_id: UUID | str | None = None) -> AcademicYear | None:
        """Retrieve the current active academic year, optionally scoped to school_id."""
        qs = self.get_queryset().filter(is_current=True)
        if school_id:
            s_str = str(school_id).strip()
            if s_str.lower() not in ("all", "none", "null", "undefined", ""):
                try:
                    UUID(s_str)
                    qs = qs.filter(school_id=s_str)
                except ValueError:
                    qs = qs.filter(school__code__iexact=s_str)
        return qs.first()

    def get_academic_year_detail(self, identifier: UUID | str) -> AcademicYear | None:
        """Retrieve single academic year by UUID or code."""
        qs = self.get_queryset()
        try:
            UUID(str(identifier))
            return qs.filter(id=identifier).first()
        except ValueError:
            return qs.filter(code=str(identifier)).first()
