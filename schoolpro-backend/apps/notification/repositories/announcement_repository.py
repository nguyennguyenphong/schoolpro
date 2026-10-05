"""
Announcement Repository.
Encapsulates data access and ORM queries for school announcements and read receipts.
"""

from typing import Any
from uuid import UUID

from django.db.models import Case, Count, Exists, F, OuterRef, Q, QuerySet, Value, When
from django.utils import timezone

from apps.core.models.profile import Student
from apps.core.models.user import User
from apps.notification.models.announcement import Announcement, AnnouncementRead
from common.repositories.base import BaseRepository


class AnnouncementRepository(BaseRepository[Announcement]):
    """
    Repository for querying, filtering, and persisting Announcement domain entities.
    """

    def __init__(self):
        super().__init__(Announcement)

    def get_announcements_for_user(
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
        Query eligible announcements for a specific user based on target rules.
        Annotates `is_read` and author name.
        """
        # Read receipt subquery
        read_subquery = AnnouncementRead.objects.filter(
            announcement_id=OuterRef("id"),
            user_id=user.id,
        )

        qs = (
            self.get_queryset()
            .annotate(is_read=Exists(read_subquery))
            .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now()))
        )

        # 1. Target Audience filtering
        # Check if user is system admin / staff
        active_role_code = getattr(user, "active_role_code", "") or ""
        is_admin = user.is_staff or "ADMIN" in active_role_code.upper()

        if not is_admin:
            target_filter = Q(target_type="SCHOOL")

            # Match target_user
            target_filter |= Q(target_type="USER", target_user_id=user.id)

            # Match role
            user_role_ids = list(
                user.user_roles.filter(status="ACTIVE").values_list("role_id", flat=True)
            )
            if user_role_ids:
                target_filter |= Q(target_type="ROLE", target_role_id__in=user_role_ids)

            # Match student class and grade
            student_profile = Student.objects.filter(user_id=user.id).first()
            if student_profile:
                if student_profile.current_class_id:
                    target_filter |= Q(
                        target_type="CLASS",
                        target_class_id=student_profile.current_class_id,
                    )
                    # Get grade from class if available
                    from apps.core.models.organization import SchoolClass

                    cls = SchoolClass.objects.filter(id=student_profile.current_class_id).first()
                    if cls and cls.grade_id:
                        target_filter |= Q(
                            target_type="GRADE",
                            target_grade_id=cls.grade_id,
                        )

            qs = qs.filter(target_filter)

        # Multi-tenancy guard: restrict to user's school if available
        if getattr(user, "school_id", None):
            qs = qs.filter(school_id=user.school_id)

        # 2. Search query
        if search_query and search_query.strip():
            sq = search_query.strip()
            qs = qs.filter(
                Q(title__icontains=sq)
                | Q(summary__icontains=sq)
                | Q(content__icontains=sq)
                | Q(department__icontains=sq)
            )

        # 3. Category filter
        # Mapping frontend category slugs to backend enum categories while allowing dynamic categories
        category_map = {
            "general": "GENERAL",
            "academic": "ACADEMIC",
            "exam": "EXAM",
            "tuition": "FEES",
            "activity": "EVENTS",
            "homeroom": "ACADEMIC",
        }
        if category and category.strip() and category.lower() != "all":
            cat_clean = category.strip()
            mapped_cat = category_map.get(cat_clean.lower(), cat_clean.upper())
            qs = qs.filter(Q(category__iexact=cat_clean) | Q(category__iexact=mapped_cat))

        # 4. Department filter
        if department and department.strip() and department.lower() != "all":
            dept_val = department.strip()
            # Check if department matches ID, code, or name from Master Department
            dept_names_to_match = [dept_val]
            try:
                from apps.master.models.department import Department

                # Match by UUID
                dept_obj = Department.objects.filter(id=dept_val).first()
                if dept_obj and dept_obj.name:
                    dept_names_to_match.append(dept_obj.name)

                # Match by code
                dept_by_code = Department.objects.filter(code__iexact=dept_val).first()
                if dept_by_code and dept_by_code.name:
                    dept_names_to_match.append(dept_by_code.name)
            except Exception:
                pass

            dept_query = Q()
            for d_name in set(dept_names_to_match):
                dept_query |= Q(department__icontains=d_name)
            qs = qs.filter(dept_query)

        # 5. Priority filter
        if priority and priority.lower() != "all":
            qs = qs.filter(priority=priority.upper())

        # 6. Read status filter
        if read_status == "unread":
            qs = qs.filter(is_read=False)
        elif read_status == "read":
            qs = qs.filter(is_read=True)

        # 7. Sorting
        priority_weight = Case(
            When(priority="URGENT", then=Value(3)),
            When(priority="HIGH", then=Value(2)),
            When(priority="NORMAL", then=Value(1)),
            When(priority="LOW", then=Value(0)),
            default=Value(0),
        )

        if sort_by == "oldest":
            qs = qs.order_by("-is_pinned", "published_at")
        elif sort_by == "views":
            qs = qs.order_by("-is_pinned", "-views_count", "-published_at")
        elif sort_by == "priority":
            qs = qs.annotate(p_weight=priority_weight).order_by(
                "-is_pinned", "-p_weight", "-published_at"
            )
        else:
            # Default newest
            qs = qs.order_by("-is_pinned", "-published_at")

        return qs

    def get_announcement_with_read(
        self, announcement_id: UUID | str, user_id: UUID | str
    ) -> Announcement | None:
        """
        Fetch single announcement with read status annotated.
        """
        read_subquery = AnnouncementRead.objects.filter(
            announcement_id=OuterRef("id"),
            user_id=user_id,
        )
        return (
            self.get_queryset()
            .annotate(is_read=Exists(read_subquery))
            .filter(id=announcement_id)
            .first()
        )

    def increment_views(self, announcement_id: UUID | str) -> None:
        """Increment announcement views count atomically."""
        self.get_queryset().filter(id=announcement_id).update(views_count=F("views_count") + 1)

    def mark_as_read(self, announcement_id: UUID | str, user_id: UUID | str) -> bool:
        """
        Record a read receipt for user.
        """
        # Ensure announcement exists
        if not self.get_queryset().filter(id=announcement_id).exists():
            return False

        # Create or update read receipt
        AnnouncementRead.objects.update_or_create(
            announcement_id=announcement_id,
            user_id=user_id,
            defaults={"read_at": timezone.now()},
        )
        return True

    def mark_all_as_read(self, user: User) -> int:
        """
        Mark all eligible announcements as read for user.
        """
        eligible_qs = self.get_announcements_for_user(user, read_status="unread")
        eligible_ids = list(eligible_qs.values_list("id", flat=True))

        now = timezone.now()
        reads_to_create = [
            AnnouncementRead(
                announcement_id=ann_id,
                user_id=user.id,
                read_at=now,
            )
            for ann_id in eligible_ids
        ]

        if reads_to_create:
            AnnouncementRead.objects.bulk_create(
                reads_to_create,
                ignore_conflicts=True,
            )

        return len(reads_to_create)

    def get_user_announcement_summary(self, user: User) -> dict[str, Any]:
        """
        Compute summary counts for user's eligible announcements.
        """
        all_eligible = self.get_announcements_for_user(user)

        total = all_eligible.count()
        unread_count = all_eligible.filter(is_read=False).count()
        urgent_count = all_eligible.filter(priority="URGENT").count()
        academic_count = all_eligible.filter(category="ACADEMIC").count()
        exam_count = all_eligible.filter(category="EXAM").count()
        activity_count = all_eligible.filter(category="EVENTS").count()

        return {
            "total": total,
            "unread_count": unread_count,
            "urgent_count": urgent_count,
            "academic_count": academic_count,
            "exam_count": exam_count,
            "activity_count": activity_count,
        }

    def get_categories_for_user(self, user: User) -> list[dict[str, Any]]:
        """
        Retrieve distinct announcement categories available for user/school,
        including item counts and human-readable Vietnamese labels.
        """
        all_eligible = self.get_announcements_for_user(user)
        cat_counts = all_eligible.values("category").annotate(count=Count("id")).order_by("-count")

        label_map = {
            "ACADEMIC": "Đào tạo & Học vụ",
            "EXAM": "Khảo thí & Lịch thi",
            "FEES": "Học phí & Khoản thu",
            "EVENTS": "Đoàn trường & Ngoại khóa",
            "ACTIVITY": "Hoạt động & Ngoại khóa",
            "EMULATION": "Thi đua & Khen thưởng",
            "GENERAL": "Thông báo chung",
            "HOMEROOM": "Lớp & GVCN",
            "ADMISSION": "Tuyển sinh",
        }

        results = []
        for row in cat_counts:
            raw_cat = row["category"] or "GENERAL"
            upper_cat = raw_cat.upper()
            label = label_map.get(upper_cat, raw_cat.capitalize())
            results.append(
                {
                    "value": raw_cat.lower(),
                    "code": upper_cat,
                    "label": label,
                    "count": row["count"],
                }
            )
        return results

    def get_departments_for_user(self, user: User) -> list[str]:
        """
        Retrieve distinct issuing departments for user's eligible announcements.
        """
        all_eligible = self.get_announcements_for_user(user)
        departments = list(
            all_eligible.exclude(department__isnull=True)
            .exclude(department="")
            .values_list("department", flat=True)
            .distinct()
        )
        return sorted(departments)
