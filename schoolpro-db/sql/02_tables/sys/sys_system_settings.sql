-- =====================================================================
-- TABLE: sys.system_settings
-- Campus and system-wide setting configurations
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.system_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  updated_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, setting_id)
);

COMMENT ON TABLE sys.system_settings IS 'School-wide default configuration parameters';
