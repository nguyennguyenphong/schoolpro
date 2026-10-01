import os

env = os.environ.get("DJANGO_ENV", "development").lower()

if env == "production":
    from config.settings.production import *
elif env == "staging":
    from config.settings.staging import *
elif env == "testing":
    from config.settings.testing import *
else:
    from config.settings.development import *
