import os

import environ

from config.settings.base import *

env = environ.Env()

DEBUG = True
SECRET_KEY = env(
    "SECRET_KEY",
    default="django-insecure-schoolpro-dev-secret-key-change-in-production-12345",
)

ALLOWED_HOSTS = ["*"]

# CORS settings for development (Frontend at localhost:5173)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# CSRF settings for development
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

# Database: Uses DATABASE_URL if provided, else falls back to SQLite for easy local dev
if "DATABASE_URL" in os.environ:
    DATABASES = {"default": env.db_url("DATABASE_URL")}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Celery local memory or redis fallback
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://localhost:6379/0")

# Axes configuration in dev
AXES_ENABLED = False
