"""
Evaluation Domain Entities encapsulating Forms, Questions, Submissions, Facilities, Incidents.
Covers 6 tables:
  - EvaluationFormEntity ("evaluation"."forms")
  - EvaluationQuestionEntity ("evaluation"."questions")
  - EvaluationSubmissionEntity ("evaluation"."submissions")
  - EvaluationAnswerEntity ("evaluation"."answers")
  - FacilityEntity ("evaluation"."facilities")
  - FacilityIncidentReportEntity ("evaluation"."facility_incident_reports")
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any
import uuid

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class EvaluationFormEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    title: str
    target_role: str = "TEACHER"
    start_date: date = field(default_factory=date.today)
    end_date: date = field(default_factory=date.today)
    is_active: bool = True
    is_anonymous: bool = True

    @classmethod
    def create(cls, school_id: uuid.UUID, title: str, target_role: str = "TEACHER", code: str | None = None) -> "EvaluationFormEntity":
        form_code = code or generate_entity_code("FRM")
        return cls(id=uuid.uuid4(), school_id=school_id, code=form_code, title=title, target_role=target_role)


@dataclass
class EvaluationQuestionEntity(BaseDomainEntity):
    form_id: uuid.UUID
    question_no: int
    content: str
    question_type: str = "RATING_5"
    is_required: bool = True


@dataclass
class EvaluationSubmissionEntity(BaseDomainEntity):
    form_id: uuid.UUID
    submitted_at: datetime = field(default_factory=datetime.now)
    evaluator_user_id: uuid.UUID | None = None
    target_user_id: uuid.UUID | None = None
    overall_rating: Decimal | None = None


@dataclass
class EvaluationAnswerEntity(BaseDomainEntity):
    submission_id: uuid.UUID
    question_id: uuid.UUID
    rating_value: int | None = None
    comment_text: str | None = None


@dataclass
class FacilityEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    category: str = "EQUIPMENT"
    room_id: uuid.UUID | None = None
    status: str = "OPERATIONAL"

    @classmethod
    def create(cls, school_id: uuid.UUID, name: str, category: str = "EQUIPMENT", code: str | None = None) -> "FacilityEntity":
        fac_code = code or generate_entity_code("FAC")
        return cls(id=uuid.uuid4(), school_id=school_id, code=fac_code, name=name, category=category)


@dataclass
class FacilityIncidentReportEntity(BaseDomainEntity):
    facility_id: uuid.UUID
    reported_by: uuid.UUID
    incident_date: date = field(default_factory=date.today)
    description: str = ""
    severity: str = "MEDIUM"
    status: str = "OPEN"
