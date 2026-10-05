"""
Repository layer for ExportTemplate data access.
"""

from typing import Any

from django.db.models import Q, QuerySet

from apps.system.models.export_template import ExportTemplate
from common.repositories.base import BaseRepository


class ExportTemplateRepository(BaseRepository[ExportTemplate]):
    """
    Repository handling sys_export_templates queries and optimizers.
    """

    def __init__(self):
        super().__init__(ExportTemplate)
        self.model = self.model_class

    def get_by_id(self, template_id: Any) -> ExportTemplate | None:
        """
        Retrieves a template by ID with optimized joins on School, Department, and Authors.
        """
        return (
            self.model.objects.select_related("school", "department", "created_by", "updated_by")
            .filter(pk=template_id, is_deleted=False)
            .first()
        )

    def get_active_by_code(self, code: str, school_id: Any = None) -> ExportTemplate | None:
        """
        Finds active template matching the given code.
        Prioritizes school-specific template first, then falls back to system-wide default.
        """
        clean_code = code.strip().upper()

        if school_id:
            # 1. School-specific override
            school_tpl = (
                self.model.objects.select_related("school", "department")
                .filter(code=clean_code, school_id=school_id, is_active=True, is_deleted=False)
                .first()
            )
            if school_tpl:
                return school_tpl

        # 2. Global system default template (school is null)
        return (
            self.model.objects.select_related("school", "department")
            .filter(code=clean_code, school__isnull=True, is_active=True, is_deleted=False)
            .first()
        )

    def get_default_by_type(
        self, template_type: str, school_id: Any = None
    ) -> ExportTemplate | None:
        """
        Finds the default template for a given document type.
        """
        if school_id:
            tpl = (
                self.model.objects.select_related("school", "department")
                .filter(
                    template_type=template_type,
                    school_id=school_id,
                    is_default=True,
                    is_active=True,
                    is_deleted=False,
                )
                .first()
            )
            if tpl:
                return tpl

        # Fallback to system-level default
        return (
            self.model.objects.select_related("school", "department")
            .filter(
                template_type=template_type,
                school__isnull=True,
                is_default=True,
                is_active=True,
                is_deleted=False,
            )
            .first()
        )

    def list_templates(
        self,
        school_id: Any = None,
        template_type: str | None = None,
        file_format: str | None = None,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> QuerySet[ExportTemplate]:
        """
        Lists export templates with filters and search query.
        """
        qs = self.model.objects.select_related(
            "school", "department", "created_by", "updated_by"
        ).filter(is_deleted=False)

        if school_id is not None:
            # Include templates specifically for this school PLUS global templates
            qs = qs.filter(Q(school_id=school_id) | Q(school__isnull=True))

        if template_type:
            qs = qs.filter(template_type=template_type)

        if file_format:
            qs = qs.filter(file_format=file_format)

        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        if search:
            query = search.strip()
            qs = qs.filter(
                Q(code__icontains=query)
                | Q(name__icontains=query)
                | Q(description__icontains=query)
            )

        return qs.order_by("-is_default", "name")

    def clear_other_defaults(
        self, template_type: str, school_id: Any = None, exclude_id: Any = None
    ) -> None:
        """
        Ensures only one template is marked as is_default for the same template_type and school.
        """
        qs = self.model.objects.filter(
            template_type=template_type,
            school_id=school_id,
            is_default=True,
        )
        if exclude_id:
            qs = qs.exclude(pk=exclude_id)
        qs.update(is_default=False)
