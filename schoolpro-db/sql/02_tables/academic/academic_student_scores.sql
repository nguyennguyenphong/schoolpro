-- =====================================================================
-- TABLE: academic.student_scores
-- Atomic student grades and qualitative evaluations (Circular 22/2021)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_scores (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id               UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  score_type_id            UUID NOT NULL REFERENCES academic.score_types(id),
  semester_id              UUID REFERENCES core.semesters(id) ON DELETE CASCADE,
  exam_id                  UUID REFERENCES academic.exams(id) ON DELETE SET NULL,
  assignment_submission_id UUID REFERENCES academic.assignment_submissions(id) ON DELETE SET NULL,
  score_value              NUMERIC(4,2) CHECK (score_value >= 0 AND score_value <= 10),
  previous_score_value     NUMERIC(4,2),                     -- Audit score before modification
  comment_result           VARCHAR(20) CHECK (comment_result IN ('PASSED', 'NOT_PASSED')),
  score_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  note                     TEXT,
  edit_reason              TEXT,                             -- Justification required under MOET regulations
  edit_approved_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  edit_approved_at         TIMESTAMPTZ,
  entered_by               UUID NOT NULL REFERENCES core.users(id),
  entered_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_locked                BOOLEAN NOT NULL DEFAULT FALSE,   -- Lock mark status to prevent modification
  locked_at                TIMESTAMPTZ,
  locked_by                UUID REFERENCES core.users(id),
  metadata                 JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS ix_scores_student ON academic.student_scores(student_id);
CREATE INDEX IF NOT EXISTS ix_scores_cst ON academic.student_scores(class_subject_teacher_id);
CREATE INDEX IF NOT EXISTS ix_scores_semester ON academic.student_scores(semester_id);
CREATE INDEX IF NOT EXISTS ix_scores_score_type ON academic.student_scores(score_type_id);

COMMENT ON TABLE academic.student_scores IS 'Granular evaluation marks per score category (oral, 15m, mid-term, end-term)';
COMMENT ON COLUMN academic.student_scores.edit_reason IS 'Mandatory explanation logged when modifying entered grades per MOET inspection standards';
