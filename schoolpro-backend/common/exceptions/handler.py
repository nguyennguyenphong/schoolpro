import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException, ValidationError, AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Enterprise global exception handler for Django REST Framework.
    Formats all errors into the standard JSON response format.
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "Yêu cầu không hợp lệ"
        error_code = "VALIDATION_ERROR"

        if isinstance(exc, ValidationError):
            message = "Dữ liệu gửi lên không đúng định dạng hoặc thiếu trường bắt buộc."
            error_code = "VALIDATION_ERROR"
        elif isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
            error_code = "UNAUTHORIZED"
        elif isinstance(exc, PermissionDenied):
            message = "Bạn không có quyền thực hiện hành động này."
            error_code = "FORBIDDEN"
        elif hasattr(exc, "detail") and isinstance(exc.detail, str):
            message = exc.detail

        response.data = {
            "success": False,
            "code": response.status_code,
            "error_code": error_code,
            "message": message,
            "errors": errors if isinstance(errors, (list, dict)) else [str(errors)],
        }
    else:
        # Unhandled 500 server errors
        logger.exception("Unhandled server exception: %s", exc, exc_info=True)
        response = Response(
            {
                "success": False,
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "Hệ thống gặp sự cố trong quá trình xử lý. Vui lòng thử lại sau.",
                "errors": [str(exc)] if hasattr(exc, "__str__") else [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
