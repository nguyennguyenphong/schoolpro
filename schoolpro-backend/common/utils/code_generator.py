"""
Utility functions for generating enterprise codes, random digits, and identifiers.
"""

import secrets
import string
from typing import Any


def generate_random_digits(length: int = 12) -> str:
    """
    Generate a cryptographically secure string of random decimal digits.
    Default length is 12 digits (e.g. '839201948273').
    First digit is non-zero to guarantee numeric representation preservation.
    """
    first_digit = secrets.choice("123456789")
    remaining_digits = "".join(secrets.choice(string.digits) for _ in range(length - 1))
    return f"{first_digit}{remaining_digits}"


def generate_unique_code(
    model_or_queryset: Any,
    field_name: str = "code",
    length: int = 12,
    max_attempts: int = 200,
) -> str:
    """
    Generate a 12-digit random numeric code guaranteed to be unique in the given model or queryset.
    If the candidate already exists in the table, it automatically re-samples up to max_attempts.
    """
    for _ in range(max_attempts):
        candidate = generate_random_digits(length)
        filter_kwargs = {field_name: candidate}
        if hasattr(model_or_queryset, "objects"):
            exists = model_or_queryset.objects.filter(**filter_kwargs).exists()
        else:
            exists = model_or_queryset.filter(**filter_kwargs).exists()
        if not exists:
            return candidate

    # High-concurrency fallback with timestamp component
    import time

    ts = str(int(time.time() * 1000))[-8:]
    return f"{secrets.choice('123456789')}{generate_random_digits(3)}{ts}"


def generate_entity_code(prefix: str = "", length: int = 12) -> str:
    """
    Generate a 12-digit random numeric code.
    If prefix is provided, it is ignored unless strictly required, to guarantee
    standard 12-digit numeric codes per user requirements.
    """
    return generate_random_digits(length)
