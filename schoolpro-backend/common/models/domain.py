"""
Base Domain Entity and Domain Event abstractions for Domain-Driven Design (DDD).
Each database table corresponds to a rich Domain Entity encapsulating domain invariants,
business rules, and entity-specific behavior.
"""

import uuid
from abc import ABC
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class DomainEvent:
    """Base Domain Event dispatched when domain state changes occur."""

    occurred_at: datetime = field(default_factory=datetime.now)
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))


@dataclass
class BaseDomainEntity(ABC):
    """
    Base Domain Entity encapsulating identity, invariants, and domain logic.
    """

    id: uuid.UUID

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, BaseDomainEntity):
            return False
        return self.id == other.id

    def __hash__(self) -> int:
        return hash(self.id)
