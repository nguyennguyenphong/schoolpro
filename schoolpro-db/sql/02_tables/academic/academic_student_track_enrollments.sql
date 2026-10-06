-- =====================================================================
-- TABLE: academic.student_track_enrollments
-- Individual student academic track registration per school year
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_track_enrollments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id                  UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  track_id                    UUID NOT NULL REFERENCES academic.curriculum_tracks(id) ON DELETE CASCADE,
  academic_year_id            UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  enrolled_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  registered_cluster_subjects JSONB,                           -- Specific elective topics/clusters chosen
  status                      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE', 'PENDING_CHANGE', 'CHANGED', 'DROPPED')),
  change_reason               TEXT,
  parent_consent              BOOLEAN NOT NULL DEFAULT TRUE,   -- Parent approval signature for elective track change
  parent_consent_document_url TEXT,
  approved_by                 UUID REFERENCES core.users(id) ON DELETE SET NULL,
  approved_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS ix_student_track_student ON academic.student_track_enrollments(student_id);
CREATE INDEX IF NOT EXISTS ix_student_track_track ON academic.student_track_enrollments(track_id);
CREATE INDEX IF NOT EXISTS ix_student_track_year ON academic.student_track_enrollments(academic_year_id);

COMMENT ON TABLE academic.student_track_enrollments IS 'Annual student subject combination and career track assignment';
COMMENT ON COLUMN academic.student_track_enrollments.parent_consent IS 'Parent written consent required when switching elective track per MOET regulations';
