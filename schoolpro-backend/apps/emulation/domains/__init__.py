"""
Emulation Domain package.
"""

from apps.emulation.domains.entities import (
    AchievementCertificateEntity,
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
    "AchievementCertificateEntity",
    "CriteriaEntity",
    "ClassCustomCriteriaEntity",
    "EmulationPeriodEntity",
    "EmulationRecordEntity",
    "EmulationRankingEntity",
    "SupervisorDutyLogEntity",
    "EmulationAwardEntity",
    "DisciplinaryRecordEntity",
]
