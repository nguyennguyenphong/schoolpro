"""
Django Admin site registration for Academic domain models.
Covers 28 models:
  - Infrastructure: Room, Period
  - Timetable: Timetable, TimetableChange
  - Attendance: Attendance
  - Grading: ScoreType, StudentScore, StudentTermSummary, ReportCard, ConductEvaluation, SubjectExemption
  - Exam: Exam, ExamQuestion, ExamSubmission, ExamSubmissionAnswer, QuestionBank
  - Curriculum: CurriculumTrack, CurriculumTrackSubject, StudentTrackEnrollment
  - Journal: ClassJournalEntry
  - Material: CurriculumMaterial, MaterialAttachment
  - Fee: FeeItem, StudentFeeBill
  - Activity: ExtracurricularActivity, ActivityParticipation
  - Assignment: Assignment, AssignmentSubmission
"""

from django.contrib import admin

from apps.academic.models.activity import ActivityParticipation, ExtracurricularActivity
from apps.academic.models.assignment import Assignment, AssignmentEventLog, AssignmentSubmission
from apps.academic.models.attendance import (
    Attendance,
    AttendanceLog,
    LeaveRequest,
    LeaveRequestEventLog,
)
from apps.academic.models.curriculum import (
    CurriculumTrack,
    CurriculumTrackSubject,
    StudentTrackEnrollment,
)
from apps.academic.models.exam import (
    Exam,
    ExamEventLog,
    ExamQuestion,
    ExamSubmission,
    ExamSubmissionAnswer,
    QuestionBank,
)
from apps.academic.models.fee import FeeItem, StudentFeeBill
from apps.academic.models.grading import (
    ConductEvaluation,
    ReportCard,
    ScoreType,
    StudentScore,
    StudentTermSummary,
    SubjectExemption,
)
from apps.academic.models.infrastructure import Period, Room
from apps.academic.models.journal import ClassJournalEntry
from apps.academic.models.material import CurriculumMaterial, MaterialAttachment
from apps.academic.models.timetable import Timetable, TimetableChange
from common.admin_mixins import AutoCodeAdminMixin


