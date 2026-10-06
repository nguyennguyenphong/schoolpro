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
  target_class_id     UUID REFERENCES core.classes(id) ON DELETE SET NULL,
  target_service      VARCHAR(100),                                      -- Tên dịch vụ (Xe buýt số 02, Căng-tin,...)
  semester_id         UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  total_score         NUMERIC(5,2),                                      -- Aggregate satisfaction score
  feedback_summary    TEXT,                                              -- Overall subjective feedback / recommendations
  ip_hash             VARCHAR(64),                                       -- Salted IP hash to prevent spam while protecting anonymity
  metadata            JSONB DEFAULT '{}'::jsonb,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (target_teacher_id IS NOT NULL OR target_facility_id IS NOT NULL OR target_class_id IS NOT NULL OR target_service IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS ix_eval_sub_form ON evaluation.submissions(form_id);
CREATE INDEX IF NOT EXISTS ix_eval_sub_teacher ON evaluation.submissions(target_teacher_id) WHERE target_teacher_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_eval_sub_facility ON evaluation.submissions(target_facility_id) WHERE target_facility_id IS NOT NULL;

COMMENT ON TABLE evaluation.submissions IS 'Header record for submitted survey responses';
COMMENT ON COLUMN evaluation.submissions.ip_hash IS 'Cryptographic salted hash of submitter IP for ballot stuffing prevention in anonymous forms';
