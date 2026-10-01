# Export domain models for Django ORM discovery

from .announcement import Announcement, AnnouncementRead
from .contact_book import ContactBookNote
from .message import ParentTeacherMessage
from .push_token import PushToken
from .reminder import Reminder

__all__ = [
    "Announcement",
    "AnnouncementRead",
    "ContactBookNote",
    "ParentTeacherMessage",
    "PushToken",
    "Reminder",
]
