-- =====================================================================
-- TABLE: emulation.records
-- Point transactions awarded or deducted across multi-tier hierarchy
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id          UUID NOT NULL REFERENCES emulation.periods(id) ON DELETE CASCADE,
  criteria_id        UUID REFERENCES emulation.criteria(id) ON DELETE SET NULL,
  class_criteria_id  UUID REFERENCES emulation.class_custom_criteria(id) ON DELETE SET NULL,
  scope_type         core.scope_type_enum NOT NULL,
  student_id         UUID REFERENCES core.students(id) ON DELETE CASCADE,
  class_group_id     UUID REFERENCES core.class_groups(id) ON DELETE CASCADE,
  class_id           UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  grade_id           UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  school_id          UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  points             NUMERIC(6,2) NOT NULL,
  evidence_url       TEXT,
  note               TEXT,
  recorded_by        UUID NOT NULL REFERENCES core.users(id),
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (scope_type = 'INDIVIDUAL' AND student_id IS NOT NULL) OR
    (scope_type = 'GROUP'      AND class_group_id IS NOT NULL) OR
    (scope_type = 'CLASS'      AND class_id IS NOT NULL) OR
    (scope_type = 'GRADE'      AND grade_id IS NOT NULL) OR
    (scope_type = 'SCHOOL'     AND school_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_emu_records_period ON emulation.records(period_id);
CREATE INDEX IF NOT EXISTS ix_emu_records_student ON emulation.records(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_emu_records_class ON emulation.records(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_emu_records_group ON emulation.records(class_group_id) WHERE class_group_id IS NOT NULL;

COMMENT ON TABLE emulation.records IS 'Granular point journal for commendations and violations across all scopes';
