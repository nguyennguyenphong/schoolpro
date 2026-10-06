-- =====================================================================
-- TABLE: core.class_subject_teachers
-- Teaching assignments mapping teachers to subjects per class and semester
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.class_subject_teachers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id           UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  subject_id         UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  teacher_id         UUID NOT NULL REFERENCES core.teachers(id) ON DELETE CASCADE,
  semester_id        UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  periods_per_week   SMALLINT NOT NULL DEFAULT 3,     -- Weekly teaching workload
  is_primary_teacher BOOLEAN NOT NULL DEFAULT TRUE,   -- Main assigned teacher (vs tutor / co-teacher)
  effective_from     DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to       DATE,
  status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                       CHECK (status IN ('ACTIVE', 'COMPLETED', 'TRANSFERRED', 'CANCELLED')),
  notes              TEXT,
  assigned_by        UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Academic director / VP
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_cst_teacher ON core.class_subject_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS ix_cst_class ON core.class_subject_teachers(class_id);
CREATE INDEX IF NOT EXISTS ix_cst_semester ON core.class_subject_teachers(semester_id);

COMMENT ON TABLE core.class_subject_teachers IS 'Semester teaching assignments linking teachers to specific subject classes';
COMMENT ON COLUMN core.class_subject_teachers.periods_per_week IS 'Allocated weekly lesson periods contributing to teacher workload totals';
