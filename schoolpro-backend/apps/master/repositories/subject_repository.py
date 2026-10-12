"""
Subject Repository.
Data access layer for Subject master reference entity.
"""

from uuid import UUID

from django.db.models import Q, QuerySet

from apps.master.models.subject import Subject
from common.repositories.base import BaseRepository


class SubjectRepository(BaseRepository[Subject]):
    """
    Repository for Subject master entity with optimized relational queries.
    """

    def __init__(self):
        super().__init__(Subject)

    def get_queryset(self) -> QuerySet[Subject]:
        """Base queryset with select_related for school and department."""
        return self.model_class.objects.select_related(
            "school",
            "department",
        ).all()

    def get_subjects_list(
        self,
        school_id: UUID | str | None = None,
        department_id: UUID | str | None = None,
        grade_level: int | None = None,
        evaluation_type: str | None = None,
        is_compulsory: bool | None = None,
        is_active: bool | None = None,
        search_query: str | None = None,
    ) -> QuerySet[Subject]:
        """Filter subjects list by school, department, grade level, evaluation type, and search term."""
        qs = self.get_queryset()

        if school_id:
            qs = qs.filter(school_id=school_id)

        if department_id:
            qs = qs.filter(department_id=department_id)

        if grade_level is not None:
            qs = qs.filter(Q(grade_level=grade_level) | Q(grade_level__isnull=True))

        if evaluation_type and evaluation_type.upper() != "ALL":
            qs = qs.filter(evaluation_type__iexact=evaluation_type)

        if is_compulsory is not None:
            qs = qs.filter(is_compulsory=is_compulsory)

        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        if search_query and search_query.strip():
            term = search_query.strip()
            qs = qs.filter(
                Q(code__icontains=term)
                | Q(name__icontains=term)
                | Q(short_name__icontains=term)
                | Q(department__name__icontains=term)
            )

        return qs.order_by("order_no", "code")

    def get_subject_detail(self, identifier: UUID | str) -> Subject | None:
        """Retrieve single subject by UUID or code."""
        qs = self.get_queryset()
        try:
            UUID(str(identifier))
            return qs.filter(id=identifier).first()
        except ValueError:
            return qs.filter(code=str(identifier)).first()
