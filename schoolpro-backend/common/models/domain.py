"""
Base Domain Entity and Domain Event abstractions for Domain-Driven Design (DDD).
Each database table corresponds to a rich Domain Entity encapsulating domain invariants,
business rules, and entity-specific behavior.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import uuid6


@dataclass
class DomainEvent:
    """Base Domain Event dispatched when domain state changes occur."""

    occurred_at: datetime = field(default_factory=datetime.now)
    event_id: str = field(default_factory=lambda: str(uuid6.uuid7()))


@dataclass
class BaseDomainEntity:
    """
    Base Domain Entity encapsulating identity, invariants, and domain logic.
    Defaults to sequential time-ordered UUIDv7 for high-performance database indexing.
    """

    id: uuid.UUID = field(default_factory=uuid6.uuid7)

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, BaseDomainEntity):
            return False
        return self.id == other.id

    def __hash__(self) -> int:
        return hash(self.id)
