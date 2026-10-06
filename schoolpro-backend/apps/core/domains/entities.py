"""
Core Domain Entities encapsulating Identity, RBAC, Profiles, and Organization invariants.
Covers:
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

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any
import uuid

from common.models.domain import BaseDomainEntity
from common.utils.code_generator import generate_entity_code


@dataclass
class UserEntity(BaseDomainEntity):
    username: str
    email: str | None
    phone: str | None
    password_hash: str
    full_name: str
    status_code: str = "ACTIVE"
    school_id: uuid.UUID | None = None
    first_name: str | None = None
    last_name: str | None = None
    gender_code: str = "MALE"
    date_of_birth: date | None = None
    national_id: str | None = None
    failed_login_attempts: int = 0
    locked_until: datetime | None = None
    is_2fa_enabled: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)

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
    description: str | None = None
    badge_color: str = "#2563EB"
    icon: str = "user"
    is_system: bool = False
    is_active: bool = True
    school_id: uuid.UUID | None = None

    @classmethod
    def create(cls, name: str, code: str | None = None, is_system: bool = False) -> "RoleEntity":
        generated_code = code or generate_entity_code("R")
        return cls(id=uuid.uuid4(), code=generated_code, name=name, is_system=is_system)


@dataclass
class PermissionEntity(BaseDomainEntity):
    code: str
    name: str
    group_code: str
    module: str = "CORE"
    description: str | None = None
    is_dangerous: bool = False


@dataclass
class RolePermissionEntity(BaseDomainEntity):
    role_id: uuid.UUID
    permission_id: uuid.UUID


@dataclass
class UserRoleEntity(BaseDomainEntity):
    user_id: uuid.UUID
    role_id: uuid.UUID
    is_primary: bool = False
    effective_from: date = field(default_factory=date.today)
    effective_to: date | None = None
    status: str = "ACTIVE"

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

    @classmethod
    def create(cls, user_id: uuid.UUID, subject_major: str, hire_date: date, code: str | None = None) -> "TeacherEntity":
        teacher_code = code or generate_entity_code("T")
        return cls(
            id=uuid.uuid4(),
            user_id=user_id,
            teacher_code=teacher_code,
            subject_major=subject_major,
            hire_date=hire_date,
        )


@dataclass
class StudentEntity(BaseDomainEntity):
    user_id: uuid.UUID
    student_code: str
    admission_date: date
    current_class_id: uuid.UUID | None = None
    status: str = "STUDYING"
    graduation_date: date | None = None
    ethnicity: str | None = None
    religion: str | None = None
    birth_place: str | None = None
    is_boarder: bool = False

    @classmethod
    def create(cls, user_id: uuid.UUID, admission_date: date, code: str | None = None) -> "StudentEntity":
        student_code = code or generate_entity_code("HS")
        return cls(
            id=uuid.uuid4(),
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
    hire_date: date = field(default_factory=date.today)
    status: str = "ACTIVE"


@dataclass
class GuardianEntity(BaseDomainEntity):
    user_id: uuid.UUID
    student_id: uuid.UUID
    relationship: str
    is_primary_contact: bool = True
    can_pickup: bool = True


@dataclass
class StudentHealthRecordEntity(BaseDomainEntity):
    student_id: uuid.UUID
    blood_type: str | None = None
    allergies: str | None = None
    chronic_conditions: str | None = None
    vision_left: float | None = None
    vision_right: float | None = None


@dataclass
class SchoolClassEntity(BaseDomainEntity):
    academic_year_id: uuid.UUID
    grade_id: uuid.UUID
    code: str
    name: str
    room_name: str | None = None
    class_stream_code: str = "KHTN"
    max_students: int = 45

    @classmethod
    def create(cls, academic_year_id: uuid.UUID, grade_id: uuid.UUID, name: str, code: str | None = None) -> "SchoolClassEntity":
        class_code = code or generate_entity_code("CLS")
        return cls(
            id=uuid.uuid4(),
            academic_year_id=academic_year_id,
            grade_id=grade_id,
            code=class_code,
            name=name,
        )


@dataclass
class ClassGroupEntity(BaseDomainEntity):
    class_id: uuid.UUID
    code: str
    name: str
    order_no: int = 1


@dataclass
class StudentClassEnrollmentEntity(BaseDomainEntity):
    student_id: uuid.UUID
    class_id: uuid.UUID
    enrollment_date: date
    status: str = "ACTIVE"


@dataclass
class ClassSubjectTeacherEntity(BaseDomainEntity):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_id: uuid.UUID
    role_type: str = "SUBJECT_TEACHER"
    academic_year_id: uuid.UUID | None = None


@dataclass
class PositionAssignmentEntity(BaseDomainEntity):
    position_id: uuid.UUID
    user_id: uuid.UUID
    scope_id: uuid.UUID
    assigned_date: date = field(default_factory=date.today)
    is_active: bool = True


@dataclass
class CustomFieldDefinitionEntity(BaseDomainEntity):
    entity_type: str
    field_code: str
    field_label: str
    data_type: str
    is_required: bool = False
    options: list[str] | None = None


@dataclass
class CustomFieldValueEntity(BaseDomainEntity):
    field_id: uuid.UUID
    entity_id: uuid.UUID
    field_value: str | None = None
    json_value: dict[str, Any] | None = None


@dataclass
class ClubEntity(BaseDomainEntity):
    school_id: uuid.UUID
    code: str
    name: str
    category: str = "ACADEMIC"
    leader_teacher_id: uuid.UUID | None = None
    is_active: bool = True


@dataclass
class ClubMemberEntity(BaseDomainEntity):
    club_id: uuid.UUID
    student_id: uuid.UUID
    role: str = "MEMBER"
    joined_date: date = field(default_factory=date.today)
    is_active: bool = True
