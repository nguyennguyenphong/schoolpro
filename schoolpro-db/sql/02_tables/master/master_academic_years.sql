-- =====================================================================
-- TABLE: core.academic_years (Master Data)
-- School academic fiscal and educational years
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.academic_years (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code          VARCHAR(20) NOT NULL,              -- E.g. '2026-2027'
  name          VARCHAR(100) NOT NULL,             -- E.g. 'Năm học 2026 - 2027'
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_current    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code),
  CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_academic_years_current
  ON core.academic_years (school_id)
  WHERE is_current = TRUE;

COMMENT ON TABLE core.academic_years IS 'Master academic school years with active term indicators';
