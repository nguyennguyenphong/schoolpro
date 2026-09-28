-- =====================================================================
-- TABLE: academic.assignments
-- Homework tasks, projects, essays, and exam revision exercises
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  assignment_type VARCHAR(20) NOT NULL DEFAULT 'HOMEWORK'
                    CHECK (assignment_type IN ('HOMEWORK', 'PROJECT', 'ESSAY', 'REVISION')),
  assigned_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        TIMESTAMPTZ NOT NULL,
  max_score       NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  attachments     JSONB,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES core.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.assignments IS 'Homework tasks and group projects assigned by subject teachers';
