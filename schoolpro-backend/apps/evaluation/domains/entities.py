"""
Evaluation Domain Entities encapsulating Forms, Questions, Submissions, Answers, Facilities, and Incidents.
Covers 6 tables:
  - EvaluationFormEntity ("evaluation"."forms")
  - EvaluationQuestionEntity ("evaluation"."questions")
  - EvaluationSubmissionEntity ("evaluation"."submissions")
  - EvaluationAnswerEntity ("evaluation"."answers")
  - FacilityEntity ("evaluation"."facilities")
  - FacilityIncidentReportEntity ("evaluation"."facility_incident_reports")
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
class EvaluationFormEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    title: str
    academic_year_id: uuid.UUID | None = None
    description: str | None = None
    form_type: str = "TEACHER_SURVEY"
    target_audience: str = "STUDENT"
    target_role_id: uuid.UUID | None = None
    start_date: date = field(default_factory=date.today)
    end_date: date = field(default_factory=date.today)
    is_anonymous: bool = True
    is_active: bool = True
    created_by: uuid.UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        title: str,
        form_type: str = "TEACHER_SURVEY",
        code: str | None = None,
    ) -> "EvaluationFormEntity":
        form_code = code or generate_entity_code("EVF")
        return cls(
            id=uuid6.uuid7(),
            school_id=school_id,
            code=form_code,
            title=title,
            form_type=form_type,
        )

    def is_currently_open(self, target_date: date | None = None) -> bool:
        today = target_date or date.today()
        return self.is_active and self.start_date <= today <= self.end_date


@dataclass
class EvaluationQuestionEntity(BaseDomainEntity):
    form_id: uuid.UUID
    question_text: str
    question_code: str | None = None
    question_type: str = "RATING_1_5"
    options: list[Any] = field(default_factory=list)
    is_required: bool = True
    order_no: int = 1
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class EvaluationSubmissionEntity(BaseDomainEntity):
    form_id: uuid.UUID
    anonymous_hash: str
    target_teacher_id: uuid.UUID | None = None
    target_class_id: uuid.UUID | None = None
    evaluator_user_id: uuid.UUID | None = None
    academic_year_id: uuid.UUID | None = None
    overall_rating: Decimal | None = None
    is_completed: bool = True
    submitted_at: datetime = field(default_factory=datetime.now)


@dataclass
class EvaluationAnswerEntity(BaseDomainEntity):
    submission_id: uuid.UUID
    question_id: uuid.UUID
    rating_score: int | None = None
    text_answer: str | None = None
    selected_options: list[Any] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class FacilityEntity(BaseDomainEntity):
    facility_code: str
    name: str
    room_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    category: str = "EQUIPMENT"
    brand: str | None = None
    serial_number: str | None = None
    quantity: int = 1
    status: str = "GOOD"
    purchase_date: date | None = None
    warranty_expiry: date | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls, name: str, category: str = "EQUIPMENT", code: str | None = None
    ) -> "FacilityEntity":
        fac_code = code or generate_entity_code("FAC")
        return cls(
            id=uuid6.uuid7(),
            facility_code=fac_code,
            name=name,
            category=category,
        )

    def is_operational(self) -> bool:
        return self.status in ("GOOD", "OPERATIONAL")


@dataclass
class FacilityIncidentReportEntity(BaseDomainEntity):
    description: str
    facility_id: uuid.UUID | None = None
    room_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    reported_by: uuid.UUID | None = None
    incident_image_url: str | None = None
    priority: str = "MEDIUM"
    repair_status: str = "REPORTED"
    resolution_notes: str | None = None
    resolved_at: datetime | None = None
    resolved_by: uuid.UUID | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def resolve(self, resolved_by_user: uuid.UUID, notes: str) -> None:
        self.repair_status = "RESOLVED"
        self.resolved_by = resolved_by_user
        self.resolved_at = datetime.now()
        self.resolution_notes = notes
