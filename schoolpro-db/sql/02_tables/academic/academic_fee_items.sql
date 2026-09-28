-- =====================================================================
-- TABLE: academic.fee_items
-- Catalog of tuition fees, health insurance, and academic surcharges
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.fee_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  semester_id         UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  grade_id            UUID REFERENCES core.grades(id) ON DELETE SET NULL,
  code                VARCHAR(50) NOT NULL,               -- E.g. 'FEE_TUITION_HK1', 'FEE_BHYT_2026'
  name                VARCHAR(255) NOT NULL,
  category            VARCHAR(30) NOT NULL DEFAULT 'TUITION'
                        CHECK (category IN ('TUITION', 'HEALTH_INSURANCE', 'FACILITY_ENHANCEMENT', 'STUDY_SESSION_2', 'BOARDING', 'STUDENT_ORGANIZATION')),
  amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  is_mandatory        BOOLEAN NOT NULL DEFAULT TRUE,
  due_date            DATE,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_fee_items_school_year ON academic.fee_items(school_id, academic_year_id);

COMMENT ON TABLE academic.fee_items IS 'Master fee schedule for tuition and statutory student fees';
