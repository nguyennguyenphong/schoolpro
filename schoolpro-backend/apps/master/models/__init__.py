# Export domain models for Django ORM discovery

from .academic_year import AcademicYear
from .department import Department
from .grade import Grade
from .lookup import LookupType, LookupValue
from .position import Position
from .school import School
from .semester import Semester
from .subject import Subject

__all__ = [
    "AcademicYear",
    "Department",
    "Grade",
    "LookupType",
    "LookupValue",
    "Position",
    "School",
    "Semester",
    "Subject",
]
