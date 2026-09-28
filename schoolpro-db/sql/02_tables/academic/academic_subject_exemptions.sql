-- =====================================================================
-- TABLE: academic.subject_exemptions
-- Formal exemptions and standardized certificate score conversions
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.subject_exemptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  subject_id          UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  semester_id         UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  exemption_type      VARCHAR(30) NOT NULL
                        CHECK (exemption_type IN ('FULL_EXEMPTION', 'PRACTICAL_EXEMPTION', 'CERTIFICATE_CONVERSION')),
  reason              TEXT NOT NULL,
  certificate_name    VARCHAR(100),                       -- E.g. 'IELTS', 'TOEFL iBT', 'Medical Disability'
  certificate_score   VARCHAR(50),                        -- E.g. '7.5', '105'
  converted_score     NUMERIC(4,2),                       -- Equivalent conversion score (e.g. 10.00)
  decision_number     VARCHAR(100),                       -- Official school decision reference
  valid_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to            DATE,
  approved_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_exemptions_student ON academic.subject_exemptions(student_id);

COMMENT ON TABLE academic.subject_exemptions IS 'Authorized medical waivers, military drill exemptions, and international certificate conversions';
