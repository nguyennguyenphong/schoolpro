-- =====================================================================
-- TABLE: evaluation.submissions
-- Form submission header linking student response to target teacher/facility
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id             UUID NOT NULL REFERENCES evaluation.forms(id) ON DELETE CASCADE,
  submitted_by        UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  target_teacher_id   UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  target_facility_id  UUID REFERENCES evaluation.facilities(id) ON DELETE SET NULL,
  semester_id         UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (target_teacher_id IS NOT NULL OR target_facility_id IS NOT NULL)
);

COMMENT ON TABLE evaluation.submissions IS 'Header record for submitted survey responses';
