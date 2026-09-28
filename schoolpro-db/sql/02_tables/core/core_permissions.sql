-- =====================================================================
-- TABLE: core.permissions
-- Granular security operation codes
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(100) NOT NULL UNIQUE,      -- E.g. 'TIMETABLE_VIEW', 'GRADE_EDIT'
  name          VARCHAR(255) NOT NULL,
  group_code    VARCHAR(50) NOT NULL,              -- E.g. 'ACADEMIC', 'EMULATION', 'EVALUATION', 'SYSTEM'
  description   TEXT
);

COMMENT ON TABLE core.permissions IS 'Atomic permission privileges for endpoint and UI access control';
