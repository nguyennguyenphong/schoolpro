"""
Semester Repository.
Data access layer for Semester master reference entity.
"""

from uuid import UUID

from django.db.models import Q, QuerySet

from apps.master.models.semester import Semester
from common.repositories.base import BaseRepository


class SemesterRepository(BaseRepository[Semester]):
    """
    Repository for Semester master entity with optimized relational queries.
    """

    def __init__(self):
        super().__init__(Semester)

    def get_queryset(self) -> QuerySet[Semester]:
        """Base queryset with select_related for academic_year and school."""
        return self.model_class.objects.select_related(
            "academic_year",
            "academic_year__school",
        ).all()

    def get_semesters_list(
        self,
        school_id: UUID | str | None = None,
        academic_year_id: UUID | str | None = None,
        order_no: int | None = None,
        is_current: bool | None = None,
        is_locked: bool | None = None,
        search_query: str | None = None,
    ) -> QuerySet[Semester]:
        """Filter semesters list by school, academic year, order, flags, and search term."""
        qs = self.get_queryset()

        if school_id:
            s_str = str(school_id).strip()
            if s_str.lower() not in ("all", "none", "null", "undefined", ""):
                try:
                    UUID(s_str)
                    qs = qs.filter(academic_year__school_id=s_str)
                except ValueError:
                    qs = qs.filter(academic_year__school__code__iexact=s_str)

        if academic_year_id:
            ay_str = str(academic_year_id).strip()
            if ay_str.lower() not in ("all", "none", "null", "undefined", ""):
                try:
                    UUID(ay_str)
                    qs = qs.filter(academic_year_id=ay_str)
                except ValueError:
                    qs = qs.filter(
                        Q(academic_year__code__iexact=ay_str)
                        | Q(academic_year__name__icontains=ay_str)
                    )

        if order_no is not None:
            qs = qs.filter(order_no=order_no)

        if is_current is not None:
            qs = qs.filter(is_current=is_current)

        if is_locked is not None:
            qs = qs.filter(is_locked=is_locked)

        if search_query and search_query.strip():
            term = search_query.strip()
            qs = qs.filter(
                Q(code__icontains=term)
                | Q(name__icontains=term)
                | Q(academic_year__name__icontains=term)
            )

        return qs.order_by("-academic_year__start_date", "order_no")

    def get_current_semester(
        self,
        school_id: UUID | str | None = None,
        academic_year_id: UUID | str | None = None,
    ) -> Semester | None:
        """Retrieve the current active semester, optionally scoped to school and/or academic year."""
        qs = self.get_queryset().filter(is_current=True)
        if academic_year_id:
            ay_str = str(academic_year_id).strip()
            if ay_str.lower() not in ("all", "none", "null", "undefined", ""):
                try:
                    UUID(ay_str)
                    qs = qs.filter(academic_year_id=ay_str)
                except ValueError:
                    qs = qs.filter(
                        Q(academic_year__code__iexact=ay_str)
                        | Q(academic_year__name__icontains=ay_str)
                    )
        if school_id:
            s_str = str(school_id).strip()
            if s_str.lower() not in ("all", "none", "null", "undefined", ""):
                try:
                    UUID(s_str)
                    qs = qs.filter(academic_year__school_id=s_str)
                except ValueError:
                    qs = qs.filter(academic_year__school__code__iexact=s_str)
        return qs.first()

    def get_semester_detail(self, identifier: UUID | str) -> Semester | None:
        """Retrieve single semester by UUID or code."""
        qs = self.get_queryset()
        try:
            UUID(str(identifier))
            return qs.filter(id=identifier).first()
        except ValueError:
            return qs.filter(code=str(identifier)).first()
