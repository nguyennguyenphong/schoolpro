-- =====================================================================
-- TABLE: core.custom_field_definitions
-- Extensible EAV schema definitions for runtime attribute extensions
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.custom_field_definitions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        UUID REFERENCES core.schools(id) ON DELETE CASCADE, -- NULL for system-wide, or school specific
  entity_type      VARCHAR(50) NOT NULL,           -- E.g. 'STUDENT', 'TEACHER', 'CLASS', 'EXAM'
  field_code       VARCHAR(60) NOT NULL,           -- E.g. 'vneid_level2', 'laptop_serial'
  field_label      VARCHAR(150) NOT NULL,          -- Vietnamese/English display label
  data_type        VARCHAR(30) NOT NULL
                     CHECK (data_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'MULTI_SELECT', 'JSON')),
  options          JSONB,                          -- Optional list of choices for SELECT: ["Yes", "No"]
  validation_regex VARCHAR(255),                   -- Regular expression validation rule
  placeholder      VARCHAR(255),                   -- Input placeholder text
  tooltip          TEXT,                           -- UI guidance tooltip
  is_required      BOOLEAN NOT NULL DEFAULT FALSE,
  default_value    TEXT,
  display_order    SMALLINT DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, entity_type, field_code)
);

CREATE INDEX IF NOT EXISTS ix_cf_school_entity ON core.custom_field_definitions(school_id, entity_type);

COMMENT ON TABLE core.custom_field_definitions IS 'Registry for dynamic entity custom fields without altering relational table schemas';
COMMENT ON COLUMN core.custom_field_definitions.validation_regex IS 'Regex pattern used to validate user input for this dynamic field';
