import os
from config.settings.base import *  # noqa: F403

DEBUG = True
SECRET_KEY = os.environ.get(
    "SECRET_KEY", "django-insecure-schoolpro-dev-secret-key-change-in-production-12345"
)

ALLOWED_HOSTS = ["*"]

# CORS settings for development (Frontend at localhost:5173)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Database SQLite fallback for fast local development or PostgreSQL if configured
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

# Celery local memory or redis fallback
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Axes configuration in dev
AXES_ENABLED = False
