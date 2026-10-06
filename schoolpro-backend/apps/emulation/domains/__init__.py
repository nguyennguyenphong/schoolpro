"""
Emulation Domain package.
"""

from apps.emulation.domains.entities import (
    ClassCustomCriteriaEntity,
    CriteriaEntity,
    DisciplinaryRecordEntity,
    EmulationAwardEntity,
    EmulationPeriodEntity,
    EmulationRankingEntity,
    EmulationRecordEntity,
    SupervisorDutyLogEntity,
)

__all__ = [
    "CriteriaEntity",
    "ClassCustomCriteriaEntity",
    "EmulationPeriodEntity",
    "EmulationRecordEntity",
    "EmulationRankingEntity",
    "SupervisorDutyLogEntity",
    "EmulationAwardEntity",
    "DisciplinaryRecordEntity",
]
