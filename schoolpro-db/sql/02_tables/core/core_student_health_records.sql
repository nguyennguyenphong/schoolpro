-- =====================================================================
-- TABLE: core.student_health_records
-- Student medical profile, BMI indicators, allergies, and vision exams
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.student_health_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  height_cm       NUMERIC(5,2),
  weight_kg       NUMERIC(5,2),
  blood_type      VARCHAR(10),
  allergies       TEXT,
  chronic_illness TEXT,
  vision_left     VARCHAR(10),
  vision_right    VARCHAR(10),
  insurance_code  VARCHAR(50),
  last_checkup_at DATE,
  notes           TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.student_health_records IS 'Campus medical clinic records and physical growth tracking per student';
