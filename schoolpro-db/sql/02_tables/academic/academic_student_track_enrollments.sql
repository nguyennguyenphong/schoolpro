-- =====================================================================
-- TABLE: academic.student_track_enrollments
-- Individual student academic track registration per school year
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_track_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  track_id          UUID NOT NULL REFERENCES academic.curriculum_tracks(id) ON DELETE CASCADE,
  academic_year_id  UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  enrolled_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'CHANGED', 'DROPPED')),
  change_reason     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS ix_student_track_student ON academic.student_track_enrollments(student_id);
CREATE INDEX IF NOT EXISTS ix_student_track_track ON academic.student_track_enrollments(track_id);

COMMENT ON TABLE academic.student_track_enrollments IS 'Annual student subject combination and career track assignment';
