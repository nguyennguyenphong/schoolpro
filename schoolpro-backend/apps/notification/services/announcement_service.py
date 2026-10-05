"""
Announcement Service.
Business logic layer managing notification workflows, delivery rules, and read confirmations.
"""

from typing import Any
from uuid import UUID

from django.core.exceptions import ValidationError
from django.db.models import QuerySet

from apps.core.models.user import User
from apps.notification.models.announcement import Announcement
from apps.notification.repositories.announcement_repository import AnnouncementRepository
from common.services.base import BaseService


class AnnouncementService(BaseService):
    """
    Domain service for Announcement management and notification receipts.
    """

    def __init__(self, repository: AnnouncementRepository | None = None):
        super().__init__()
        self.repository = repository or AnnouncementRepository()

    def list_announcements(
        self,
        user: User,
        search_query: str | None = None,
        category: str | None = None,
        department: str | None = None,
        priority: str | None = None,
        read_status: str | None = None,
        sort_by: str | None = None,
    ) -> QuerySet[Announcement]:
        """
        Retrieve filtered and sorted announcements for the authenticated user.
        """
        return self.repository.get_announcements_for_user(
            user=user,
            search_query=search_query,
            category=category,
            department=department,
            priority=priority,
            read_status=read_status,
            sort_by=sort_by,
        )

    def get_announcement_detail(
        self,
        user: User,
        announcement_id: UUID | str,
        auto_mark_read: bool = True,
    ) -> Announcement:
        """
        Retrieve detail of a specific announcement, increment view count, and optionally mark read.
        """
        announcement = self.repository.get_announcement_with_read(
            announcement_id=announcement_id,
            user_id=user.id,
        )
        if not announcement:
            raise ValidationError("Thông báo không tồn tại hoặc bạn không có quyền xem.")

        # Increment view count
        self.repository.increment_views(announcement_id)

        # Mark read receipt
        if auto_mark_read and not getattr(announcement, "is_read", False):
            self.repository.mark_as_read(announcement_id=announcement_id, user_id=user.id)
            announcement.is_read = True

        return announcement

    def mark_as_read(self, user: User, announcement_id: UUID | str) -> bool:
        """
        Explicitly acknowledge and mark an announcement as read.
        """
        return self.repository.mark_as_read(
            announcement_id=announcement_id,
            user_id=user.id,
        )

    def mark_all_as_read(self, user: User) -> int:
        """
        Acknowledge all unread eligible announcements for the user.
        """
        return self.repository.mark_all_as_read(user=user)

    def get_summary(self, user: User) -> dict[str, Any]:
        """
        Get counts and category breakdown for user announcements.
        """
        return self.repository.get_user_announcement_summary(user=user)

    def get_unread_count(self, user: User) -> int:
        """
        Get quick unread announcement count for header badge.
        """
        summary = self.repository.get_user_announcement_summary(user=user)
        return summary.get("unread_count", 0)

    def get_categories(self, user: User) -> list[dict[str, Any]]:
        """
        Get dynamic categories available for user/school.
        """
        return self.repository.get_categories_for_user(user=user)

    def get_departments(self, user: User) -> list[str]:
        """
        Get distinct departments issuing announcements for user/school.
        """
        return self.repository.get_departments_for_user(user=user)

