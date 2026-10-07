"""
Django Admin site registration for Emulation and Discipline models.
Covers 9 models:
  - Criteria, ClassCustomCriteria
  - EmulationPeriod, EmulationRecord, EmulationRanking
  - SupervisorDutyLog
  - EmulationAward
  - DisciplinaryRecord
  - AchievementCertificate (Bảng vàng thành tích & Chứng chỉ)
"""

from django.contrib import admin

from apps.emulation.models.achievement_certificate import AchievementCertificate
from apps.emulation.models.award import EmulationAward
from apps.emulation.models.criteria import ClassCustomCriteria, Criteria
from apps.emulation.models.disciplinary import DisciplinaryRecord
from apps.emulation.models.duty_log import SupervisorDutyLog
from apps.emulation.models.period import EmulationPeriod
from apps.emulation.models.ranking import EmulationRanking
from apps.emulation.models.record import EmulationRecord


@admin.register(Criteria)
class CriteriaAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "school",
        "category",
        "scope_type",
        "points",
        "is_violation",
        "severity_level",
        "is_active",
    ]
    search_fields = ["code", "name"]
    list_filter = [
        "school",
        "category",
        "scope_type",
        "is_violation",
        "severity_level",
        "is_active",
    ]
    autocomplete_fields = ["school", "applicable_role"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ClassCustomCriteria)
class ClassCustomCriteriaAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "school_class",
        "category",
        "points",
        "is_violation",
        "target_scope",
        "is_active",
    ]
    search_fields = ["code", "name", "school_class__name"]
    list_filter = ["school_class", "category", "is_violation", "target_scope", "is_active"]
    autocomplete_fields = ["school_class", "created_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(EmulationPeriod)
class EmulationPeriodAdmin(admin.ModelAdmin):
    list_display = [
        "school",
        "academic_year",
        "code",
        "name",
        "period_type",
        "week_number",
        "start_date",
        "end_date",
        "is_closed",
    ]
    search_fields = ["code", "name", "theme_title"]
    list_filter = ["school", "period_type", "is_closed"]
    autocomplete_fields = ["school", "academic_year", "closed_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(EmulationRecord)
class EmulationRecordAdmin(admin.ModelAdmin):
    list_display = [
        "school_class",
        "period",
        "criteria",
        "student",
        "points",
        "incident_time",
        "status",
        "recorded_by",
        "recorded_at",
    ]
    search_fields = [
        "school_class__name",
        "student__student_code",
        "student__user__full_name",
        "note",
    ]
    list_filter = ["school_class", "period", "status", "incident_time"]
    autocomplete_fields = [
        "school_class",
        "period",
        "criteria",
        "class_criteria",
        "student",
        "class_group",
        "grade",
        "school",
        "recorded_by",
        "disputed_by",
        "dispute_resolved_by",
    ]
    readonly_fields = ["recorded_at", "updated_at"]


@admin.register(EmulationRanking)
class EmulationRankingAdmin(admin.ModelAdmin):
    list_display = [
        "period",
        "school_class",
        "student",
        "scope_type",
        "base_score",
        "final_score",
        "rank_position",
        "is_published",
        "computed_at",
    ]
    search_fields = ["school_class__name", "student__student_code", "student__user__full_name"]
    list_filter = ["period", "scope_type", "is_published"]
    autocomplete_fields = ["period", "school_class", "student", "class_group", "grade"]
    readonly_fields = ["computed_at"]


@admin.register(SupervisorDutyLog)
class SupervisorDutyLogAdmin(admin.ModelAdmin):
    list_display = [
        "period",
        "school_class",
        "supervisor",
        "red_flag_student",
        "duty_date",
        "shift",
        "total_score",
        "disputed",
        "created_at",
    ]
    search_fields = [
        "school_class__name",
        "supervisor__full_name",
        "red_flag_student__student_code",
        "general_feedback",
    ]
    list_filter = ["school_class", "shift", "disputed", "duty_date"]
    autocomplete_fields = ["period", "school_class", "supervisor", "red_flag_student"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(EmulationAward)
class EmulationAwardAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "student",
        "academic_year",
        "semester",
        "award_category",
        "level",
        "prize",
        "decision_number",
        "decision_date",
        "reward_amount",
        "is_featured",
        "created_at",
    ]
    search_fields = [
        "title",
        "decision_number",
        "student__student_code",
        "student__user__full_name",
    ]
    list_filter = ["award_category", "level", "prize", "is_featured", "academic_year"]
    autocomplete_fields = ["student", "academic_year", "semester", "coach_teacher"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(DisciplinaryRecord)
class DisciplinaryRecordAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "academic_year",
        "semester",
        "title",
        "record_type",
        "level",
        "decision_no",
        "decision_date",
        "incident_date",
        "rehabilitation_status",
        "created_at",
    ]
    search_fields = [
        "student__student_code",
        "student__user__full_name",
        "title",
        "decision_no",
        "description",
    ]
    list_filter = ["record_type", "level", "rehabilitation_status", "academic_year"]
    autocomplete_fields = ["student", "academic_year", "semester", "signed_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(AchievementCertificate)
class AchievementCertificateAdmin(admin.ModelAdmin):
    """
    Quản trị Bảng Vàng & Chứng chỉ Thành tích.
    Dành cho học sinh, giáo viên, nhân viên, lớp, khối, trường công khai.
    """

    list_display = [
        "certificate_code",
        "title",
        "recipient_type",
        "recipient_name",
        "category",
        "level",
        "prize_or_rank",
        "issue_date",
        "is_public",
        "is_featured",
        "views_count",
    ]
    search_fields = [
        "certificate_code",
        "title",
        "recipient_name",
        "issuing_organization",
        "decision_number",
    ]
    list_filter = [
        "school",
        "recipient_type",
        "category",
        "level",
        "prize_or_rank",
        "is_public",
        "is_featured",
        "academic_year",
    ]
    autocomplete_fields = [
        "school",
        "academic_year",
        "semester",
        "user",
        "student",
        "teacher",
        "staff",
        "school_class",
        "grade",
        "verified_by",
    ]
    readonly_fields = ["views_count", "created_at", "updated_at"]
    fieldsets = (
        (
            "Thông tin chứng chỉ & Bằng khen",
            {
                "fields": (
                    "certificate_code",
                    "title",
                    "category",
                    "level",
                    "prize_or_rank",
                    "issuing_organization",
                    "decision_number",
                    "decision_date",
                    "issue_date",
                    "expiry_date",
                ),
            },
        ),
        (
            "Đối tượng thụ hưởng (Cá nhân hoặc Tập thể)",
            {
                "fields": (
                    "recipient_type",
                    "recipient_name",
                    "school",
                    "academic_year",
                    "semester",
                    "user",
                    "student",
                    "teacher",
                    "staff",
                    "school_class",
                    "grade",
                ),
            },
        ),
        (
            "Trưng bày Bảng Vàng & Công khai",
            {
                "fields": (
                    "is_public",
                    "is_featured",
                    "display_order",
                    "certificate_file_url",
                    "badge_icon_url",
                    "views_count",
                    "summary",
                ),
            },
        ),
        (
            "Xác thực & Kiểm toán",
            {
                "fields": (
                    "status",
                    "verified_by",
                    "verified_at",
                    "rejection_reason",
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )
