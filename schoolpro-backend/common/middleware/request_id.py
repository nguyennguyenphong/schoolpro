import uuid
from collections.abc import Callable

from django.http import HttpRequest, HttpResponse


class RequestIDMiddleware:
    """
    Middleware that assigns a unique UUID to every incoming HTTP request.
    Appends 'X-Request-ID' to response headers for distributed logging and tracing.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        # Extract existing request ID from reverse proxy or generate new UUID4
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.request_id = request_id

        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response
