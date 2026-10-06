-- =====================================================================
-- TABLE: core.lookup_types (Master Data)
-- Dynamic lookup catalog definitions avoiding rigid physical ENUMs
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.lookup_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES core.schools(id) ON DELETE CASCADE, -- NULL for system-wide lookup types
  code            VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'GENDER', 'ACCOUNT_STATUS', 'ROOM_TYPE', 'CLASS_STREAM'
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  is_hierarchical BOOLEAN NOT NULL DEFAULT FALSE,    -- Supports tree parent-child taxonomy
  is_system       BOOLEAN NOT NULL DEFAULT TRUE,     -- System categories cannot be deleted by users
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_lookup_types_school ON core.lookup_types(school_id);

COMMENT ON TABLE core.lookup_types IS 'Master definition table for dynamic extensible enum categories';
COMMENT ON COLUMN core.lookup_types.code IS 'Unique alphanumeric code for lookup category';
COMMENT ON COLUMN core.lookup_types.is_hierarchical IS 'Tree structure flag enabling multi-tier lookup relations';
