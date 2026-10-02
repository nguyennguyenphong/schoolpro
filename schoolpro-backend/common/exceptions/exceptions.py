"""
Custom Application Exceptions for SchoolPro Enterprise.
Follows DRF APIException specification defined in AGENT.md.
"""

from typing import Any

from rest_framework import status
from rest_framework.exceptions import APIException


class BaseApplicationException(APIException):
    """Base exception class for all domain application errors."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An application error occurred."
    default_code = "APPLICATION_ERROR"

    def __init__(self, detail: Any = None, code: str | None = None):
        if detail is not None:
            self.detail = detail
        else:
            self.detail = self.default_detail

        if code is not None:
            self.default_code = code


class ResourceNotFoundError(BaseApplicationException):
    """Raised when a requested resource does not exist."""

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Requested resource not found."
    default_code = "RESOURCE_NOT_FOUND"


class BusinessLogicError(BaseApplicationException):
    """Raised when a business rule or invariant is violated."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Business logic validation failed."
    default_code = "BUSINESS_LOGIC_ERROR"


class ConflictError(BaseApplicationException):
    """Raised when an operation conflicts with existing state (e.g. unique constraint)."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = "Resource conflict occurred."
    default_code = "RESOURCE_CONFLICT"


class UnauthorizedAccessError(BaseApplicationException):
    """Raised when user lacks permission to access a resource."""

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action."
    default_code = "FORBIDDEN"
