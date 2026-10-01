from collections.abc import Sequence
from typing import Generic, TypeVar

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Model, QuerySet

T = TypeVar("T", bound=Model)


class BaseRepository(Generic[T]):
    """
    Generic Data Access Layer (Repository Pattern) for Django ORM entities.
    Centralizes query optimizations, filters, and standard CRUD operations.
    """

    def __init__(self, model_class: type[T]):
        self.model_class = model_class

    def get_queryset(self) -> QuerySet[T]:
        """Return base queryset for the entity."""
        return self.model_class.objects.all()

    def get_by_id(self, entity_id: str) -> T | None:
        """Fetch entity by primary key or return None."""
        try:
            return self.get_queryset().get(id=entity_id)
        except ObjectDoesNotExist:
            return None

    def exists(self, **kwargs) -> bool:
        """Check whether any entity matches the criteria."""
        return self.get_queryset().filter(**kwargs).exists()

    def create(self, **kwargs) -> T:
        """Create and persist a new model instance."""
        return self.model_class.objects.create(**kwargs)

    def bulk_create(self, instances: Sequence[T], batch_size: int = 500) -> Sequence[T]:
        """Perform optimized bulk insertion."""
        return self.model_class.objects.bulk_create(instances, batch_size=batch_size)

    def update(self, instance: T, **kwargs) -> T:
        """Update fields of an existing model instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save(update_fields=list(kwargs.keys()))
        return instance

    def delete(self, instance: T) -> None:
        """Trigger soft-delete or hard-delete based on model implementation."""
        instance.delete()
