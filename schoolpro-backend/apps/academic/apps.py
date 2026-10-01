from django.apps import AppConfig


class AcademicConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.academic"
    label = "academic"
    verbose_name = "Academic Affairs"
