-- =====================================================================
-- TABLE: core.grades (Master Data)
-- High school grade levels (Grade 10, Grade 11, Grade 12)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.grades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code            VARCHAR(10) NOT NULL,              -- E.g. '10', '11', '12'
  name            VARCHAR(50) NOT NULL,              -- E.g. 'Khối 10', 'Khối 11', 'Khối 12'
  order_no        SMALLINT NOT NULL DEFAULT 0,
  supervisor_id   UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Giám thị phụ trách khối
  head_teacher_id UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Khối trưởng chủ nhiệm
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS ix_grades_school ON core.grades(school_id);

COMMENT ON TABLE core.grades IS 'Master high school grade tiers (Grade 10, 11, 12) and assigned grade supervisor';
COMMENT ON COLUMN core.grades.head_teacher_id IS 'Lead homeroom advisor overseeing all classrooms within this grade';
