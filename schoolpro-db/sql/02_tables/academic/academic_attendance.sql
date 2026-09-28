-- =====================================================================
-- TABLE: academic.attendance
-- Daily and period-based student attendance records
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  period_id       UUID REFERENCES academic.periods(id) ON DELETE SET NULL,
  status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('PRESENT', 'ABSENT_EXCUSED', 'ABSENT_UNEXCUSED', 'LATE')),
  note            TEXT,
  recorded_by     UUID NOT NULL REFERENCES core.users(id),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, attendance_date, period_id)
);

CREATE INDEX IF NOT EXISTS ix_attendance_class_date ON academic.attendance(class_id, attendance_date);

COMMENT ON TABLE academic.attendance IS 'Daily student attendance roll-call tracking excuses and tardiness';
