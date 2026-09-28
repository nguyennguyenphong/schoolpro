-- =====================================================================
-- TABLE: emulation.supervisor_duty_logs
-- Daily school gate / classroom inspection rounds conducted by supervisors
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.supervisor_duty_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duty_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  shift             VARCHAR(10) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON')),
  supervisor_id     UUID NOT NULL REFERENCES core.users(id),
  class_id          UUID NOT NULL REFERENCES core.classes(id),
  cleanliness_score NUMERIC(4,2) DEFAULT 10.0,
  orderliness_score NUMERIC(4,2) DEFAULT 10.0,
  uniform_score     NUMERIC(4,2) DEFAULT 10.0,
  general_feedback  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE emulation.supervisor_duty_logs IS 'Daily supervisor and red-flag brigade inspection evaluation checklists';
