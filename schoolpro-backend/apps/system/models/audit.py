from django.contrib.postgres.fields import ArrayField
from django.db import models

from common.models.base import UUIDModel


class AuditLog(UUIDModel):
    """
    AuditLog Model.

    Database Table: "sys"."audit_logs"
    Description: Immutable security audit trail recording critical changes, data diffs,
    user actions, system security events, and compliance forensics.
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="user_id",
        related_name="audit_logs",
        null=True,
        blank=True,
        db_comment="user_id foreign key",
    )
    username_snapshot = models.CharField(max_length=100, null=True, blank=True)
    role_code_snapshot = models.CharField(max_length=50, null=True, blank=True)
    impersonated_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="impersonated_by",
        related_name="impersonated_audit_logs",
        null=True,
        blank=True,
        db_comment="impersonated_by foreign key",
    )

    module = models.CharField(max_length=50)
    subsystem = models.CharField(max_length=50, null=True, blank=True)
    action = models.CharField(max_length=50)
    severity = models.CharField(max_length=20, default="INFO")
    table_name = models.CharField(max_length=150, null=True, blank=True)
    record_id = models.UUIDField(null=True, blank=True)
    target_summary = models.CharField(max_length=255, null=True, blank=True)

    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    diff_data = models.JSONField(null=True, blank=True)
    changed_fields = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True,
    )

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    ip_country = models.CharField(max_length=100, null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    client_type = models.CharField(max_length=30, default="WEB")
    session_id = models.CharField(max_length=128, null=True, blank=True)
    device_id = models.CharField(max_length=128, null=True, blank=True)

    request_id = models.CharField(max_length=64, null=True, blank=True)
    trace_id = models.CharField(max_length=128, null=True, blank=True)
    span_id = models.CharField(max_length=64, null=True, blank=True)
    method = models.CharField(max_length=10, null=True, blank=True)
    url = models.CharField(max_length=500, null=True, blank=True)
    query_params = models.JSONField(default=dict, blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    duration_ms = models.IntegerField(null=True, blank=True)

    is_security_event = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    stack_trace = models.TextField(null=True, blank=True)

    reason = models.TextField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="approved_by",
        related_name="approved_audit_logs",
        null=True,
        blank=True,
        db_comment="approved_by foreign key",
    )

    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = '"sys"."audit_logs"'
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.module}:{self.action} on {self.table_name or 'system'} at {self.created_at}"

    def __repr__(self) -> str:
        return f"<AuditLog {self.pk}: {self.action}>"
