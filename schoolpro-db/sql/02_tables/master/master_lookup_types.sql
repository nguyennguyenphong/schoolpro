-- =====================================================================
-- TABLE: core.lookup_types (Master Data)
-- Dynamic lookup catalog definitions avoiding rigid physical ENUMs
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.lookup_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'GENDER', 'ACCOUNT_STATUS', 'ROOM_TYPE', 'CLASS_STREAM'
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT TRUE,     -- System categories cannot be deleted by users
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.lookup_types IS 'Master definition table for dynamic extensible enum categories';
COMMENT ON COLUMN core.lookup_types.code IS 'Unique alphanumeric code for lookup category';
COMMENT ON COLUMN core.lookup_types.is_system IS 'Protection flag preventing accidental removal of core system categories';
