"""
Service layer for Exam Proctoring and Anti-Cheat Event Logging domain.
Provides capabilities to:
- Log online exam milestones (start, autosave, submission)
- Record anti-cheat violation signals (tab switch, window blur, webcam defocus)
- Increment violation counter on ExamSubmission
"""

import logging
from typing import Any
from uuid import UUID

from django.db import transaction
from django.db.models import F

from apps.academic.models.exam import Exam, ExamEventLog, ExamSubmission
from apps.core.models.user import User

logger = logging.getLogger(__name__)


class ExamEventLogService:
    """
    Business service handling exam event telemetry and proctor incident logging.
    """

    @classmethod
    @transaction.atomic
    def log_event(
        cls,
        exam_id: UUID,
        event_type: str,
        title: str,
        actor: User | None = None,
        submission_id: UUID | None = None,
        student_id: UUID | None = None,
        description: str = "",
        severity: str = "INFO",
        metadata: dict[str, Any] | None = None,
    ) -> ExamEventLog:
        """
        Record an exam telemetry or proctor event.
        If severity is 'VIOLATION' and submission_id is present, automatically increments violation_count.
        """
        # Ensure exam exists
        exam = Exam.objects.get(id=exam_id)

        # If student_id is not given but submission_id is, deduce student_id
        if submission_id and not student_id:
            sub = ExamSubmission.objects.filter(id=submission_id).first()
            if sub:
                student_id = sub.student_id

        event_log = ExamEventLog.objects.create(
            exam=exam,
            submission_id=submission_id,
            student_id=student_id,
            actor=actor,
            event_type=event_type,
            title=title,
            description=description,
            severity=severity,
            metadata=metadata or {},
        )

        # If violation detected, increment violation counter on submission
        if severity == "VIOLATION" and submission_id:
            ExamSubmission.objects.filter(id=submission_id).update(
                violation_count=F("violation_count") + 1
            )
            logger.warning(
                "Violation logged for submission %s: %s (%s)",
                submission_id,
                title,
                event_type,
            )

        return event_log
