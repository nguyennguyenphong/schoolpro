import logging
from contextvars import ContextVar

# ContextVar to store request_id per async/thread execution context
request_id_ctx: ContextVar[str] = ContextVar("request_id_ctx", default="-")


class RequestIDFilter(logging.Filter):
    """
    Logging filter that injects `request_id` into LogRecord.
    If no request_id is in context, defaults to '-'.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get("-")
        return True
