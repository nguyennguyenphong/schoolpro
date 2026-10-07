from django.contrib.postgres.fields import ArrayField
from django.db import models

from common.models.base import UUIDModel


class LoginHistory(UUIDModel):
    """
    LoginHistory Model.

    Database Table: "sys"."login_history"
    Description: Detailed login auditing, device fingerprinting, session auditing,
    geolocation, and security tracking.
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="login_history",
        null=True,
        blank=True,
        db_comment="user_id foreign key",
    )
    username_attempt = models.CharField(max_length=100, null=True, blank=True)
    login_at = models.DateTimeField(auto_now_add=True)
    login_status = models.CharField(max_length=30, default="SUCCESS")
    failure_reason = models.CharField(max_length=255, null=True, blank=True)

    # Device & Client Information
    device_name = models.CharField(max_length=150, null=True, blank=True)
    device_id = models.CharField(max_length=128, null=True, blank=True)
    device_type = models.CharField(max_length=30, default="DESKTOP")
    browser_name = models.CharField(max_length=100, null=True, blank=True)
    browser_version = models.CharField(max_length=50, null=True, blank=True)
    os_name = models.CharField(max_length=100, null=True, blank=True)
    os_version = models.CharField(max_length=50, null=True, blank=True)
    client_type = models.CharField(max_length=30, default="WEB")
    app_version = models.CharField(max_length=50, null=True, blank=True)

    # Authentication & Network Details
    auth_method = models.CharField(max_length=50, default="PASSWORD")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    request_id = models.CharField(max_length=64, null=True, blank=True)

    # Geolocation & Network Provider
    location_country = models.CharField(max_length=100, null=True, blank=True)
    location_country_code = models.CharField(max_length=60, null=True, blank=True)
    location_city = models.CharField(max_length=100, null=True, blank=True)
    location_region = models.CharField(max_length=100, null=True, blank=True)
    isp_provider = models.CharField(max_length=150, null=True, blank=True)

    # Security & Anomaly Detection
    is_suspicious = models.BooleanField(default=False)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    risk_reasons = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True,
    )

    # Session Lifecycle & Logout Tracking
    session_id = models.CharField(max_length=128, null=True, blank=True)
    is_active_session = models.BooleanField(default=True)
    logout_at = models.DateTimeField(null=True, blank=True)
    logout_type = models.CharField(max_length=50, null=True, blank=True)

    # Extensibility
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        managed = False
        db_table = '"sys"."login_history"'
        verbose_name = "Login History"
        verbose_name_plural = "Login Histories"
        ordering = ["-login_at"]

    def __str__(self) -> str:
        return f"{self.user_id or self.username_attempt} - {self.login_status} at {self.login_at}"
