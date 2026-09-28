-- =====================================================================
-- TABLE: academic.class_journal_entries
-- Electronic class register / lesson diary (Sổ đầu bài điện tử)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.class_journal_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  session_date      DATE NOT NULL,
  period_no         SMALLINT NOT NULL,
  lesson_title      VARCHAR(255) NOT NULL,
  present_count     SMALLINT NOT NULL,
  absent_count      SMALLINT NOT NULL DEFAULT 0,
  absent_names      TEXT,
  lesson_rating     VARCHAR(5) NOT NULL DEFAULT 'A'
                      CHECK (lesson_rating IN ('A', 'B', 'C', 'D')), -- Grade A (Good), B, C, D
  teacher_feedback  TEXT,
  teacher_signature_time TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_journal_class_date ON academic.class_journal_entries(class_id, session_date);

COMMENT ON TABLE academic.class_journal_entries IS 'Official electronic class journal recording syllabus progress, attendance, and period rating';
