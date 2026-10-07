from collections.abc import Callable

import uuid6
from django.http import HttpRequest, HttpResponse

from common.logging_filters import request_id_ctx


class RequestIDMiddleware:
    """
    Middleware that assigns a unique UUID to every incoming HTTP request.
    Appends 'X-Request-ID' to response headers for distributed logging and tracing.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        # Extract existing request ID from reverse proxy or generate new UUID7
        request_id = request.headers.get("X-Request-ID") or str(uuid6.uuid7())
        request.request_id = request_id

        # Bind to logging context
        token = request_id_ctx.set(request_id)
        try:
            response = self.get_response(request)
            response["X-Request-ID"] = request_id
            return response
        finally:
            request_id_ctx.reset(token)
