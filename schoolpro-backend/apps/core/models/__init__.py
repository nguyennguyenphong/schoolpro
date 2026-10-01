# Export domain models for Django ORM discovery

from .club import Club, ClubMember
from .custom_field import CustomFieldDefinition, CustomFieldValue
from .organization import SchoolClass, ClassGroup, StudentClassEnrollment, ClassSubjectTeacher, PositionAssignment
from .permission import Permission, RolePermission
from .profile import Teacher, Student, Staff, Guardian, StudentHealthRecord
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
