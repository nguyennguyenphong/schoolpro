"""
System Domain Entities encapsulating Auditing, Login History, Settings, Modules, Export Templates, and Outbox.
Covers 11 tables:
  - AuditLogEntity ("sys"."audit_logs")
  - LoginHistoryEntity ("sys"."login_history")
  - ModuleEntity ("sys"."modules")
  - RoleModuleEntity ("sys"."role_modules")
  - UserModulePreferenceEntity ("sys"."user_module_preferences")
  - SettingsDefinitionEntity ("sys"."settings_definitions")
  - SystemSettingEntity ("sys"."system_settings")
  - RoleSettingsDefaultEntity ("sys"."role_settings_defaults")
  - UserSettingEntity ("sys"."user_settings")
  - ExportTemplateEntity ("sys"."export_templates")
  - EventOutboxEntity ("sys"."event_outbox")
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any

import uuid6

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class AuditLogEntity(BaseDomainEntity):
    module: str
    action: str
    user_id: uuid.UUID | None = None
    username_snapshot: str | None = None
    role_code_snapshot: str | None = None
    impersonated_by: uuid.UUID | None = None
    subsystem: str | None = None
    severity: str = "INFO"
    table_name: str | None = None
    record_id: uuid.UUID | None = None
    target_summary: str | None = None
    old_data: dict[str, Any] | None = None
    new_data: dict[str, Any] | None = None
    diff_data: dict[str, Any] | None = None
    changed_fields: list[str] = field(default_factory=list)
    ip_address: str | None = None
    ip_country: str | None = None
    user_agent: str | None = None
    client_type: str = "WEB"
    session_id: str | None = None
    device_id: str | None = None
    request_id: str | None = None
    trace_id: str | None = None
    span_id: str | None = None
    method: str | None = None
    url: str | None = None
    query_params: dict[str, Any] = field(default_factory=dict)
    status_code: int | None = None
    duration_ms: int | None = None
    is_security_event: bool = False
    error_message: str | None = None
    stack_trace: str | None = None
    reason: str | None = None
    approved_by: uuid.UUID | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)

    def is_critical(self) -> bool:
        return self.severity in ("CRITICAL", "SECURITY_ALERT") or self.is_security_event

    def has_data_mutation(self) -> bool:
        return bool(self.diff_data or self.changed_fields)


@dataclass
class LoginHistoryEntity(BaseDomainEntity):
    user_id: uuid.UUID | None = None
    username_attempt: str | None = None
    login_status: str = "SUCCESS"
    failure_reason: str | None = None
    device_name: str | None = None
    device_id: str | None = None
    device_type: str = "DESKTOP"
    browser_name: str | None = None
    browser_version: str | None = None
    os_name: str | None = None
    os_version: str | None = None
    client_type: str = "WEB"
    app_version: str | None = None
    auth_method: str = "PASSWORD"
    ip_address: str | None = None
    user_agent: str | None = None
    request_id: str | None = None
    location_country: str | None = None
    location_country_code: str | None = None
    location_city: str | None = None
    location_region: str | None = None
    isp_provider: str | None = None
    is_suspicious: bool = False
    risk_score: Decimal = Decimal("0.00")
    risk_reasons: list[str] = field(default_factory=list)
    session_id: str | None = None
    is_active_session: bool = True
    logout_at: datetime | None = None
    logout_type: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    login_at: datetime = field(default_factory=datetime.now)

    def is_successful(self) -> bool:
        return self.login_status == "SUCCESS"

    def terminate_session(self, reason: str = "USER_INITIATED") -> None:
        self.is_active_session = False
        self.logout_at = datetime.now()
        self.logout_type = reason


@dataclass
class ModuleEntity(BaseDomainEntity):
    code: str
    name: str
    icon: str
    route: str
    short_name: str | None = None
    description: str | None = None
    module_type: str = "CARD"
    category: str = "ACADEMIC"
    required_permission: str | None = None
    is_mobile_visible: bool = True
    is_desktop_visible: bool = True
    badge_count_api: str | None = None
    default_color: str | None = "#3B82F6"
    default_badge: str | None = None
    component_name: str | None = None
    parent_module_id: uuid.UUID | None = None
    default_order_no: int = 0
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(cls, name: str, icon: str, route: str, code: str | None = None) -> "ModuleEntity":
        mod_code = code or generate_entity_code("MOD")
        return cls(id=uuid6.uuid7(), code=mod_code, name=name, icon=icon, route=route)


@dataclass
class RoleModuleEntity(BaseDomainEntity):
    role_id: uuid.UUID
    module_id: uuid.UUID
    is_visible: bool = True
    is_pinned_default: bool = False
    order_no: int = 0
    grid_col_span: int = 1
    grid_row_span: int = 1
    min_screen_width: str = "ALL"
    can_hide: bool = True
    custom_badge: str | None = None
    config: dict[str, Any] | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class UserModulePreferenceEntity(BaseDomainEntity):
    user_id: uuid.UUID
    module_id: uuid.UUID
    custom_title: str | None = None
    custom_color: str | None = None
    custom_col_span: int | None = None
    custom_row_span: int | None = None
    is_pinned: bool = False
    is_hidden: bool = False
    order_no: int | None = None
    custom_config: dict[str, Any] | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def toggle_pin(self) -> bool:
        self.is_pinned = not self.is_pinned
        return self.is_pinned

    def toggle_hide(self) -> bool:
        self.is_hidden = not self.is_hidden
        return self.is_hidden


@dataclass
class SettingsDefinitionEntity(BaseDomainEntity):
    code: str
    name: str
    data_type: str = "STRING"
    default_value: str = ""
    allowed_values: list[Any] | None = None
    scope: str = "USER"
    category: str | None = "APPEARANCE"
    ui_component: str = "INPUT"
    display_order: int = 0
    validation_rule: str | None = None
    description: str | None = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class SystemSettingEntity(BaseDomainEntity):
    setting_id: uuid.UUID
    value: str
    school_id: uuid.UUID | None = None
    is_public: bool = False
    description: str | None = None
    updated_by: uuid.UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class RoleSettingsDefaultEntity(BaseDomainEntity):
    role_id: uuid.UUID
    setting_id: uuid.UUID
    value: str
    school_id: uuid.UUID | None = None
    is_enforced: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class UserSettingEntity(BaseDomainEntity):
    user_id: uuid.UUID
    setting_id: uuid.UUID
    value: str
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ExportTemplateEntity(BaseDomainEntity):
    code: str
    name: str
    content: str
    template_type: str = "ANNOUNCEMENT"
    file_format: str = "HTML_PRINT"
    version: int = 1
    watermark_text: str | None = None
    include_digital_stamp: bool = True
    include_qr_verification: bool = True
    description: str | None = None
    header_content: str | None = None
    footer_content: str | None = None
    style_content: str | None = None
    page_size: str = "A4"
    page_orientation: str = "PORTRAIT"
    margins: dict[str, Any] = field(default_factory=lambda: {"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "20mm"})
    placeholders_schema: list[dict[str, Any]] = field(default_factory=list)
    sample_data: dict[str, Any] = field(default_factory=dict)
    is_default: bool = False
    is_active: bool = True
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    created_by: uuid.UUID | None = None
    updated_by: uuid.UUID | None = None
    is_deleted: bool = False
    deleted_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls, name: str, template_type: str = "ANNOUNCEMENT", code: str | None = None
    ) -> "ExportTemplateEntity":
        tpl_code = code or generate_entity_code("TPL")
        return cls(id=uuid6.uuid7(), code=tpl_code, name=name, content="", template_type=template_type)


@dataclass
class EventOutboxEntity(BaseDomainEntity):
    event_type: str
    aggregate_type: str
    aggregate_id: uuid.UUID
    payload: dict[str, Any]
    topic: str | None = None
    correlation_id: str | None = None
    headers: dict[str, Any] = field(default_factory=dict)
    status: str = "PENDING"
    retry_count: int = 0
    max_retries: int = 5
    next_retry_at: datetime | None = None
    error_message: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    processed_at: datetime | None = None

    def mark_processing(self) -> None:
        self.status = "PROCESSING"

    def mark_processed(self) -> None:
        self.status = "PROCESSED"
        self.processed_at = datetime.now()

    def mark_failed(self, error: str) -> None:
        self.retry_count += 1
        self.error_message = error
        if self.retry_count >= self.max_retries:
            self.status = "DEAD_LETTER"
        else:
            self.status = "FAILED"
            # Exponential backoff: 2^retry * 30 seconds
            backoff_secs = (2 ** self.retry_count) * 30
            self.next_retry_at = datetime.now() + timedelta(seconds=backoff_secs)
