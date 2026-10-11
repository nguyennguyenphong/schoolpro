"""
Celery tasks registry for Academic domain.
"""

from apps.academic.tasks.leave_request_tasks import (
    auto_approve_overdue_leave_requests_task,
    send_leave_request_email_task,
)

__all__ = [
    "auto_approve_overdue_leave_requests_task",
    "send_leave_request_email_task",
]
