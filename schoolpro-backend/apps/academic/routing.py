"""
WebSocket URL routing for Academic domain.
"""

from django.urls import re_path

from apps.academic.consumers import LeaveRequestConsumer

websocket_urlpatterns = [
    re_path(
        r"^ws/academic/leave-requests/?$",
        LeaveRequestConsumer.as_asgi(),
    ),
]
