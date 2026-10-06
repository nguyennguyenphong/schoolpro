-- =====================================================================
-- TABLE: sys.settings_definitions (Master Data)
-- Dynamic system and user settings catalog definitions
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.settings_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(80) NOT NULL UNIQUE,       -- E.g. 'theme', 'primary_color', 'date_format'
  name            VARCHAR(150) NOT NULL,
  data_type       VARCHAR(20) NOT NULL
                    CHECK (data_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'COLOR', 'ENUM')),
  default_value   TEXT NOT NULL,
  allowed_values  JSONB,
  scope           VARCHAR(20) NOT NULL DEFAULT 'USER'
                    CHECK (scope IN ('SYSTEM', 'SCHOOL', 'ROLE', 'USER')),
  category        VARCHAR(50) DEFAULT 'APPEARANCE'
                    CHECK (category IN ('APPEARANCE', 'LOCALIZATION', 'NOTIFICATIONS', 'ACCESSIBILITY', 'SECURITY')),
  ui_component    VARCHAR(50) NOT NULL DEFAULT 'INPUT'
                    CHECK (ui_component IN ('INPUT', 'SWITCH', 'SELECT', 'COLOR_PICKER', 'TEXTAREA', 'CODE_EDITOR')),
  display_order   SMALLINT NOT NULL DEFAULT 0,
  validation_rule VARCHAR(255),
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_settings_def_scope ON sys.settings_definitions(scope);
CREATE INDEX IF NOT EXISTS ix_settings_def_cat ON sys.settings_definitions(category);

COMMENT ON TABLE sys.settings_definitions IS 'Master registry of customizable application settings and appearance parameters';
COMMENT ON COLUMN sys.settings_definitions.ui_component IS 'Specific UI input widget used to render this setting field';
