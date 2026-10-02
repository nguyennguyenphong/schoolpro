"""
Authentication Views for SchoolPro Core Identity.
Provides enterprise endpoints for user login, session inspection, token refresh, and logout.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.authentication import SchoolProJWTAuthentication
from apps.core.serializers.auth_serializers import (
    AuthUserResponseSerializer,
    LoginRequestSerializer,
    LoginResponseDataSerializer,
    RoleSimpleSerializer,
    TokenRefreshRequestSerializer,
)
from apps.core.services.auth_service import AuthService
from common.responses.response import APIResponse


class AuthLoginView(APIView):
    """
    User login endpoint issuing JWT tokens and user context.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="User Authentication & Login",
        description="Authenticate user with identifier (username, student/teacher code, email, phone) and password.",
        request=LoginRequestSerializer,
        responses={200: LoginResponseDataSerializer},
    )
    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        auth_service = AuthService()
        result = auth_service.authenticate(
            code=data["code"],
            password=data["password"],
            role_identifier=data.get("role"),
            remember=data.get("remember", True),
        )

        response_data = {
            "access": result["access"],
            "refresh": result["refresh"],
            "token_type": result["token_type"],
            "expires_in": result["expires_in"],
            "user": AuthUserResponseSerializer(result["user"]).data,
            "role": RoleSimpleSerializer(result["role"]).data if result["role"] else None,
            "assigned_roles": RoleSimpleSerializer(result["assigned_roles"], many=True).data,
        }

        return APIResponse.success(
            data=response_data,
            message="Đăng nhập thành công",
            code=status.HTTP_200_OK,
        )


class AuthMeView(APIView):
    """
    Endpoint to retrieve the currently authenticated user's profile and active role.
    """

    authentication_classes = [SchoolProJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Current User Profile",
        description="Returns profile and active role of the currently authenticated session.",
        responses={200: AuthUserResponseSerializer},
    )
    def get(self, request):
        user = request.user
        role_code = getattr(user, "active_role_code", None)

        from apps.core.models.role import Role

        active_role = Role.objects.filter(code=role_code).first() if role_code else None

        data = {
            "user": AuthUserResponseSerializer(user).data,
            "active_role": RoleSimpleSerializer(active_role).data if active_role else None,
        }

        return APIResponse.success(
            data=data,
            message="Thông tin người dùng hợp lệ",
        )


class AuthLogoutView(APIView):
    """
    Invalidates session and blacklists refresh token.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="User Logout",
        description="Terminates active session and blacklists the refresh token.",
        request=TokenRefreshRequestSerializer,
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        return APIResponse.success(
            message="Đăng xuất thành công",
        )


class AuthTokenRefreshView(APIView):
    """
    Issues a new access token given a valid refresh token.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Refresh Access Token",
        description="Renew access token using an active refresh token.",
        request=TokenRefreshRequestSerializer,
    )
    def post(self, request):
        serializer = TokenRefreshRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data["refresh"]

        try:
            token = RefreshToken(refresh_token)
            new_access = str(token.access_token)
            return APIResponse.success(
                data={
                    "access": new_access,
                    "token_type": "Bearer",
                    "expires_in": 7200,
                },
                message="Làm mới token thành công",
            )
        except Exception as e:
            return APIResponse.error(
                message="Token làm mới không hợp lệ hoặc đã hết hạn",
                code=status.HTTP_401_UNAUTHORIZED,
                errors=[str(e)],
            )
