"""
Business Logic Service for System Modules and Role-based Dynamic Dashboard Cards.
"""

import logging
import uuid
from typing import Any

from django.db import connection

from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from apps.system.models.module import Module, RoleModule
from apps.system.models.preference import UserModulePreference
from apps.system.repositories.module_repository import (
    ModuleRepository,
    RoleModuleRepository,
    UserModulePreferenceRepository,
)
from common.exceptions import ResourceNotFoundError


class ModuleService:
    """
    Service resolving modules and role cards for authenticated users.
    Implements 3-tier layout fallback:
    User Preferences -> Role Default Configuration -> Module Master Default.
    """

    def __init__(self):
        self.module_repo = ModuleRepository()
        self.role_module_repo = RoleModuleRepository()
        self.pref_repo = UserModulePreferenceRepository()
        self.logger = logging.getLogger(__name__)

    def get_modules_for_user(
        self,
        user: User,
        active_role_code: str | None = None,
        include_hidden: bool = False,
    ) -> list[dict[str, Any]]:
        """
        Fetches dynamic card stream for the user based on active role session.
        Merges sys.modules + sys.role_modules + sys.user_module_preferences.
        """
        # 1. Resolve role for session
        role = self._resolve_target_role(user, active_role_code)
        if not role:
            self.logger.warning("No valid role found for user %s", user.id)
            return []

        # 2. Try querying the database view sys.v_user_dashboard_cards if available
        cards = self._fetch_cards_via_view(user.id, role.code, include_hidden)
        if cards:
            return cards

        # 3. Fallback ORM computation in case database view is not accessible
        return self._compute_cards_via_orm(user.id, role, include_hidden)

    def update_user_preference(
        self,
        user: User,
        module_id: str | uuid.UUID,
        is_pinned: bool | None = None,
        is_hidden: bool | None = None,
        order_no: int | None = None,
        custom_config: dict[str, Any] | None = None,
    ) -> UserModulePreference:
        """
        Persists user drag-and-drop / pin / hide preferences for a module.
        """
        module = self.module_repo.get_by_id(str(module_id))
        if not module:
            raise ResourceNotFoundError(detail=f"Module với ID '{module_id}' không tồn tại.")

        return self.pref_repo.upsert_preference(
            user_id=user.id,
            module_id=module.id,
            is_pinned=is_pinned,
            is_hidden=is_hidden,
            order_no=order_no,
            custom_config=custom_config,
        )

    def reorder_modules_for_user(
        self,
        user: User,
        orders: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Batch updates display order for user's dashboard cards.
        orders: [{'module_id': 'uuid', 'order_no': 1}, ...]
        """
        for item in orders:
            module_id = item["module_id"]
            order_no = item["order_no"]
            self.pref_repo.upsert_preference(
                user_id=user.id,
                module_id=module_id,
                order_no=order_no,
            )

        active_role_code = getattr(user, "active_role_code", None)
        return self.get_modules_for_user(user, active_role_code=active_role_code)

    # -------------------------------------------------------------------------
    # ADMIN CRUD OPERATIONS FOR MODULES (sys.modules)
    # -------------------------------------------------------------------------

    def list_all_modules(
        self, category: str | None = None, is_active: bool | None = None
    ) -> list[Module]:
        """Admin list of all registered modules."""
        qs = self.module_repo.get_queryset()
        if category:
            qs = qs.filter(category=category.upper())
        if is_active is not None:
            qs = qs.filter(is_active=is_active)
        return list(qs.order_by("category", "default_order_no", "code"))

    def get_module_by_id(self, module_id: str | uuid.UUID) -> Module:
        """Admin get single module details."""
        module = self.module_repo.get_by_id(str(module_id))
        if not module:
            raise ResourceNotFoundError(detail=f"Module với ID '{module_id}' không tồn tại.")
        return module

    def create_module(self, **data) -> Module:
        """Admin create a new functional module."""
        return self.module_repo.create_module(**data)

    def update_module(self, module_id: str | uuid.UUID, **data) -> Module:
        """Admin update existing module."""
        module = self.get_module_by_id(module_id)
        return self.module_repo.update_module(module, **data)

    def delete_module(self, module_id: str | uuid.UUID) -> None:
        """Admin delete a module and associated role mappings."""
        module = self.get_module_by_id(module_id)
        # Clean up related role mappings and preferences
        RoleModule.objects.filter(module_id=module.id).delete()
        UserModulePreference.objects.filter(module_id=module.id).delete()
        self.module_repo.delete_module(module)

    # -------------------------------------------------------------------------
    # ADMIN ROLE - MODULE MAPPING OPERATIONS (sys.role_modules)
    # -------------------------------------------------------------------------

    def list_role_modules(self, role_id: str | uuid.UUID | None = None) -> list[RoleModule]:
        """Admin list of role-module assignments."""
        qs = RoleModule.objects.select_related("module").order_by("role_id", "order_no")
        if role_id:
            qs = qs.filter(role_id=role_id)
        return list(qs)

    def assign_module_to_role(
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
        """Admin assign or update module layout for a specific role."""
        if not Role.objects.filter(id=role_id).exists():
            raise ResourceNotFoundError(detail=f"Role với ID '{role_id}' không tồn tại.")
        if not Module.objects.filter(id=module_id).exists():
            raise ResourceNotFoundError(detail=f"Module với ID '{module_id}' không tồn tại.")

        return self.role_module_repo.upsert_role_module(
            role_id=role_id,
            module_id=module_id,
            is_visible=is_visible,
            is_pinned_default=is_pinned_default,
            order_no=order_no,
            grid_col_span=grid_col_span,
            custom_badge=custom_badge,
            config=config,
        )

    def revoke_module_from_role(self, role_id: str | uuid.UUID, module_id: str | uuid.UUID) -> None:
        """Admin revoke a module assignment from a role."""
        removed = self.role_module_repo.remove_role_module(role_id, module_id)
        if not removed:
            raise ResourceNotFoundError(
                detail=f"Không tìm thấy liên kết giữa Role '{role_id}' và Module '{module_id}'."
            )

    def _resolve_target_role(self, user: User, requested_role_code: str | None) -> Role | None:
        """
        Identifies active role: requested code > user.active_role_code > primary role > first role.
        """
        target_code = requested_role_code or getattr(user, "active_role_code", None)

        if target_code:
            clean_code = target_code.strip()
            role = Role.objects.filter(code__iexact=clean_code).first()
            if not role:
                # Semantic match (e.g. 'student' matches 'R_STU_568294')
                clean_upper = clean_code.upper()
                if "STUDENT" in clean_upper or clean_upper == "STUDENT":
                    role = Role.objects.filter(code__icontains="STU").first()
                elif "TEACHER" in clean_upper or clean_upper == "TEACHER":
                    role = Role.objects.filter(code__icontains="TCH").first()
                elif "ADMIN" in clean_upper or clean_upper == "ADMIN":
                    role = Role.objects.filter(code__icontains="ADMIN").first()
            if role:
                return role

        # Fallback to user's assigned primary role in core.user_roles
        primary_ur = (
            UserRole.objects.filter(user=user, is_primary=True).select_related("role").first()
        )
        if primary_ur and primary_ur.role:
            return primary_ur.role

        first_ur = UserRole.objects.filter(user=user).select_related("role").first()
        if first_ur and first_ur.role:
            return first_ur.role

        # Default student role if no user_roles assigned
        return Role.objects.filter(code__icontains="STU").first()

    def _fetch_cards_via_view(
        self,
        user_id: uuid.UUID,
        role_code: str,
        include_hidden: bool,
    ) -> list[dict[str, Any]] | None:
        """
        Queries sys.v_user_dashboard_cards database view for optimal SQL performance.
        """
        try:
            sql = """
                SELECT
                    module_id,
                    module_code,
                    module_name,
                    description,
                    icon,
                    route,
                    module_type,
                    category,
                    is_hidden,
                    is_pinned,
                    display_order,
                    badge_text,
                    ui_config
                FROM sys.v_user_dashboard_cards
                WHERE user_id = %s
                  AND (role_code = %s OR role_code = 'STUDENT' OR role_code = 'R_STU_568294')
            """
            if not include_hidden:
                sql += " AND is_hidden = FALSE"
            sql += " ORDER BY display_order ASC;"

            with connection.cursor() as cursor:
                cursor.execute(sql, [str(user_id), role_code])
                rows = cursor.fetchall()

                if not rows:
                    return None

                results = []
                for row in rows:
                    (
                        module_id,
                        module_code,
                        module_name,
                        desc,
                        icon,
                        route,
                        m_type,
                        cat,
                        hidden,
                        pinned,
                        order_no,
                        badge_text,
                        ui_config,
                    ) = row

                    cfg = ui_config if isinstance(ui_config, dict) else {}
                    results.append(
                        self._build_card_dict(
                            module_id=str(module_id),
                            code=module_code,
                            name=module_name,
                            short_name=None,
                            description=desc,
                            icon=icon,
                            route=route,
                            module_type=m_type,
                            category=cat,
                            is_hidden=hidden,
                            is_pinned=pinned,
                            display_order=order_no,
                            badge_text=badge_text,
                            config=cfg,
                        )
                    )
                return results
        except Exception as e:
            self.logger.debug("Database view sys.v_user_dashboard_cards query omitted: %s", e)
            return None

    def _compute_cards_via_orm(
        self,
        user_id: uuid.UUID,
        role: Role,
        include_hidden: bool,
    ) -> list[dict[str, Any]]:
        """
        Computes cards directly using Django ORM joining sys.role_modules, sys.modules,
        and sys.user_module_preferences.
        """
        # Get active role modules
        role_modules = (
            RoleModule.objects.filter(role_id=role.id, is_visible=True)
            .select_related("module")
            .order_by("order_no")
        )

        # Get user personalized overrides
        user_prefs = {
            pref.module_id: pref for pref in UserModulePreference.objects.filter(user_id=user_id)
        }

        cards = []
        for rm in role_modules:
            mod = rm.module
            if not mod or not mod.is_active:
                continue

            pref = user_prefs.get(mod.id)
            is_hidden = pref.is_hidden if pref and pref.is_hidden is not None else False
            if is_hidden and not include_hidden:
                continue

            is_pinned = (
                pref.is_pinned if pref and pref.is_pinned is not None else rm.is_pinned_default
            )
            order_no = (
                pref.order_no
                if pref and pref.order_no is not None
                else (rm.order_no or mod.default_order_no or 0)
            )

            # Resolve config
            merged_config = dict(rm.config or {})
            if pref and pref.custom_config:
                merged_config.update(pref.custom_config)

            badge_text = rm.custom_badge or mod.default_badge

            cards.append(
                self._build_card_dict(
                    module_id=str(mod.id),
                    code=mod.code,
                    name=mod.name,
                    short_name=mod.short_name,
                    description=mod.description,
                    icon=mod.icon,
                    route=mod.route,
                    module_type=mod.module_type,
                    category=mod.category,
                    is_hidden=is_hidden,
                    is_pinned=is_pinned,
                    display_order=order_no,
                    badge_text=badge_text,
                    config=merged_config,
                )
            )

        cards.sort(key=lambda c: c["display_order"])
        return cards

    def _build_card_dict(
        self,
        module_id: str,
        code: str,
        name: str,
        short_name: str | None,
        description: str | None,
        icon: str,
        route: str,
        module_type: str,
        category: str,
        is_hidden: bool,
        is_pinned: bool,
        display_order: int,
        badge_text: str | None,
        config: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Formats single unified card dictionary with backward and forward frontend compatibility.
        """
        icon_name = config.get("iconName", icon)
        icon_bg_color = config.get("iconBgColor", "bg-blue-50 border border-blue-200")
        icon_color = config.get("iconColor", "text-blue-600")
        badge_count = config.get("badgeCount")
        badge_color = config.get("badgeColor", "blue")
        translation_key = config.get("translationKey", "")

        card_id = config.get("id", code)

        return {
            "id": card_id,
            "module_id": module_id,
            "module_code": code,
            "module_name": name,
            "short_name": short_name,
            "description": description,
            "icon": icon,
            "icon_name": icon_name,
            "icon_bg_color": icon_bg_color,
            "icon_color": icon_color,
            "route": route,
            "module_type": module_type,
            "category": category,
            "translation_key": translation_key,
            "badge_count": badge_count,
            "badge_color": badge_color,
            "badge_text": badge_text or (str(badge_count) if badge_count is not None else None),
            "is_pinned": is_pinned,
            "is_hidden": is_hidden,
            "display_order": display_order,
            "ui_config": config,
        }
