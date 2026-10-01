# Export domain models for Django ORM discovery

from .club import Club, ClubMember
from .custom_field import CustomFieldDefinition, CustomFieldValue
from .organization import (
    ClassGroup,
    ClassSubjectTeacher,
    PositionAssignment,
    SchoolClass,
    StudentClassEnrollment,
)
from .permission import Permission, RolePermission
from .profile import Guardian, Staff, Student, StudentHealthRecord, Teacher
from .role import Role, UserRole
from .user import User

__all__ = [
    "Club",
    "ClubMember",
    "CustomFieldDefinition",
    "CustomFieldValue",
    "SchoolClass",
    "ClassGroup",
    "StudentClassEnrollment",
    "ClassSubjectTeacher",
    "PositionAssignment",
    "Permission",
    "RolePermission",
    "Teacher",
    "Student",
    "Staff",
    "Guardian",
    "StudentHealthRecord",
    "Role",
    "UserRole",
    "User",
]
