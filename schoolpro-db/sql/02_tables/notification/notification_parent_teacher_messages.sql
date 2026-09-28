-- =====================================================================
-- TABLE: notification.parent_teacher_messages
-- Direct bilateral communication channel between parents and teachers
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.parent_teacher_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  guardian_id       UUID NOT NULL REFERENCES core.guardians(id) ON DELETE CASCADE,
  teacher_id        UUID NOT NULL REFERENCES core.teachers(id) ON DELETE CASCADE,
  sender_user_id    UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  message_content   TEXT NOT NULL,
  attachments       JSONB,                                -- Array of file attachments [{"url": "...", "name": "..."}]
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_pt_msg_student ON notification.parent_teacher_messages(student_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_teacher ON notification.parent_teacher_messages(teacher_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_guardian ON notification.parent_teacher_messages(guardian_id);

COMMENT ON TABLE notification.parent_teacher_messages IS 'Encrypted home-school communication thread between parents and subject/homeroom teachers';
