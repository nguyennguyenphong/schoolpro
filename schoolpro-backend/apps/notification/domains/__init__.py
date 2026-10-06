"""
Notification Domain package.
"""

from apps.notification.domains.entities import (
    AnnouncementEntity,
    AnnouncementReadEntity,
    ContactBookNoteEntity,
    ParentTeacherMessageEntity,
    PushTokenEntity,
    ReminderEntity,
)

__all__ = [
    "AnnouncementEntity",
    "AnnouncementReadEntity",
    "ReminderEntity",
    "PushTokenEntity",
    "ContactBookNoteEntity",
    "ParentTeacherMessageEntity",
]
