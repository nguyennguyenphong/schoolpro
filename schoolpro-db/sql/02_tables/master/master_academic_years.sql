-- =====================================================================
-- TABLE: core.academic_years (Master Data)
-- School academic fiscal and educational years
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.academic_years (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id         UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code              VARCHAR(20) NOT NULL,              -- E.g. '2026-2027'
  name              VARCHAR(100) NOT NULL,             -- E.g. 'Năm học 2026 - 2027'
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  enrollment_target INT,                               -- Target student admissions headcount
  is_current        BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked         BOOLEAN NOT NULL DEFAULT FALSE,    -- Locked once school year closes
  locked_at         TIMESTAMPTZ,
  locked_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  settings          JSONB DEFAULT '{}'::jsonb,         -- Term weeks plan, opening/closing ceremony dates
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code),
  CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_academic_years_current
  ON core.academic_years (school_id)
  WHERE is_current = TRUE;

COMMENT ON TABLE core.academic_years IS 'Master academic school years with active term indicators and audit locks';
COMMENT ON COLUMN core.academic_years.is_locked IS 'Safety lock preventing modification of archived grades and records after term end';
