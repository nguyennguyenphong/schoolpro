-- =====================================================================
-- TABLE: notification.announcement_reads
-- Read confirmation audit trail tracking which users have seen an announcement
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.announcement_reads (
  announcement_id UUID NOT NULL REFERENCES notification.announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

COMMENT ON TABLE notification.announcement_reads IS 'Proof-of-read receipt log for official school notifications';
