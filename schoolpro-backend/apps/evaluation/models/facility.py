from django.db import models

from common.models.base import UUIDModel


class Facility(UUIDModel):
    """
    Facility Model.

    Database Table: "evaluation"."facilities"
    Description: Tracked campus assets, classroom projectors, fans, and laboratory kits
    """

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
        verbose_name_plural = "Campus Facilities"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Facility {self.pk}>"


class FacilityIncidentReport(UUIDModel):
    """
    FacilityIncidentReport Model.

    Database Table: "evaluation"."facility_incident_reports"
    Description: Maintenance trouble tickets for repairing lighting, desks, or electronics
    """

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
        ordering = ["-reported_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<FacilityIncidentReport {self.pk}>"
