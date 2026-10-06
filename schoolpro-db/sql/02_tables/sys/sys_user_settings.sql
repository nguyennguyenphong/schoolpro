-- =====================================================================
-- TABLE: sys.user_settings
-- Personalized user preferences overriding role and system defaults
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.user_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, setting_id)
);

CREATE INDEX IF NOT EXISTS ix_user_settings_user ON sys.user_settings(user_id);

COMMENT ON TABLE sys.user_settings IS 'Top-priority user personalized setting values (theme, color, date format, notifications)';
