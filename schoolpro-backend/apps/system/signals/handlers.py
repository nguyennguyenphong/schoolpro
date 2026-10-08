"""
Django Auth Signals Handlers for System Login History & Auditing.
Listens to user_logged_in, user_login_failed, and user_logged_out signals
emitted by Django Admin and Django authentication backends.
"""

import logging
from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.signals import (
    user_logged_in,
    user_logged_out,
    user_login_failed,
)
from django.dispatch import receiver
from django.http import HttpRequest

from apps.system.services.login_history_service import LoginHistoryService

logger = logging.getLogger(__name__)
login_service = LoginHistoryService()
User = get_user_model()


@receiver(user_logged_in)
def handle_user_logged_in(
    sender: type,
    request: HttpRequest | None,
    user: Any,
    **kwargs: Any,
) -> None:
    """
    Records a successful login attempt into sys.login_history.
    Triggered by Django Admin login and standard Django auth workflows.
    """
    if not request or getattr(request, "_schoolpro_login_recorded", False):
        return

    try:
        login_service.record_login(
            request=request,
            user=user if hasattr(user, "id") else None,
            status="SUCCESS",
            auth_method="PASSWORD",
            metadata={"source": "django_admin_signal"},
        )
        request._schoolpro_login_recorded = True
    except Exception as exc:
        logger.error("Error recording user_logged_in signal: %s", exc, exc_info=True)


@receiver(user_login_failed)
def handle_user_login_failed(
    sender: type,
    credentials: dict[str, Any] | None,
    request: HttpRequest | None,
    **kwargs: Any,
) -> None:
    """
    Records a failed login attempt into sys.login_history.
    Triggered when authentication fails in Django Admin or auth backend.
    """
    if not request or getattr(request, "_schoolpro_login_recorded", False):
        return

    try:
        username_attempt = ""
        if credentials:
            username_attempt = (
                credentials.get("username")
                or credentials.get("email")
                or credentials.get("code")
                or ""
            )

        # Attempt to see if this user actually exists in the database
        matched_user = None
        if username_attempt:
            matched_user = (
                User.objects.filter(username__iexact=username_attempt).first()
                or User.objects.filter(email__iexact=username_attempt).first()
            )

        login_service.record_login(
            request=request,
            user=matched_user,
            username_attempt=username_attempt,
            status="FAILED",
            failure_reason="Tên đăng nhập hoặc mật khẩu không chính xác.",
            auth_method="PASSWORD",
            metadata={"source": "django_admin_signal"},
        )
        request._schoolpro_login_recorded = True
    except Exception as exc:
        logger.error("Error recording user_login_failed signal: %s", exc, exc_info=True)


@receiver(user_logged_out)
def handle_user_logged_out(
    sender: type,
    request: HttpRequest | None,
    user: Any,
    **kwargs: Any,
) -> None:
    """
    Records a logout event and deactivates active session in sys.login_history.
    """
    try:
        login_service.record_logout(
            request=request,
            user=user if (user and hasattr(user, "id") and user.is_authenticated) else None,
            logout_type="USER_INITIATED",
        )
    except Exception as exc:
        logger.error("Error recording user_logged_out signal: %s", exc, exc_info=True)
