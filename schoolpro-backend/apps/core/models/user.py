import uuid

from django.db import models


class User(models.Model):
    """
    User Model.

    Database Table: "core"."users"
    Description: Unified identity authentication and personal profile table
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(
        "master.School",
        on_delete=models.SET_NULL,
        db_column="school_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="school_id foreign key",
    )
    username = models.CharField(
        max_length=100,
    )
    email = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    password_hash = models.TextField()
    full_name = models.CharField(
        max_length=255,
    )
    date_of_birth = models.DateField(null=True, blank=True)
    gender_code = models.CharField(max_length=20, null=True, blank=True)
    national_id = models.CharField(max_length=30, null=True, blank=True)
    avatar_url = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    status_code = models.CharField(max_length=20, null=True, blank=True)
    must_change_password = models.BooleanField(default=False)
    last_login_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."users"'
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return str(self.full_name)
