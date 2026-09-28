-- =====================================================================
-- TABLE: evaluation.questions
-- Individual questionnaire items (Likert scale 1-5, multiple choice, text)
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES evaluation.forms(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  question_type   VARCHAR(20) NOT NULL DEFAULT 'RATING_1_5'
                    CHECK (question_type IN ('RATING_1_5', 'TEXT', 'YES_NO', 'MULTIPLE_CHOICE')),
  options         JSONB,
  order_no        SMALLINT NOT NULL DEFAULT 0,
  is_required     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_eval_questions_form ON evaluation.questions(form_id);

COMMENT ON TABLE evaluation.questions IS 'Itemized survey questions for rating teaching methods, fairness, and clarity';
