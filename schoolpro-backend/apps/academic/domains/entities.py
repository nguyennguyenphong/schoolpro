"""
Academic Domain Entities encapsulating Timetables, Assignments, Exams, Attendance, Scores, Fees.
Covers 29 tables:
  - TimetableEntity ("academic"."timetables")
  - TimetableChangeEntity ("academic"."timetable_changes")
  - RoomEntity ("academic"."rooms")
  - PeriodEntity ("academic"."periods")
  - AssignmentEntity ("academic"."assignments")
  - AssignmentSubmissionEntity ("academic"."assignment_submissions")
  - AssignmentEventLogEntity ("academic"."assignment_event_logs")
  - AttendanceEntity ("academic"."attendance")
  - ExamEntity ("academic"."exams")
  - ExamQuestionEntity ("academic"."exam_questions")
  - ExamSubmissionEntity ("academic"."exam_submissions")
  - ExamSubmissionAnswerEntity ("academic"."exam_submission_answers")
  - QuestionBankEntity ("academic"."question_bank")
  - ScoreTypeEntity ("academic"."score_types")
  - StudentScoreEntity ("academic"."student_scores")
  - StudentTermSummaryEntity ("academic"."student_term_summaries")
  - ReportCardEntity ("academic"."report_cards")
  - ConductEvaluationEntity ("academic"."conduct_evaluations")
  - SubjectExemptionEntity ("academic"."subject_exemptions")
  - CurriculumTrackEntity ("academic"."curriculum_tracks")
  - CurriculumTrackSubjectEntity ("academic"."curriculum_track_subjects")
  - StudentTrackEnrollmentEntity ("academic"."student_track_enrollments")
  - ClassJournalEntryEntity ("academic"."class_journal_entries")
  - CurriculumMaterialEntity ("academic"."curriculum_materials")
  - MaterialAttachmentEntity ("academic"."material_attachments")
  - FeeItemEntity ("academic"."fee_items")
  - StudentFeeBillEntity ("academic"."student_fee_bills")
  - ExtracurricularActivityEntity ("academic"."extracurricular_activities")
  - ActivityParticipationEntity ("academic"."activity_participations")
"""

import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any

import uuid6

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class TimetableEntity(BaseDomainEntity):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_id: uuid.UUID
    period_id: uuid.UUID
    semester_id: uuid.UUID
    day_of_week: int
    room_id: uuid.UUID | None = None
    valid_from: date = field(default_factory=date.today)
    valid_to: date | None = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class TimetableChangeEntity(BaseDomainEntity):
    timetable_id: uuid.UUID
    change_type: str = "ROOM_CHANGE"
    change_date: date = field(default_factory=date.today)
    substitute_teacher_id: uuid.UUID | None = None
    new_period_id: uuid.UUID | None = None
    new_room_id: uuid.UUID | None = None
    reason: str | None = None
    approved_by: uuid.UUID | None = None
    status: str = "PENDING"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class RoomEntity(BaseDomainEntity):
    school_id: uuid.UUID
    room_code: str
    name: str
    room_type_code: str = "CLASSROOM"
    capacity: int = 45
    building: str | None = None
    floor: int | None = 1
    status: str = "AVAILABLE"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        name: str,
        room_type_code: str = "CLASSROOM",
        code: str | None = None,
    ) -> "RoomEntity":
        room_code = code or generate_entity_code("RM")
        return cls(
            id=uuid6.uuid7(),
            school_id=school_id,
            room_code=room_code,
            name=name,
            room_type_code=room_type_code,
        )


