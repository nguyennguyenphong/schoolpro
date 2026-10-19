"""
Celery background tasks for Academic Student Leave Requests.
Handles:
- Scheduled and periodic 3-hour pre-lesson automatic approval checks
- Asynchronous SMTP email notifications with retry backoff
"""

import logging
from typing import Any

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from apps.academic.models.attendance import LeaveRequest
from apps.academic.services.leave_request_service import LeaveRequestService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_leave_request_email_task(
    self: Any,
    subject: str,
    plain_body: str,
    recipient_list: list[str],
    html_body: str | None = None,
) -> dict[str, Any]:
    """
    Dispatches leave request notification emails via Celery worker with exponential retry.
    """
    valid_recipients = [
        r.strip() for r in recipient_list if r and "@" in r and not r.endswith(".local")
    ]
    if not valid_recipients:
        return {"status": "skipped", "reason": "no_valid_recipients"}

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or getattr(
        settings, "EMAIL_HOST_USER", "noreply@schoolpro.edu.vn"
    )

    try:
        send_mail(
            subject=subject,
            message=plain_body,
            from_email=from_email,
            recipient_list=valid_recipients,
            html_message=html_body,
            fail_silently=False,
        )
        logger.info("Sent leave request email '%s' to %s", subject, valid_recipients)
        return {"status": "sent", "recipients": valid_recipients}
    except Exception as exc:
        logger.warning("Failed sending leave request email to %s: %s", valid_recipients, exc)
        raise self.retry(exc=exc, countdown=30 * (2**self.request.retries)) from exc


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def auto_approve_overdue_leave_requests_task(
    self: Any,
    leave_request_id: str | None = None,
) -> dict[str, Any]:
    """
    Periodically or on-deadline evaluates pending leave requests:
    - Automatically approves requests whose 3-hour continuous processing deadline has expired (BR-01 / BR-03).
    - Dispatches 30-minute approaching deadline reminders to Homeroom Teachers.
    """
    try:
        qs = None
        if leave_request_id:
            qs = LeaveRequest.objects.filter(id=leave_request_id, status="PENDING")
        approved_count = LeaveRequestService.check_and_auto_approve_overdue_requests(qs=qs)

        reminder_count = 0
        if not leave_request_id:
            reminder_count = LeaveRequestService.check_and_send_deadline_reminders()

        return {
            "status": "success",
            "auto_approved_count": approved_count,
            "reminders_sent": reminder_count,
            "leave_request_id": leave_request_id,
        }
    except Exception as exc:
        logger.error("Error in auto_approve_overdue_leave_requests_task: %s", exc, exc_info=True)
        raise self.retry(exc=exc, countdown=60) from exc
