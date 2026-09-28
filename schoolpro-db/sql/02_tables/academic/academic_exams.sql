-- =====================================================================
-- TABLE: academic.exams
-- Scheduled examination sittings, test slots, and room allocations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  score_type_id   UUID NOT NULL REFERENCES academic.score_types(id),
  title           VARCHAR(255) NOT NULL,
  exam_date       DATE NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 45,
  max_score       NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  room_id         UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  description     TEXT,
  created_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.exams IS 'Formal examination events (15-min tests, mid-term, final term exams)';
