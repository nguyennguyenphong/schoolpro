-- =====================================================================
-- TABLE: academic.assignment_event_logs
-- Chronological event journal and audit log tracking homework lifecycle:
-- (e.g. Created -> Due Passed -> Submitted -> Graded -> Appealed -> Resolved)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignment_event_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES academic.assignments(id) ON DELETE CASCADE,
  submission_id   UUID REFERENCES academic.assignment_submissions(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES core.students(id) ON DELETE CASCADE,
  actor_id        UUID REFERENCES core.users(id) ON DELETE SET NULL,
  event_type      VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_asgn_event_assignment ON academic.assignment_event_logs(assignment_id, created_at);
CREATE INDEX IF NOT EXISTS ix_asgn_event_submission ON academic.assignment_event_logs(submission_id);
CREATE INDEX IF NOT EXISTS ix_asgn_event_student ON academic.assignment_event_logs(student_id);
CREATE INDEX IF NOT EXISTS ix_asgn_event_actor ON academic.assignment_event_logs(actor_id);

COMMENT ON TABLE academic.assignment_event_logs IS 'Top-to-bottom event journal and workflow audit history for assignments and submissions';
COMMENT ON COLUMN academic.assignment_event_logs.event_type IS 'Action type: CREATED, EXTENDED_1, EXTENDED_2, EXTENDED_3, SUBMITTED, GRADED, APPEAL_SUBMITTED, APPEAL_RESOLVED, REOPEN_REQUESTED, etc.';
COMMENT ON COLUMN academic.assignment_event_logs.metadata IS 'Dynamic structured context: snapshot of scores, appeal reasons, extension justifications, file names, etc.';
