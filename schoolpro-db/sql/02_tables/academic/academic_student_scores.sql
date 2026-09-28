-- =====================================================================
-- TABLE: academic.student_scores
-- Atomic student grades and qualitative evaluations (Circular 22/2021)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  score_type_id   UUID NOT NULL REFERENCES academic.score_types(id),
  exam_id         UUID REFERENCES academic.exams(id) ON DELETE SET NULL,
  score_value     NUMERIC(4,2) CHECK (score_value >= 0 AND score_value <= 10),
  comment_result  VARCHAR(20) CHECK (comment_result IN ('PASSED', 'NOT_PASSED')),
  score_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  note            TEXT,
  entered_by      UUID NOT NULL REFERENCES core.users(id),
  entered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_scores_student ON academic.student_scores(student_id);
CREATE INDEX IF NOT EXISTS ix_scores_cst ON academic.student_scores(class_subject_teacher_id);

COMMENT ON TABLE academic.student_scores IS 'Granular evaluation marks per score category (oral, 15m, mid-term, end-term)';
