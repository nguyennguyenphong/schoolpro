from django.db import models

from common.models.base import UUIDModel


class AuditLog(UUIDModel):
    """
    AuditLog Model.

    Database Table: "sys"."audit_logs"
    Description: System audit trail tracking transactional changes for security compliance and governance
    """

    user_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(
        max_length=50,
    )
    table_name = models.CharField(
        max_length=150,
    )
    record_id = models.UUIDField(null=True, blank=True)
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"sys"."audit_logs"'
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.action)

    def __repr__(self) -> str:
        return f"<AuditLog {self.pk}>"
