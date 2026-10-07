"""
Emulation Domain Entities encapsulating Criteria, Records, Rankings, Duties, Awards, and Disciplinary actions.
Covers 8 tables:
  - CriteriaEntity ("emulation"."criteria")
  - ClassCustomCriteriaEntity ("emulation"."class_custom_criteria")
  - EmulationPeriodEntity ("emulation"."periods")
  - EmulationRecordEntity ("emulation"."records")
  - EmulationRankingEntity ("emulation"."rankings")
  - SupervisorDutyLogEntity ("emulation"."supervisor_duty_logs")
  - EmulationAwardEntity ("emulation"."awards")
  - DisciplinaryRecordEntity ("emulation"."disciplinary_records")
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any
import uuid

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class CriteriaEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    category: str = "ORDER"
    points: Decimal = Decimal("5.00")
    is_positive: bool = False
    is_active: bool = True

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        name: str,
        points: Decimal,
        is_positive: bool = False,
        code: str | None = None,
    ) -> "CriteriaEntity":
        cr_code = code or generate_entity_code("CRI")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            code=cr_code,
            name=name,
            points=points,
            is_positive=is_positive,
        )


@dataclass
class ClassCustomCriteriaEntity(BaseDomainEntity):
    class_id: uuid.UUID
    criteria_id: uuid.UUID
    custom_points: Decimal


@dataclass
class EmulationPeriodEntity(BaseDomainEntity):
    school_id: uuid.UUID
    academic_year_id: uuid.UUID
    code: str
    name: str
    period_type: str = "WEEK"
    start_date: date = field(default_factory=date.today)
    end_date: date = field(default_factory=date.today)
    is_closed: bool = False

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        academic_year_id: uuid.UUID,
        name: str,
        start_date: date,
        end_date: date,
        code: str | None = None,
    ) -> "EmulationPeriodEntity":
        per_code = code or generate_entity_code("PER")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            academic_year_id=academic_year_id,
            code=per_code,
            name=name,
            start_date=start_date,
            end_date=end_date,
        )


@dataclass
class EmulationRecordEntity(BaseDomainEntity):
    class_id: uuid.UUID
    criteria_id: uuid.UUID
    period_id: uuid.UUID
    recorded_by: uuid.UUID
    incident_date: date = field(default_factory=date.today)
    points_awarded: Decimal = Decimal("0.00")
    student_id: uuid.UUID | None = None
    description: str | None = None
    status: str = "VERIFIED"


@dataclass
class EmulationRankingEntity(BaseDomainEntity):
    period_id: uuid.UUID
    class_id: uuid.UUID
    total_points: Decimal = Decimal("100.00")
    rank_position: int = 1
    flag_awarded: str | None = "FLAG_EXCELLENT"


@dataclass
class SupervisorDutyLogEntity(BaseDomainEntity):
    supervisor_id: uuid.UUID
    duty_date: date = field(default_factory=date.today)
    shift: str = "MORNING"
    notes: str | None = None
    incidents_count: int = 0


@dataclass
class EmulationAwardEntity(BaseDomainEntity):
    school_id: uuid.UUID
    title: str
    award_level: str = "SCHOOL"
    awarded_date: date = field(default_factory=date.today)
    recipient_user_id: uuid.UUID | None = None
    recipient_class_id: uuid.UUID | None = None


@dataclass
class DisciplinaryRecordEntity(BaseDomainEntity):
    student_id: uuid.UUID
    incident_date: date = field(default_factory=date.today)
    severity: str = "WARNING"
    reason: str = ""
    decision_number: str | None = None
    is_resolved: bool = False