@dataclass
class PeriodEntity(BaseDomainEntity):
    school_id: uuid.UUID
    period_number: int
    shift: str = "MORNING"
    start_time: time = field(default_factory=lambda: time(7, 0))
    end_time: time = field(default_factory=lambda: time(7, 45))
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class AssignmentEntity(BaseDomainEntity):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_id: uuid.UUID
    title: str
    due_date: datetime
    school_id: uuid.UUID | None = None
    academic_year_id: uuid.UUID | None = None
    semester_id: uuid.UUID | None = None
    description: str | None = None
    assignment_type: str = "HOMEWORK"
    instructions: str | None = None
    max_score: Decimal = Decimal("10.00")
    assigned_date: date = field(default_factory=date.today)
    extended_due_date: datetime | None = None
    submission_type: str = "ONLINE_FILE"
    allowed_file_types: list[str] = field(default_factory=lambda: ["pdf", "docx", "zip"])
    max_file_size_mb: int = 50
    is_group_assignment: bool = False
    group_size_limit: int | None = None
    is_published: bool = True
    status: str = "OPEN"
    grading_criteria: dict[str, Any] = field(default_factory=dict)
    attachment_url: str | None = None
    total_submissions: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def is_past_due(self, current_time: datetime | None = None) -> bool:
        check_time = current_time or datetime.now()
        effective_deadline = self.extended_due_date or self.due_date
        return check_time > effective_deadline


@dataclass
class AssignmentSubmissionEntity(BaseDomainEntity):
    assignment_id: uuid.UUID
    student_id: uuid.UUID
    submitted_at: datetime = field(default_factory=datetime.now)
    submission_content: str | None = None
    attachment_url: str | None = None
    file_size_bytes: int | None = None
    is_late: bool = False
    score: Decimal | None = None
    feedback: str | None = None
    status: str = "SUBMITTED"
    graded_by: uuid.UUID | None = None
    graded_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class AssignmentEventLogEntity(BaseDomainEntity):
    assignment_id: uuid.UUID
    action_type: str
    student_id: uuid.UUID | None = None
    payload: dict[str, Any] = field(default_factory=dict)
    ip_address: str | None = None
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class AttendanceEntity(BaseDomainEntity):
    class_id: uuid.UUID
    student_id: uuid.UUID
    attendance_date: date
    status: str = "PRESENT"
    session: str = "MORNING"
    period_id: uuid.UUID | None = None
    note: str | None = None
    recorded_by: uuid.UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ExamEntity(BaseDomainEntity):
    school_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID
    grade_id: uuid.UUID
    title: str
    exam_type: str = "MIDTERM"
    duration_minutes: int = 60
    total_score: Decimal = Decimal("10.00")
    pass_score: Decimal = Decimal("5.00")
    start_time: datetime | None = None
    end_time: datetime | None = None
    room_id: uuid.UUID | None = None
    is_published: bool = True
    status: str = "UPCOMING"
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        subject_id: uuid.UUID,
        semester_id: uuid.UUID,
        grade_id: uuid.UUID,
        title: str,
    ) -> "ExamEntity":
        return cls(
            id=uuid6.uuid7(),
            school_id=school_id,
            subject_id=subject_id,
            semester_id=semester_id,
            grade_id=grade_id,
            title=title,
        )


