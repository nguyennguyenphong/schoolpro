"""
Subject Service.
Business logic layer for managing curriculum Subjects.
"""

from uuid import UUID

from apps.master.models.subject import Subject
from apps.master.repositories.subject_repository import SubjectRepository
from common.exceptions import ResourceNotFoundError


class SubjectService:
    """
    Domain service orchestrating business workflows for Subjects.
    """

    def __init__(self, repository: SubjectRepository | None = None):
        self.repository = repository or SubjectRepository()

    def get_subjects(
        self,
        school_id: UUID | str | None = None,
        department_id: UUID | str | None = None,
        grade_level: int | None = None,
        evaluation_type: str | None = None,
        is_compulsory: bool | None = None,
        is_active: bool | None = None,
        search_query: str | None = None,
        search: str | None = None,
    ):
        """List subjects with filtering and search."""
        query = search if search is not None else search_query
        return self.repository.get_subjects_list(
            school_id=school_id,
            department_id=department_id,
            grade_level=grade_level,
            evaluation_type=evaluation_type,
            is_compulsory=is_compulsory,
            is_active=is_active,
            search_query=query,
        )

    def list_subjects(
        self,
        school_id: UUID | str | None = None,
        department_id: UUID | str | None = None,
        grade_level: int | None = None,
        evaluation_type: str | None = None,
        is_compulsory: bool | None = None,
        is_active: bool | None = None,
        search: str | None = None,
        search_query: str | None = None,
    ):
        """Alias for get_subjects matching standard ViewSet conventions."""
        return self.get_subjects(
            school_id=school_id,
            department_id=department_id,
            grade_level=grade_level,
            evaluation_type=evaluation_type,
            is_compulsory=is_compulsory,
            is_active=is_active,
            search_query=search_query,
            search=search,
        )

    def get_subject_detail(
        self, identifier: UUID | str, school_id: UUID | str | None = None
    ) -> Subject:
        """Retrieve subject by UUID or code, scoped to school_id."""
        subject = self.repository.get_subject_detail(identifier)
        if not subject or (school_id and str(subject.school_id) != str(school_id)):
            raise ResourceNotFoundError(f"Không tìm thấy môn học với mã định danh: {identifier}")
        return subject
