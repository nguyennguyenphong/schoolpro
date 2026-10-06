"""
Academic Domain Entities encapsulating Timetables, Assignments, Exams, Attendance, Scores, Fees.
Covers 26 tables:
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

from dataclasses import dataclass, field
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any
import uuid

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class TimetableEntity(BaseDomainEntity):
    class_id: uuid.UUID
    semester_id: uuid.UUID
    period_id: uuid.UUID
    day_of_week: int
    class_subject_teacher_id: uuid.UUID
    effective_from: date
    room_id: uuid.UUID | None = None
    lesson_topic: str | None = None
    is_online: bool = False
    color_theme: str | None = "blue"


@dataclass
class TimetableChangeEntity(BaseDomainEntity):
    timetable_id: uuid.UUID
    change_type: str = "ROOM_CHANGE"
    change_date: date = field(default_factory=date.today)
    substitute_teacher_id: uuid.UUID | None = None
    new_room_id: uuid.UUID | None = None
    reason: str | None = None
    status: str = "PENDING"


@dataclass
class RoomEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    room_type: str = "CLASSROOM"
    capacity: int = 45
    building: str | None = None
    floor: int | None = 1
    status: str = "AVAILABLE"

    @classmethod
    def create(cls, school_id: uuid.UUID, name: str, room_type: str = "CLASSROOM", code: str | None = None) -> "RoomEntity":
        room_code = code or generate_entity_code("RM")
        return cls(id=uuid.uuid4(), school_id=school_id, code=room_code, name=name, room_type=room_type)


@dataclass
class PeriodEntity(BaseDomainEntity):
    school_id: uuid.UUID
    period_no: int
    shift: str = "MORNING"
    start_time: time = field(default_factory=lambda: time(7, 0))
    end_time: time = field(default_factory=lambda: time(7, 45))


@dataclass
class AssignmentEntity(BaseDomainEntity):
    class_subject_teacher_id: uuid.UUID
    title: str
    due_date: datetime
    assignment_type: str = "HOMEWORK"
    assigned_date: date = field(default_factory=date.today)
    max_score: Decimal = Decimal("10.00")
    description: str | None = None
    attachments: list[dict[str, Any]] = field(default_factory=list)
    is_published: bool = True
    submission_format: str = "ANY"
    allowed_file_types: list[str] = field(default_factory=lambda: ["pdf", "docx", "zip"])
    max_file_size_mb: int = 50
    extended_due_date_1: datetime | None = None
    extended_due_date_2: datetime | None = None
    extended_due_date_3: datetime | None = None
    created_by: uuid.UUID | None = None

    def is_past_due(self, current_time: datetime | None = None) -> bool:
        check_time = current_time or datetime.now()
        effective_deadline = (
            self.extended_due_date_3
            or self.extended_due_date_2
            or self.extended_due_date_1
            or self.due_date
        )
        return check_time > effective_deadline


@dataclass
class AssignmentSubmissionEntity(BaseDomainEntity):
    assignment_id: uuid.UUID
    student_id: uuid.UUID
    submitted_at: datetime = field(default_factory=datetime.now)
    content_text: str | None = None
    attachments: list[dict[str, Any]] = field(default_factory=list)
    score: Decimal | None = None
    feedback: str | None = None
    status: str = "SUBMITTED"
    graded_by: uuid.UUID | None = None
    graded_at: datetime | None = None


@dataclass
class AssignmentEventLogEntity(BaseDomainEntity):
    assignment_id: uuid.UUID
    event_type: str
    actor_id: uuid.UUID | None = None
    student_id: uuid.UUID | None = None
    description: str | None = None
    event_data: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class AttendanceEntity(BaseDomainEntity):
    class_id: uuid.UUID
    student_id: uuid.UUID
    attendance_date: date
    period_id: uuid.UUID | None = None
    status_code: str = "PRESENT"
    reason: str | None = None
    recorded_by: uuid.UUID | None = None


@dataclass
class ExamEntity(BaseDomainEntity):
    school_id: uuid.UUID
    semester_id: uuid.UUID
    subject_id: uuid.UUID
    name: str
    exam_type: str = "MIDTERM"
    exam_date: date = field(default_factory=date.today)
    duration_minutes: int = 60
    max_score: Decimal = Decimal("10.00")
    paper_code: str | None = None

    @classmethod
    def create(cls, school_id: uuid.UUID, semester_id: uuid.UUID, subject_id: uuid.UUID, name: str, code: str | None = None) -> "ExamEntity":
        paper_code = code or generate_entity_code("EX")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            semester_id=semester_id,
            subject_id=subject_id,
            name=name,
            paper_code=paper_code,
        )


@dataclass
class ExamQuestionEntity(BaseDomainEntity):
    exam_id: uuid.UUID
    question_no: int
    content: str
    question_type: str = "MULTIPLE_CHOICE"
    points: Decimal = Decimal("1.00")
    options: list[dict[str, Any]] = field(default_factory=list)
    correct_answer: str | None = None


@dataclass
class ExamSubmissionEntity(BaseDomainEntity):
    exam_id: uuid.UUID
    student_id: uuid.UUID
    started_at: datetime = field(default_factory=datetime.now)
    submitted_at: datetime | None = None
    total_score: Decimal | None = None
    status: str = "SUBMITTED"


@dataclass
class ExamSubmissionAnswerEntity(BaseDomainEntity):
    submission_id: uuid.UUID
    question_id: uuid.UUID
    student_answer: str | None = None
    is_correct: bool = False
    awarded_points: Decimal = Decimal("0.00")


@dataclass
class QuestionBankEntity(BaseDomainEntity):
    subject_id: uuid.UUID
    grade_id: uuid.UUID
    content: str
    difficulty_level: str = "MEDIUM"
    question_type: str = "MULTIPLE_CHOICE"
    options: list[dict[str, Any]] = field(default_factory=list)
    correct_answer: str | None = None


@dataclass
class ScoreTypeEntity(BaseDomainEntity):
    code: str
    name: str
    coefficient: int = 1
    min_evaluations: int = 1
    is_active: bool = True

    @classmethod
    def create(cls, name: str, coefficient: int = 1, code: str | None = None) -> "ScoreTypeEntity":
        st_code = code or generate_entity_code("ST")
        return cls(id=uuid.uuid4(), code=st_code, name=name, coefficient=coefficient)


@dataclass
class StudentScoreEntity(BaseDomainEntity):
    student_id: uuid.UUID
    class_subject_teacher_id: uuid.UUID
    score_type_id: uuid.UUID
    score_value: Decimal | None = None
    score_text: str | None = None
    evaluated_date: date = field(default_factory=date.today)
    is_locked: bool = False


@dataclass
class StudentTermSummaryEntity(BaseDomainEntity):
    student_id: uuid.UUID
    semester_id: uuid.UUID
    gpa: Decimal | None = None
    academic_performance: str | None = None
    conduct_grade: str | None = None
    rank_in_class: int | None = None


@dataclass
class ReportCardEntity(BaseDomainEntity):
    student_id: uuid.UUID
    academic_year_id: uuid.UUID
    final_gpa: Decimal | None = None
    final_performance: str | None = None
    final_conduct: str | None = None
    is_promoted: bool = True
    homeroom_comment: str | None = None


@dataclass
class ConductEvaluationEntity(BaseDomainEntity):
    student_id: uuid.UUID
    semester_id: uuid.UUID
    conduct_grade: str = "TOT"
    homeroom_comment: str | None = None
    principal_approved: bool = False


@dataclass
class SubjectExemptionEntity(BaseDomainEntity):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    semester_id: uuid.UUID
    exemption_type: str = "FULL"
    reason: str | None = None


@dataclass
class CurriculumTrackEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    description: str | None = None

    @classmethod
    def create(cls, school_id: uuid.UUID, name: str, code: str | None = None) -> "CurriculumTrackEntity":
        tr_code = code or generate_entity_code("TRK")
        return cls(id=uuid.uuid4(), school_id=school_id, code=tr_code, name=name)


@dataclass
class CurriculumTrackSubjectEntity(BaseDomainEntity):
    track_id: uuid.UUID
    subject_id: uuid.UUID
    is_advanced: bool = False


@dataclass
class StudentTrackEnrollmentEntity(BaseDomainEntity):
    student_id: uuid.UUID
    track_id: uuid.UUID
    enrolled_date: date = field(default_factory=date.today)


@dataclass
class ClassJournalEntryEntity(BaseDomainEntity):
    class_id: uuid.UUID
    period_id: uuid.UUID
    entry_date: date
    subject_id: uuid.UUID
    teacher_id: uuid.UUID
    lesson_content: str
    attendance_summary: str | None = None
    conduct_rating: str = "A"


@dataclass
class CurriculumMaterialEntity(BaseDomainEntity):
    subject_id: uuid.UUID
    grade_id: uuid.UUID
    title: str
    description: str | None = None
    author_teacher_id: uuid.UUID | None = None
    is_public: bool = True


@dataclass
class MaterialAttachmentEntity(BaseDomainEntity):
    material_id: uuid.UUID
    file_name: str
    file_url: str
    file_size_bytes: int = 0
    file_type: str = "application/pdf"


@dataclass
class FeeItemEntity(BaseDomainEntity):
    school_id: uuid.UUID
    academic_year_id: uuid.UUID
    code: str
    name: str
    amount: Decimal = Decimal("0.00")
    is_compulsory: bool = True

    @classmethod
    def create(cls, school_id: uuid.UUID, academic_year_id: uuid.UUID, name: str, amount: Decimal, code: str | None = None) -> "FeeItemEntity":
        fee_code = code or generate_entity_code("FEE")
        return cls(id=uuid.uuid4(), school_id=school_id, academic_year_id=academic_year_id, code=fee_code, name=name, amount=amount)


@dataclass
class StudentFeeBillEntity(BaseDomainEntity):
    student_id: uuid.UUID
    fee_item_id: uuid.UUID
    bill_code: str
    amount_due: Decimal
    amount_paid: Decimal = Decimal("0.00")
    status: str = "UNPAID"
    due_date: date = field(default_factory=date.today)

    @classmethod
    def create(cls, student_id: uuid.UUID, fee_item_id: uuid.UUID, amount_due: Decimal, code: str | None = None) -> "StudentFeeBillEntity":
        bill_code = code or generate_entity_code("BILL")
        return cls(id=uuid.uuid4(), student_id=student_id, fee_item_id=fee_item_id, bill_code=bill_code, amount_due=amount_due)


@dataclass
class ExtracurricularActivityEntity(BaseDomainEntity):
    school_id: uuid.UUID
    title: str
    activity_type: str = "VOLUNTEER"
    start_time: datetime = field(default_factory=datetime.now)
    end_time: datetime | None = None
    organizer_teacher_id: uuid.UUID | None = None
    max_participants: int | None = None


@dataclass
class ActivityParticipationEntity(BaseDomainEntity):
    activity_id: uuid.UUID
    student_id: uuid.UUID
    status: str = "REGISTERED"
    awarded_points: Decimal = Decimal("0.00")
