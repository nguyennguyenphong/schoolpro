import uuid

from django.db import models


class Facility(models.Model):
    """
    Facility Model.

    Database Table: "evaluation"."facilities"
    Description: Tracked campus assets, classroom projectors, fans, and laboratory kits
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_id = models.UUIDField()
    room_id = models.UUIDField(null=True, blank=True)
    code = models.CharField(
        max_length=40,
    )
    name = models.CharField(
        max_length=255,
    )
    category = models.CharField(
        max_length=100,
    )
    status = models.CharField(
        max_length=20,
    )
    location = models.CharField(max_length=150, null=True, blank=True)
    installed_date = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."facilities"'
        verbose_name = "Campus Facility"
        verbose_name_plural = "Campus Facilitys"

    def __str__(self) -> str:
        return str(self.name)


class FacilityIncidentReport(models.Model):
    """
    FacilityIncidentReport Model.

    Database Table: "evaluation"."facility_incident_reports"
    Description: Maintenance trouble tickets for repairing lighting, desks, or electronics
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    facility = models.ForeignKey(
        "evaluation.Facility",
        on_delete=models.SET_NULL,
        db_column="facility_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="facility_id foreign key",
    )
    room_id = models.UUIDField(null=True, blank=True)
    title = models.CharField(
        max_length=255,
    )
    description = models.TextField(null=True, blank=True)
    image_urls = models.JSONField(null=True, blank=True)
    priority = models.CharField(
        max_length=10,
    )
    status = models.CharField(
        max_length=20,
    )
    reported_by = models.UUIDField()
    handled_by = models.UUIDField(null=True, blank=True)
    resolution_note = models.TextField(null=True, blank=True)
    reported_at = models.DateTimeField()
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."facility_incident_reports"'
        verbose_name = "Facility Incident Report"
        verbose_name_plural = "Facility Incident Reports"

    def __str__(self) -> str:
        return str(self.title)
