-- =====================================================================
-- TABLE: academic.periods (Master Data)
-- High school period bell schedules (Periods 1 to 10, Morning & Afternoon)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  period_no     SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 12),
  shift         VARCHAR(10) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON', 'EVENING')),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  UNIQUE (school_id, period_no, shift)
);

COMMENT ON TABLE academic.periods IS 'Master daily bell schedule periods and shift time intervals for high school';
