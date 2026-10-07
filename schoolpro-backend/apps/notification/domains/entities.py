"""
Notification Domain Entities encapsulating Announcements, Reminders, Push Tokens, Messages, and Contact Book Notes.
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
from datetime import datetime
from typing import Any

from common.models.domain import BaseDomainEntity


@dataclass
class AnnouncementEntity(BaseDomainEntity):
    school_id: uuid.UUID
    title: str
    content: str
    target_type: str = "SCHOOL"
    category: str = "ACADEMIC"
    status: str = "PUBLISHED"
    summary: str | None = None
    target_grade_id: uuid.UUID | None = None
    target_class_id: uuid.UUID | None = None
    target_role_id: uuid.UUID | None = None
    target_user_id: uuid.UUID | None = None
    priority: str = "NORMAL"
    is_pinned: bool = False
    pinned_until: datetime | None = None
    channels: list[str] = field(default_factory=lambda: ["IN_APP"])
    send_push: bool = True
    send_email: bool = False
    send_sms: bool = False
    views_count: int = 0
    department: str | None = "Phòng Đào Tạo"
    attachments: list[dict[str, Any]] | None = None
    export_template_code: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    published_by: uuid.UUID | None = None
    published_at: datetime = field(default_factory=datetime.now)
    expires_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def is_active_published(self, current_time: datetime | None = None) -> bool:
        now = current_time or datetime.now()
        if self.status != "PUBLISHED":
            return False
        if self.expires_at and now > self.expires_at:
            return False
        return True

    def is_currently_pinned(self, current_time: datetime | None = None) -> bool:
        if not self.is_pinned:
            return False
        if self.pinned_until:
            now = current_time or datetime.now()
            return now <= self.pinned_until
        return True

    def increment_views(self) -> int:
        self.views_count += 1
        return self.views_count


@dataclass
class AnnouncementReadEntity(BaseDomainEntity):
    announcement_id: uuid.UUID
    user_id: uuid.UUID
    device_type: str | None = None
    ip_address: str | None = None
    reading_duration_seconds: int = 0
    acknowledged: bool = False
    acknowledged_at: datetime | None = None
    read_at: datetime = field(default_factory=datetime.now)

    def acknowledge(self) -> None:
        self.acknowledged = True
        self.acknowledged_at = datetime.now()


@dataclass
class ReminderEntity(BaseDomainEntity):
    user_id: uuid.UUID
    title: str
    remind_at: datetime
    content: str | None = None
    priority: str = "NORMAL"
    repeat_interval: str = "NONE"
    channels: list[str] = field(default_factory=lambda: ["IN_APP"])
    is_sent: bool = False
    sent_at: datetime | None = None
    related_entity: str | None = None
    related_id: uuid.UUID | None = None
    is_done: bool = False
    done_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def mark_as_done(self) -> None:
        self.is_done = True
        self.done_at = datetime.now()

    def mark_as_sent(self) -> None:
        self.is_sent = True
        self.sent_at = datetime.now()

    def should_trigger(self, current_time: datetime | None = None) -> bool:
        now = current_time or datetime.now()
        return not self.is_done and not self.is_sent and now >= self.remind_at


@dataclass
class PushTokenEntity(BaseDomainEntity):
    user_id: uuid.UUID
    device_token: str
    device_id: str | None = None
    device_name: str | None = None
    os_version: str | None = None
    app_version: str | None = None
    platform: str | None = "ANDROID"
    is_active: bool = True
    last_used_at: datetime = field(default_factory=datetime.now)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def touch(self) -> None:
        self.last_used_at = datetime.now()
        self.is_active = True

    def deactivate(self) -> None:
        self.is_active = False


@dataclass
class ContactBookNoteEntity(BaseDomainEntity):
    student_id: uuid.UUID
    class_id: uuid.UUID
    semester_id: uuid.UUID
    period_label: str
    created_by: uuid.UUID
    school_id: uuid.UUID | None = None
    guardian_id: uuid.UUID | None = None
    period_type: str = "WEEKLY"
    academic_digest: dict[str, Any] | None = None
    attendance_digest: dict[str, Any] | None = None
    emulation_digest: dict[str, Any] | None = None
    health_digest: dict[str, Any] | None = None
    extracurricular_digest: dict[str, Any] | None = None
    upcoming_events: dict[str, Any] | None = None
    teacher_remarks: str | None = None
    delivery_channels: list[str] = field(default_factory=list)
    is_sent_sms: bool = False
    is_sent_zalo: bool = False
    status: str = "PUBLISHED"
    parent_viewed_at: datetime | None = None
    parent_acknowledged: bool = False
    parent_feedback: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def mark_parent_viewed(self) -> None:
        if not self.parent_viewed_at:
            self.parent_viewed_at = datetime.now()

    def acknowledge_by_parent(self, feedback: str | None = None) -> None:
        self.parent_acknowledged = True
        self.mark_parent_viewed()
        if feedback:
            self.parent_feedback = feedback


@dataclass
class ParentTeacherMessageEntity(BaseDomainEntity):
    student_id: uuid.UUID
    guardian_id: uuid.UUID
    teacher_id: uuid.UUID
    sender_user_id: uuid.UUID
    message_content: str
    conversation_id: uuid.UUID | None = None
    message_type: str = "TEXT"
    leave_request_data: dict[str, Any] | None = None
    leave_approved_status: str = "NONE"
    reply_to_message_id: uuid.UUID | None = None
    attachments: list[dict[str, Any]] | None = None
    is_read: bool = False
    read_at: datetime | None = None
    is_deleted: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def mark_as_read(self) -> None:
        self.is_read = True
        self.read_at = datetime.now()

    def soft_delete(self) -> None:
        self.is_deleted = True

    def approve_leave_request(self) -> None:
        if self.message_type == "LEAVE_REQUEST":
            self.leave_approved_status = "APPROVED"

    def reject_leave_request(self) -> None:
        if self.message_type == "LEAVE_REQUEST":
            self.leave_approved_status = "REJECTED"
