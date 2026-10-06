-- =====================================================================
-- TABLE: notification.announcement_reads
-- Read confirmation audit trail tracking which users have seen an announcement
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.announcement_reads (
  announcement_id          UUID NOT NULL REFERENCES notification.announcements(id) ON DELETE CASCADE,
  user_id                  UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  device_type              VARCHAR(20),                         -- 'IOS', 'ANDROID', 'WEB', 'MOBILE_WEB'
  ip_address               INET,
  reading_duration_seconds INT DEFAULT 0,                       -- Time spent viewing announcement
  acknowledged             BOOLEAN NOT NULL DEFAULT FALSE,      -- Explicit user acknowledgment for critical bulletins
  acknowledged_at          TIMESTAMPTZ,
  read_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_ann_reads_user ON notification.announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS ix_ann_reads_ack ON notification.announcement_reads(acknowledged);

COMMENT ON TABLE notification.announcement_reads IS 'Proof-of-read receipt log and explicit sign-offs for official school notifications';
COMMENT ON COLUMN notification.announcement_reads.acknowledged IS 'Mandatory sign-off check for emergency, exam safety, or legal notices';
