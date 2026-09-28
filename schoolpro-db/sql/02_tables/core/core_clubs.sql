-- =====================================================================
-- TABLE: core.clubs
-- Student clubs, artistic ensembles, and academic societies
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.clubs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code                  VARCHAR(50) NOT NULL UNIQUE,       -- E.g. 'CLUB_ROBOTICS', 'CLUB_ENGLISH'
  name                  VARCHAR(150) NOT NULL,
  category              VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC'
                          CHECK (category IN ('ACADEMIC', 'SPORTS', 'ARTS', 'COMMUNITY', 'CAREER_SKILLS')),
  advisor_teacher_id    UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  president_student_id  UUID REFERENCES core.students(id) ON DELETE SET NULL,
  description           TEXT,
  logo_url              TEXT,
  established_date      DATE DEFAULT CURRENT_DATE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_clubs_school ON core.clubs(school_id);

COMMENT ON TABLE core.clubs IS 'Extracurricular student clubs, sports teams, and volunteer societies';
