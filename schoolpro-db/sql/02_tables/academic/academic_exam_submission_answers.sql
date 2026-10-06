-- =====================================================================
-- TABLE: academic.exam_submission_answers
-- Itemized student responses, auto-validation, and grader annotations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_submission_answers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id       UUID NOT NULL REFERENCES academic.exam_submissions(id) ON DELETE CASCADE,
  exam_question_id    UUID NOT NULL REFERENCES academic.exam_questions(id) ON DELETE CASCADE,
  selected_answers    JSONB,                                -- Array of selected option keys (e.g. ["A", "C"])
  text_response       TEXT,                                 -- Essay / free-form text entered by student
  attached_files      JSONB,                                -- Uploaded images / PDFs of scratch paper or handwriting
  is_correct          BOOLEAN,                              -- Nullable for manual grading
  awarded_score       NUMERIC(4,2) DEFAULT 0.00,
  rubric_detail       JSONB,                                -- Granular score per essay rubric criterion
  teacher_note        TEXT,
  graded_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at           TIMESTAMPTZ,
  time_spent_seconds  INT DEFAULT 0,                        -- Latency spent on this question item
  flagged_for_review  BOOLEAN NOT NULL DEFAULT FALSE,       -- Marked for review by student during test
  appeal_note         TEXT,                                 -- Specific objection by student on this question
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, exam_question_id)
);

CREATE INDEX IF NOT EXISTS ix_exam_sub_ans_submission ON academic.exam_submission_answers(submission_id);

COMMENT ON TABLE academic.exam_submission_answers IS 'Individual question answers submitted by students with evaluation results';
COMMENT ON COLUMN academic.exam_submission_answers.time_spent_seconds IS 'Seconds spent attempting this question for learning analytics';
