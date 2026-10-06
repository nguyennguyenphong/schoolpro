-- =====================================================================
-- TABLE: notification.push_tokens
-- Mobile and web push notification device registry (FCM / APNs)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  device_token    TEXT NOT NULL UNIQUE,
  device_id       VARCHAR(100),                        -- Hardware device identifier
  device_name     VARCHAR(150),                        -- E.g. 'iPhone 15 Pro', 'Galaxy S24'
  os_version      VARCHAR(50),                         -- iOS 18.2, Android 15
  app_version     VARCHAR(30),                         -- SchoolPro mobile app version
  platform        VARCHAR(20) CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,       -- Inactivated if FCM returns Unregistered
  last_used_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_push_tokens_user ON notification.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_push_tokens_active ON notification.push_tokens(user_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE notification.push_tokens IS 'Registered FCM/APNs push notification endpoints per device';
COMMENT ON COLUMN notification.push_tokens.is_active IS 'Stale device token flag toggled upon provider delivery drop';