@dataclass
class ExamQuestionEntity(BaseDomainEntity):
    exam_id: uuid.UUID
    question_id: uuid.UUID
    question_order: int
    points: Decimal = Decimal("1.00")
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ExamSubmissionEntity(BaseDomainEntity):
    exam_id: uuid.UUID
    student_id: uuid.UUID
    score: Decimal | None = None
    answers_data: dict[str, Any] = field(default_factory=dict)
    started_at: datetime = field(default_factory=datetime.now)
    submitted_at: datetime | None = None
    is_passed: bool | None = None
    status: str = "SUBMITTED"
    grader_id: uuid.UUID | None = None
    feedback: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ExamSubmissionAnswerEntity(BaseDomainEntity):
    submission_id: uuid.UUID
    exam_question_id: uuid.UUID
    selected_answers: list[Any] = field(default_factory=list)
    student_text_response: str | None = None
    is_correct: bool = False
    score_awarded: Decimal = Decimal("0.00")
    grader_notes: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class QuestionBankEntity(BaseDomainEntity):
    school_id: uuid.UUID
    subject_id: uuid.UUID
    grade_id: uuid.UUID
    content: str
    created_by: uuid.UUID | None = None
    question_type: str = "SINGLE_CHOICE"
    cognitive_level: str = "KNOWLEDGE"
    options: list[Any] = field(default_factory=list)
    correct_answers: list[Any] = field(default_factory=list)
    explanation: str | None = None
    media_urls: list[str] = field(default_factory=list)
    points: Decimal = Decimal("1.00")
    status: str = "APPROVED"
    usage_count: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ScoreTypeEntity(BaseDomainEntity):
    code: str
    name: str
    school_id: uuid.UUID | None = None
    coefficient: Decimal = Decimal("1.00")
    min_required: int = 1
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls, name: str, coefficient: Decimal = Decimal("1.00"), code: str | None = None
    ) -> "ScoreTypeEntity":
        st_code = code or generate_entity_code("ST")
        return cls(id=uuid6.uuid7(), code=st_code, name=name, coefficient=coefficient)


