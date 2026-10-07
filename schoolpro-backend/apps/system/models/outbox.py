from django.db import models

from common.models.base import UUIDModel


class EventOutbox(UUIDModel):
    """
    EventOutbox Model.

    Database Table: "sys"."event_outbox"
    Description: Reliable outbox queue for event-driven message brokers (Kafka/RabbitMQ) and webhook deliveries
    """

    event_type = models.CharField(max_length=100)
    aggregate_type = models.CharField(max_length=80)
    aggregate_id = models.UUIDField()
    topic = models.CharField(max_length=100, null=True, blank=True)
    correlation_id = models.CharField(max_length=64, null=True, blank=True)
    headers = models.JSONField(default=dict, blank=True)
    payload = models.JSONField()
    status = models.CharField(max_length=20, default="PENDING")
    retry_count = models.SmallIntegerField(default=0)
    max_retries = models.SmallIntegerField(default=5)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"sys"."event_outbox"'
        verbose_name = "Event Outbox"
        verbose_name_plural = "Event Outboxes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"EventOutbox ({self.pk}: {self.event_type})"

    def __repr__(self) -> str:
        return f"<EventOutbox {self.pk}: {self.event_type}>"
