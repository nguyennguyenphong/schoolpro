-- =====================================================================
-- TABLE: academic.assignment_submissions
-- Student homework turn-ins, attachments, scores, and teacher comments
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignment_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES academic.assignments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  submitted_at    TIMESTAMPTZ,
  content_text    TEXT,
  attachments     JSONB,
  score           NUMERIC(4,2) CHECK (score >= 0 AND score <= 10),
  feedback        TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED')),
  graded_by       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at       TIMESTAMPTZ,
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_submissions_student ON academic.assignment_submissions(student_id);

COMMENT ON TABLE academic.assignment_submissions IS 'Student homework answers, uploaded files, and graded feedback';
