import logging
from collections.abc import Callable
from typing import Any, TypeVar

from django.db import transaction

T = TypeVar("T")


class BaseService:
    """
    Base Business Logic Layer service class.
    Provides standard logging and transaction wrappers.
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__module__)

    @staticmethod
    def atomic(func: Callable[..., T]) -> Callable[..., T]:
        """Decorator to wrap service execution in an atomic database transaction."""

        def wrapper(*args: Any, **kwargs: Any) -> T:
            with transaction.atomic():
                return func(*args, **kwargs)

        return wrapper
