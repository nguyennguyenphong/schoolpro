-- =====================================================================
-- TABLE: notification.push_tokens
-- Mobile and web push notification device registry (FCM / APNs)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  device_token    TEXT NOT NULL UNIQUE,
  platform        VARCHAR(20) CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notification.push_tokens IS 'Registered FCM/APNs push notification endpoints per device';
