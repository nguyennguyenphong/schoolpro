from unittest.mock import patch

from django.contrib import admin
from django.test import RequestFactory

from apps.system.models.module import Module
from common.admin_mixins import AutoCodeAdminMixin
from common.signals import auto_generate_entity_code
from common.utils.code_generator import (
    generate_random_digits,
    generate_unique_code,
)


def test_generate_random_digits_length_and_digit():
    for _ in range(50):
        digits = generate_random_digits(12)
        assert len(digits) == 12
        assert digits.isdigit()
        assert digits[0] != "0"  # Starts with 1-9


def test_generate_unique_code_with_mocked_db():
    with patch.object(Module.objects, "filter") as mock_filter:
        mock_filter.return_value.exists.return_value = False
        code = generate_unique_code(Module, "code", length=12)
        assert len(code) == 12
        assert code.isdigit()
        assert mock_filter.called


def test_pre_save_signal_auto_generates_12_digits_when_blank():
    mod = Module(
        name="Test Auto Code Module",
        category="ACADEMIC",
        module_type="PAGE",
    )
    assert not mod.code

    with patch("common.signals.generate_unique_code", return_value="123456789012") as mock_gen:
        auto_generate_entity_code(sender=Module, instance=mod)
        assert mod.code == "123456789012"
        mock_gen.assert_called_once_with(Module, field_name="code", length=12)


def test_pre_save_signal_preserves_custom_code_when_provided():
    custom_code = "CUSTOM_MODULE_CODE_999"
    mod = Module(
        code=custom_code,
        name="Test Custom Code Module",
        category="ACADEMIC",
        module_type="PAGE",
    )

    with patch("common.signals.generate_unique_code") as mock_gen:
        auto_generate_entity_code(sender=Module, instance=mod)
        # Should not regenerate if already set
        assert mod.code == custom_code
        mock_gen.assert_not_called()


def test_auto_code_admin_mixin():
    class DummyAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
        auto_code_field = "code"

    dummy_admin = DummyAdmin(Module, admin.site)
    code_dbfield = Module._meta.get_field("code")
    rf = RequestFactory()
    request = rf.get("/admin/sys/module/add/")
    formfield = dummy_admin.formfield_for_dbfield(code_dbfield, request=request)

    assert formfield is not None
    assert formfield.required is False
    assert "12 chữ số" in formfield.help_text
