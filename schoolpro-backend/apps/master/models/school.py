from django.db import models

from common.models.base import UUIDModel


class School(UUIDModel):
    """
    School Model.

    Database Table: "core"."schools"
    Description: Master high school campus profile, administrative metadata, and contacts
    """

    code = models.CharField(
        max_length=30,
    )
    name = models.CharField(
        max_length=255,
    )
    educational_stage = models.CharField(
        max_length=30,
    )
    established_year = models.SmallIntegerField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    province_code = models.CharField(max_length=20, null=True, blank=True)
    district_code = models.CharField(max_length=20, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    logo_url = models.TextField(null=True, blank=True)
    principal_name = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."schools"'
        verbose_name = "School"
        verbose_name_plural = "Schools"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<School {self.pk}>"
