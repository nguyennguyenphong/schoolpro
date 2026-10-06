"""
Core Domain package.
"""

from apps.core.domains.entities import (
    ClassGroupEntity,
    ClassSubjectTeacherEntity,
    ClubEntity,
    ClubMemberEntity,
    CustomFieldDefinitionEntity,
    CustomFieldValueEntity,
    GuardianEntity,
    PermissionEntity,
    PositionAssignmentEntity,
    RoleEntity,
    RolePermissionEntity,
    SchoolClassEntity,
    StaffEntity,
    StudentClassEnrollmentEntity,
    StudentEntity,
    StudentHealthRecordEntity,
    TeacherEntity,
    UserEntity,
    UserRoleEntity,
)

__all__ = [
    "UserEntity",
    "RoleEntity",
    "PermissionEntity",
    "RolePermissionEntity",
    "UserRoleEntity",
    "TeacherEntity",
    "StudentEntity",
    "StaffEntity",
    "GuardianEntity",
    "StudentHealthRecordEntity",
    "SchoolClassEntity",
    "ClassGroupEntity",
    "StudentClassEnrollmentEntity",
    "ClassSubjectTeacherEntity",
    "PositionAssignmentEntity",
    "CustomFieldDefinitionEntity",
    "CustomFieldValueEntity",
    "ClubEntity",
    "ClubMemberEntity",
]
