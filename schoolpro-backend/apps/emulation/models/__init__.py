# Export domain models for Django ORM discovery

from .award import EmulationAward
from .criteria import Criteria, ClassCustomCriteria
from .disciplinary import DisciplinaryRecord
from .duty_log import SupervisorDutyLog
from .period import EmulationPeriod
from .ranking import EmulationRanking
from .record import EmulationRecord

__all__ = [
    "EmulationAward",
    "Criteria",
    "ClassCustomCriteria",
    "DisciplinaryRecord",
    "SupervisorDutyLog",
    "EmulationPeriod",
    "EmulationRanking",
    "EmulationRecord",
]
