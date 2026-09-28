-- =====================================================================
-- TABLE: notification.reminders
-- Personal study reminders, assignment deadlines, and duty tasks
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  content         TEXT,
  remind_at       TIMESTAMPTZ NOT NULL,
  related_entity  VARCHAR(80),                      -- E.g. 'ASSIGNMENT', 'EXAM', 'DUTY'
  related_id      UUID,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_reminders_user_time ON notification.reminders(user_id, remind_at);

COMMENT ON TABLE notification.reminders IS 'Personal task reminders for upcoming homework deadlines, exam dates, and cleaning duty';
