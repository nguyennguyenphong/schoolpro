-- =====================================================================
-- TABLE: academic.score_types (Master Data)
-- Assessment weightings and score types (Circular 22/2021/TT-BGDĐT)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.score_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES core.schools(id) ON DELETE CASCADE, -- NULL for MOET standard, populated for custom school types
  code            VARCHAR(30) NOT NULL UNIQUE,     -- E.g. 'DDG_TX_MIENG', 'DDG_TX_15P', 'DDG_GK', 'DDG_CK'
  name            VARCHAR(100) NOT NULL,
  coefficient     SMALLINT NOT NULL DEFAULT 1,     -- Regular=1, Mid-term=2, Final=3
  weight_percent  NUMERIC(5,2),                    -- Alternative percentage weight for modern syllabus
  min_evaluations SMALLINT NOT NULL DEFAULT 4,
  max_evaluations SMALLINT NOT NULL DEFAULT 6,     -- Maximum allowed test column entries
  order_no        SMALLINT NOT NULL DEFAULT 0,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_score_types_school ON academic.score_types(school_id);
CREATE INDEX IF NOT EXISTS ix_score_types_order ON academic.score_types(order_no);

COMMENT ON TABLE academic.score_types IS 'Master evaluation score columns and calculation coefficients per MOET Circular 22';
COMMENT ON COLUMN academic.score_types.weight_percent IS 'Alternative percentage weight in overall semester mark calculation';
