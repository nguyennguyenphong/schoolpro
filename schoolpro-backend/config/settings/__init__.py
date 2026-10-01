import os

env = os.environ.get("DJANGO_ENV", "development").lower()

if env == "production":
    from config.settings.production import *  # noqa: F403
elif env == "staging":
    from config.settings.staging import *  # noqa: F403
elif env == "testing":
    from config.settings.testing import *  # noqa: F403
else:
    from config.settings.development import *  # noqa: F403
