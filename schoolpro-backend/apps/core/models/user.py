from django.db import models

from common.models.base import UUIDModel


class User(UUIDModel):
    """
    User Model.

    Database Table: "core"."users"
    Description: Unified identity authentication and personal profile table
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.SET_NULL,
        db_column="school_id",
        related_name="users",
        null=True,
        blank=True,
        db_comment="school_id foreign key",
    )
    username = models.CharField(max_length=100, unique=True)
    email = models.CharField(max_length=255, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    password_hash = models.TextField()
    full_name = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    preferred_name = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender_code = models.CharField(max_length=60, default="MALE", null=True, blank=True)
    national_id = models.CharField(max_length=30, null=True, blank=True)
    avatar_url = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    locale = models.CharField(max_length=10, default="vi-VN")
    timezone = models.CharField(max_length=50, default="Asia/Ho_Chi_Minh")
    status_code = models.CharField(max_length=60, default="ACTIVE", null=True, blank=True)
    must_change_password = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_until = models.DateTimeField(null=True, blank=True)
    lock_reason = models.CharField(max_length=255, null=True, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_2fa_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=255, null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.CharField(max_length=45, null=True, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)
    bio = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."users"'
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    @property
    def is_locked(self) -> bool:
        """Determines whether the account is currently locked out."""
        from django.utils import timezone

        if self.status_code and self.status_code.upper() in ["LOCKED", "SUSPENDED"]:
            return True
        if self.locked_until and self.locked_until > timezone.now():
            return True
        if self.locked_at and not self.locked_until:
            return True
        return False

    @property
    def is_authenticated(self) -> bool:
        """Always return True for loaded database User entity instances."""
        return getattr(self, "_is_authenticated", True)

    @is_authenticated.setter
    def is_authenticated(self, value: bool) -> None:
        self._is_authenticated = bool(value)

    @property
    def is_anonymous(self) -> bool:
        """Always return False for database User entity instances."""
        return False

    @property
    def is_staff(self) -> bool:
        """Check if user has staff/admin privileges."""
        active_role_code = getattr(self, "active_role_code", "") or ""
        return (
            "ADMIN" in str(active_role_code).upper() or "PRINCIPAL" in str(active_role_code).upper()
        )

    def __str__(self) -> str:
        return str(self.full_name)

    def __repr__(self) -> str:
        return f"<User {self.pk}: {self.username}>"
