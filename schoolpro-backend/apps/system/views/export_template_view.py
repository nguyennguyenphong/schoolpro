"""
ViewSet for ExportTemplate management and document rendering.
"""

from typing import Any

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.core.authentication import SchoolProJWTAuthentication
from apps.system.filters.export_template_filter import ExportTemplateFilter
from apps.system.models.export_template import ExportTemplate
from apps.system.serializers.export_template_serializer import (
    ExportTemplateCreateUpdateSerializer,
    ExportTemplateDetailSerializer,
    ExportTemplateListSerializer,
    ExportTemplateRenderRequestSerializer,
    ExportTemplateRenderResponseSerializer,
)
from apps.system.services.export_template_service import ExportTemplateService
from common.responses.response import APIResponse


@extend_schema_view(
    list=extend_schema(
        summary="List Export Templates",
        description="Retrieves document export and print templates filtered by school, type, or format.",
    ),
    retrieve=extend_schema(
        summary="Get Export Template Details",
        description="Retrieves full HTML, CSS, schemas, and relational links of a specific export template.",
    ),
    create=extend_schema(
        summary="Create Export Template",
        description="Creates a new customizable document export template with placeholder support.",
    ),
    update=extend_schema(
        summary="Update Export Template",
        description="Updates an existing export template layout, content, or metadata.",
    ),
    destroy=extend_schema(
        summary="Delete Export Template",
        description="Soft-deletes an export template. Protected if it is the only active default template.",
    ),
)
class ExportTemplateViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for managing document export templates (sys_export_templates)
    and rendering final HTML for PDF/Print preview.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ExportTemplateFilter
    search_fields = ["code", "name", "description"]
    ordering_fields = ["created_at", "updated_at", "name", "code", "is_default"]
    ordering = ["-is_default", "name"]

    def __init__(self, **kwargs: Any):
        super().__init__(**kwargs)
        self.service = ExportTemplateService()

    def get_queryset(self):
        user = getattr(self.request, "user", None)
        school_id = getattr(user, "school_id", None) if user else None

        qs = ExportTemplate.objects.select_related(
            "school", "department", "created_by", "updated_by"
        ).filter(is_deleted=False)

        if school_id:
            return qs.filter(Q(school_id=school_id) | Q(school__isnull=True))

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ExportTemplateListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return ExportTemplateCreateUpdateSerializer
        elif self.action == "render":
            return ExportTemplateRenderRequestSerializer
        return ExportTemplateDetailSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ExportTemplateListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ExportTemplateListSerializer(queryset, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy danh sách biểu mẫu xuất tệp thành công",
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ExportTemplateDetailSerializer(instance)
        return APIResponse.success(
            data=serializer.data,
            message="Lấy chi tiết biểu mẫu xuất tệp thành công",
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = self.service.create_template(
            user=request.user,
            validated_data=serializer.validated_data,
        )
        return APIResponse.created(
            data=ExportTemplateDetailSerializer(instance).data,
            message=f"Tạo biểu mẫu '{instance.name}' thành công",
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        updated_instance = self.service.update_template(
            template_id=instance.pk,
            user=request.user,
            validated_data=serializer.validated_data,
        )
        return APIResponse.success(
            data=ExportTemplateDetailSerializer(updated_instance).data,
            message=f"Cập nhật biểu mẫu '{updated_instance.name}' thành công",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.service.delete_template(instance.pk, request.user)
        return APIResponse.success(
            message=f"Xóa biểu mẫu '{instance.name}' thành công",
            code=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Render Export Template to HTML",
        description="Renders the specified template with the given context variables into an HTML document ready for print/export.",
        request=ExportTemplateRenderRequestSerializer,
        responses={200: ExportTemplateRenderResponseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="render")
    def render_document(self, request, pk=None):
        """
        Renders template using provided context variables.
        """
        serializer = ExportTemplateRenderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        context_data = serializer.validated_data.get("context", {})

        result = self.service.render_template(template_id=pk, context_data=context_data)
        return APIResponse.success(
            data=result,
            message="Render tài liệu thành công",
        )

    @extend_schema(
        summary="Get Active Template by Code",
        description="Retrieves the currently active template for a given template code, prioritizing school-specific override.",
        parameters=[
            OpenApiParameter(
                name="code",
                type=str,
                description="Unique template code (e.g. ANNOUNCEMENT_OFFICIAL_A4)",
                required=True,
            ),
        ],
        responses={200: ExportTemplateDetailSerializer},
    )
    @action(detail=False, methods=["get"], url_path="active-by-code")
    def active_by_code(self, request):
        code = request.query_params.get("code")
        if not code:
            return APIResponse.error(
                message="Thiếu tham số 'code' của biểu mẫu",
                code=status.HTTP_400_BAD_REQUEST,
            )

        user = getattr(request, "user", None)
        school_id = getattr(user, "school_id", None) if user else None

        template = self.service.repository.get_active_by_code(code=code, school_id=school_id)
        if not template:
            # If standard announcement, auto-seed default
            if code.strip().upper() == "ANNOUNCEMENT_OFFICIAL_A4":
                template = self.service.get_or_create_default_announcement_template(
                    school_id=school_id
                )
            else:
                return APIResponse.error(
                    message=f"Không tìm thấy biểu mẫu hiệu lực với mã '{code}'",
                    code=status.HTTP_404_NOT_FOUND,
                )

        return APIResponse.success(
            data=ExportTemplateDetailSerializer(template).data,
            message=f"Lấy biểu mẫu '{template.name}' thành công",
        )

    @extend_schema(
        summary="Get Default Announcement Template",
        description="Retrieves or seeds the default Vietnamese administrative A4 announcement template.",
        responses={200: ExportTemplateDetailSerializer},
    )
    @action(detail=False, methods=["get"], url_path="default-announcement")
    def default_announcement(self, request):
        user = getattr(request, "user", None)
        school_id = getattr(user, "school_id", None) if user else None

        template = self.service.get_or_create_default_announcement_template(school_id=school_id)
        return APIResponse.success(
            data=ExportTemplateDetailSerializer(template).data,
            message="Lấy biểu mẫu thông báo mặc định thành công",
        )

    @extend_schema(
        summary="Set Template as Default",
        description="Sets the selected template as the default template for its type within the school.",
    )
    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        instance = self.get_object()
        self.service.update_template(
            template_id=instance.pk,
            user=request.user,
            validated_data={"is_default": True},
        )
        instance.refresh_from_db()
        return APIResponse.success(
            data=ExportTemplateDetailSerializer(instance).data,
            message=f"Đã đặt '{instance.name}' làm biểu mẫu mặc định cho phân loại {instance.get_template_type_display()}",
        )
