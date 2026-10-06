-- =====================================================================
-- TABLE: academic.exam_questions
-- Composition of questions within an examination paper
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id           UUID NOT NULL REFERENCES academic.exams(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES academic.question_bank(id) ON DELETE CASCADE,
  order_no          SMALLINT NOT NULL,                    -- Question sequence in exam paper (1, 2, 3...)
  section_name      VARCHAR(100),                         -- 'Phần I: Trắc nghiệm khách quan', 'Phần II: Tự luận'
  score_weight      NUMERIC(4,2) NOT NULL DEFAULT 0.25,   -- Allocated score for this specific question
  paper_code        VARCHAR(20) DEFAULT 'STANDARD',       -- Paper version/variant code (e.g. '101', '102', '103')
  shuffled_options  JSONB,                                -- Shuffled option keys order for this specific paper code
  sub_questions     JSONB,                                -- Sub-questions for reading passages / case studies
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, paper_code, order_no)
);

CREATE INDEX IF NOT EXISTS ix_exam_questions_exam ON academic.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS ix_exam_questions_paper ON academic.exam_questions(exam_id, paper_code);

COMMENT ON TABLE academic.exam_questions IS 'Examination paper structure linking tests to question repository items';
COMMENT ON COLUMN academic.exam_questions.shuffled_options IS 'Exact randomized sequence of options presented in this variant paper';
