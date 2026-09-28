-- =====================================================================
-- TABLE: academic.conduct_evaluations
-- Student conduct & moral assessment workflow per Circular 22/2021
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.conduct_evaluations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  semester_id             UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  self_rating             VARCHAR(20) CHECK (self_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  class_vote_rating       VARCHAR(20) CHECK (class_vote_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  emulation_demerit_points SMALLINT NOT NULL DEFAULT 0,
  homeroom_teacher_rating VARCHAR(20) NOT NULL
                            CHECK (homeroom_teacher_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  final_rating            VARCHAR(20) NOT NULL
                            CHECK (final_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  homeroom_comments       TEXT,
  principal_approved      BOOLEAN NOT NULL DEFAULT FALSE,
  status                  VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED')),
  evaluated_by            UUID NOT NULL REFERENCES core.users(id),
  evaluated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_conduct_student ON academic.conduct_evaluations(student_id);
CREATE INDEX IF NOT EXISTS ix_conduct_semester ON academic.conduct_evaluations(semester_id);

COMMENT ON TABLE academic.conduct_evaluations IS 'Official student moral and behavioral conduct evaluation workflow (Tốt, Khá, Đạt, Chưa đạt)';
COMMENT ON COLUMN academic.conduct_evaluations.final_rating IS 'Final conduct classification ratified by Principal Council under Circular 22/2021';
