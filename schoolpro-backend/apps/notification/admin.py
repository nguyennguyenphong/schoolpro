"""
Django Admin site registration for Notification and Communication models.
Covers 6 models:
  - Announcement, AnnouncementRead
  - ContactBookNote (Sổ liên lạc điện tử)
  - ParentTeacherMessage (Tin nhắn Phụ huynh - Giáo viên)
  - PushToken
  - Reminder
"""

from django.contrib import admin

from apps.notification.models.announcement import Announcement, AnnouncementRead
from apps.notification.models.contact_book import ContactBookNote
from apps.notification.models.message import ParentTeacherMessage
from apps.notification.models.push_token import PushToken
from apps.notification.models.reminder import Reminder
from common.admin_mixins import AutoCodeAdminMixin


class AnnouncementReadInline(admin.TabularInline):
    model = AnnouncementRead
    extra = 0
    autocomplete_fields = ["user"]
    readonly_fields = ["read_at"]


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "school",
        "category",
        "priority",
        "status",
        "target_type",
        "is_pinned",
        "published_at",
        "expires_at",
    ]
    search_fields = ["title", "summary", "content"]
    list_filter = ["school", "category", "priority", "status", "target_type", "is_pinned"]
    autocomplete_fields = [
        "school",
        "target_grade",
        "target_class",
        "target_role",
        "target_user",
        "published_by",
    ]
    readonly_fields = ["published_at", "updated_at"]
    inlines = [AnnouncementReadInline]


@admin.register(AnnouncementRead)
class AnnouncementReadAdmin(admin.ModelAdmin):
    list_display = ["announcement", "user", "read_at"]
    search_fields = ["announcement__title", "user__username", "user__full_name"]
    list_filter = ["read_at"]
    autocomplete_fields = ["announcement", "user"]
    readonly_fields = ["read_at"]


@admin.register(ContactBookNote)
class ContactBookNoteAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "student",
        "school_class",
        "guardian",
        "period_type",
        "period_label",
        "status",
        "parent_acknowledged",
        "is_sent_sms",
        "created_at",
    ]
    search_fields = [
        "code",
        "student__student_code",
        "student__user__full_name",
        "teacher_remarks",
    ]
    list_filter = ["school_class", "period_type", "status", "parent_acknowledged"]
    autocomplete_fields = [
        "school",
        "student",
        "school_class",
        "semester",
        "guardian",
        "created_by",
    ]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ParentTeacherMessage)
class ParentTeacherMessageAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "guardian",
        "teacher",
        "sender_user",
        "message_type",
        "is_read",
        "read_at",
        "created_at",
    ]
    search_fields = [
        "message_content",
        "student__student_code",
        "student__user__full_name",
        "sender_user__full_name",
    ]
    list_filter = ["message_type", "is_read", "leave_approved_status"]
    autocomplete_fields = ["student", "guardian", "teacher", "sender_user", "reply_to_message"]
    readonly_fields = ["created_at", "read_at"]


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ["user", "platform", "app_version", "is_active", "last_used_at", "created_at"]
    search_fields = ["user__username", "user__full_name", "device_token", "device_id"]
    list_filter = ["platform", "is_active"]
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at", "updated_at", "last_used_at"]


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "user",
        "remind_at",
        "priority",
        "repeat_interval",
        "is_done",
        "created_at",
    ]
    search_fields = ["title", "content", "user__full_name"]
    list_filter = ["is_done", "repeat_interval", "priority", "remind_at"]
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at", "updated_at"]
