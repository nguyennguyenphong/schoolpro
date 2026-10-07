from django.db import models

from common.models.base import UUIDModel


class Facility(UUIDModel):
    """
    Facility Model.

    Database Table: "evaluation"."facilities"
    Description: School physical equipment, lab apparatus, projectors, and air conditioning
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="facilities",
        db_comment="school_id foreign key",
    )
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        related_name="facilities",
        null=True,
        blank=True,
        db_comment="room_id foreign key",
    )
    code = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    brand_model = models.CharField(max_length=150, null=True, blank=True)
    serial_number = models.CharField(max_length=100, null=True, blank=True)
    qr_code_tag = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, default="GOOD")
    location = models.CharField(max_length=150, null=True, blank=True)
    responsible_user = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="responsible_user_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="responsible_user_id foreign key",
    )
    purchase_date = models.DateField(null=True, blank=True)
    original_price = models.DecimalField(
        max_digits=14, decimal_places=2, default=0.00, null=True, blank=True
    )
    warranty_expiry_date = models.DateField(null=True, blank=True)
    supplier_name = models.CharField(max_length=255, null=True, blank=True)
    supplier_phone = models.CharField(max_length=50, null=True, blank=True)
    maintenance_interval_days = models.SmallIntegerField(default=90, null=True, blank=True)
    installed_date = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."facilities"'
        verbose_name = "Campus Facility"
        verbose_name_plural = "Campus Facilities"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Facility {self.code}: {self.name}>"


class FacilityIncidentReport(UUIDModel):
    """
    FacilityIncidentReport Model.

    Database Table: "evaluation"."facility_incident_reports"
    Description: Broken equipment and facility repair tickets submitted by students/teachers
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="facility_incidents",
        db_comment="school_id foreign key",
    )
    ticket_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    facility = models.ForeignKey(
        "evaluation.Facility",
        on_delete=models.SET_NULL,
        db_column="facility_id",
        related_name="incident_reports",
        null=True,
        blank=True,
        db_comment="facility_id foreign key",
    )
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="room_id foreign key",
    )
    title = models.CharField(max_length=255)
    incident_category = models.CharField(max_length=50, default="ELECTRICAL")
    description = models.TextField(null=True, blank=True)
    image_urls = models.JSONField(null=True, blank=True)
    priority = models.CharField(max_length=10, default="NORMAL")
    status = models.CharField(max_length=20, default="REPORTED")
    reported_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="reported_by",
        related_name="facility_reports_filed",
        db_comment="reported_by foreign key",
    )
    handled_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="handled_by",
        null=True,
        blank=True,
        related_name="facility_reports_handled",
        db_comment="handled_by foreign key",
    )
    contractor_name = models.CharField(max_length=150, null=True, blank=True)
    estimated_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.00, null=True, blank=True
    )
    actual_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.00, null=True, blank=True
    )
    repair_deadline = models.DateTimeField(null=True, blank=True)
    resolution_note = models.TextField(null=True, blank=True)
    repaired_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="verified_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="verified_by foreign key",
    )
    rating_satisfaction = models.SmallIntegerField(null=True, blank=True)
    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"evaluation"."facility_incident_reports"'
        verbose_name = "Facility Incident Report"
        verbose_name_plural = "Facility Incident Reports"
        ordering = ["-reported_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<FacilityIncidentReport {self.pk}: {self.title}>"
