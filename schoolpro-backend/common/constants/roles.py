from enum import StrEnum


class RoleCode(StrEnum):
    """
    Standard system role identifiers aligned with core_roles.
    """
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    PRINCIPAL = "PRINCIPAL"
    VICE_PRINCIPAL = "VICE_PRINCIPAL"
    DEPT_HEAD = "DEPT_HEAD"
    TEACHER = "TEACHER"
    HOMEROOM_TEACHER = "HOMEROOM_TEACHER"
    STUDENT = "STUDENT"
    GUARDIAN = "GUARDIAN"
    STAFF = "STAFF"
    ACCOUNTANT = "ACCOUNTANT"
    SUPERVISOR = "SUPERVISOR"