# --- Infrastructure ---
@admin.register(Room)
class RoomAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "room_type",
        "building",
        "floor",
        "capacity",
        "status",
    ]
    search_fields = ["code", "name", "building"]
    list_filter = ["school", "room_type", "status", "has_projector", "has_air_conditioner"]
    autocomplete_fields = ["school"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    list_display = ["period_no", "name", "shift", "school", "start_time", "end_time", "is_break"]
    search_fields = ["name"]
    list_filter = ["school", "shift", "is_break"]
    autocomplete_fields = ["school"]
    readonly_fields = ["created_at", "updated_at"]


# --- Timetable ---
@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = [
        "school_class",
        "semester",
        "day_of_week",
        "period",
        "class_subject_teacher",
        "room",
        "class_type",
        "learning_mode",
        "effective_from",
    ]
    search_fields = [
        "school_class__name",
        "lesson_topic",
        "class_subject_teacher__teacher__user__full_name",
    ]
    list_filter = ["school_class", "semester", "day_of_week", "class_type", "learning_mode"]
    autocomplete_fields = ["school_class", "semester", "period", "class_subject_teacher", "room"]
    fieldsets = [
        (
            "Thông tin lịch học",
            {
                "fields": [
                    ("school_class", "semester"),
                    ("day_of_week", "period"),
                    ("class_subject_teacher", "room"),
                ],
                "description": "Thứ trong tuần: 2 (Thứ Hai), 3 (Thứ Ba), 4 (Thứ Tư), 5 (Thứ Năm), 6 (Thứ Sáu), 7 (Thứ Bảy), 8 (Chủ Nhật).",
            },
        ),
        (
            "Hình thức đào tạo & Chi tiết bài giảng",
            {
                "fields": [
                    ("class_type", "learning_mode"),
                    ("is_online", "online_url"),
                    "meeting_passcode",
                    "lesson_topic",
                    ("color_theme", "notes"),
                ]
            },
        ),
        (
            "Thời gian hiệu lực",
            {
                "fields": [
                    ("effective_from", "effective_to"),
                ]
            },
        ),
        (
            "Cấu hình nâng cao",
            {
                "classes": ["collapse"],
                "fields": [
                    "curriculum_material_ids",
                    "settings",
                ],
            },
        ),
    ]


@admin.register(TimetableChange)
class TimetableChangeAdmin(admin.ModelAdmin):
    list_display = [
        "timetable",
        "change_date",
        "change_type",
        "substitute_teacher",
        "new_room",
        "new_period",
        "status",
        "created_at",
    ]
    search_fields = ["timetable__school_class__name", "reason"]
    list_filter = ["change_type", "status", "change_date"]
    autocomplete_fields = [
        "timetable",
        "substitute_teacher",
        "new_room",
        "new_period",
        "requested_by",
        "approved_by",
    ]
    readonly_fields = ["created_at", "updated_at"]


# --- Attendance ---
class AttendanceLogInline(admin.TabularInline):
    model = AttendanceLog
    extra = 0
    readonly_fields = ["created_at"]
    can_delete = False


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "school_class",
        "attendance_date",
        "period",
        "status",
        "method",
        "is_parent_notified",
        "recorded_by",
        "recorded_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "school_class__name"]
    list_filter = ["school_class", "status", "attendance_date", "is_parent_notified"]
    autocomplete_fields = ["student", "school_class", "period", "recorded_by"]
    readonly_fields = ["recorded_at"]
    inlines = [AttendanceLogInline]


@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "attendance",
        "previous_status",
        "new_status",
        "action",
        "performed_by",
        "created_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "reason"]
    list_filter = ["new_status", "action", "created_at"]
    autocomplete_fields = ["student", "attendance", "performed_by"]
    readonly_fields = ["created_at"]


class LeaveRequestEventLogInline(admin.TabularInline):
    model = LeaveRequestEventLog
    extra = 0
    readonly_fields = ["created_at"]
    can_delete = False


@admin.register(LeaveRequest)
class LeaveRequestAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "student",
        "school_class",
        "leave_type",
        "start_date",
        "end_date",
        "status",
        "is_auto_approved",
        "approval_deadline",
        "requested_by",
        "reviewed_by",
        "created_at",
    ]
    search_fields = [
        "code",
        "student__student_code",
        "student__user__full_name",
        "school_class__name",
        "reason",
    ]
    list_filter = ["status", "is_auto_approved", "leave_type", "school_class", "start_date"]
    autocomplete_fields = ["student", "school_class", "guardian", "requested_by", "reviewed_by"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [LeaveRequestEventLogInline]


@admin.register(LeaveRequestEventLog)
class LeaveRequestEventLogAdmin(admin.ModelAdmin):
    list_display = [
        "leave_request",
        "event_type",
        "title",
        "actor_name",
        "recipient_email",
        "email_sent",
        "created_at",
    ]
    search_fields = ["title", "description", "actor_name", "recipient_email"]
    list_filter = ["event_type", "email_sent", "created_at"]
    autocomplete_fields = ["leave_request"]
    readonly_fields = ["created_at"]


# --- Grading ---
@admin.register(ScoreType)
class ScoreTypeAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "coefficient",
        "min_evaluations",
        "max_evaluations",
        "is_active",
    ]
    search_fields = ["code", "name"]
    list_filter = ["school", "is_active"]
    autocomplete_fields = ["school"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(StudentScore)
class StudentScoreAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "class_subject_teacher",
        "semester",
        "score_type",
        "score_value",
        "score_date",
        "is_locked",
        "entered_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "note"]
    list_filter = ["semester", "score_type", "is_locked", "score_date"]
    autocomplete_fields = [
        "student",
        "class_subject_teacher",
        "semester",
        "score_type",
        "exam",
        "entered_by",
    ]
    readonly_fields = ["entered_at", "updated_at"]


@admin.register(StudentTermSummary)
class StudentTermSummaryAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "school_class",
        "academic_year",
        "semester",
        "term_type",
        "gpa_score",
        "academic_rating",
        "conduct_rating",
        "is_locked",
    ]
    search_fields = ["student__student_code", "student__user__full_name"]
    list_filter = [
        "school_class",
        "academic_year",
        "semester",
        "academic_rating",
        "conduct_rating",
        "is_locked",
    ]
    autocomplete_fields = ["student", "school_class", "academic_year", "semester", "certified_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ReportCard)
class ReportCardAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "school_class",
        "subject",
        "academic_year",
        "semester",
        "average_score",
        "academic_rating",
        "conduct_rating",
        "is_locked",
        "generated_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name"]
    list_filter = ["school_class", "academic_year", "semester", "academic_rating", "is_locked"]
    autocomplete_fields = [
        "student",
        "school_class",
        "subject",
        "academic_year",
        "semester",
        "verified_by",
    ]
    readonly_fields = ["generated_at", "updated_at"]


