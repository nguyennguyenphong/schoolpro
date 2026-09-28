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
                    CHECK (category IN ('APPEARANCE', 'LOCALIZATION', 'NOTIFICATIONS', 'ACCESSIBILITY')),
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE sys.settings_definitions IS 'Master registry of customizable application settings and appearance parameters';
