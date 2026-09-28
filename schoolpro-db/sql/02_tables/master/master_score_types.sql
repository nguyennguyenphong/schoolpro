-- =====================================================================
-- TABLE: academic.score_types (Master Data)
-- Assessment weightings and score types (Circular 22/2021/TT-BGDĐT)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.score_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(30) NOT NULL UNIQUE,     -- E.g. 'DDG_TX_MIENG', 'DDG_TX_15P', 'DDG_GK', 'DDG_CK'
  name            VARCHAR(100) NOT NULL,
  coefficient     SMALLINT NOT NULL DEFAULT 1,     -- Regular=1, Mid-term=2, Final=3
  min_evaluations SMALLINT DEFAULT 4,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE academic.score_types IS 'Master evaluation score columns and calculation coefficients per MOET Circular 22';
