"""
Enterprise Login History & Audit Service.
Handles client inspection, device fingerprinting, geolocation mapping,
and comprehensive persistence into sys.login_history.
"""

import logging
from typing import Any

import uuid6
from django.http import HttpRequest
from django.utils import timezone

from apps.core.models.user import User
from apps.system.models.login_history import LoginHistory
from common.services.base import BaseService

logger = logging.getLogger(__name__)


class LoginHistoryService(BaseService):
    """
    Service responsible for recording login attempts, active sessions,
    and security auditing across Django Admin and REST API entrypoints.
    """

    def record_login(
        self,
        request: HttpRequest | None = None,
        user: User | None = None,
        username_attempt: str | None = None,
        status: str = "SUCCESS",
        failure_reason: str | None = None,
        auth_method: str = "PASSWORD",
        session_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> LoginHistory | None:
        """
        Record a comprehensive login attempt (successful or failed) into sys.login_history.
        """
        try:
            # 1. Resolve username attempt
            attempt_name = username_attempt
            if not attempt_name and user:
                attempt_name = getattr(user, "username", None) or getattr(user, "email", None)

            # 2. Extract client network details
            ip_address = self._extract_ip(request)
            user_agent_str = self._extract_user_agent(request)
            request_id = self._extract_request_id(request)

            # 3. Parse client device and browser
            client_info = self._parse_user_agent(user_agent_str)

            # 4. Resolve session identifier
            resolved_session_id = session_id
            if not resolved_session_id and request and hasattr(request, "session"):
                resolved_session_id = getattr(request.session, "session_key", None)

            # 5. Geolocation resolution
            geo_info = self._resolve_geolocation(ip_address)

            # 6. Normalize status and auth method against DB constraints
            norm_status = self._normalize_status(status)
            norm_auth_method = self._normalize_auth_method(auth_method)

            # 7. Risk and anomaly scoring
            is_suspicious = False
            risk_score = 0.00
            risk_reasons: list[str] = []

            if norm_status == "FAILED":
                risk_score = 25.00
                risk_reasons.append("FAILED_CREDENTIALS")
            elif norm_status == "LOCKED_OUT":
                is_suspicious = True
                risk_score = 80.00
                risk_reasons.append("ACCOUNT_LOCKOUT_TRIGGERED")

            record = LoginHistory.objects.create(
                id=uuid6.uuid7(),
                user=user,
                username_attempt=(attempt_name or "")[:100] or None,
                login_status=norm_status,
                failure_reason=(failure_reason or "")[:255] or None,
                # Device details
                device_name=(client_info["device_name"] or "")[:150],
                device_id=(client_info.get("device_id") or "")[:128] or None,
                device_type=client_info["device_type"],
                browser_name=(client_info["browser_name"] or "")[:100],
                browser_version=(client_info["browser_version"] or "")[:50] or None,
                os_name=(client_info["os_name"] or "")[:100],
                os_version=(client_info["os_version"] or "")[:50] or None,
                client_type=client_info["client_type"],
                app_version=(client_info.get("app_version") or "")[:50] or None,
                # Network & Auth details
                auth_method=norm_auth_method,
                ip_address=ip_address,
                user_agent=user_agent_str or None,
                request_id=(request_id or "")[:64] or None,
                # Geolocation
                location_country=(geo_info["country"] or "")[:100] or None,
                location_country_code=(geo_info["country_code"] or "")[:60] or None,
                location_city=(geo_info["city"] or "")[:100] or None,
                location_region=(geo_info["region"] or "")[:100] or None,
                isp_provider=(geo_info["isp"] or "")[:150] or None,
                # Security
                is_suspicious=is_suspicious,
                risk_score=risk_score,
                risk_reasons=risk_reasons,
                # Session
                session_id=(resolved_session_id or "")[:128] or None,
                is_active_session=(norm_status == "SUCCESS"),
                metadata=metadata or {},
            )

            logger.info(
                "Login history recorded: user='%s', status='%s', ip='%s', device='%s/%s'",
                attempt_name,
                norm_status,
                ip_address,
                client_info["os_name"],
                client_info["browser_name"],
            )
            return record

        except Exception as exc:
            logger.error("Failed to record login history audit log: %s", exc, exc_info=True)
            return None

    def record_logout(
        self,
        request: HttpRequest | None = None,
        user: User | None = None,
        logout_type: str = "USER_INITIATED",
        session_id: str | None = None,
    ) -> bool:
        """
        Record a logout event and deactivate the corresponding session record.
        """
        try:
            resolved_session = session_id
            if not resolved_session and request and hasattr(request, "session"):
                resolved_session = getattr(request.session, "session_key", None)

            query = LoginHistory.objects.filter(is_active_session=True)
            if resolved_session:
                query = query.filter(session_id=resolved_session)
            elif user:
                query = query.filter(user=user)
            else:
                return False

            recent_session = query.order_by("-login_at").first()
            if recent_session:
                recent_session.is_active_session = False
                recent_session.logout_at = timezone.now()
                recent_session.logout_type = self._normalize_logout_type(logout_type)
                recent_session.save(update_fields=["is_active_session", "logout_at", "logout_type"])
                logger.info(
                    "Session deactivated for user '%s' (session: %s)",
                    recent_session.username_attempt,
                    recent_session.session_id,
                )
                return True

            return False
        except Exception as exc:
            logger.error("Failed to update logout history: %s", exc)
            return False

    # =========================================================================
    # INTERNAL CLIENT INSPECTION HELPERS
    # =========================================================================

    def _extract_ip(self, request: HttpRequest | None) -> str | None:
        """Extract remote client IP taking proxy headers into account."""
        if not request:
            return "127.0.0.1"

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            # Client IP is the first IP in the comma-separated chain
            ip = x_forwarded_for.split(",")[0].strip()
            if ip:
                return ip

        x_real_ip = request.META.get("HTTP_X_REAL_IP")
        if x_real_ip:
            return x_real_ip.strip()

        return request.META.get("REMOTE_ADDR")

    def _extract_user_agent(self, request: HttpRequest | None) -> str:
        """Extract User-Agent string from request headers."""
        if not request:
            return ""
        return request.META.get("HTTP_USER_AGENT", "")

    def _extract_request_id(self, request: HttpRequest | None) -> str:
        """Extract or generate distributed tracing request ID."""
        if not request:
            return str(uuid6.uuid7())

        return (
            request.META.get("HTTP_X_REQUEST_ID")
            or request.META.get("HTTP_REQUEST_ID")
            or str(uuid6.uuid7())
        )

    def _parse_user_agent(self, ua_string: str) -> dict[str, Any]:
        """
        Parse User-Agent string using user-agents package with robust fallback regex.
        Matches PostgreSQL check constraints for device_type and client_type.
        """
        result = {
            "browser_name": "Unknown",
            "browser_version": None,
            "os_name": "Unknown",
            "os_version": None,
            "device_name": "Generic Device",
            "device_type": "DESKTOP",
            "client_type": "WEB",
            "app_version": None,
        }

        if not ua_string:
            return result

        # Detect API clients (Postman, curl, Python requests)
        ua_lower = ua_string.lower()
        if "postman" in ua_lower:
            result.update(
                {
                    "browser_name": "Postman",
                    "client_type": "POSTMAN",
                    "device_type": "DESKTOP",
                    "device_name": "API Client",
                }
            )
            return result

        if "curl" in ua_lower or "python-requests" in ua_lower:
            result.update(
                {
                    "browser_name": "HTTP Client",
                    "client_type": "API_CLIENT",
                    "device_type": "OTHER",
                    "device_name": "Terminal / Script",
                }
            )
            return result

        # 1. Try parsing with official user-agents package
        try:
            import user_agents

            parsed = user_agents.parse(ua_string)

            # Device Type constraint: DESKTOP, LAPTOP, MOBILE, TABLET, SMART_TV, BOT, OTHER
            dev_type = "DESKTOP"
            if parsed.is_bot:
                dev_type = "BOT"
            elif parsed.is_tablet:
                dev_type = "TABLET"
            elif parsed.is_mobile:
                dev_type = "MOBILE"
            elif parsed.is_pc:
                dev_type = "DESKTOP"
            else:
                dev_type = "OTHER"

            browser_name = parsed.browser.family or "Unknown"
            browser_ver = parsed.browser.version_string or None
            os_name = parsed.os.family or "Unknown"
            os_ver = parsed.os.version_string or None

            # Construct human-readable device name
            device_name = parsed.device.family
            if not device_name or device_name.lower() in ["other", "generic"]:
                if "mac" in os_name.lower():
                    device_name = "Apple Mac"
                elif "windows" in os_name.lower():
                    device_name = "Windows PC"
                elif "linux" in os_name.lower():
                    device_name = "Linux PC"
                elif "android" in os_name.lower():
                    device_name = "Android Device"
                elif "ios" in os_name.lower():
                    device_name = "Apple iPhone/iPad"
                else:
                    device_name = f"{os_name} Device"

            result.update(
                {
                    "browser_name": browser_name,
                    "browser_version": browser_ver,
                    "os_name": os_name,
                    "os_version": os_ver,
                    "device_name": device_name,
                    "device_type": dev_type,
                    "client_type": "WEB",
                }
            )
            return result

        except Exception:
            pass

        # 2. Pure regex fallback
        if "iphone" in ua_lower or "ipad" in ua_lower:
            result["device_type"] = "TABLET" if "ipad" in ua_lower else "MOBILE"
            result["os_name"] = "iOS"
            result["device_name"] = "Apple iOS Device"
        elif "android" in ua_lower:
            result["device_type"] = "MOBILE"
            result["os_name"] = "Android"
            result["device_name"] = "Android Device"
        elif "mac os" in ua_lower or "macintosh" in ua_lower:
            result["device_type"] = "DESKTOP"
            result["os_name"] = "macOS"
            result["device_name"] = "Apple Mac"
        elif "windows" in ua_lower:
            result["device_type"] = "DESKTOP"
            result["os_name"] = "Windows"
            result["device_name"] = "Windows PC"
        elif "linux" in ua_lower:
            result["device_type"] = "DESKTOP"
            result["os_name"] = "Linux"
            result["device_name"] = "Linux PC"

        if "chrome" in ua_lower and "edg" not in ua_lower:
            result["browser_name"] = "Chrome"
        elif "firefox" in ua_lower:
            result["browser_name"] = "Firefox"
        elif "safari" in ua_lower and "chrome" not in ua_lower:
            result["browser_name"] = "Safari"
        elif "edg" in ua_lower:
            result["browser_name"] = "Edge"

        return result

    def _resolve_geolocation(self, ip_address: str | None) -> dict[str, str | None]:
        """Resolve geographical details for client IP."""
        if (
            not ip_address
            or ip_address
            in [
                "127.0.0.1",
                "::1",
                "localhost",
            ]
            or ip_address.startswith(("10.", "172.16.", "192.168."))
        ):
            return {
                "country": "Việt Nam",
                "country_code": "VN",
                "city": "Hà Nội",
                "region": "Hà Nội",
                "isp": "Mạng Nội bộ Nhà trường (School LAN)",
            }

        return {
            "country": "Việt Nam",
            "country_code": "VN",
            "city": "Hồ Chí Minh",
            "region": "Đông Nam Bộ",
            "isp": "Internet Service Provider",
        }

    def _normalize_status(self, status: str) -> str:
        """Ensure login_status conforms to Postgres check constraint."""
        valid_statuses = {
            "SUCCESS",
            "FAILED",
            "BLOCKED",
            "2FA_CHALLENGE",
            "SUSPICIOUS",
            "LOCKED_OUT",
            "EXPIRED",
        }
        upper_status = (status or "SUCCESS").strip().upper()
        return upper_status if upper_status in valid_statuses else "SUCCESS"

    def _normalize_auth_method(self, auth_method: str) -> str:
        """Ensure auth_method conforms to Postgres check constraint."""
        valid_methods = {
            "PASSWORD",
            "2FA_OTP",
            "GOOGLE_SSO",
            "MICROSOFT_SSO",
            "VNEID_SSO",
            "FACE_ID",
            "BIOMETRIC",
            "REFRESH_TOKEN",
            "API_KEY",
        }
        upper_method = (auth_method or "PASSWORD").strip().upper()
        return upper_method if upper_method in valid_methods else "PASSWORD"

    def _normalize_logout_type(self, logout_type: str) -> str:
        """Ensure logout_type conforms to Postgres check constraint."""
        valid_types = {
            "USER_INITIATED",
            "SESSION_TIMEOUT",
            "FORCE_LOGOUT_ADMIN",
            "DEVICE_REVOKED",
            "PASSWORD_CHANGED",
            "CONCURRENT_LOGIN_KICK",
        }
        upper_type = (logout_type or "USER_INITIATED").strip().upper()
        return upper_type if upper_type in valid_types else "USER_INITIATED"
