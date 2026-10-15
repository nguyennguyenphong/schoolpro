"""
Authentication Serializers for SchoolPro Core Identity.
"""

from rest_framework import serializers

from apps.core.models.role import Role
from apps.core.models.user import User


class LoginRequestSerializer(serializers.Serializer):
    """
    Credentials payload for user authentication.
    Supports login via username, student/teacher code, email, or phone.
    """

    code = serializers.CharField(
        required=True,
        min_length=1,
        max_length=255,
        help_text="Username, code, email, or phone number",
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
        help_text="User secret password",
    )
    role = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        default=None,
        help_text="Role UUID, code (e.g. R_STU_568294), or role slug (e.g. student)",
    )
    remember = serializers.BooleanField(
        required=False,
        default=True,
        help_text="Whether to persist long-lived session",
    )


class AuthUserResponseSerializer(serializers.ModelSerializer):
    """
    Public profile of an authenticated user.
    """

    is_locked = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "phone",
            "avatar_url",
            "status_code",
            "must_change_password",
            "is_locked",
            "locked_until",
            "is_2fa_enabled",
            "email_verified_at",
            "phone_verified_at",
        ]


class RoleSimpleSerializer(serializers.ModelSerializer):
    """
    Simplified role representation for token and user responses.
    """

    role_type = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            "id",
            "code",
            "name",
            "badge_color",
            "icon",
            "is_system",
            "role_type",
        ]

    def get_role_type(self, obj: Role) -> str:
        """Derive standard role type slug from role code."""
        code = (obj.code or "").upper()
        if "STU" in code:
            return "student"
        if "TCH" in code:
            return "teacher"
        if "STF" in code:
            return "staff"
        if "ADMIN" in code:
            return "admin"
        if "PRIN" in code:
            return "principal"
        if "PAR" in code:
            return "parent"
        if "SUP" in code:
            return "supervisor"
        return "student"


class AcademicContextSerializer(serializers.Serializer):
    """
    Current academic term and calendar week context.
    """

    academic_year_id = serializers.CharField(allow_null=True, required=False)
    academic_year = serializers.CharField()
    academic_year_code = serializers.CharField(required=False)
    semester_id = serializers.CharField(allow_null=True, required=False)
    semester = serializers.CharField()
    semester_code = serializers.CharField(required=False)
    current_week = serializers.IntegerField(default=1)


class UserProfileContextSerializer(serializers.Serializer):
    """
    Role-specific domain profile context (Student, Teacher, Staff).
    """

    type = serializers.CharField()
    student_id = serializers.CharField(required=False, allow_null=True)
    student_code = serializers.CharField(required=False, allow_null=True)
    class_id = serializers.CharField(required=False, allow_null=True)
    class_name = serializers.CharField(required=False, allow_null=True)
    class_code = serializers.CharField(required=False, allow_null=True)
    homeroom_teacher_name = serializers.CharField(required=False, allow_null=True)
    teacher_id = serializers.CharField(required=False, allow_null=True)
    teacher_code = serializers.CharField(required=False, allow_null=True)
    department_name = serializers.CharField(required=False, allow_null=True)
    subject_major = serializers.CharField(required=False, allow_null=True)
    is_homeroom = serializers.BooleanField(required=False, default=False)
    birth_place = serializers.CharField(required=False, allow_null=True)
    status = serializers.CharField(required=False, allow_null=True)


class LoginResponseDataSerializer(serializers.Serializer):
    """
    Payload returned upon successful authentication.
    """

    access = serializers.CharField(help_text="JWT Access Token")
    refresh = serializers.CharField(help_text="JWT Refresh Token")
    token_type = serializers.CharField(default="Bearer")
    expires_in = serializers.IntegerField(default=7200, help_text="Access token TTL in seconds")
    user = AuthUserResponseSerializer()
    role = RoleSimpleSerializer()
    assigned_roles = RoleSimpleSerializer(many=True)
    academic_context = AcademicContextSerializer(required=False, allow_null=True)
    profile = UserProfileContextSerializer(required=False, allow_null=True)


class TokenRefreshRequestSerializer(serializers.Serializer):
    """
    Payload for renewing expired access token.
    """

    refresh = serializers.CharField(required=True, help_text="Valid JWT refresh token")
