-- =====================================================================
-- TABLE: academic.periods (Master Data)
-- High school period bell schedules (Periods 1 to 10, Morning & Afternoon)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.periods (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id              UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  period_no              SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 12),
  name                   VARCHAR(100),                                         -- E.g. 'Tiết 1 (Chào cờ)', 'Tiết 2'
  shift                  VARCHAR(10) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON', 'EVENING')),
  start_time             TIME NOT NULL,
  end_time               TIME NOT NULL,
  is_break               BOOLEAN NOT NULL DEFAULT FALSE,                       -- Tiết sinh hoạt / giải lao giữa giờ
  break_duration_minutes SMALLINT NOT NULL DEFAULT 0,                          -- Thời gian giải lao sau tiết (phút)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, period_no, shift)
);

CREATE INDEX IF NOT EXISTS ix_periods_school ON academic.periods(school_id);

COMMENT ON TABLE academic.periods IS 'Master daily bell schedule periods and shift time intervals for high school';
COMMENT ON COLUMN academic.periods.break_duration_minutes IS 'Recess duration following this period before the next bell';
