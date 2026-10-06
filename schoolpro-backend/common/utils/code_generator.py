"""
Utility functions for generating enterprise codes, random digits, and identifiers.
"""

import secrets
import string


def generate_random_digits(length: int = 12) -> str:
    """
    Generate a cryptographically secure string of random decimal digits.
    Default length is 12 digits (e.g. '839201948273').
    First digit is non-zero to guarantee numeric representation preservation.
    """
    first_digit = secrets.choice("123456789")
    remaining_digits = "".join(secrets.choice(string.digits) for _ in range(length - 1))
    return f"{first_digit}{remaining_digits}"


def generate_entity_code(prefix: str = "", length: int = 12) -> str:
    """
    Generate a 12-digit random code, optionally with a standard business prefix.
    Example:
        generate_entity_code() -> '482910482910'
        generate_entity_code("SCH") -> 'SCH48291048291'
    """
    digits = generate_random_digits(length)
    if prefix:
        clean_prefix = prefix.strip().upper()
        # If prefix provided, ensure total length or prefix + 12 digits per project requirements
        return f"{clean_prefix}_{digits}"
    return digits
