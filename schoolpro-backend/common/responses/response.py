from typing import Any

from rest_framework import status
from rest_framework.response import Response


class APIResponse:
    """
    Standard REST API response wrapper.
    Ensures consistent payload structure across all SchoolPro endpoints.
    """

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Thành công",
        code: int = status.HTTP_200_OK,
        meta: dict | None = None,
        headers: dict | None = None,
    ) -> Response:
        payload = {
            "success": True,
            "code": code,
            "message": message,
            "data": data if data is not None else {},
        }
        if meta:
            payload["meta"] = meta
        return Response(payload, status=code, headers=headers)

    @staticmethod
    def created(
        data: Any = None,
        message: str = "Tạo mới thành công",
        meta: dict | None = None,
        headers: dict | None = None,
    ) -> Response:
        return APIResponse.success(
            data=data,
            message=message,
            code=status.HTTP_201_CREATED,
            meta=meta,
            headers=headers,
        )

    @staticmethod
    def error(
        message: str = "Đã xảy ra lỗi",
        code: int = status.HTTP_400_BAD_REQUEST,
        errors: Any = None,
        error_code: str | None = None,
    ) -> Response:
        payload = {
            "success": False,
            "code": code,
            "message": message,
            "errors": errors if errors is not None else [],
        }
        if error_code:
            payload["error_code"] = error_code
        return Response(payload, status=code)
