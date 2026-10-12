from django.apps import AppConfig


class AcademicConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.academic"
    label = "academic"
    verbose_name = "Academic Affairs"

    def ready(self) -> None:
        from common.asgi_ws_bridge import install_wsgi_websocket_bridge

        install_wsgi_websocket_bridge()
