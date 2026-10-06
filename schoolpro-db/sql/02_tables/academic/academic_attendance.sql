-- =====================================================================
-- TABLE: academic.attendance
-- Daily and period-based student attendance records
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.attendance (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id             UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  attendance_date      DATE NOT NULL,
  period_id            UUID REFERENCES academic.periods(id) ON DELETE SET NULL,
  status               VARCHAR(20) NOT NULL
                         CHECK (status IN ('PRESENT', 'ABSENT_EXCUSED', 'ABSENT_UNEXCUSED', 'LATE', 'LEFT_EARLY')),
  check_in_time        TIMESTAMPTZ,
  check_out_time       TIMESTAMPTZ,
  method               VARCHAR(30) NOT NULL DEFAULT 'MANUAL'
                         CHECK (method IN ('MANUAL', 'RFID', 'QR_CODE', 'FACE_ID', 'BIOMETRIC', 'ONLINE')),
  device_id            VARCHAR(100),
  excuse_reason        TEXT,
  excuse_document_url  TEXT,
  is_parent_notified   BOOLEAN NOT NULL DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  note                 TEXT,
  metadata             JSONB DEFAULT '{}'::jsonb,
  recorded_by          UUID NOT NULL REFERENCES core.users(id),
  recorded_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, attendance_date, period_id)
);

CREATE INDEX IF NOT EXISTS ix_attendance_class_date ON academic.attendance(class_id, attendance_date);
CREATE INDEX IF NOT EXISTS ix_attendance_student_date ON academic.attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS ix_attendance_status ON academic.attendance(status);

COMMENT ON TABLE academic.attendance IS 'Daily and period-level student attendance roll-call tracking excuses, RFID/FaceID, and parent notifications';
COMMENT ON COLUMN academic.attendance.method IS 'Verification method: MANUAL, RFID, QR_CODE, FACE_ID, BIOMETRIC, ONLINE';
COMMENT ON COLUMN academic.attendance.is_parent_notified IS 'Flag indicating whether a push notification or SMS was dispatched to guardian';
