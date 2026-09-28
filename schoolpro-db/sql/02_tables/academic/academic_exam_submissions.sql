-- =====================================================================
-- TABLE: academic.exam_submissions
-- Student online test attempts, durations, and aggregate scores
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id           UUID NOT NULL REFERENCES academic.exams(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  paper_code        VARCHAR(20) DEFAULT 'STANDARD',
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at      TIMESTAMPTZ,
  auto_score        NUMERIC(4,2) DEFAULT 0.00,            -- Automatically calculated multiple-choice score
  manual_score      NUMERIC(4,2) DEFAULT 0.00,            -- Teacher-graded essay/writing score
  total_score       NUMERIC(4,2) DEFAULT 0.00,
  status            VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                      CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'LATE', 'ABANDONED')),
  teacher_feedback  TEXT,
  graded_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_exam_sub_student ON academic.exam_submissions(student_id);
CREATE INDEX IF NOT EXISTS ix_exam_sub_exam ON academic.exam_submissions(exam_id);

COMMENT ON TABLE academic.exam_submissions IS 'Student examination attempts and final test grading status';
