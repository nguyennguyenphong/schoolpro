-- =====================================================================
-- TABLE: core.permissions
-- Granular security operation codes
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(100) NOT NULL UNIQUE,      -- E.g. 'TIMETABLE_VIEW', 'GRADE_EDIT'
  name          VARCHAR(255) NOT NULL,
  group_code    VARCHAR(50) NOT NULL,              -- E.g. 'ACADEMIC', 'EMULATION', 'EVALUATION', 'SYSTEM'
  module        VARCHAR(50) NOT NULL DEFAULT 'CORE',-- Subsystem module
  description   TEXT,
  is_dangerous  BOOLEAN NOT NULL DEFAULT FALSE,    -- Critical / destructive permission flag
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_permissions_group ON core.permissions(group_code);
CREATE INDEX IF NOT EXISTS ix_permissions_module ON core.permissions(module);

COMMENT ON TABLE core.permissions IS 'Atomic permission privileges for endpoint and UI access control';
COMMENT ON COLUMN core.permissions.is_dangerous IS 'Flag requiring elevated confirmation or 2FA for sensitive destructive actions';
