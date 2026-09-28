-- =====================================================================
-- TABLE: sys.role_settings_defaults
-- Default setting overrides defined at the role level
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.role_settings_defaults (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  UNIQUE (role_id, setting_id)
);

COMMENT ON TABLE sys.role_settings_defaults IS 'Default setting values automatically inherited by members of a specific role';
