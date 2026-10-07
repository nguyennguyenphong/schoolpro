-- =====================================================================
-- TABLE: academic.exam_event_logs
-- Proctoring, anti-cheat, session tracking and lifecycle event audit logs for examinations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_event_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         UUID NOT NULL REFERENCES academic.exams(id) ON DELETE CASCADE,
  submission_id   UUID REFERENCES academic.exam_submissions(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES core.students(id) ON DELETE CASCADE,
  actor_id        UUID REFERENCES core.users(id) ON DELETE SET NULL,
  event_type      VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  severity        VARCHAR(20) NOT NULL DEFAULT 'INFO'
                    CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'VIOLATION')),
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_exam_event_exam ON academic.exam_event_logs(exam_id, created_at);
CREATE INDEX IF NOT EXISTS ix_exam_event_submission ON academic.exam_event_logs(submission_id);
CREATE INDEX IF NOT EXISTS ix_exam_event_student ON academic.exam_event_logs(student_id);
CREATE INDEX IF NOT EXISTS ix_exam_event_type ON academic.exam_event_logs(event_type);
CREATE INDEX IF NOT EXISTS ix_exam_event_severity ON academic.exam_event_logs(severity);

COMMENT ON TABLE academic.exam_event_logs IS 'Audit journal tracking exam proctoring events, tab-switches, start/stop times, and appeals';
COMMENT ON COLUMN academic.exam_event_logs.event_type IS 'Action type: EXAM_STARTED, TAB_SWITCHED, WEBCAM_DEFOCUS, ANSWER_SAVED, EXAM_SUBMITTED, PROCTOR_FLAGGED, APPEAL_FILED, APPEAL_RESOLVED';
