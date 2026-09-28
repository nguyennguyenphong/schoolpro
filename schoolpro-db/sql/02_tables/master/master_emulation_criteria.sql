-- =====================================================================
-- TABLE: emulation.criteria (Master Data)
-- School-wide standard emulation evaluation criteria and point weights
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.criteria (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               VARCHAR(60) NOT NULL UNIQUE,      -- E.g. 'NE_NEP_DI_HOC_DUNG_GIO', 'HOC_TAP_DIEM_10'
  name               VARCHAR(255) NOT NULL,
  category           VARCHAR(50) NOT NULL DEFAULT 'DISCIPLINE'
                       CHECK (category IN ('DISCIPLINE', 'ACADEMIC', 'HYGIENE', 'ACTIVITY', 'ETHICS')),
  scope_type         core.scope_type_enum NOT NULL,    -- Applicable scope (CLASS, INDIVIDUAL, etc.)
  points             NUMERIC(6,2) NOT NULL,            -- Positive bonus points or negative penalty points
  is_violation       BOOLEAN NOT NULL DEFAULT FALSE,
  applicable_role_id UUID REFERENCES core.roles(id) ON DELETE SET NULL,
  description        TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE emulation.criteria IS 'Master emulation point criteria for weekly discipline, academics, and activities';
