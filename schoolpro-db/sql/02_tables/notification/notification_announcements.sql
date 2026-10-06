-- =====================================================================
-- TABLE: notification.announcements
-- Broadcast announcements targeted to school, grade, class, or roles
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.announcements (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  title                VARCHAR(255) NOT NULL,
  summary              TEXT,
  content              TEXT NOT NULL,
  category             VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC'
                         CHECK (category IN ('ACADEMIC', 'EXAM', 'EMULATION', 'FEES', 'EVENTS', 'GENERAL')),
  status               VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED'
                         CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED')),
  target_type          VARCHAR(20) NOT NULL
                         CHECK (target_type IN ('SCHOOL', 'GRADE', 'CLASS', 'ROLE', 'USER')),
  target_grade_id      UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  target_class_id      UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  target_role_id       UUID REFERENCES core.roles(id) ON DELETE CASCADE,
  target_user_id       UUID REFERENCES core.users(id) ON DELETE CASCADE,
  priority             VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                         CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  is_pinned            BOOLEAN NOT NULL DEFAULT FALSE,
  pinned_until         TIMESTAMPTZ,
  channels             TEXT[] DEFAULT ARRAY['IN_APP']::text[],
  send_push            BOOLEAN NOT NULL DEFAULT TRUE,
  send_email           BOOLEAN NOT NULL DEFAULT FALSE,
  send_sms             BOOLEAN NOT NULL DEFAULT FALSE,
  views_count          INT NOT NULL DEFAULT 0,
  department           VARCHAR(100) DEFAULT 'Phòng Đào Tạo',
  attachments          JSONB,
  export_template_code VARCHAR(100),
  metadata             JSONB DEFAULT '{}'::jsonb,
  published_by         UUID NOT NULL REFERENCES core.users(id),
  published_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at           TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_announcements_target
  ON notification.announcements(target_type, target_class_id, target_grade_id, target_role_id);
CREATE INDEX IF NOT EXISTS ix_announcements_category ON notification.announcements(category);
CREATE INDEX IF NOT EXISTS ix_announcements_status ON notification.announcements(status);

COMMENT ON TABLE notification.announcements IS 'Official school news bulletins, grade circulars, and multi-channel notices';
COMMENT ON COLUMN notification.announcements.channels IS 'Distribution channels: IN_APP, PUSH, EMAIL, SMS, PORTAL';
COMMENT ON COLUMN notification.announcements.pinned_until IS 'Auto-expiration time for sticky/pinned announcement display';
