"""
Authentication Classes for SchoolPro REST API.
Overrides SimpleJWT authentication to resolve against SchoolPro's core.User domain model.
"""

from typing import Any
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

from apps.core.models.user import User


class SchoolProJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication backend for SchoolPro.
    Validates SimpleJWT tokens and resolves against core.User instead of django.contrib.auth.User.
    """

    def get_user(self, validated_token: Any) -> User:
        """
        Attempts to find and return a user using the given validated token.
        """
        user_id = validated_token.get("user_id")
        if not user_id:
            raise InvalidToken("Token contained no recognizable user identification")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found", code="user_not_found")

        # Check account activity
        if user.status_code and user.status_code.upper() in ["INACTIVE", "LOCKED", "SUSPENDED"]:
            raise AuthenticationFailed("User account is inactive or suspended", code="user_inactive")

        # Injected session metadata
        user.is_authenticated = True
        user.active_role_code = validated_token.get("role_code")
        user.active_role_id = validated_token.get("role_id")

        return user
