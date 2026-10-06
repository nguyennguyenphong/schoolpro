-- =====================================================================
-- TABLE: core.position_assignments
-- Historical and active position assignment across any organizational scope
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.position_assignments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  position_id                 UUID NOT NULL REFERENCES core.positions(id),
  academic_year_id            UUID NOT NULL REFERENCES core.academic_years(id),
  scope_type                  core.scope_type_enum NOT NULL,
  school_id                   UUID REFERENCES core.schools(id),
  grade_id                    UUID REFERENCES core.grades(id),
  class_id                    UUID REFERENCES core.classes(id),
  class_group_id              UUID REFERENCES core.class_groups(id),
  department_id               UUID REFERENCES core.departments(id),
  appointment_decision_number VARCHAR(100),                -- Số quyết định bổ nhiệm
  allowance_coefficient       NUMERIC(4,2) DEFAULT 0.00,   -- Hệ số phụ cấp trách nhiệm chức vụ
  start_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date                    DATE,
  is_current                  BOOLEAN NOT NULL DEFAULT TRUE,
  note                        TEXT,
  created_by                  UUID REFERENCES core.users(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date),
  CHECK (
    (scope_type = 'SCHOOL'     AND school_id IS NOT NULL      AND grade_id IS NULL AND class_id IS NULL AND class_group_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'GRADE'      AND grade_id IS NOT NULL       AND school_id IS NULL AND class_id IS NULL AND class_group_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'CLASS'      AND class_id IS NOT NULL       AND school_id IS NULL AND grade_id IS NULL AND class_group_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'GROUP'      AND class_group_id IS NOT NULL AND school_id IS NULL AND grade_id IS NULL AND class_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'DEPARTMENT' AND department_id IS NOT NULL  AND school_id IS NULL AND grade_id IS NULL AND class_id IS NULL AND class_group_id IS NULL) OR
    (scope_type = 'INDIVIDUAL' AND school_id IS NULL AND grade_id IS NULL AND class_id IS NULL AND class_group_id IS NULL AND department_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_pos_assign_user ON core.position_assignments(user_id);
CREATE INDEX IF NOT EXISTS ix_pos_assign_class ON core.position_assignments(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_pos_assign_group ON core.position_assignments(class_group_id) WHERE class_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_pos_assign_active ON core.position_assignments(position_id, class_id, is_current) WHERE is_current = TRUE;

COMMENT ON TABLE core.position_assignments IS 'Temporal polymorphic history of positions held by users in classes, groups, departments, or grades';
COMMENT ON COLUMN core.position_assignments.allowance_coefficient IS 'Statutory leadership allowance multiplier (Hệ số phụ cấp chức vụ)';
