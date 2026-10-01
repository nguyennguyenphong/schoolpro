# Export domain models for Django ORM discovery

from .activity import ActivityParticipation, ExtracurricularActivity
from .assignment import Assignment, AssignmentSubmission
from .attendance import Attendance
from .curriculum import CurriculumTrack, CurriculumTrackSubject, StudentTrackEnrollment
from .exam import Exam, ExamQuestion, ExamSubmission, ExamSubmissionAnswer, QuestionBank
from .fee import FeeItem, StudentFeeBill
from .grading import (
    ConductEvaluation,
    ReportCard,
    ScoreType,
    StudentScore,
    StudentTermSummary,
    SubjectExemption,
)
from .infrastructure import Period, Room
from .journal import ClassJournalEntry
from .material import CurriculumMaterial, MaterialAttachment
from .timetable import Timetable, TimetableChange

__all__ = [
    "ExtracurricularActivity",
    "ActivityParticipation",
    "Assignment",
    "AssignmentSubmission",
    "Attendance",
    "CurriculumTrack",
    "CurriculumTrackSubject",
    "StudentTrackEnrollment",
    "Exam",
    "ExamQuestion",
    "ExamSubmission",
    "ExamSubmissionAnswer",
    "QuestionBank",
    "FeeItem",
    "StudentFeeBill",
    "ScoreType",
    "ConductEvaluation",
    "SubjectExemption",
    "StudentScore",
    "StudentTermSummary",
    "ReportCard",
    "Room",
    "Period",
    "ClassJournalEntry",
    "CurriculumMaterial",
    "MaterialAttachment",
    "Timetable",
    "TimetableChange",
]
