-- =====================================================================
-- TABLE: evaluation.forms
-- Survey form templates for anonymous teacher feedback and school surveys
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.forms (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                  UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  semester_id                UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  code                       VARCHAR(60) NOT NULL UNIQUE,
  name                       VARCHAR(255) NOT NULL,
  category                   VARCHAR(50) NOT NULL DEFAULT 'PEDAGOGICAL'
                               CHECK (category IN ('PEDAGOGICAL', 'SERVICE', 'CANTEEN', 'FACILITY', 'COURSE_EXIT', 'HEALTH_SAFETY')),
  target_type                VARCHAR(30) NOT NULL
                               CHECK (target_type IN ('TEACHER', 'FACILITY', 'SCHOOL_SERVICE', 'CANTEEN', 'CLASS')),
  target_audience            VARCHAR(30) NOT NULL DEFAULT 'STUDENT'
                               CHECK (target_audience IN ('STUDENT', 'TEACHER', 'PARENT', 'STAFF', 'PUBLIC')),
  description                TEXT,
  is_anonymous               BOOLEAN NOT NULL DEFAULT TRUE,   -- Preserves respondent confidentiality
  allow_multiple_submissions BOOLEAN NOT NULL DEFAULT FALSE,  -- True for multi-teacher reviews
  pass_percentage            NUMERIC(5,2) DEFAULT 80.00,      -- KPI satisfaction threshold (%)
  is_active                  BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from                 DATE,
  valid_to                   DATE,
  created_by                 UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_eval_forms_school ON evaluation.forms(school_id);
CREATE INDEX IF NOT EXISTS ix_eval_forms_category ON evaluation.forms(category);

COMMENT ON TABLE evaluation.forms IS 'Survey questionnaires for confidential pedagogical reviews, student feedback, and campus satisfaction';
COMMENT ON COLUMN evaluation.forms.target_audience IS 'Intended respondent role: STUDENT, TEACHER, PARENT, STAFF, PUBLIC';
