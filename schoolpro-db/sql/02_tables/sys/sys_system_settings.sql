-- =====================================================================
-- TABLE: sys.system_settings
-- Campus and system-wide setting configurations
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.system_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,                     -- Exposed to unauthenticated clients
  description     TEXT,
  updated_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, setting_id)
);

CREATE INDEX IF NOT EXISTS ix_sys_settings_public ON sys.system_settings(school_id, is_public) WHERE is_public = TRUE;

COMMENT ON TABLE sys.system_settings IS 'School-wide default configuration parameters';
COMMENT ON COLUMN sys.system_settings.is_public IS 'Public accessibility flag for anonymous branding assets';
