"""
Global Signals for SchoolPro.
Auto-generates 12-digit unique random numeric codes across all business entities
whenever code is omitted by the admin, while strictly preserving manual admin input.
"""

import logging
from typing import Any

from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver

from common.utils.code_generator import generate_unique_code

logger = logging.getLogger(__name__)

# Registered entity models and their designated code fields
ENTITY_CODE_FIELDS_BY_MODEL: dict[str, str] = {
    # Master Domain
    "master.school": "code",
    "master.academicyear": "code",
    "master.semester": "code",
    "master.grade": "code",
    "master.department": "code",
    "master.subject": "code",
    "master.position": "code",
    "master.lookuptype": "code",
    "master.lookupvalue": "code",
    # Core Domain
    "core.role": "code",
    "core.permission": "code",
    "core.schoolclass": "code",
    "core.classgroup": "code",
    "core.club": "code",
    "core.customfielddefinition": "field_code",
    "core.teacher": "teacher_code",
    "core.student": "student_code",
    "core.staff": "staff_code",
    # Academic Domain
    "academic.room": "code",
    "academic.period": "code",
    "academic.curriculumtrack": "code",
    "academic.questionbank": "code",
    "academic.scoretype": "code",
    "academic.feeitem": "code",
    "academic.studentfeebill": "bill_code",
    # Emulation Domain
    "emulation.criteria": "code",
    "emulation.classcustomcriteria": "code",
    "emulation.emulationperiod": "code",
    "emulation.emulationaward": "code",
    "emulation.achievementcertificate": "certificate_code",
    # Evaluation Domain
    "evaluation.evaluationform": "code",
    "evaluation.facility": "code",
    "evaluation.facilityincidentreport": "ticket_code",
    # Notification Domain
    "notification.contactbooknote": "code",
    # System Domain
    "system.module": "code",
    "system.settingsdefinition": "code",
    "system.exporttemplate": "code",
}


@receiver(pre_save)
def auto_generate_entity_code(sender: Any, instance: Any, **kwargs: Any) -> None:
    """
    Pre-save hook to generate 12-digit unique random numeric code if code is not provided.
    If code is provided by admin or API caller, that value is preserved.
    """
    model_key = sender._meta.label_lower
    field_name = ENTITY_CODE_FIELDS_BY_MODEL.get(model_key)

    if not field_name:
        # Check if the model has a standalone 'code' field of type CharField
        if hasattr(instance, "code"):
            try:
                field = sender._meta.get_field("code")
                if isinstance(field, models.CharField):
                    field_name = "code"
            except Exception:
                return
        else:
            return

    current_val = getattr(instance, field_name, None)
    # If empty or blank string, generate a unique 12-digit code
    if current_val is None or str(current_val).strip() == "":
        unique_code = generate_unique_code(sender, field_name=field_name, length=12)
        setattr(instance, field_name, unique_code)
        logger.debug(
            "Auto-generated 12-digit code for %s.%s: %s",
            model_key,
            field_name,
            unique_code,
        )
