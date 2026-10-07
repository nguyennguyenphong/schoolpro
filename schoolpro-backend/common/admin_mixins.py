"""
Admin mixins for Django admin site.
Provides automatic optional handling and guidance for code fields.
"""

from typing import Any

from common.signals import ENTITY_CODE_FIELDS_BY_MODEL


class AutoCodeAdminMixin:
    """
    Mixin for ModelAdmin classes that makes code fields optional in admin forms.
    When left blank by the administrator, the pre_save signal automatically
    generates a 12-digit unique random code.
    """

    def formfield_for_dbfield(self, db_field: Any, request: Any, **kwargs: Any) -> Any:
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if not formfield:
            return formfield

        model_key = self.model._meta.label_lower
        target_field = ENTITY_CODE_FIELDS_BY_MODEL.get(model_key)

        if not target_field and db_field.name == "code":
            target_field = "code"

        if db_field.name == target_field:
            formfield.required = False
            hint = "Để trống để hệ thống tự động sinh ngẫu nhiên 12 chữ số không trùng lặp."
            base_help = str(formfield.help_text or "").strip()
            if hint not in base_help:
                formfield.help_text = f"{base_help} ({hint})".strip() if base_help else hint

        return formfield
