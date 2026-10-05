"""
Serializers for ExportTemplate Model.
"""

from rest_framework import serializers

from apps.system.models.export_template import ExportTemplate


class ExportTemplateListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing export templates.
    """

    school_name = serializers.CharField(source="school.name", read_only=True, default=None)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    template_type_display = serializers.CharField(
        source="get_template_type_display", read_only=True
    )
    file_format_display = serializers.CharField(source="get_file_format_display", read_only=True)

    class Meta:
        model = ExportTemplate
        fields = [
            "id",
            "code",
            "name",
            "description",
            "template_type",
            "template_type_display",
            "file_format",
            "file_format_display",
            "page_size",
            "page_orientation",
            "is_default",
            "is_active",
            "school",
            "school_name",
            "department",
            "department_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ExportTemplateDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer including full HTML, CSS, schemas, and relational authors.
    """

    school_name = serializers.CharField(source="school.name", read_only=True, default=None)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=None
    )
    updated_by_name = serializers.CharField(
        source="updated_by.full_name", read_only=True, default=None
    )
    template_type_display = serializers.CharField(
        source="get_template_type_display", read_only=True
    )
    file_format_display = serializers.CharField(source="get_file_format_display", read_only=True)

    class Meta:
        model = ExportTemplate
        fields = [
            "id",
            "code",
            "name",
            "description",
            "template_type",
            "template_type_display",
            "file_format",
            "file_format_display",
            "content",
            "header_content",
            "footer_content",
            "style_content",
            "page_size",
            "page_orientation",
            "margins",
            "placeholders_schema",
            "sample_data",
            "is_default",
            "is_active",
            "school",
            "school_name",
            "department",
            "department_name",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ExportTemplateCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating export templates with validation.
    """

    class Meta:
        model = ExportTemplate
        fields = [
            "school",
            "department",
            "code",
            "name",
            "description",
            "template_type",
            "file_format",
            "content",
            "header_content",
            "footer_content",
            "style_content",
            "page_size",
            "page_orientation",
            "margins",
            "placeholders_schema",
            "sample_data",
            "is_default",
            "is_active",
        ]

    def validate_code(self, value: str) -> str:
        clean_code = value.strip().upper()
        if not clean_code:
            raise serializers.ValidationError("Mã biểu mẫu không được để trống")

        school = self.initial_data.get("school")
        instance = getattr(self, "instance", None)

        qs = ExportTemplate.objects.filter(code=clean_code, school=school)
        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                f"Mã biểu mẫu '{clean_code}' đã tồn tại trong phạm vi trường học này"
            )

        return clean_code

    def validate_content(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("Nội dung biểu mẫu không được để trống")
        return value


class ExportTemplateRenderRequestSerializer(serializers.Serializer):
    """
    Serializer for payload sent to render a template into final HTML.
    """

    context = serializers.DictField(
        required=False,
        default=dict,
        help_text="Từ điển dữ liệu chứa các biến động truyền vào để thay thế placeholder trong template",
    )


class ExportTemplateRenderResponseSerializer(serializers.Serializer):
    """
    Serializer for output returned by the render action.
    """

    html = serializers.CharField(help_text="Nội dung trang HTML hoàn chỉnh sau khi render")
    template_id = serializers.UUIDField(help_text="ID của biểu mẫu được sử dụng")
    template_code = serializers.CharField(help_text="Mã biểu mẫu")
    template_name = serializers.CharField(help_text="Tên biểu mẫu")
