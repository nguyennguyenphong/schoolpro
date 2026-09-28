-- =====================================================================
-- TABLE: evaluation.answers
-- Specific question responses within a survey submission
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES evaluation.submissions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES evaluation.questions(id) ON DELETE CASCADE,
  answer_value    JSONB NOT NULL,
  UNIQUE (submission_id, question_id)
);

COMMENT ON TABLE evaluation.answers IS 'Atomic answers provided for survey questions';
