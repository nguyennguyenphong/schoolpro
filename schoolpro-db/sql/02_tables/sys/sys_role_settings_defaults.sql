-- =====================================================================
-- TABLE: sys.role_settings_defaults
-- Default setting overrides defined at the role level
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.role_settings_defaults (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES core.schools(id) ON DELETE CASCADE, -- NULL for system-wide defaults
  role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  is_enforced     BOOLEAN NOT NULL DEFAULT FALSE,                     -- If TRUE, users cannot override this policy
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, role_id, setting_id)
);

CREATE INDEX IF NOT EXISTS ix_role_settings_role ON sys.role_settings_defaults(role_id);
CREATE INDEX IF NOT EXISTS ix_role_settings_school ON sys.role_settings_defaults(school_id);

COMMENT ON TABLE sys.role_settings_defaults IS 'Default setting values automatically inherited by members of a specific role';
COMMENT ON COLUMN sys.role_settings_defaults.is_enforced IS 'Policy enforcement lock restricting individual user customization';
