-- =====================================================================
-- TABLE: sys.modules (Master Data)
-- Dynamic dashboard cards, widgets, and functional navigation modules
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.modules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                VARCHAR(80) NOT NULL UNIQUE,       -- E.g. 'STUDENT_TIMETABLE', 'STUDENT_REPORT_CARD'
  name                VARCHAR(150) NOT NULL,
  short_name          VARCHAR(80),
  description         TEXT,
  icon                VARCHAR(100) NOT NULL,
  route               VARCHAR(255) NOT NULL,
  module_type         VARCHAR(20) NOT NULL DEFAULT 'CARD'
                        CHECK (module_type IN ('CARD', 'MENU', 'WIDGET', 'QUICK_ACTION', 'BANNER')),
  category            VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC'
                        CHECK (category IN ('ACADEMIC', 'EMULATION', 'EVALUATION', 'COMMUNICATION', 'MANAGEMENT', 'UTILITY')),
  required_permission VARCHAR(100),                      -- Minimum permission code needed to view this module
  is_mobile_visible   BOOLEAN NOT NULL DEFAULT TRUE,     -- Accessible via mobile app
  is_desktop_visible  BOOLEAN NOT NULL DEFAULT TRUE,     -- Accessible via desktop web
  badge_count_api     VARCHAR(255),                      -- Endpoint returning active unread / pending task count
  default_color       VARCHAR(30) DEFAULT '#3B82F6',
  default_badge       VARCHAR(50),
  component_name      VARCHAR(100),
  parent_module_id    UUID REFERENCES sys.modules(id) ON DELETE SET NULL,
  default_order_no    SMALLINT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_modules_category ON sys.modules(category);
CREATE INDEX IF NOT EXISTS ix_modules_order ON sys.modules(default_order_no);

COMMENT ON TABLE sys.modules IS 'Master functional card modules available for personalized role-based dashboards';
COMMENT ON COLUMN sys.modules.badge_count_api IS 'Dynamic REST URI returning real-time notification badge counts';
