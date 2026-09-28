-- =====================================================================
-- TABLE: academic.report_cards
-- Semester final academic report card summaries and honor roll ratings
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.report_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES core.subjects(id),
  semester_id       UUID NOT NULL REFERENCES core.semesters(id),
  average_score     NUMERIC(4,2),                  -- Semester subject grade point average (ĐTBmhk)
  subject_eval      VARCHAR(20),                   -- Pass/Fail qualitative result for physical education/defense
  conduct_rating    VARCHAR(20)
                      CHECK (conduct_rating IN ('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR')),
  academic_rating   VARCHAR(20)
                      CHECK (academic_rating IN ('OUTSTANDING', 'GOOD', 'FAIR', 'PASS', 'FAIL')),
  honor_title       VARCHAR(50),
  rank_in_class     SMALLINT,
  teacher_comment   TEXT,
  is_locked         BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_reportcards_student ON academic.report_cards(student_id);

COMMENT ON TABLE academic.report_cards IS 'Official academic report transcripts complying with MOET high school grading norms';
