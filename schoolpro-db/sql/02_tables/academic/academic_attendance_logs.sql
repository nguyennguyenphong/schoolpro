-- =====================================================================
-- TABLE: academic.attendance_logs
-- Audit trail and change history for student attendance roll-calls
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.attendance_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id      UUID NOT NULL REFERENCES academic.attendance(id) ON DELETE CASCADE,
  session_id         UUID REFERENCES academic.attendance_sessions(id) ON DELETE SET NULL,
  student_id         UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  previous_status    VARCHAR(20),
  new_status         VARCHAR(20) NOT NULL
                       CHECK (new_status IN ('PRESENT', 'ABSENT_EXCUSED', 'ABSENT_UNEXCUSED', 'LATE', 'LEFT_EARLY')),
  action             VARCHAR(50) NOT NULL DEFAULT 'STATUS_UPDATED',
  method             VARCHAR(30),
  check_in_latitude  NUMERIC(10, 7),
  check_in_longitude NUMERIC(10, 7),
  distance_meters    NUMERIC(8, 2),
  is_within_radius   BOOLEAN,
  reason             TEXT,
  performed_by       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  metadata           JSONB DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_att_log_attendance ON academic.attendance_logs(attendance_id);
CREATE INDEX IF NOT EXISTS ix_att_log_session ON academic.attendance_logs(session_id);
CREATE INDEX IF NOT EXISTS ix_att_log_student ON academic.attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS ix_att_log_created_at ON academic.attendance_logs(created_at);

COMMENT ON TABLE academic.attendance_logs IS 'Audit and change history log tracking student check-ins, GPS verification metrics, and teacher modifications';
COMMENT ON COLUMN academic.attendance_logs.action IS 'Action type: STUDENT_CHECK_IN, INITIAL_ROLL_CALL, STATUS_UPDATED, EXCUSE_ATTACHED, REJECTED_OUT_OF_RADIUS, REJECTED_EXPIRED, OVERRIDDEN';
