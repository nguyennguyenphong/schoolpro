-- =====================================================================
-- TABLE: evaluation.questions
-- Individual questionnaire items (Likert scale 1-5, multiple choice, text)
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES evaluation.forms(id) ON DELETE CASCADE,
  section_name    VARCHAR(100),                         -- Nhóm tiêu chí (I. Phương pháp giảng dạy, II. Đạo đức...)
  question_text   TEXT NOT NULL,
  description     TEXT,                                 -- Guidance note for respondents
  question_type   VARCHAR(20) NOT NULL DEFAULT 'RATING_1_5'
                    CHECK (question_type IN ('RATING_1_5', 'RATING_SCALE', 'TEXT', 'YES_NO', 'MULTIPLE_CHOICE', 'MULTI_SELECT')),
  options         JSONB,                                -- Options for choices
  weight          NUMERIC(4,2) NOT NULL DEFAULT 1.0,    -- Question score weight in aggregate KPI
  min_rating      SMALLINT DEFAULT 1,
  max_rating      SMALLINT DEFAULT 5,
  rating_labels   JSONB,                                -- E.g. {"1": "Rất không hài lòng", "5": "Rất hài lòng"}
  order_no        SMALLINT NOT NULL DEFAULT 0,
  is_required     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_eval_questions_form ON evaluation.questions(form_id);

COMMENT ON TABLE evaluation.questions IS 'Itemized survey questions for rating teaching methods, fairness, clarity, and facilities';
COMMENT ON COLUMN evaluation.questions.weight IS 'Relative importance coefficient used in weighted satisfaction formulas';