@dataclass
class StudentScoreEntity(BaseDomainEntity):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    class_id: uuid.UUID
    semester_id: uuid.UUID
    academic_year_id: uuid.UUID
    score_type_id: uuid.UUID
    score_value: Decimal | None = None
    evaluation_remark: str | None = None
    entered_by: uuid.UUID | None = None
    is_locked: bool = False
    locked_at: datetime | None = None
    locked_by: uuid.UUID | None = None
    score_history: list[dict[str, Any]] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class StudentTermSummaryEntity(BaseDomainEntity):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    class_id: uuid.UUID
    semester_id: uuid.UUID
    academic_year_id: uuid.UUID
    term_type: str = "SEMESTER_1"
    average_score: Decimal | None = None
    evaluation_result: str | None = "DAT"
    passed: bool = True
    calculated_at: datetime = field(default_factory=datetime.now)
    calculated_by: uuid.UUID | None = None
    calculation_details: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ReportCardEntity(BaseDomainEntity):
    student_id: uuid.UUID
    class_id: uuid.UUID
    academic_year_id: uuid.UUID
    semester_id: uuid.UUID | None = None
    gpa: Decimal | None = None
    academic_rank: str | None = "KHA"
    conduct_rank: str | None = "TOT"
    total_absences: int = 0
    unexcused_absences: int = 0
    title: str | None = None
    rank_position: int | None = None
    is_promoted: bool = True
    is_graduated: bool = False
    homeroom_teacher_feedback: str | None = None
    principal_approval_status: str = "PENDING"
    principal_approved_at: datetime | None = None
    issue_date: date = field(default_factory=date.today)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ConductEvaluationEntity(BaseDomainEntity):
    student_id: uuid.UUID
    class_id: uuid.UUID
    semester_id: uuid.UUID
    academic_year_id: uuid.UUID
    month: int | None = None
    evaluation_type: str = "TERM"
    conduct_grade: str = "TOT"
    conduct_score: Decimal | None = None
    infractions_count: int = 0
    merits_count: int = 0
    teacher_comments: str | None = None
    assessed_by: uuid.UUID | None = None
    status: str = "APPROVED"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class SubjectExemptionEntity(BaseDomainEntity):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID
    reason: str
    academic_year_id: uuid.UUID | None = None
    exemption_type: str = "FULL_EXEMPTION"
    certificate_name: str | None = None
    certificate_score: str | None = None
    certificate_file_url: str | None = None
    certificate_issued_date: date | None = None
    certificate_expiry_date: date | None = None
    verification_url: str | None = None
    converted_score: Decimal | None = None
    decision_number: str | None = None
    valid_from: date = field(default_factory=date.today)
    valid_to: date | None = None
    status: str = "APPROVED"
    rejection_reason: str | None = None
    approved_by: uuid.UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CurriculumTrackEntity(BaseDomainEntity):
    school_id: uuid.UUID
    grade_id: uuid.UUID
    code: str
    name: str
    academic_year_id: uuid.UUID | None = None
    track_category: str = "KHTN"
    description: str | None = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CurriculumTrackSubjectEntity(BaseDomainEntity):
    track_id: uuid.UUID
    subject_id: uuid.UUID
    is_specialized: bool = False
    weekly_periods: int = 2
    is_compulsory: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class StudentTrackEnrollmentEntity(BaseDomainEntity):
    student_id: uuid.UUID
    track_id: uuid.UUID
    academic_year_id: uuid.UUID
    status: str = "ACTIVE"
    registration_date: date = field(default_factory=date.today)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ClassJournalEntryEntity(BaseDomainEntity):
    class_id: uuid.UUID
    teacher_id: uuid.UUID
    subject_id: uuid.UUID
    entry_date: date = field(default_factory=date.today)
    period_id: uuid.UUID | None = None
    timetable_id: uuid.UUID | None = None
    day_of_week: int | None = None
    shift: str = "MORNING"
    period_number: int | None = None
    lesson_topic: str | None = None
    homework_assigned: str | None = None
    total_present: int = 0
    absent_unexcused: int = 0
    absent_excused: int = 0
    student_absent_names: str | None = None
    discipline_rating: str = "A"
    teacher_notes: str | None = None
    signature_confirmed: bool = False
    signed_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CurriculumMaterialEntity(BaseDomainEntity):
    school_id: uuid.UUID
    subject_id: uuid.UUID
    grade_id: uuid.UUID
    title: str
    teacher_id: uuid.UUID | None = None
    description: str | None = None
    material_type: str = "LECTURE_NOTE"
    file_format: str = "PDF"
    file_size_mb: Decimal = Decimal("0.00")
    download_url: str | None = None
    is_public: bool = True
    views_count: int = 0
    downloads_count: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class MaterialAttachmentEntity(BaseDomainEntity):
    material_id: uuid.UUID
    file_name: str
    file_url: str
    file_size_bytes: int = 0
    mime_type: str | None = "application/pdf"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class FeeItemEntity(BaseDomainEntity):
    school_id: uuid.UUID
    academic_year_id: uuid.UUID
    code: str
    name: str
    amount: Decimal
    semester_id: uuid.UUID | None = None
    category: str = "TUITION"
    due_date: date | None = None
    is_mandatory: bool = True
    description: str | None = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class StudentFeeBillEntity(BaseDomainEntity):
    student_id: uuid.UUID
    fee_item_id: uuid.UUID
    bill_code: str
    original_amount: Decimal
    final_amount: Decimal
    discount_amount: Decimal = Decimal("0.00")
    paid_amount: Decimal = Decimal("0.00")
    payment_status: str = "UNPAID"
    payment_method: str | None = None
    transaction_ref: str | None = None
    paid_at: datetime | None = None
    receipt_number: str | None = None
    payer_name: str | None = None
    notes: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def is_fully_paid(self) -> bool:
        return self.paid_amount >= self.final_amount


@dataclass
class ExtracurricularActivityEntity(BaseDomainEntity):
    school_id: uuid.UUID
    title: str
    academic_year_id: uuid.UUID | None = None
    semester_id: uuid.UUID | None = None
    description: str | None = None
    activity_type: str = "VOLUNTEER"
    location: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    max_participants: int = 100
    points_reward: int = 5
    organizer_name: str | None = None
    status: str = "UPCOMING"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ActivityParticipationEntity(BaseDomainEntity):
    activity_id: uuid.UUID
    student_id: uuid.UUID
    registration_date: datetime = field(default_factory=datetime.now)
    attendance_status: str = "REGISTERED"
    points_earned: int = 0
    feedback: str | None = None
    certificate_issued: bool = False
    verified_by: uuid.UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
