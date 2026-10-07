"""
Notification Domain Entities encapsulating Announcements, Reminders, Push Tokens, Messages, Contact Book Notes.
Covers 6 tables:
  - AnnouncementEntity ("notification"."announcements")
  - AnnouncementReadEntity ("notification"."announcement_reads")
  - ReminderEntity ("notification"."reminders")
  - PushTokenEntity ("notification"."push_tokens")
  - ContactBookNoteEntity ("notification"."contact_book_notes")
  - ParentTeacherMessageEntity ("notification"."parent_teacher_messages")
"""

import uuid
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any

from common.models.domain import BaseDomainEntity


@dataclass
class AnnouncementEntity(BaseDomainEntity):
    school_id: uuid.UUID
    title: str
    content: str
    sender_id: uuid.UUID
    target_type: str = "ALL"
    target_role_id: uuid.UUID | None = None
    target_class_id: uuid.UUID | None = None
    is_published: bool = True
    published_at: datetime = field(default_factory=datetime.now)
    attachments: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class AnnouncementReadEntity(BaseDomainEntity):
    announcement_id: uuid.UUID
    user_id: uuid.UUID
    read_at: datetime = field(default_factory=datetime.now)


@dataclass
class ReminderEntity(BaseDomainEntity):
    user_id: uuid.UUID
    title: str
    remind_at: datetime
    description: str | None = None
    is_completed: bool = False


@dataclass
class PushTokenEntity(BaseDomainEntity):
    user_id: uuid.UUID
    token: str
    device_type: str = "ANDROID"
    is_active: bool = True
    last_used_at: datetime = field(default_factory=datetime.now)


@dataclass
class ContactBookNoteEntity(BaseDomainEntity):
    student_id: uuid.UUID
    teacher_id: uuid.UUID
    note_date: date = field(default_factory=date.today)
    content: str = ""
    is_parent_acknowledged: bool = False
    parent_comment: str | None = None


@dataclass
class ParentTeacherMessageEntity(BaseDomainEntity):
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    student_id: uuid.UUID
    content: str
    sent_at: datetime = field(default_factory=datetime.now)
    is_read: bool = False
