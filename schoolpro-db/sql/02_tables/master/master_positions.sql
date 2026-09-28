-- =====================================================================
-- TABLE: core.positions (Master Data)
-- Organizational position titles across school, classes, and groups
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.positions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'HOMEROOM_TEACHER', 'CLASS_MONITOR'
  name          VARCHAR(150) NOT NULL,             -- E.g. 'Giáo viên chủ nhiệm', 'Lớp trưởng'
  scope_type    core.scope_type_enum NOT NULL,     -- 'CLASS', 'GROUP', 'GRADE', 'SCHOOL', 'DEPARTMENT'
  applicable_role_id UUID REFERENCES core.roles(id) ON DELETE SET NULL,
  max_holders   SMALLINT,                          -- E.g. Homeroom teacher = 1, Class monitor = 1
  is_leadership BOOLEAN NOT NULL DEFAULT FALSE,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE core.positions IS 'Master catalog of positions held by teachers, staff, or students across organizational scopes';
