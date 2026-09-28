-- =====================================================================
-- TABLE: academic.exam_submission_answers
-- Itemized student responses, auto-validation, and grader annotations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_submission_answers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id     UUID NOT NULL REFERENCES academic.exam_submissions(id) ON DELETE CASCADE,
  exam_question_id  UUID NOT NULL REFERENCES academic.exam_questions(id) ON DELETE CASCADE,
  selected_answers  JSONB,                                -- Array of selected option keys (e.g. ["A", "C"])
  text_response     TEXT,                                 -- Essay / free-form text entered by student
  is_correct        BOOLEAN,                              -- Nullable for manual grading
  awarded_score     NUMERIC(4,2) DEFAULT 0.00,
  teacher_note      TEXT,
  graded_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, exam_question_id)
);

CREATE INDEX IF NOT EXISTS ix_exam_sub_ans_submission ON academic.exam_submission_answers(submission_id);

COMMENT ON TABLE academic.exam_submission_answers IS 'Individual question answers submitted by students with evaluation results';
