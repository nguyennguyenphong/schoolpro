-- =====================================================================
-- TABLE: academic.leave_request_event_logs
-- Chronological audit trail, notifications, and email delivery history
-- for student leave requests
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.leave_request_event_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id  UUID NOT NULL REFERENCES academic.leave_requests(id) ON DELETE CASCADE,
  event_type        VARCHAR(60) NOT NULL,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  actor_name        VARCHAR(255),
  actor_role        VARCHAR(100),
  badge_text        VARCHAR(100),
  badge_color       VARCHAR(30) NOT NULL DEFAULT 'blue',
  recipient_email   VARCHAR(255),
  email_sent        BOOLEAN NOT NULL DEFAULT FALSE,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leave_request_event_logs_req_id
  ON academic.leave_request_event_logs(leave_request_id, created_at);

COMMENT ON TABLE academic.leave_request_event_logs IS 'Chronological audit trail, notifications, and email delivery history for student leave requests';
COMMENT ON COLUMN academic.leave_request_event_logs.event_type IS 'Event type: CREATED, EMAIL_SENT, APPROVED, AUTO_APPROVED, REJECTED, CANCELLED, UPDATED';
