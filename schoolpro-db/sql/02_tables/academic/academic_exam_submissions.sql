-- =====================================================================
-- TABLE: academic.exam_submissions
-- Student online test attempts, durations, and aggregate scores
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_submissions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id            UUID NOT NULL REFERENCES academic.exams(id) ON DELETE CASCADE,
  student_id         UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  paper_code         VARCHAR(20) DEFAULT 'STANDARD',
  attempt_number     SMALLINT NOT NULL DEFAULT 1,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at       TIMESTAMPTZ,
  duration_seconds   INT DEFAULT 0,
  auto_score         NUMERIC(4,2) DEFAULT 0.00,            -- Automatically calculated multiple-choice score
  manual_score       NUMERIC(4,2) DEFAULT 0.00,            -- Teacher-graded essay/writing score
  total_score        NUMERIC(4,2) DEFAULT 0.00,
  status             VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                       CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'LATE', 'ABANDONED', 'DISQUALIFIED')),
  submitted_files    JSONB,                                -- Files attached for essay / oral exams
  proctor_notes      TEXT,                                 -- Proctor observations or incident records
  violation_count    INT NOT NULL DEFAULT 0,               -- Cheating / tab-switch detection counter
  teacher_feedback   TEXT,
  graded_by          UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at          TIMESTAMPTZ,
  appeal_status      VARCHAR(20) NOT NULL DEFAULT 'NONE'
                       CHECK (appeal_status IN ('NONE', 'PENDING', 'ACCEPTED', 'REJECTED')),
  appeal_reason      TEXT,
  appealed_at        TIMESTAMPTZ,
  appeal_resolved_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
  appeal_response    TEXT,
  appeal_resolved_at TIMESTAMPTZ,
  metadata           JSONB DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS ix_exam_sub_student ON academic.exam_submissions(student_id);
CREATE INDEX IF NOT EXISTS ix_exam_sub_exam ON academic.exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS ix_exam_sub_appeal ON academic.exam_submissions(appeal_status);

COMMENT ON TABLE academic.exam_submissions IS 'Student examination attempts, anti-cheat signals, scores, and appeal lifecycle';
COMMENT ON COLUMN academic.exam_submissions.violation_count IS 'Anti-cheat detection: number of tab switches, webcam defocus, or browser unfocus events';
COMMENT ON COLUMN academic.exam_submissions.appeal_status IS 'Score appeal status: NONE, PENDING, ACCEPTED, REJECTED';
