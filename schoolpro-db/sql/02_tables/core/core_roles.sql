-- =====================================================================
-- TABLE: core.roles
-- Dynamic RBAC security roles with UI custom badges
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(50) NOT NULL UNIQUE,       -- E.g. 'STUDENT', 'TEACHER', 'SUPERVISOR', 'PRINCIPAL'
  name          VARCHAR(150) NOT NULL,             -- E.g. 'Học sinh', 'Giáo viên', 'Giám thị', 'Hiệu trưởng'
  description   TEXT,
  badge_color   VARCHAR(30) DEFAULT '#2563EB',
  icon          VARCHAR(50) DEFAULT 'user',
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.roles IS 'Dynamic role definitions allowing new administrative or student roles at any time';
