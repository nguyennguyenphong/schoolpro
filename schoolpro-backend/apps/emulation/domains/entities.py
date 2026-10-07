"""
Emulation Domain Entities encapsulating Criteria, Records, Rankings, Duties, Awards,
Disciplinary actions, and Institutional Achievement Certificates.
Covers 9 tables:
  - CriteriaEntity ("master"."emulation_criteria")
  - ClassCustomCriteriaEntity ("emulation"."class_custom_criteria")
  - EmulationPeriodEntity ("emulation"."periods")
  - EmulationRecordEntity ("emulation"."records")
  - EmulationRankingEntity ("emulation"."rankings")
  - SupervisorDutyLogEntity ("emulation"."supervisor_duty_logs")
  - EmulationAwardEntity ("emulation"."awards")
  - DisciplinaryRecordEntity ("emulation"."disciplinary_records")
  - AchievementCertificateEntity ("emulation"."achievement_certificates")
"""

import uuid
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any

import uuid6

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class CriteriaEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    title: str
    category: str = "DISCIPLINE"
    default_points: Decimal = Decimal("5.00")
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        title: str,
        default_points: Decimal,
        category: str = "DISCIPLINE",
        code: str | None = None,
    ) -> "CriteriaEntity":
        cr_code = code or generate_entity_code("CRI")
        return cls(
            id=uuid6.uuid7(),
            school_id=school_id,
            code=cr_code,
            title=title,
            default_points=default_points,
            category=category,
        )


@dataclass
class ClassCustomCriteriaEntity(BaseDomainEntity):
    class_id: uuid.UUID
    name: str
    points: Decimal
    criteria_type: str = "PENALTY"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class EmulationPeriodEntity(BaseDomainEntity):
    academic_year_id: uuid.UUID
    name: str
    period_type: str = "WEEKLY"
    start_date: date = field(default_factory=date.today)
    end_date: date = field(default_factory=date.today)
    semester_id: uuid.UUID | None = None
    is_closed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def close(self) -> None:
        self.is_closed = True


@dataclass
class EmulationRecordEntity(BaseDomainEntity):
    class_id: uuid.UUID
    period_id: uuid.UUID
    recorded_by: uuid.UUID
    points_delta: Decimal = Decimal("0.00")
    criteria_id: uuid.UUID | None = None
    custom_criteria_id: uuid.UUID | None = None
    student_id: uuid.UUID | None = None
    reason: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class EmulationRankingEntity(BaseDomainEntity):
    period_id: uuid.UUID
    class_id: uuid.UUID
    total_points: Decimal = Decimal("100.00")
    ranking_position: int = 1
    rank_tier: str | None = "XUAT_SAC"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class SupervisorDutyLogEntity(BaseDomainEntity):
    supervisor_id: uuid.UUID
    duty_date: date = field(default_factory=date.today)
    shift: str = "MORNING"
    general_assessment: str | None = None
    incident_count: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class EmulationAwardEntity(BaseDomainEntity):
    student_id: uuid.UUID
    academic_year_id: uuid.UUID
    title: str
    award_category: str = "ACADEMIC"
    level: str = "SCHOOL"
    prize: str = "FIRST_PRIZE"
    decision_date: date = field(default_factory=date.today)
    bonus_points: int = 10
    semester_id: uuid.UUID | None = None
    contest_name: str | None = None
    organizer_name: str | None = None
    coach_teacher_id: uuid.UUID | None = None
    decision_number: str | None = None
    certificate_code: str | None = None
    reward_amount: Decimal = Decimal("0.00")
    signed_by: str | None = None
    is_featured: bool = False
    certificate_url: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class DisciplinaryRecordEntity(BaseDomainEntity):
    student_id: uuid.UUID
    infraction_description: str
    disciplinary_level: str = "REPRIMAND"
    academic_year_id: uuid.UUID | None = None
    semester_id: uuid.UUID | None = None
    decision_number: str | None = None
    decision_date: date | None = None
    decision_signed_by: uuid.UUID | None = None
    status: str = "ACTIVE"
    is_recorded_in_report_card: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def resolve(self) -> None:
        self.status = "RESOLVED"


@dataclass
class AchievementCertificateEntity(BaseDomainEntity):
    school_id: uuid.UUID
    recipient_name: str
    title: str
    issuing_organization: str
    recipient_type: str = "STUDENT"
    user_id: uuid.UUID | None = None
    student_id: uuid.UUID | None = None
    teacher_id: uuid.UUID | None = None
    staff_id: uuid.UUID | None = None
    class_id: uuid.UUID | None = None
    grade_id: uuid.UUID | None = None
    academic_year_id: uuid.UUID | None = None
    semester_id: uuid.UUID | None = None
    category: str = "ACADEMIC"
    certificate_code: str | None = None
    decision_number: str | None = None
    decision_date: date | None = None
    issue_date: date = field(default_factory=date.today)
    expiry_date: date | None = None
    level: str = "SCHOOL"
    prize_or_rank: str | None = None
    score_details: dict[str, Any] = field(default_factory=dict)
    summary: str | None = None
    certificate_file_url: str | None = None
    badge_icon_url: str | None = None
    verification_url: str | None = None
    verification_code: str | None = None
    is_public: bool = True
    is_featured: bool = False
    display_order: int = 0
    views_count: int = 0
    status: str = "APPROVED"
    verified_by: uuid.UUID | None = None
    verified_at: datetime | None = None
    rejection_reason: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def increment_views(self) -> int:
        self.views_count += 1
        return self.views_count

    def toggle_featured(self) -> bool:
        self.is_featured = not self.is_featured
        return self.is_featured
