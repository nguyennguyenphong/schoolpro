import environ

from config.settings.base import *

env = environ.Env()

DEBUG = False
SECRET_KEY = "django-insecure-schoolpro-testing-secret-key"

ALLOWED_HOSTS = ["*"]

# Fast password hasher for test suite performance
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# In-memory database for fast test execution
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# In-memory cache for tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Celery in-memory/eager execution for testing
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Disable rate limiting / lockout during tests
AXES_ENABLED = False