@admin.register(ConductEvaluation)
class ConductEvaluationAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "semester",
        "homeroom_teacher_rating",
        "final_rating",
        "status",
        "evaluated_by",
        "evaluated_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name"]
    list_filter = ["semester", "final_rating", "status"]
    autocomplete_fields = ["student", "semester", "evaluated_by"]
    readonly_fields = ["evaluated_at", "updated_at"]


@admin.register(SubjectExemption)
class SubjectExemptionAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "subject",
        "semester",
        "academic_year",
        "exemption_type",
        "status",
        "valid_from",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "subject__name", "reason"]
    list_filter = ["exemption_type", "status", "subject"]
    autocomplete_fields = ["student", "subject", "semester", "academic_year", "approved_by"]
    readonly_fields = ["created_at", "updated_at"]


# --- Exam & Question Bank ---
class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1
    autocomplete_fields = ["question"]


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "class_subject_teacher",
        "score_type",
        "exam_date",
        "format",
        "status",
        "max_score",
        "pass_score",
        "created_at",
    ]
    search_fields = [
        "title",
        "class_subject_teacher__school_class__name",
        "class_subject_teacher__subject__name",
    ]
    list_filter = ["score_type", "format", "status", "exam_date"]
    autocomplete_fields = [
        "class_subject_teacher",
        "score_type",
        "room",
        "proctor_teacher",
        "created_by",
    ]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [ExamQuestionInline]


