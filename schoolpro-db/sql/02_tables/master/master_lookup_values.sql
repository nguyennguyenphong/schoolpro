-- =====================================================================
-- TABLE: core.lookup_values (Master Data)
-- Dynamic lookup items associated with lookup_types
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.lookup_values (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookup_type_id UUID NOT NULL REFERENCES core.lookup_types(id) ON DELETE CASCADE,
  code           VARCHAR(60) NOT NULL,           -- E.g. 'MALE', 'FEMALE', 'KHTN', 'KHXH'
  name           VARCHAR(150) NOT NULL,          -- Display text in Vietnamese/English
  order_no       SMALLINT NOT NULL DEFAULT 0,
  badge_color    VARCHAR(30),                    -- Hex/CSS badge color for UI rendering
  icon           VARCHAR(50),
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  metadata       JSONB DEFAULT '{}'::jsonb,      -- Custom extension properties
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lookup_type_id, code)
);

CREATE INDEX IF NOT EXISTS ix_lookups_type_code ON core.lookup_values(lookup_type_id, code);

COMMENT ON TABLE core.lookup_values IS 'Master dynamic values for lookup dropdowns, badges, and validation rules';
