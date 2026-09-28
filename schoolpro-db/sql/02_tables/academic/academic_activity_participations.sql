-- =====================================================================
-- TABLE: academic.activity_participations
-- Student event attendance, performance roles, and merit awards
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.activity_participations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id           UUID NOT NULL REFERENCES academic.extracurricular_activities(id) ON DELETE CASCADE,
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  role                  VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT', -- E.g. 'PARTICIPANT', 'ORGANIZER', 'PRESENTER'
  attendance_status     VARCHAR(20) NOT NULL DEFAULT 'ATTENDED'
                          CHECK (attendance_status IN ('REGISTERED', 'ATTENDED', 'ABSENT', 'EXCUSED')),
  bonus_points_awarded  SMALLINT NOT NULL DEFAULT 0,
  achievement_note      VARCHAR(255),
  certificate_url       TEXT,
  verified_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_act_part_student ON academic.activity_participations(student_id);
CREATE INDEX IF NOT EXISTS ix_act_part_activity ON academic.activity_participations(activity_id);

COMMENT ON TABLE academic.activity_participations IS 'Individual student participation logs in experiential and extracurricular activities';
