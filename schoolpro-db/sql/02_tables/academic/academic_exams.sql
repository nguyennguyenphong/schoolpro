-- =====================================================================
-- TABLE: academic.exams
-- Scheduled examination sittings, test slots, and room allocations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exams (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  score_type_id            UUID NOT NULL REFERENCES academic.score_types(id),
  title                    VARCHAR(255) NOT NULL,
  exam_date                DATE NOT NULL,
  start_time               TIMESTAMPTZ,
  end_time                 TIMESTAMPTZ,
  duration_minutes         SMALLINT NOT NULL DEFAULT 45,
  format                   VARCHAR(30) NOT NULL DEFAULT 'MIXED'
                             CHECK (format IN ('MULTIPLE_CHOICE', 'ESSAY', 'MIXED', 'ORAL', 'PRACTICE')),
  status                   VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                             CHECK (status IN ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'GRADING', 'PUBLISHED', 'CANCELLED')),
  max_score                NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  pass_score               NUMERIC(4,2) DEFAULT 5.00,
  weight_percent           NUMERIC(5,2) DEFAULT 100.00,
  room_id                  UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  proctor_teacher_id       UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  shuffle_questions        BOOLEAN NOT NULL DEFAULT FALSE,
  shuffle_answers          BOOLEAN NOT NULL DEFAULT FALSE,
  allow_review             BOOLEAN NOT NULL DEFAULT TRUE,
  max_attempts             SMALLINT NOT NULL DEFAULT 1,
  attachments              JSONB,
  description              TEXT,
  settings                 JSONB DEFAULT '{}'::jsonb,
  created_by               UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_exams_cst ON academic.exams(class_subject_teacher_id);
CREATE INDEX IF NOT EXISTS ix_exams_date ON academic.exams(exam_date);
CREATE INDEX IF NOT EXISTS ix_exams_proctor ON academic.exams(proctor_teacher_id);

COMMENT ON TABLE academic.exams IS 'Formal examination events (15-min tests, mid-term, final term exams, quizzes)';
COMMENT ON COLUMN academic.exams.format IS 'Format of exam: MULTIPLE_CHOICE, ESSAY, MIXED, ORAL, PRACTICE';
COMMENT ON COLUMN academic.exams.proctor_teacher_id IS 'Assigned exam proctor / invigilator';
COMMENT ON COLUMN academic.exams.settings IS 'Dynamic rules: anti-cheat, full-screen lock, IP restrictions, rubric JSON';
