-- =====================================================================
-- TABLE: academic.question_bank
-- Question repository supporting LaTeX, rich text, and multiple formats
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.question_bank (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id            UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  grade_id              UUID NOT NULL REFERENCES core.grades(id) ON DELETE CASCADE,
  code                  VARCHAR(50),                      -- Unique question catalog code (e.g. 'TOAN10_CD1_001')
  chapter_name          VARCHAR(150),
  difficulty_level      VARCHAR(30) NOT NULL DEFAULT 'RECOGNITION'
                          CHECK (difficulty_level IN ('RECOGNITION', 'COMPREHENSION', 'APPLICATION', 'HIGH_APPLICATION')),
  question_type         VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE'
                          CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY', 'MATCHING')),
  content               TEXT NOT NULL,                    -- Markdown or LaTeX supported problem statement
  audio_url             VARCHAR(1000),                    -- Audio file for Foreign Language listening comprehension
  image_urls            JSONB,                            -- Diagram / geometric illustration URLs
  options               JSONB,                            -- Array of answer choices: [{"key":"A","text":"..."}, ...]
  correct_answers       JSONB NOT NULL,                   -- Keys of correct answers: ["A"] or specific text for fill-in
  solution_explanation  TEXT,                             -- Detailed step-by-step solution
  default_score         NUMERIC(4,2) NOT NULL DEFAULT 0.25,
  author_id             UUID REFERENCES core.users(id) ON DELETE SET NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
                          CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED')),
  reviewed_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  reviewed_at           TIMESTAMPTZ,
  usage_count           INT NOT NULL DEFAULT 0,           -- Frequency used in exams
  discrimination_index  NUMERIC(4,3),                     -- Psychometric item discrimination index
  is_shared             BOOLEAN NOT NULL DEFAULT TRUE,    -- Shared across all teachers in subject department
  tags                  TEXT[],                           -- Knowledge tags: e.g. ARRAY['Hàm số', 'Cực trị', 'GDPT2018']
  metadata              JSONB DEFAULT '{}'::jsonb,        -- Competency matrix: Output standards, Bloom level, skills
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_question_bank_subject_grade ON academic.question_bank(subject_id, grade_id);
CREATE INDEX IF NOT EXISTS ix_question_bank_difficulty ON academic.question_bank(difficulty_level);
CREATE INDEX IF NOT EXISTS ix_question_bank_status ON academic.question_bank(status);
CREATE INDEX IF NOT EXISTS ix_question_bank_code ON academic.question_bank(code);

COMMENT ON TABLE academic.question_bank IS 'Centralized educational question repository categorized by Bloom cognitive taxonomy';
COMMENT ON COLUMN academic.question_bank.difficulty_level IS 'Taxonomy levels: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao';
COMMENT ON COLUMN academic.question_bank.status IS 'Quality review workflow: DRAFT, PENDING_REVIEW, APPROVED, REJECTED';
