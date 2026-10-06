-- =====================================================================
-- TABLE: evaluation.answers
-- Specific question responses within a survey submission
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES evaluation.submissions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES evaluation.questions(id) ON DELETE CASCADE,
  numeric_score   NUMERIC(4,2),                     -- Direct numeric score parsed from rating for fast statistical rollup
  answer_value    JSONB NOT NULL,                   -- Complete selected payload
  text_comment    TEXT,                             -- Optional qualitative comment attached to this specific question
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, question_id)
);

CREATE INDEX IF NOT EXISTS ix_eval_ans_question ON evaluation.answers(question_id);
CREATE INDEX IF NOT EXISTS ix_eval_ans_sub ON evaluation.answers(submission_id);

COMMENT ON TABLE evaluation.answers IS 'Atomic answers provided for survey questions';
COMMENT ON COLUMN evaluation.answers.numeric_score IS 'Normalized numeric rating value (e.g. 1.0 to 5.0) enabling high-speed SQL averages';
