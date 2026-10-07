-- =====================================================================
-- TABLE: core.classes
-- School classes for each academic year (e.g. 10A1, 11B2, 12A1)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.classes (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                    UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  academic_year_id             UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  grade_id                     UUID NOT NULL REFERENCES core.grades(id),
  code                         VARCHAR(20) NOT NULL,        -- E.g. '10A1'
  name                         VARCHAR(100) NOT NULL,       -- E.g. 'Lớp 10A1'
  homeroom_teacher_id          UUID,                        -- GVCN chính (references core.teachers)
  assistant_homeroom_teacher_id UUID,                        -- GVCN phụ tá (references core.teachers)
  monitor_student_id           UUID,                        -- Lớp trưởng (references core.students)
  vice_monitor_student_id      UUID,                        -- Lớp phó học tập (references core.students)
  curriculum_track_id          UUID,                        -- Tổ hợp ban (references academic.curriculum_tracks)
  shift                        VARCHAR(20) NOT NULL DEFAULT 'MORNING'
                                 CHECK (shift IN ('MORNING', 'AFTERNOON', 'FULL_DAY')),
  room_id                      UUID,                        -- Phòng học cố định (references academic.rooms)
  room_name                    VARCHAR(50),                 -- Assigned permanent classroom display name
  class_stream_code            VARCHAR(30) DEFAULT 'KHTN',  -- Natural Sciences vs Social Sciences ('CLASS_STREAM')
  max_students                 SMALLINT DEFAULT 45,
  slogan                       VARCHAR(255),
  avatar_url                   TEXT,
  is_active                    BOOLEAN NOT NULL DEFAULT TRUE,
  metadata                     JSONB DEFAULT '{}'::jsonb,   -- Subject track configuration per GDPT 2018
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_classes_school ON core.classes(school_id);
CREATE INDEX IF NOT EXISTS ix_classes_grade ON core.classes(grade_id);
CREATE INDEX IF NOT EXISTS ix_classes_homeroom ON core.classes(homeroom_teacher_id);
CREATE INDEX IF NOT EXISTS ix_classes_track ON core.classes(curriculum_track_id);

COMMENT ON TABLE core.classes IS 'Annual high school class rooms grouped by grade level, homeroom teacher, and academic track';
COMMENT ON COLUMN core.classes.homeroom_teacher_id IS 'Assigned principal homeroom teacher (Giáo viên chủ nhiệm)';
COMMENT ON COLUMN core.classes.curriculum_track_id IS 'GDPT 2018 subject track combination assigned to the entire classroom';
