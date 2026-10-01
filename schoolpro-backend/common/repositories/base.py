from collections.abc import Sequence

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Model, QuerySet


class BaseRepository[T: Model]:
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
            return self.get_queryset().get(pk=entity_id)
        except (ObjectDoesNotExist, ValueError):
            return None

    def filter(self, **kwargs) -> QuerySet[T]:
        """Filter queryset by criteria."""
        return self.get_queryset().filter(**kwargs)

    def create(self, **kwargs) -> T:
        """Create and save a new entity instance."""
        return self.model_class.objects.create(**kwargs)

    def bulk_create(self, instances: Sequence[T], batch_size: int = 500) -> list[T]:
        """Bulk create entities efficiently."""
        return list(self.model_class.objects.bulk_create(instances, batch_size=batch_size))

    def update(self, instance: T, **fields) -> T:
        """Update specified fields on an existing entity instance."""
        for field, value in fields.items():
            setattr(instance, field, value)
        instance.save(update_fields=list(fields.keys()))
        return instance

    def delete(self, instance: T) -> None:
        """Delete an entity instance (delegates to model delete, supporting soft-delete)."""
        instance.delete()
