import uuid

from django.db import models


class AuditLog(models.Model):
    """
    AuditLog Model.

    Database Table: "sys"."audit_logs"
    Description: System audit trail tracking transactional changes for security compliance and governance
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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

    def __str__(self) -> str:
        return str(self.action)
