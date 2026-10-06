-- =====================================================================
-- TABLE: emulation.records
-- Point transactions awarded or deducted across multi-tier hierarchy
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.records (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id              UUID NOT NULL REFERENCES emulation.periods(id) ON DELETE CASCADE,
  criteria_id            UUID REFERENCES emulation.criteria(id) ON DELETE SET NULL,
  class_criteria_id      UUID REFERENCES emulation.class_custom_criteria(id) ON DELETE SET NULL,
  scope_type             core.scope_type_enum NOT NULL,
  student_id             UUID REFERENCES core.students(id) ON DELETE CASCADE,
  class_group_id         UUID REFERENCES core.class_groups(id) ON DELETE CASCADE,
  class_id               UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  grade_id               UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  school_id              UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  points                 NUMERIC(6,2) NOT NULL,
  incident_time          TIMESTAMPTZ DEFAULT now(),                         -- Thời điểm xảy ra sự việc
  status                 VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
                           CHECK (status IN ('PENDING_VERIFICATION', 'CONFIRMED', 'DISPUTED', 'CANCELLED')),
  evidence_url           TEXT,
  evidence_urls          JSONB,                                             -- Bằng chứng đa phương tiện
  dispute_reason         TEXT,                                              -- Lý do khiếu nại
  disputed_by            UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Người khiếu nại
  disputed_at            TIMESTAMPTZ,
  dispute_resolved_by    UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Người xử lý khiếu nại
  dispute_resolution     TEXT,                                              -- Biên bản kết luận xử lý
  dispute_resolved_at    TIMESTAMPTZ,
  note                   TEXT,
  recorded_by            UUID NOT NULL REFERENCES core.users(id),
  recorded_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (scope_type = 'INDIVIDUAL' AND student_id IS NOT NULL) OR
    (scope_type = 'GROUP'      AND class_group_id IS NOT NULL) OR
    (scope_type = 'CLASS'      AND class_id IS NOT NULL) OR
    (scope_type = 'GRADE'      AND grade_id IS NOT NULL) OR
    (scope_type = 'SCHOOL'     AND school_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_emu_records_period ON emulation.records(period_id);
CREATE INDEX IF NOT EXISTS ix_emu_records_status ON emulation.records(status);
CREATE INDEX IF NOT EXISTS ix_emu_records_student ON emulation.records(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_emu_records_class ON emulation.records(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_emu_records_group ON emulation.records(class_group_id) WHERE class_group_id IS NOT NULL;

COMMENT ON TABLE emulation.records IS 'Granular point journal for commendations, violations, and dispute lifecycle across all scopes';
COMMENT ON COLUMN emulation.records.status IS 'Verification status: PENDING_VERIFICATION, CONFIRMED, DISPUTED, CANCELLED';
