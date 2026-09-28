-- =====================================================================
-- TABLE: evaluation.forms
-- Survey form templates for anonymous teacher feedback and school surveys
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(60) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  target_type     VARCHAR(30) NOT NULL
                    CHECK (target_type IN ('TEACHER', 'FACILITY', 'SCHOOL_SERVICE', 'CANTEEN')),
  description     TEXT,
  is_anonymous    BOOLEAN NOT NULL DEFAULT TRUE,   -- Preserves student confidentiality
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from      DATE,
  valid_to        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE evaluation.forms IS 'Survey questionnaires for confidential pedagogical reviews and campus satisfaction';
