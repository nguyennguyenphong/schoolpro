"""
Serializers for Announcement Domain.
Formats data contracts strictly for frontend consumption.
"""

from rest_framework import serializers

from apps.core.models.user import User
from apps.notification.models.announcement import Announcement


class AnnouncementAttachmentSerializer(serializers.Serializer):
    """Attachment document metadata."""

    id = serializers.CharField()
    name = serializers.CharField()
    url = serializers.CharField()
    size = serializers.CharField()
    fileType = serializers.CharField()


class AnnouncementItemResponseSerializer(serializers.ModelSerializer):
    """
    Announcement item representation formatted to match frontend client schema.
    """

    publishDate = serializers.DateTimeField(source="published_at", format="%Y-%m-%d %H:%M:%S")
    author = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    isPinned = serializers.BooleanField(source="is_pinned")
    isRead = serializers.SerializerMethodField()
    viewsCount = serializers.IntegerField(source="views_count")
    targetAudience = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "summary",
            "content",
            "publishDate",
            "author",
            "department",
            "category",
            "priority",
            "isPinned",
            "isRead",
            "viewsCount",
            "targetAudience",
            "attachments",
        ]

    def get_author(self, obj: Announcement) -> str:
        """Resolve publisher name or default to School Administration."""
        if hasattr(obj, "_author_cache"):
            return obj._author_cache
        user = User.objects.filter(id=obj.published_by).first()
        author_name = user.full_name or user.username if user else "Ban Giám Hiệu"
        obj._author_cache = author_name
        return author_name

    def get_department(self, obj: Announcement) -> str:
        return obj.department or "Phòng Đào Tạo"

    def get_category(self, obj: Announcement) -> str:
        """Map backend enum to frontend category slugs while preserving dynamic categories."""
        if not obj.category:
            return "general"
        cat_lower = obj.category.lower()
        cat_map = {
            "academic": "academic",
            "exam": "exam",
            "emulation": "emulation",
            "fees": "tuition",
            "tuition": "tuition",
            "events": "activity",
            "activity": "activity",
            "general": "general",
            "homeroom": "homeroom",
        }
        return cat_map.get(cat_lower, cat_lower)

    def get_priority(self, obj: Announcement) -> str:
        """Map backend enum to frontend priority strings."""
        pri_map = {
            "URGENT": "urgent",
            "HIGH": "high",
            "NORMAL": "normal",
            "LOW": "normal",
        }
        return pri_map.get(obj.priority, "normal")

    def get_isRead(self, obj: Announcement) -> bool:
        """Read receipt flag annotated by repository."""
        return bool(getattr(obj, "is_read", False))

    def get_targetAudience(self, obj: Announcement) -> str:
        """Human-readable target audience description."""
        tt = obj.target_type
        if tt == "SCHOOL":
            return "Toàn trường"
        if tt == "ROLE":
            return "Theo chức vụ / vai trò"
        if tt == "GRADE":
            return "Theo khối lớp"
        if tt == "CLASS":
            return "Theo lớp học"
        return "Cá nhân"

    def get_attachments(self, obj: Announcement) -> list[dict]:
        """Format attachments list safely."""
        raw = obj.attachments
        if isinstance(raw, list):
            return raw
        return []


class AnnouncementSummaryResponseSerializer(serializers.Serializer):
    """
    Summary counters and breakdown response.
    """

    total = serializers.IntegerField()
    unreadCount = serializers.IntegerField(source="unread_count")
    urgentCount = serializers.IntegerField(source="urgent_count")
    academicCount = serializers.IntegerField(source="academic_count")
    examCount = serializers.IntegerField(source="exam_count")
    activityCount = serializers.IntegerField(source="activity_count")


class UnreadCountResponseSerializer(serializers.Serializer):
    """Header notification badge unread counter."""

    unreadCount = serializers.IntegerField()


class MarkReadResponseSerializer(serializers.Serializer):
    """Result of mark as read operation."""

    success = serializers.BooleanField()
    markedCount = serializers.IntegerField(required=False)


class AnnouncementCategoryItemSerializer(serializers.Serializer):
    """Announcement category option metadata."""

    value = serializers.CharField()
    code = serializers.CharField()
    label = serializers.CharField()
    count = serializers.IntegerField()

