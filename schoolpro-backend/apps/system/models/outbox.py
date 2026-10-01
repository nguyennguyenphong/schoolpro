from django.db import models

from common.models.base import UUIDModel


class EventOutbox(UUIDModel):
    """
    EventOutbox Model.

    Database Table: "sys"."event_outbox"
    Description: Reliable outbox queue for event-driven message brokers (Kafka/RabbitMQ) and webhook deliveries
    """

    event_type = models.CharField(
        max_length=100,
    )
    aggregate_type = models.CharField(
        max_length=80,
    )
    aggregate_id = models.UUIDField()
    payload = models.JSONField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )
    retry_count = models.SmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField()
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"sys"."event_outbox"'
        verbose_name = "Event Outbox"
        verbose_name_plural = "Event Outboxes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"EventOutbox ({self.pk})"

    def __repr__(self) -> str:
        return f"<EventOutbox {self.pk}>"
