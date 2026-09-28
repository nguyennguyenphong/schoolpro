-- =====================================================================
-- TABLE: sys.modules (Master Data)
-- Dynamic dashboard cards, widgets, and functional navigation modules
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.modules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             VARCHAR(80) NOT NULL UNIQUE,       -- E.g. 'STUDENT_TIMETABLE', 'STUDENT_REPORT_CARD'
  name             VARCHAR(150) NOT NULL,
  short_name       VARCHAR(80),
  description      TEXT,
  icon             VARCHAR(100) NOT NULL,
  route            VARCHAR(255) NOT NULL,
  module_type      VARCHAR(20) NOT NULL DEFAULT 'CARD'
                     CHECK (module_type IN ('CARD', 'MENU', 'WIDGET', 'QUICK_ACTION', 'BANNER')),
  category         VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC'
                     CHECK (category IN ('ACADEMIC', 'EMULATION', 'EVALUATION', 'COMMUNICATION', 'MANAGEMENT', 'UTILITY')),
  default_color    VARCHAR(30) DEFAULT '#3B82F6',
  default_badge    VARCHAR(50),
  component_name   VARCHAR(100),
  parent_module_id UUID REFERENCES sys.modules(id) ON DELETE SET NULL,
  default_order_no SMALLINT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE sys.modules IS 'Master functional card modules available for personalized role-based dashboards';
