"""
System Domain Entities encapsulating Auditing, Login History, Settings, Modules, Export Templates, and Outbox.
Covers 9 tables:
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
from datetime import datetime
from typing import Any

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class AuditLogEntity(BaseDomainEntity):
    module: str
    action: str
    table_name: str
    user_id: uuid.UUID | None = None
    record_id: uuid.UUID | None = None
    old_data: dict[str, Any] | None = None
    new_data: dict[str, Any] | None = None
    diff_data: dict[str, Any] | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    request_id: str | None = None
    severity: str = "INFO"
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class LoginHistoryEntity(BaseDomainEntity):
    user_id: uuid.UUID
    login_status: str = "SUCCESS"
    device_name: str | None = None
    device_id: str | None = None
    device_type: str = "DESKTOP"
    browser_name: str | None = None
    browser_version: str | None = None
    os_name: str | None = None
    os_version: str | None = None
    client_type: str = "WEB"
    auth_method: str = "PASSWORD"
    ip_address: str | None = None
    user_agent: str | None = None
    is_suspicious: bool = False
    session_id: str | None = None
    login_at: datetime = field(default_factory=datetime.now)
    logout_at: datetime | None = None


@dataclass
class ModuleEntity(BaseDomainEntity):
    code: str
    name: str
    icon: str
    route: str
    module_type: str = "CARD"
    category: str = "ACADEMIC"
    is_active: bool = True
    default_order_no: int = 0

    @classmethod
    def create(cls, name: str, icon: str, route: str, code: str | None = None) -> "ModuleEntity":
        mod_code = code or generate_entity_code("MOD")
        return cls(id=uuid.uuid4(), code=mod_code, name=name, icon=icon, route=route)


@dataclass
class RoleModuleEntity(BaseDomainEntity):
    role_id: uuid.UUID
    module_id: uuid.UUID
    is_visible: bool = True
    order_no: int = 0


@dataclass
class UserModulePreferenceEntity(BaseDomainEntity):
    user_id: uuid.UUID
    module_id: uuid.UUID
    is_pinned: bool = False
    custom_order_no: int = 0


@dataclass
class SettingsDefinitionEntity(BaseDomainEntity):
    code: str
    name: str
    data_type: str = "STRING"
    default_value: str | None = None
    category: str = "GENERAL"


@dataclass
class SystemSettingEntity(BaseDomainEntity):
    school_id: uuid.UUID | None
    code: str
    setting_value: str
    is_encrypted: bool = False


@dataclass
class RoleSettingsDefaultEntity(BaseDomainEntity):
    role_id: uuid.UUID
    code: str
    default_value: str


@dataclass
class UserSettingEntity(BaseDomainEntity):
    user_id: uuid.UUID
    code: str
    setting_value: str


@dataclass
class ExportTemplateEntity(BaseDomainEntity):
    code: str
    name: str
    template_type: str = "EXCEL"
    file_path: str = ""
    is_active: bool = True

    @classmethod
    def create(
        cls, name: str, template_type: str = "EXCEL", code: str | None = None
    ) -> "ExportTemplateEntity":
        tpl_code = code or generate_entity_code("TPL")
        return cls(id=uuid.uuid4(), code=tpl_code, name=name, template_type=template_type)


@dataclass
class EventOutboxEntity(BaseDomainEntity):
    event_type: str
    payload: dict[str, Any]
    status: str = "PENDING"
    retry_count: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    processed_at: datetime | None = None
