# Export domain models for Django ORM discovery

from .achievement_certificate import AchievementCertificate
from .award import EmulationAward
from .criteria import ClassCustomCriteria, Criteria
from .disciplinary import DisciplinaryRecord
from .duty_log import SupervisorDutyLog
from .period import EmulationPeriod
from .ranking import EmulationRanking
from .record import EmulationRecord

__all__ = [
    "AchievementCertificate",
    "EmulationAward",
    "Criteria",
    "ClassCustomCriteria",
    "DisciplinaryRecord",
    "SupervisorDutyLog",
    "EmulationPeriod",
    "EmulationRanking",
    "EmulationRecord",
]
