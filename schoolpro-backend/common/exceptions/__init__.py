"""
Common exceptions module exporting domain errors and exception handler.
"""

from .exceptions import (
    BaseApplicationException,
    BusinessLogicError,
    ConflictError,
    ResourceNotFoundError,
    UnauthorizedAccessError,
)
from .handler import custom_exception_handler

__all__ = [
    "BaseApplicationException",
    "ResourceNotFoundError",
    "BusinessLogicError",
    "ConflictError",
    "UnauthorizedAccessError",
    "custom_exception_handler",
]
