-- =====================================================================
-- TABLE: academic.attendance
-- Daily and period-based student attendance records with GPS verification
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.attendance (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           UUID REFERENCES academic.attendance_sessions(id) ON DELETE SET NULL,
  timetable_id         UUID REFERENCES academic.timetables(id) ON DELETE SET NULL,
  student_id           UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id             UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  subject_id           UUID REFERENCES core.subjects(id) ON DELETE SET NULL,
  attendance_date      DATE NOT NULL,
  period_id            UUID REFERENCES academic.periods(id) ON DELETE SET NULL,
  status               VARCHAR(20) NOT NULL
                         CHECK (status IN ('PRESENT', 'ABSENT_EXCUSED', 'ABSENT_UNEXCUSED', 'LATE', 'LEFT_EARLY')),
  check_in_time        TIMESTAMPTZ,
  method               VARCHAR(30) NOT NULL DEFAULT 'MANUAL'
                         CHECK (method IN ('PIN_CODE', 'QR_SCAN', 'QR_UPLOAD', 'QR_CODE', 'MANUAL', 'TEACHER_APP', 'EXCUSED_LEAVE', 'ONLINE')),
  check_in_code        VARCHAR(64),
  check_in_latitude    NUMERIC(10, 7)
                         CHECK (check_in_latitude IS NULL OR (check_in_latitude BETWEEN -90 AND 90)),
  check_in_longitude   NUMERIC(10, 7)
                         CHECK (check_in_longitude IS NULL OR (check_in_longitude BETWEEN -180 AND 180)),
  distance_meters      NUMERIC(8, 2)
                         CHECK (distance_meters IS NULL OR distance_meters >= 0),
  is_within_radius     BOOLEAN NOT NULL DEFAULT TRUE,
  gps_accuracy_meters  NUMERIC(8, 2),
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
CREATE INDEX IF NOT EXISTS ix_attendance_session ON academic.attendance(session_id);
CREATE INDEX IF NOT EXISTS ix_attendance_status ON academic.attendance(status);

COMMENT ON TABLE academic.attendance IS 'Daily and period-level student attendance roll-call tracking 6-digit PIN, QR scan/upload, GPS anti-cheat coordinates, and excuses';
COMMENT ON COLUMN academic.attendance.method IS 'Verification method: PIN_CODE, QR_SCAN, QR_UPLOAD, QR_CODE, MANUAL, TEACHER_APP, EXCUSED_LEAVE, ONLINE';
COMMENT ON COLUMN academic.attendance.check_in_latitude IS 'Student GPS latitude at the moment of check-in';
COMMENT ON COLUMN academic.attendance.check_in_longitude IS 'Student GPS longitude at the moment of check-in';
COMMENT ON COLUMN academic.attendance.distance_meters IS 'Calculated Haversine distance in meters from teacher scanning device';
COMMENT ON COLUMN academic.attendance.is_within_radius IS 'True if student checked in within the allowed radius configured by the teacher';
COMMENT ON COLUMN academic.attendance.is_parent_notified IS 'Flag indicating whether a push notification or SMS was dispatched to guardian';
