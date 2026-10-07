"""
Core Domain Entities encapsulating Identity, RBAC, Profiles, and Organization invariants.
Covers 19 tables:
  - UserEntity ("core"."users")
  - RoleEntity ("core"."roles")
  - PermissionEntity ("core"."permissions")
  - RolePermissionEntity ("core"."role_permissions")
  - UserRoleEntity ("core"."user_roles")
  - TeacherEntity ("core"."teachers")
  - StudentEntity ("core"."students")
  - StaffEntity ("core"."staff")
  - GuardianEntity ("core"."guardians")
  - StudentHealthRecordEntity ("core"."student_health_records")
  - SchoolClassEntity ("core"."classes")
  - ClassGroupEntity ("core"."class_groups")
  - StudentClassEnrollmentEntity ("core"."student_class_enrollments")
  - ClassSubjectTeacherEntity ("core"."class_subject_teachers")
  - PositionAssignmentEntity ("core"."position_assignments")
  - CustomFieldDefinitionEntity ("core"."custom_field_definitions")
  - CustomFieldValueEntity ("core"."custom_field_values")
  - ClubEntity ("core"."clubs")
  - ClubMemberEntity ("core"."club_members")
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
class UserEntity(BaseDomainEntity):
    username: str
    password_hash: str
    full_name: str
    email: str | None = None
    phone: str | None = None
    school_id: uuid.UUID | None = None
    first_name: str | None = None
    last_name: str | None = None
    gender_code: str = "MALE"
    date_of_birth: date | None = None
    national_id: str | None = None
    avatar_url: str | None = None
    status_code: str = "ACTIVE"
    failed_login_attempts: int = 0
    locked_until: datetime | None = None
    is_2fa_enabled: bool = False
    two_factor_secret: str | None = None
    last_login_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def is_active(self) -> bool:
        return self.status_code.upper() == "ACTIVE"

    def record_failed_login(self, max_attempts: int = 5) -> bool:
        self.failed_login_attempts += 1
        return self.failed_login_attempts >= max_attempts

    def reset_failed_logins(self) -> None:
        self.failed_login_attempts = 0
        self.locked_until = None


@dataclass
class RoleEntity(BaseDomainEntity):
    code: str
    name: str
    school_id: uuid.UUID | None = None
    description: str | None = None
    badge_color: str = "#2563EB"
    is_system: bool = False
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(cls, name: str, code: str | None = None, is_system: bool = False) -> "RoleEntity":
        generated_code = code or generate_entity_code("R")
        return cls(id=uuid6.uuid7(), code=generated_code, name=name, is_system=is_system)


@dataclass
class PermissionEntity(BaseDomainEntity):
    code: str
    name: str
    group_code: str
    module: str = "CORE"
    description: str | None = None
    is_dangerous: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class RolePermissionEntity(BaseDomainEntity):
    role_id: uuid.UUID
    permission_id: uuid.UUID
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class UserRoleEntity(BaseDomainEntity):
    user_id: uuid.UUID
    role_id: uuid.UUID
    is_primary: bool = False
    effective_from: date = field(default_factory=date.today)
    effective_to: date | None = None
    status: str = "ACTIVE"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def is_valid_on(self, target_date: date) -> bool:
        if self.status != "ACTIVE":
            return False
        if target_date < self.effective_from:
            return False
        if self.effective_to and target_date > self.effective_to:
            return False
        return True


@dataclass
class TeacherEntity(BaseDomainEntity):
    user_id: uuid.UUID
    teacher_code: str
    subject_major: str
    hire_date: date
    department_id: uuid.UUID | None = None
    qualification: str | None = None
    status: str = "ACTIVE"
    is_homeroom: bool = False
    bio: str | None = None
    achievements_summary: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls, user_id: uuid.UUID, subject_major: str, hire_date: date, code: str | None = None
    ) -> "TeacherEntity":
        teacher_code = code or generate_entity_code("T")
        return cls(
            id=uuid6.uuid7(),
            user_id=user_id,
            teacher_code=teacher_code,
            subject_major=subject_major,
            hire_date=hire_date,
        )


@dataclass
class StudentEntity(BaseDomainEntity):
    user_id: uuid.UUID
    student_code: str
    admission_date: date = field(default_factory=date.today)
    school_id: uuid.UUID | None = None
    national_id_number: str | None = None
    national_id_issued_date: date | None = None
    national_id_issued_place: str | None = None
    graduation_date: date | None = None
    ethnicity: str | None = "Kinh"
    religion: str | None = "Không"
    status: str = "STUDYING"
    current_class_id: uuid.UUID | None = None
    birth_place: str | None = None
    permanent_address: str | None = None
    temporary_address: str | None = None
    household_registration_number: str | None = None
    insurance_card_number: str | None = None
    policy_beneficiary: str | None = None
    blood_type: str | None = None
    allergies: str | None = None
    is_boarder: bool = False
    is_pioneer: bool = True
    pioneer_entry_date: date | None = None
    is_union_member: bool = False
    union_entry_date: date | None = None
    special_notes: str | None = None
    custom_attributes: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls, user_id: uuid.UUID, admission_date: date, code: str | None = None
    ) -> "StudentEntity":
        student_code = code or generate_entity_code("HS")
        return cls(
            id=uuid6.uuid7(),
            user_id=user_id,
            student_code=student_code,
            admission_date=admission_date,
        )


@dataclass
class StaffEntity(BaseDomainEntity):
    user_id: uuid.UUID
    staff_code: str
    job_title: str
    department_id: uuid.UUID | None = None
    employment_status: str = "ACTIVE"
    hire_date: date = field(default_factory=date.today)
    qualification: str | None = None
    notes: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class GuardianEntity(BaseDomainEntity):
    user_id: uuid.UUID
    student_id: uuid.UUID
    relationship_type: str = "FATHER"
    is_emergency_contact: bool = True
    occupation: str | None = None
    workplace: str | None = None
    note: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class StudentHealthRecordEntity(BaseDomainEntity):
    student_id: uuid.UUID
    academic_year_id: uuid.UUID | None = None
    checkup_date: date = field(default_factory=date.today)
    height: Decimal | None = None
    weight: Decimal | None = None
    bmi: Decimal | None = None
    vision_left: Decimal | None = None
    vision_right: Decimal | None = None
    hearing: str | None = "GOOD"
    dental_status: str | None = "NORMAL"
    blood_pressure: str | None = None
    heart_rate: int | None = None
    medical_history: str | None = None
    allergies: str | None = None
    chronic_diseases: str | None = None
    vaccination_records: dict[str, Any] = field(default_factory=dict)
    doctor_notes: str | None = None
    health_classification: str = "GRADE_1"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class SchoolClassEntity(BaseDomainEntity):
    academic_year_id: uuid.UUID
    grade_id: uuid.UUID
    code: str
    name: str
    school_id: uuid.UUID | None = None
    room_id: uuid.UUID | None = None
    class_type: str = "STANDARD"
    track_id: uuid.UUID | None = None
    max_capacity: int = 45
    status: str = "ACTIVE"
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def create(
        cls, academic_year_id: uuid.UUID, grade_id: uuid.UUID, name: str, code: str | None = None
    ) -> "SchoolClassEntity":
        class_code = code or generate_entity_code("CLS")
        return cls(
            id=uuid6.uuid7(),
            academic_year_id=academic_year_id,
            grade_id=grade_id,
            code=class_code,
            name=name,
        )


@dataclass
class ClassGroupEntity(BaseDomainEntity):
    class_id: uuid.UUID
    name: str
    order_no: int = 1
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class StudentClassEnrollmentEntity(BaseDomainEntity):
    student_id: uuid.UUID
    class_id: uuid.UUID
    academic_year_id: uuid.UUID | None = None
    enrollment_date: date = field(default_factory=date.today)
    status: str = "ACTIVE"
    transfer_reason: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ClassSubjectTeacherEntity(BaseDomainEntity):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_id: uuid.UUID
    semester_id: uuid.UUID | None = None
    academic_year_id: uuid.UUID | None = None
    is_primary_instructor: bool = True
    weekly_periods_allocated: int = 2
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class PositionAssignmentEntity(BaseDomainEntity):
    position_id: uuid.UUID
    user_id: uuid.UUID
    academic_year_id: uuid.UUID | None = None
    scope_type: str = "CLASS"
    class_id: uuid.UUID | None = None
    grade_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    start_date: date = field(default_factory=date.today)
    end_date: date | None = None
    is_current: bool = True
    appointed_by: uuid.UUID | None = None
    decision_number: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CustomFieldDefinitionEntity(BaseDomainEntity):
    school_id: uuid.UUID
    entity_type: str
    field_code: str
    field_name: str
    field_type: str = "TEXT"
    is_required: bool = False
    is_searchable: bool = False
    is_active: bool = True
    default_value: str | None = None
    allowed_options: list[Any] = field(default_factory=list)
    validation_regex: str | None = None
    display_order: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CustomFieldValueEntity(BaseDomainEntity):
    definition_id: uuid.UUID
    entity_id: uuid.UUID
    field_value: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ClubEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    academic_year_id: uuid.UUID | None = None
    category: str = "ACADEMIC"
    leader_teacher_id: uuid.UUID | None = None
    president_student_id: uuid.UUID | None = None
    description: str | None = None
    max_members: int = 50
    meeting_schedule: str | None = None
    room_id: uuid.UUID | None = None
    is_active: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ClubMemberEntity(BaseDomainEntity):
    club_id: uuid.UUID
    student_id: uuid.UUID
    role_title: str = "MEMBER"
    joined_date: date = field(default_factory=date.today)
    left_date: date | None = None
    status: str = "ACTIVE"
    contribution_notes: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
