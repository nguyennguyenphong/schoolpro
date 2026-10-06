-- =====================================================================
-- TABLE: notification.parent_teacher_messages
-- Direct bilateral communication channel between parents and teachers
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.parent_teacher_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID,                                 -- Thread / conversation channel identifier
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  guardian_id           UUID NOT NULL REFERENCES core.guardians(id) ON DELETE CASCADE,
  teacher_id            UUID NOT NULL REFERENCES core.teachers(id) ON DELETE CASCADE,
  sender_user_id        UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  message_type          VARCHAR(20) NOT NULL DEFAULT 'TEXT'
                          CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'LEAVE_APPLICATION', 'VOICE_NOTE', 'SYSTEM')),
  message_content       TEXT NOT NULL,
  leave_request_data    JSONB,                                -- Structured leave application (start_date, end_date, reason)
  leave_approved_status VARCHAR(20) NOT NULL DEFAULT 'NONE'
                          CHECK (leave_approved_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED')),
  reply_to_message_id   UUID REFERENCES notification.parent_teacher_messages(id) ON DELETE SET NULL,
  attachments           JSONB,                                -- Array of file attachments [{"url": "...", "name": "..."}]
  is_read               BOOLEAN NOT NULL DEFAULT FALSE,
  read_at               TIMESTAMPTZ,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,       -- Message revoked / soft deleted
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_pt_msg_student ON notification.parent_teacher_messages(student_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_teacher ON notification.parent_teacher_messages(teacher_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_guardian ON notification.parent_teacher_messages(guardian_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_conv ON notification.parent_teacher_messages(conversation_id);

COMMENT ON TABLE notification.parent_teacher_messages IS 'Encrypted home-school communication thread between parents and subject/homeroom teachers';
COMMENT ON COLUMN notification.parent_teacher_messages.leave_approved_status IS 'Direct in-chat sick/absence leave approval workflow handled by teacher';
