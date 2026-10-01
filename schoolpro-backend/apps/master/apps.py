from django.apps import AppConfig


class MasterConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.master"
    label = "master"
    verbose_name = "Master Reference Data"
