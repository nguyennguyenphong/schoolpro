"""
Django Admin site registration for Evaluation, Survey, and Facility models.
Covers 6 models:
  - EvaluationForm, EvaluationQuestion, EvaluationSubmission, EvaluationAnswer
  - Facility, FacilityIncidentReport
"""

from django.contrib import admin

from apps.evaluation.models.answer import EvaluationAnswer
from apps.evaluation.models.facility import Facility, FacilityIncidentReport
from apps.evaluation.models.form import EvaluationForm
from apps.evaluation.models.question import EvaluationQuestion
from apps.evaluation.models.submission import EvaluationSubmission
from common.admin_mixins import AutoCodeAdminMixin


class EvaluationQuestionInline(admin.StackedInline):
    model = EvaluationQuestion
    extra = 2
    readonly_fields = ["created_at"]


@admin.register(EvaluationForm)
class EvaluationFormAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "semester",
        "category",
        "target_type",
        "target_audience",
        "is_anonymous",
        "is_active",
        "valid_from",
        "valid_to",
    ]
    search_fields = ["code", "name", "description"]
    list_filter = [
        "school",
        "category",
        "target_type",
        "target_audience",
        "is_anonymous",
        "is_active",
    ]
    autocomplete_fields = ["school", "semester", "created_by"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [EvaluationQuestionInline]


@admin.register(EvaluationQuestion)
class EvaluationQuestionAdmin(admin.ModelAdmin):
    list_display = ["form", "order_no", "question_text", "question_type", "is_required", "weight"]
    search_fields = ["question_text", "form__name"]
    list_filter = ["form", "question_type", "is_required"]
    autocomplete_fields = ["form"]
    readonly_fields = ["created_at", "updated_at"]


class EvaluationAnswerInline(admin.TabularInline):
    model = EvaluationAnswer
    extra = 0
    autocomplete_fields = ["question"]
    readonly_fields = ["created_at"]


@admin.register(EvaluationSubmission)
class EvaluationSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        "form",
        "submitted_by",
        "target_teacher",
        "target_facility",
        "target_class",
        "total_score",
        "submitted_at",
    ]
    search_fields = [
        "form__name",
        "submitted_by__username",
        "submitted_by__full_name",
        "target_teacher__user__full_name",
    ]
    list_filter = ["form", "submitted_at"]
    autocomplete_fields = [
        "form",
        "submitted_by",
        "target_teacher",
        "target_facility",
        "target_class",
        "semester",
    ]
    readonly_fields = ["submitted_at"]
    inlines = [EvaluationAnswerInline]


@admin.register(EvaluationAnswer)
class EvaluationAnswerAdmin(admin.ModelAdmin):
    list_display = ["submission", "question", "numeric_score", "created_at"]
    list_filter = ["question__question_type"]
    autocomplete_fields = ["submission", "question"]
    readonly_fields = ["created_at"]


@admin.register(Facility)
class FacilityAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "room",
        "category",
        "brand_model",
        "status",
        "location",
        "responsible_user",
    ]
    search_fields = ["code", "name", "serial_number", "qr_code_tag"]
    list_filter = ["school", "category", "status", "room"]
    autocomplete_fields = ["school", "room", "responsible_user"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(FacilityIncidentReport)
class FacilityIncidentReportAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "ticket_code"
    list_display = [
        "ticket_code",
        "title",
        "school",
        "facility",
        "room",
        "incident_category",
        "priority",
        "status",
        "reported_by",
        "reported_at",
    ]
    search_fields = ["ticket_code", "title", "description", "contractor_name"]
    list_filter = ["school", "incident_category", "priority", "status", "reported_at"]
    autocomplete_fields = ["school", "facility", "room", "reported_by", "handled_by", "verified_by"]
    readonly_fields = ["reported_at", "updated_at"]
