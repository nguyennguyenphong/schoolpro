-- =====================================================================
-- TABLE: notification.contact_book_notes
-- Periodic electronic home-school contact book bulletins
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.contact_book_notes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id              UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  semester_id           UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  guardian_id           UUID REFERENCES core.guardians(id) ON DELETE SET NULL, -- Specific parent acknowledged
  period_type           VARCHAR(20) NOT NULL DEFAULT 'WEEKLY'
                          CHECK (period_type IN ('WEEKLY', 'MONTHLY', 'MID_TERM', 'FINAL_TERM')),
  period_label          VARCHAR(50) NOT NULL,               -- E.g. 'Tuần 8 (14/10 - 19/10)', 'Tháng 10/2026'
  academic_digest       JSONB,                              -- Snapshot of latest test scores and homework completion
  attendance_digest     JSONB,                              -- Number of present, late, excused/unexcused absences
  emulation_digest      JSONB,                              -- Commendations, discipline flags, conduct points
  health_digest         JSONB,                              -- Student campus health status
  extracurricular_digest JSONB,                             -- Events and club participations
  upcoming_events       JSONB,                              -- Upcoming exam schedules and fee deadlines
  teacher_remarks       TEXT,                               -- Homeroom teacher direct qualitative feedback
  delivery_channels     TEXT[] DEFAULT ARRAY['APP']::text[],-- Dispatched via APP, ZALO_OA, SMS, EMAIL
  is_sent_sms           BOOLEAN NOT NULL DEFAULT FALSE,
  is_sent_zalo          BOOLEAN NOT NULL DEFAULT FALSE,
  status                VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED'
                          CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ACKNOWLEDGED')),
  parent_viewed_at      TIMESTAMPTZ,
  parent_acknowledged   BOOLEAN NOT NULL DEFAULT FALSE,
  parent_feedback       TEXT,                               -- Feedback or confirmation notes from parents
  created_by            UUID NOT NULL REFERENCES core.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, semester_id, period_type, period_label)
);

CREATE INDEX IF NOT EXISTS ix_contact_book_student ON notification.contact_book_notes(student_id);
CREATE INDEX IF NOT EXISTS ix_contact_book_class ON notification.contact_book_notes(class_id);
CREATE INDEX IF NOT EXISTS ix_contact_book_school ON notification.contact_book_notes(school_id);

COMMENT ON TABLE notification.contact_book_notes IS 'Structured electronic communication logbook between homeroom teachers and parents';
COMMENT ON COLUMN notification.contact_book_notes.delivery_channels IS 'Omnichannel broadcast flags: APP, ZALO_OA, SMS, EMAIL';
