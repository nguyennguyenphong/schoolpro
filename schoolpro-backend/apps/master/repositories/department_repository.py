"""
Department Repository.
Data access layer for Department master reference entity.
Encapsulates database queries, relation prefetching, annotations, and filtering.
"""

from uuid import UUID

from django.db.models import Count, Q, QuerySet

from apps.master.models.department import Department
from common.repositories.base import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    """
    Repository for Department master entity with optimized relational queries.
    """

    def __init__(self):
        super().__init__(Department)

    def get_queryset(self) -> QuerySet[Department]:
        """
        Base queryset with select_related for leader and vice leader.
        """
        return self.model_class.objects.select_related(
            "school",
            "leader_teacher",
            "vice_leader",
        ).all()

    def get_annotated_queryset(self) -> QuerySet[Department]:
        """
        Queryset annotated with headcount and statistics:
        - teachers_count: Number of assigned teachers
        - staff_count: Number of assigned administrative staff
        - subjects_count: Number of linked subjects
        """
        return self.get_queryset().annotate(
            teachers_count=Count("teachers", distinct=True),
            staff_count=Count("staff", distinct=True),
            subjects_count=Count("subjects", distinct=True),
        )

    def get_departments_list(
        self,
        school_id: UUID | str | None = None,
        department_type: str | None = None,
        is_active: bool | None = None,
        search_query: str | None = None,
    ) -> QuerySet[Department]:
        """
        Filter departments list with annotations and search criteria.
        """
        qs = self.get_annotated_queryset()

        if school_id:
            qs = qs.filter(school_id=school_id)

        if department_type and department_type.upper() != "ALL":
            qs = qs.filter(department_type=department_type.upper())

        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        if search_query and search_query.strip():
            term = search_query.strip()
            qs = qs.filter(
                Q(code__icontains=term)
                | Q(name__icontains=term)
                | Q(leader_teacher__full_name__icontains=term)
                | Q(vice_leader__full_name__icontains=term)
            )

        return qs.order_by("code")

    def get_department_detail(self, department_id: UUID | str) -> Department | None:
        """
        Retrieve single department by ID with counts annotated and relations prefetched.
        """
        return (
            self.get_annotated_queryset()
            .prefetch_related(
                "teachers",
                "teachers__user",
                "staff",
                "staff__user",
                "subjects",
            )
            .filter(id=department_id)
            .first()
        )

    def get_by_code(self, school_id: UUID | str, code: str) -> Department | None:
        """
        Retrieve department by unique (school_id, code).
        """
        return self.get_queryset().filter(school_id=school_id, code=code).first()

    def get_summary_statistics(self, school_id: UUID | str | None = None) -> dict[str, int]:
        """
        Compute high-level summary metrics for departments.
        """
        base_qs = self.model_class.objects.all()
        if school_id:
            base_qs = base_qs.filter(school_id=school_id)

        total_departments = base_qs.count()
        active_departments = base_qs.filter(is_active=True).count()
        subject_departments = base_qs.filter(department_type="SUBJECT").count()
        administration_departments = base_qs.filter(department_type="ADMINISTRATION").count()
        other_departments = total_departments - (subject_departments + administration_departments)

        return {
            "total_departments": total_departments,
            "active_departments": active_departments,
            "inactive_departments": total_departments - active_departments,
            "subject_departments": subject_departments,
            "administration_departments": administration_departments,
            "other_departments": max(0, other_departments),
        }
