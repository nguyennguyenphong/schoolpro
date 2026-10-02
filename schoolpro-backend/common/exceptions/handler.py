import logging

from rest_framework import status
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Global exception handler for Django REST Framework.
    Formats all errors into the standard JSON response format.
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "Invalid request"
        error_code = "VALIDATION_ERROR"

        if isinstance(exc, ValidationError):
            message = "Validation error: payload contains invalid or missing required fields."
            error_code = "VALIDATION_ERROR"
        elif isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            message = (
                str(exc.detail)
                if hasattr(exc, "detail") and exc.detail
                else "Authentication credentials were not provided or have expired."
            )
            error_code = "UNAUTHORIZED"
        elif isinstance(exc, PermissionDenied):
            message = (
                str(exc.detail)
                if hasattr(exc, "detail") and exc.detail
                else "You do not have permission to perform this action."
            )
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
        logger.exception("Unhandled server exception: %s", exc)
        response = Response(
            {
                "success": False,
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred. Please try again later.",
                "errors": [str(exc)] if hasattr(exc, "__str__") else [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
