"""
Repository layer for Modules, Role Modules, and User Module Preferences.
"""

import uuid
from typing import Any

from django.db.models import QuerySet
from django.utils import timezone

from apps.system.models.module import Module, RoleModule
from apps.system.models.preference import UserModulePreference
from common.repositories.base import BaseRepository


class ModuleRepository(BaseRepository[Module]):
    """
    Repository handling sys.modules master records.
    """

    def __init__(self):
        super().__init__(Module)

    def get_active_modules(self) -> QuerySet[Module]:
        return self.filter(is_active=True).order_by("default_order_no", "code")

    def get_by_code(self, code: str) -> Module | None:
        return self.filter(code=code).first()

    def create_module(self, **data) -> Module:
        if "id" not in data:
            data["id"] = uuid.uuid4()
        if "created_at" not in data:
            data["created_at"] = timezone.now()
        return Module.objects.create(**data)

    def update_module(self, module: Module, **data) -> Module:
        for k, v in data.items():
            setattr(module, k, v)
        module.save()
        return module

    def delete_module(self, module: Module) -> None:
        module.delete()


class RoleModuleRepository(BaseRepository[RoleModule]):
    """
    Repository handling sys.role_modules configurations.
    """

    def __init__(self):
        super().__init__(RoleModule)

    def get_modules_by_role_id(self, role_id: str | uuid.UUID) -> QuerySet[RoleModule]:
        return self.filter(role_id=role_id).select_related("module").order_by("order_no")

    def get_by_role_and_module(
        self, role_id: str | uuid.UUID, module_id: str | uuid.UUID
    ) -> RoleModule | None:
        return self.filter(role_id=role_id, module_id=module_id).first()

    def upsert_role_module(
        self,
        role_id: str | uuid.UUID,
        module_id: str | uuid.UUID,
        is_visible: bool = True,
        is_pinned_default: bool = False,
        order_no: int = 0,
        grid_col_span: int = 1,
        custom_badge: str | None = None,
        config: dict[str, Any] | None = None,
    ) -> RoleModule:
        rm = self.get_by_role_and_module(role_id, module_id)
        if not rm:
            rm = RoleModule(
                id=uuid.uuid4(),
                role_id=role_id,
                module_id=module_id,
                is_visible=is_visible,
                is_pinned_default=is_pinned_default,
                order_no=order_no,
                grid_col_span=grid_col_span,
                custom_badge=custom_badge,
                config=config or {},
            )
        else:
            rm.is_visible = is_visible
            rm.is_pinned_default = is_pinned_default
            rm.order_no = order_no
            rm.grid_col_span = grid_col_span
            rm.custom_badge = custom_badge
            if config is not None:
                rm.config = config

        rm.save()
        return rm

    def remove_role_module(self, role_id: str | uuid.UUID, module_id: str | uuid.UUID) -> bool:
        rm = self.get_by_role_and_module(role_id, module_id)
        if rm:
            rm.delete()
            return True
        return False


class UserModulePreferenceRepository(BaseRepository[UserModulePreference]):
    """
    Repository handling personalized overrides in sys.user_module_preferences.
    """

    def __init__(self):
        super().__init__(UserModulePreference)

    def get_user_preferences(self, user_id: str | uuid.UUID) -> QuerySet[UserModulePreference]:
        return self.filter(user_id=user_id).select_related("module")

    def get_user_preference_for_module(
        self, user_id: str | uuid.UUID, module_id: str | uuid.UUID
    ) -> UserModulePreference | None:
        return self.filter(user_id=user_id, module_id=module_id).first()

    def upsert_preference(
        self,
        user_id: str | uuid.UUID,
        module_id: str | uuid.UUID,
        is_pinned: bool | None = None,
        is_hidden: bool | None = None,
        order_no: int | None = None,
        custom_config: dict[str, Any] | None = None,
    ) -> UserModulePreference:
        pref = self.get_user_preference_for_module(user_id, module_id)
        if not pref:
            pref = UserModulePreference(
                id=uuid.uuid4(),
                user_id=user_id,
                module_id=module_id,
                is_pinned=is_pinned if is_pinned is not None else False,
                is_hidden=is_hidden if is_hidden is not None else False,
                order_no=order_no,
                custom_config=custom_config or {},
            )
        else:
            if is_pinned is not None:
                pref.is_pinned = is_pinned
            if is_hidden is not None:
                pref.is_hidden = is_hidden
            if order_no is not None:
                pref.order_no = order_no
            if custom_config is not None:
                pref.custom_config = custom_config

        pref.save()
        return pref
