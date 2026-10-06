-- =====================================================================
-- TABLE: core.roles
-- Dynamic RBAC security roles with UI custom badges
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID REFERENCES core.schools(id) ON DELETE CASCADE, -- NULL for system-wide roles, populated for school-specific roles
  code          VARCHAR(50) NOT NULL UNIQUE,       -- E.g. 'STUDENT', 'TEACHER', 'SUPERVISOR', 'PRINCIPAL'
  name          VARCHAR(150) NOT NULL,             -- E.g. 'Học sinh', 'Giáo viên', 'Giám thị', 'Hiệu trưởng'
  description   TEXT,
  badge_color   VARCHAR(30) DEFAULT '#2563EB',
  icon          VARCHAR(50) DEFAULT 'user',
  priority      SMALLINT NOT NULL DEFAULT 0,       -- Permission precedence level
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_roles_school ON core.roles(school_id);
CREATE INDEX IF NOT EXISTS ix_roles_priority ON core.roles(priority);

COMMENT ON TABLE core.roles IS 'Dynamic role definitions allowing new administrative or student roles at any time';
COMMENT ON COLUMN core.roles.school_id IS 'Tenant school ID for custom localized school roles; NULL for global roles';
