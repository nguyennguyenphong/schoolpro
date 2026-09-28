-- =====================================================================
-- TABLE: core.grades (Master Data)
-- High school grade levels (Grade 10, Grade 11, Grade 12)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.grades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code          VARCHAR(10) NOT NULL,              -- E.g. '10', '11', '12'
  name          VARCHAR(50) NOT NULL,              -- E.g. 'Khối 10', 'Khối 11', 'Khối 12'
  order_no      SMALLINT NOT NULL DEFAULT 0,
  supervisor_id UUID,                              -- Will reference core.users(id) once created
  UNIQUE (school_id, code)
);

COMMENT ON TABLE core.grades IS 'Master high school grade tiers (Grade 10, 11, 12) and assigned grade supervisor';
