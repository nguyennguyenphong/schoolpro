"""
Master Domain Entities encapsulating reference data and organizational definitions.
Covers:
  - SchoolEntity ("core"."schools")
  - AcademicYearEntity ("core"."academic_years")
  - SemesterEntity ("core"."semesters")
  - GradeEntity ("core"."grades")
  - DepartmentEntity ("core"."departments")
  - SubjectEntity ("core"."subjects")
  - PositionEntity ("core"."positions")
  - LookupTypeEntity ("core"."lookup_types")
  - LookupValueEntity ("core"."lookup_values")
"""

import uuid
from dataclasses import dataclass, field
from datetime import date
from typing import Any

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class SchoolEntity(BaseDomainEntity):
    code: str
    name: str
    educational_stage: str = "HIGH_SCHOOL"
    school_type: str = "PUBLIC"
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    principal_name: str | None = None
    is_active: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def create(
        cls, name: str, code: str | None = None, address: str | None = None
    ) -> "SchoolEntity":
        school_code = code or generate_entity_code("SCH")
        return cls(
            id=uuid.uuid4(),
            code=school_code,
            name=name,
            address=address,
        )


@dataclass
class AcademicYearEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    start_date: date
    end_date: date
    is_current: bool = False

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        name: str,
        start_date: date,
        end_date: date,
        code: str | None = None,
    ) -> "AcademicYearEntity":
        ay_code = code or generate_entity_code("AY")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            code=ay_code,
            name=name,
            start_date=start_date,
            end_date=end_date,
        )


@dataclass
class SemesterEntity(BaseDomainEntity):
    academic_year_id: uuid.UUID
    code: str
    name: str
    start_date: date
    end_date: date
    is_current: bool = False

    @classmethod
    def create(
        cls,
        academic_year_id: uuid.UUID,
        name: str,
        start_date: date,
        end_date: date,
        code: str | None = None,
    ) -> "SemesterEntity":
        sem_code = code or generate_entity_code("SEM")
        return cls(
            id=uuid.uuid4(),
            academic_year_id=academic_year_id,
            code=sem_code,
            name=name,
            start_date=start_date,
            end_date=end_date,
        )


@dataclass
class GradeEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    order_no: int = 1

    @classmethod
    def create(
        cls, school_id: uuid.UUID, name: str, order_no: int = 1, code: str | None = None
    ) -> "GradeEntity":
        grade_code = code or generate_entity_code("G")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            code=grade_code,
            name=name,
            order_no=order_no,
        )


@dataclass
class DepartmentEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    department_type: str = "SUBJECT"
    leader_teacher_id: uuid.UUID | None = None
    is_active: bool = True

    @classmethod
    def create(
        cls, school_id: uuid.UUID, name: str, dept_type: str = "SUBJECT", code: str | None = None
    ) -> "DepartmentEntity":
        dept_code = code or generate_entity_code("DEP")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            code=dept_code,
            name=name,
            department_type=dept_type,
        )


@dataclass
class SubjectEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    evaluation_type: str = "SCORE"
    is_compulsory: bool = True
    department_id: uuid.UUID | None = None

    @classmethod
    def create(
        cls,
        school_id: uuid.UUID,
        name: str,
        evaluation_type: str = "SCORE",
        code: str | None = None,
    ) -> "SubjectEntity":
        subject_code = code or generate_entity_code("SUB")
        return cls(
            id=uuid.uuid4(),
            school_id=school_id,
            code=subject_code,
            name=name,
            evaluation_type=evaluation_type,
        )


@dataclass
class PositionEntity(BaseDomainEntity):
    code: str
    name: str
    scope_type: str = "CLASS"
    max_holders: int | None = 1
    is_leadership: bool = False
    description: str | None = None


@dataclass
class LookupTypeEntity(BaseDomainEntity):
    code: str
    name: str
    description: str | None = None
    is_system: bool = True


@dataclass
class LookupValueEntity(BaseDomainEntity):
    lookup_type_id: uuid.UUID
    code: str
    name: str
    order_no: int = 1
    badge_color: str | None = None
    is_default: bool = False
