-- =====================================================================
-- TABLE: core.clubs
-- Student clubs, artistic ensembles, and academic societies
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.clubs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code                     VARCHAR(50) NOT NULL UNIQUE,       -- E.g. 'CLUB_ROBOTICS', 'CLUB_ENGLISH'
  name                     VARCHAR(150) NOT NULL,
  category                 VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC'
                             CHECK (category IN ('ACADEMIC', 'SPORTS', 'ARTS', 'COMMUNITY', 'CAREER_SKILLS', 'MEDIA')),
  advisor_teacher_id       UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  president_student_id     UUID REFERENCES core.students(id) ON DELETE SET NULL,
  vice_president_student_id UUID REFERENCES core.students(id) ON DELETE SET NULL,
  meeting_schedule         VARCHAR(255),                      -- E.g. 'Chiều thứ 7 hàng tuần (14:00 - 16:30)'
  meeting_location         VARCHAR(255),                      -- E.g. 'Hội trường B / Sân bóng đá'
  membership_fee           NUMERIC(10,2) DEFAULT 0.00,        -- Phí tham gia / quỹ Câu lạc bộ
  max_members              SMALLINT,                          -- Giới hạn số lượng thành viên
  social_media_link        VARCHAR(500),
  cover_image_url          TEXT,
  logo_url                 TEXT,
  description              TEXT,
  established_date         DATE DEFAULT CURRENT_DATE,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  settings                 JSONB DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_clubs_school ON core.clubs(school_id);
CREATE INDEX IF NOT EXISTS ix_clubs_category ON core.clubs(category);

COMMENT ON TABLE core.clubs IS 'Extracurricular student clubs, sports teams, and volunteer societies';
COMMENT ON COLUMN core.clubs.membership_fee IS 'Optional monthly or term club dues assessed to members';
