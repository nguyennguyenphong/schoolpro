-- =====================================================================
-- TABLE: core.class_subject_teachers
-- Teaching assignments mapping teachers to subjects per class and semester
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.class_subject_teachers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  teacher_id        UUID NOT NULL REFERENCES core.teachers(id) ON DELETE CASCADE,
  semester_id       UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  periods_per_week  SMALLINT NOT NULL DEFAULT 3,     -- Weekly teaching workload
  notes             TEXT,
  UNIQUE (class_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_cst_teacher ON core.class_subject_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS ix_cst_class ON core.class_subject_teachers(class_id);

COMMENT ON TABLE core.class_subject_teachers IS 'Semester teaching assignments linking teachers to specific subject classes';
