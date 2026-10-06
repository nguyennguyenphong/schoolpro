-- =====================================================================
-- TABLE: emulation.criteria (Master Data)
-- School-wide standard emulation evaluation criteria and point weights
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.criteria (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  code                 VARCHAR(60) NOT NULL UNIQUE,      -- E.g. 'NE_NEP_DI_HOC_DUNG_GIO', 'HOC_TAP_DIEM_10'
  name                 VARCHAR(255) NOT NULL,
  category             VARCHAR(50) NOT NULL DEFAULT 'DISCIPLINE'
                         CHECK (category IN ('DISCIPLINE', 'ACADEMIC', 'HYGIENE', 'ACTIVITY', 'ETHICS', 'UNIFORM')),
  scope_type           core.scope_type_enum NOT NULL,    -- Applicable scope (CLASS, INDIVIDUAL, etc.)
  points               NUMERIC(6,2) NOT NULL,            -- Positive bonus points or negative penalty points
  is_violation         BOOLEAN NOT NULL DEFAULT FALSE,
  severity_level       VARCHAR(20) NOT NULL DEFAULT 'MINOR'
                         CHECK (severity_level IN ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL')),
  is_repeated_penalty  BOOLEAN NOT NULL DEFAULT FALSE,   -- Double penalties on repeat infraction
  applicable_role_id   UUID REFERENCES core.roles(id) ON DELETE SET NULL,
  icon                 VARCHAR(50) DEFAULT 'award',
  order_no             SMALLINT NOT NULL DEFAULT 0,
  description          TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_emu_criteria_school ON emulation.criteria(school_id);
CREATE INDEX IF NOT EXISTS ix_emu_criteria_category ON emulation.criteria(category);

COMMENT ON TABLE emulation.criteria IS 'Master emulation point criteria for weekly discipline, academics, and activities';
COMMENT ON COLUMN emulation.criteria.severity_level IS 'Severity grade: MINOR, MODERATE, MAJOR, CRITICAL';
