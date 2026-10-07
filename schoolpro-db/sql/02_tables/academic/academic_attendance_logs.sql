-- =====================================================================
-- TABLE: academic.attendance_logs
-- Audit trail and change history for student attendance roll-calls
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.attendance_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id   UUID NOT NULL REFERENCES academic.attendance(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status      VARCHAR(20) NOT NULL
                    CHECK (new_status IN ('PRESENT', 'ABSENT_EXCUSED', 'ABSENT_UNEXCUSED', 'LATE', 'LEFT_EARLY')),
  action          VARCHAR(50) NOT NULL DEFAULT 'STATUS_UPDATED',
  reason          TEXT,
  performed_by    UUID REFERENCES core.users(id) ON DELETE SET NULL,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_att_log_attendance ON academic.attendance_logs(attendance_id);
CREATE INDEX IF NOT EXISTS ix_att_log_student ON academic.attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS ix_att_log_created_at ON academic.attendance_logs(created_at);

COMMENT ON TABLE academic.attendance_logs IS 'Audit and change history log tracking modifications to student attendance records';
COMMENT ON COLUMN academic.attendance_logs.action IS 'Action type: INITIAL_ROLL_CALL, STATUS_UPDATED, EXCUSE_ATTACHED, REMOVED, OVERRIDDEN';
