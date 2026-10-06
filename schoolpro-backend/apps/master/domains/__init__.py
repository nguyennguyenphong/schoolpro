"""
Master Domain package.
"""

from apps.master.domains.entities import (
    AcademicYearEntity,
    DepartmentEntity,
    GradeEntity,
    LookupTypeEntity,
    LookupValueEntity,
    PositionEntity,
    SchoolEntity,
    SemesterEntity,
    SubjectEntity,
)

__all__ = [
    "SchoolEntity",
    "AcademicYearEntity",
    "SemesterEntity",
    "GradeEntity",
    "DepartmentEntity",
    "SubjectEntity",
    "PositionEntity",
    "LookupTypeEntity",
    "LookupValueEntity",
]
