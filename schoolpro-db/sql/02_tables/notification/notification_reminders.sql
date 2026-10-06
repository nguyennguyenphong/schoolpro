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
  priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  repeat_interval VARCHAR(20) NOT NULL DEFAULT 'NONE'
                    CHECK (repeat_interval IN ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY')),
  channels        TEXT[] DEFAULT ARRAY['IN_APP']::text[],
  is_sent         BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at         TIMESTAMPTZ,
  related_entity  VARCHAR(80),                      -- E.g. 'ASSIGNMENT', 'EXAM', 'DUTY', 'MEETING'
  related_id      UUID,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  done_at         TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,        -- Contextual deep-link or parameters
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_reminders_user_time ON notification.reminders(user_id, remind_at);
CREATE INDEX IF NOT EXISTS ix_reminders_pending ON notification.reminders(remind_at, is_sent) WHERE is_sent = FALSE;

COMMENT ON TABLE notification.reminders IS 'Personal task reminders for upcoming homework deadlines, exam dates, and cleaning duty';
COMMENT ON COLUMN notification.reminders.repeat_interval IS 'Recurrence frequency for repetitive duty chores or study routines';
