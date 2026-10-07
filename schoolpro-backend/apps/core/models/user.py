from typing import Any

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

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

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
    def is_active(self) -> bool:
        """Required by Django auth backend and admin."""
        return bool(self.status_code and self.status_code.upper() == "ACTIVE")

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
    def last_login(self) -> Any:
        return self.last_login_at

    @last_login.setter
    def last_login(self, value: Any) -> None:
        self.last_login_at = value

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Remap update_fields from last_login to last_login_at if needed."""
        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            new_fields = set(update_fields)
            if "last_login" in new_fields:
                new_fields.remove("last_login")
                new_fields.add("last_login_at")
            kwargs["update_fields"] = list(new_fields)
        super().save(*args, **kwargs)

    @property
    def is_staff(self) -> bool:
        """Check if user has staff/admin privileges."""
        active_role_code = getattr(self, "active_role_code", "") or ""
        if "ADMIN" in str(active_role_code).upper() or "PRINCIPAL" in str(active_role_code).upper():
            return True
        # Check database UserRole if not cached in active_role_code
        try:
            return self.user_roles.filter(
                role__code__icontains="ADMIN",
                status="ACTIVE",
            ).exists()
        except Exception:
            return False

    @property
    def is_superuser(self) -> bool:
        """Superuser access for system administrators."""
        return self.is_staff

    def get_username(self) -> str:
        return str(self.username)

    def check_password(self, raw_password: str) -> bool:
        """Verify candidate raw password against stored password_hash."""
        if not self.password_hash or not raw_password:
            return False

        # 1. Try standard Django hashers (PBKDF2, Argon2, Django-bcrypt)
        from django.contrib.auth.hashers import check_password

        try:
            if check_password(raw_password, self.password_hash):
                return True
        except Exception:
            pass

        # 2. Try raw bcrypt / modular crypt hashes (e.g. PostgreSQL pgcrypto $2a$, $2b$, $2y$)
        if self.password_hash.startswith(("$2a$", "$2b$", "$2y$", "$2x$")):
            try:
                import bcrypt

                if bcrypt.checkpw(raw_password.encode("utf-8"), self.password_hash.encode("utf-8")):
                    return True
            except Exception:
                pass

        return False

    def set_password(self, raw_password: str) -> None:
        """Hash and update password."""
        from django.contrib.auth.hashers import make_password

        self.password_hash = make_password(raw_password)

    def get_session_auth_hash(self) -> str:
        """Return HMAC hash of the password field for Django session management."""
        from django.utils.crypto import salted_hmac

        key_salt = "apps.core.models.user.User.get_session_auth_hash"
        return salted_hmac(
            key_salt,
            self.password_hash or "",
            algorithm="sha256",
        ).hexdigest()

    def has_perm(self, perm: str, obj: Any = None) -> bool:
        """Permission check for Django Admin site."""
        return self.is_staff

    def has_perms(self, perm_list: Any, obj: Any = None) -> bool:
        """Multiple permission check for Django Admin site."""
        return self.is_staff

    def has_module_perms(self, app_label: str) -> bool:
        """Module permission check for Django Admin site."""
        return self.is_staff

    def __str__(self) -> str:
        return f"{self.full_name} ({self.username})"

    def __repr__(self) -> str:
        return f"<User {self.pk}: {self.username}>"
