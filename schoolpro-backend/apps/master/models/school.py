from django.db import models

from common.models.base import UUIDModel


class School(UUIDModel):
    """
    School Model.

    Database Table: "core"."schools"
    Description: Master high school campus profile, administrative metadata, and contacts
    """

    code = models.CharField(max_length=60, unique=True, blank=True)
    name = models.CharField(max_length=255)
    moet_code = models.CharField(max_length=60, null=True, blank=True)
    educational_stage = models.CharField(max_length=30, default="HIGH_SCHOOL")
    school_type = models.CharField(max_length=30, default="PUBLIC")
    established_year = models.SmallIntegerField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    province_code = models.CharField(max_length=60, null=True, blank=True)
    district_code = models.CharField(max_length=60, null=True, blank=True)
    ward_code = models.CharField(max_length=60, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    fax = models.CharField(max_length=30, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    tax_id = models.CharField(max_length=30, null=True, blank=True)
    bank_name = models.CharField(max_length=150, null=True, blank=True)
    bank_account_number = models.CharField(max_length=50, null=True, blank=True)
    bank_account_holder = models.CharField(max_length=150, null=True, blank=True)
    logo_url = models.TextField(null=True, blank=True)
    banner_url = models.TextField(null=True, blank=True)
    stamp_image_url = models.TextField(null=True, blank=True)
    slogan = models.CharField(max_length=255, null=True, blank=True)
    principal_name = models.CharField(max_length=255, null=True, blank=True)
    digital_certificate_info = models.JSONField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."schools"'
        verbose_name = "School"
        verbose_name_plural = "Schools"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<School {self.code}: {self.name}>"
