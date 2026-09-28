-- =====================================================================
-- TABLE: core.subjects (Master Data)
-- Subjects taught according to national curriculum standard (GDPT 2018)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.subjects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  code            VARCHAR(20) NOT NULL,              -- E.g. 'TOAN', 'VAN', 'ANH', 'VAT_LY'
  name            VARCHAR(150) NOT NULL,             -- E.g. 'Toán học', 'Ngữ văn'
  grade_level     SMALLINT CHECK (grade_level IN (10, 11, 12)),
  evaluation_type VARCHAR(20) NOT NULL DEFAULT 'SCORE'
                    CHECK (evaluation_type IN ('SCORE', 'COMMENT')), -- Numeric score or pass/fail qualitative
  is_compulsory   BOOLEAN NOT NULL DEFAULT TRUE,     -- Compulsory vs elective subject track
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB DEFAULT '{}'::jsonb,         -- Periods per year, subject stream, curriculum codes
  UNIQUE (school_id, code)
);

COMMENT ON TABLE core.subjects IS 'Master subjects directory aligned with Vietnamese high school curriculum (GDPT 2018)';