@admin.register(QuestionBank)
class QuestionBankAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "subject",
        "grade",
        "question_type",
        "difficulty_level",
        "default_score",
        "status",
        "created_at",
    ]
    search_fields = ["code", "content", "solution_explanation"]
    list_filter = ["subject", "grade", "question_type", "difficulty_level", "status"]
    autocomplete_fields = ["subject", "grade", "author", "reviewed_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ["exam", "question", "order_no", "score_weight", "paper_code"]
    search_fields = ["paper_code", "section_name", "exam__title"]
    list_filter = ["exam", "paper_code"]
    autocomplete_fields = ["exam", "question"]
    readonly_fields = ["created_at"]


class ExamEventLogInline(admin.TabularInline):
    model = ExamEventLog
    extra = 0
    readonly_fields = ["created_at"]
    can_delete = False


@admin.register(ExamSubmission)
class ExamSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        "exam",
        "student",
        "attempt_number",
        "status",
        "total_score",
        "started_at",
        "submitted_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "exam__title"]
    list_filter = ["exam", "status", "appeal_status"]
    autocomplete_fields = ["exam", "student", "graded_by", "appeal_resolved_by"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [ExamEventLogInline]


@admin.register(ExamSubmissionAnswer)
class ExamSubmissionAnswerAdmin(admin.ModelAdmin):
    list_display = ["submission", "exam_question", "awarded_score", "is_correct", "created_at"]
    list_filter = ["is_correct", "flagged_for_review"]
    autocomplete_fields = ["submission", "exam_question", "graded_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ExamEventLog)
class ExamEventLogAdmin(admin.ModelAdmin):
    list_display = [
        "exam",
        "student",
        "submission",
        "event_type",
        "title",
        "severity",
        "actor",
        "created_at",
    ]
    search_fields = ["title", "description", "event_type", "exam__title"]
    list_filter = ["severity", "event_type", "created_at"]
    autocomplete_fields = ["exam", "submission", "student", "actor"]
    readonly_fields = ["created_at"]


# --- Curriculum Tracks ---
class CurriculumTrackSubjectInline(admin.TabularInline):
    model = CurriculumTrackSubject
    extra = 2
    autocomplete_fields = ["subject"]


@admin.register(CurriculumTrack)
class CurriculumTrackAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "grade",
        "career_orientation",
        "quota_students",
        "is_active",
        "created_at",
    ]
    search_fields = ["code", "name", "career_orientation"]
    list_filter = ["school", "grade", "is_active"]
    autocomplete_fields = ["school", "grade"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [CurriculumTrackSubjectInline]


@admin.register(CurriculumTrackSubject)
class CurriculumTrackSubjectAdmin(admin.ModelAdmin):
    list_display = [
        "track",
        "subject",
        "is_compulsory",
        "is_track_core",
        "credit_periods_per_year",
        "cluster_period_count",
    ]
    list_filter = ["track", "is_compulsory", "is_track_core"]
    autocomplete_fields = ["track", "subject"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(StudentTrackEnrollment)
class StudentTrackEnrollmentAdmin(admin.ModelAdmin):
    list_display = ["student", "track", "academic_year", "enrolled_date", "status"]
    search_fields = ["student__student_code", "student__user__full_name", "track__name"]
    list_filter = ["track", "academic_year", "status"]
    autocomplete_fields = ["student", "track", "academic_year", "approved_by"]
    readonly_fields = ["created_at", "updated_at"]


# --- Class Journal ---
@admin.register(ClassJournalEntry)
class ClassJournalEntryAdmin(admin.ModelAdmin):
    list_display = [
        "school_class",
        "class_subject_teacher",
        "session_date",
        "period_no",
        "lesson_title",
        "lesson_rating",
        "emulation_score",
    ]
    search_fields = ["school_class__name", "lesson_title"]
    list_filter = ["school_class", "session_date", "lesson_rating"]
    autocomplete_fields = [
        "school_class",
        "class_subject_teacher",
        "timetable",
        "period",
        "substitute_teacher",
    ]
    readonly_fields = ["created_at", "updated_at"]


# --- Material ---
class MaterialAttachmentInline(admin.TabularInline):
    model = MaterialAttachment
    extra = 1
    readonly_fields = ["created_at"]


@admin.register(CurriculumMaterial)
class CurriculumMaterialAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "subject",
        "target_grade",
        "material_type",
        "visibility",
        "is_published",
        "created_at",
    ]
    search_fields = ["title", "chapter_name", "description"]
    list_filter = ["subject", "target_grade", "material_type", "visibility", "is_published"]
    autocomplete_fields = ["class_subject_teacher", "subject", "target_grade", "created_by"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [MaterialAttachmentInline]


@admin.register(MaterialAttachment)
class MaterialAttachmentAdmin(admin.ModelAdmin):
    list_display = ["material", "file_name", "file_type", "file_size_bytes", "created_at"]
    search_fields = ["file_name"]
    list_filter = ["file_type"]
    autocomplete_fields = ["material"]
    readonly_fields = ["created_at"]


# --- Fee ---
@admin.register(FeeItem)
class FeeItemAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "code"
    list_display = [
        "code",
        "name",
        "school",
        "academic_year",
        "semester",
        "category",
        "amount",
        "is_mandatory",
        "is_active",
    ]
    search_fields = ["code", "name"]
    list_filter = ["school", "academic_year", "semester", "category", "is_mandatory", "is_active"]
    autocomplete_fields = ["school", "academic_year", "semester", "grade", "target_classes"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(StudentFeeBill)
class StudentFeeBillAdmin(AutoCodeAdminMixin, admin.ModelAdmin):
    auto_code_field = "bill_code"
    list_display = [
        "bill_code",
        "student",
        "fee_item",
        "final_amount",
        "paid_amount",
        "payment_status",
        "paid_at",
    ]
    search_fields = [
        "bill_code",
        "student__student_code",
        "student__user__full_name",
        "payer_name",
        "payer_phone",
    ]
    list_filter = ["payment_status", "fee_item", "payment_method"]
    autocomplete_fields = ["student", "fee_item", "cashier_user"]
    readonly_fields = ["created_at", "updated_at"]


# --- Activities ---
class ActivityParticipationInline(admin.TabularInline):
    model = ActivityParticipation
    extra = 1
    autocomplete_fields = ["student"]


@admin.register(ExtracurricularActivity)
class ExtracurricularActivityAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "school",
        "semester",
        "activity_type",
        "organizer_unit",
        "start_time",
        "end_time",
        "status",
        "is_published",
    ]
    search_fields = ["title", "location", "organizer_unit"]
    list_filter = ["school", "semester", "activity_type", "status"]
    autocomplete_fields = ["school", "semester", "target_grades"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [ActivityParticipationInline]


@admin.register(ActivityParticipation)
class ActivityParticipationAdmin(admin.ModelAdmin):
    list_display = [
        "activity",
        "student",
        "role",
        "attendance_status",
        "bonus_points_awarded",
        "evaluation_score",
        "created_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "activity__title"]
    list_filter = ["activity", "role", "attendance_status"]
    autocomplete_fields = ["activity", "student", "verified_by"]
    readonly_fields = ["created_at", "updated_at"]


# --- Assignment ---
class AssignmentSubmissionInline(admin.TabularInline):
    model = AssignmentSubmission
    extra = 0
    autocomplete_fields = ["student"]


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "class_subject_teacher",
        "assignment_type",
        "assigned_date",
        "due_date",
        "max_score",
        "is_published",
    ]
    search_fields = [
        "title",
        "class_subject_teacher__school_class__name",
        "class_subject_teacher__subject__name",
    ]
    list_filter = ["assignment_type", "is_published", "assigned_date"]
    autocomplete_fields = ["class_subject_teacher", "created_by"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [AssignmentSubmissionInline]


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        "assignment",
        "student",
        "attempt_number",
        "status",
        "score",
        "final_score",
        "is_late",
        "submitted_at",
    ]
    search_fields = ["student__student_code", "student__user__full_name", "assignment__title"]
    list_filter = ["status", "submission_status", "is_late", "appeal_status"]
    autocomplete_fields = [
        "assignment",
        "student",
        "graded_by",
        "appeal_resolved_by",
        "reopen_approved_by",
    ]
    readonly_fields = [
        "submitted_at",
        "graded_at",
        "appealed_at",
        "appeal_resolved_at",
        "reopen_requested_at",
        "reopen_approved_at",
    ]


@admin.register(AssignmentEventLog)
class AssignmentEventLogAdmin(admin.ModelAdmin):
    list_display = ["assignment", "event_type", "title", "actor", "student", "created_at"]
    search_fields = ["title", "description", "assignment__title"]
    list_filter = ["event_type", "created_at"]
    autocomplete_fields = ["assignment", "submission", "student", "actor"]
    readonly_fields = ["created_at"]
