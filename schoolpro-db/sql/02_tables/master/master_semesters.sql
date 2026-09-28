-- =====================================================================
-- TABLE: core.semesters (Master Data)
-- School semesters / academic terms within an academic year
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.semesters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id  UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  code              VARCHAR(20) NOT NULL,          -- E.g. 'HK1', 'HK2', 'HE'
  name              VARCHAR(100) NOT NULL,         -- E.g. 'Học kỳ 1', 'Học kỳ 2'
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  is_current        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, code),
  CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_semesters_current
  ON core.semesters (academic_year_id)
  WHERE is_current = TRUE;

COMMENT ON TABLE core.semesters IS 'Master academic semesters (Term 1, Term 2, Summer) with date boundaries';
