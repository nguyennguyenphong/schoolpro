-- =====================================================================
-- TABLE: academic.curriculum_tracks
-- High school academic tracks and subject combinations (Giáo dục phổ thông 2018)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_tracks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  grade_id            UUID NOT NULL REFERENCES core.grades(id) ON DELETE CASCADE,
  code                VARCHAR(50) NOT NULL,               -- E.g. 'TRACK_KHTN_A00', 'TRACK_KHXH_D01'
  name                VARCHAR(255) NOT NULL,              -- E.g. 'Ban Khoa học Tự nhiên A00 (Toán-Lý-Hóa-Tin)'
  career_orientation  VARCHAR(100),                       -- E.g. 'Kỹ thuật - Công nghệ - Y Dược'
  quota_students      SMALLINT,                           -- Target enrollment quota
  admission_criteria  TEXT,                               -- Criteria or entrance requirements for track selection
  color_tag           VARCHAR(30) DEFAULT 'blue',         -- UI badge color
  description         TEXT,
  settings            JSONB DEFAULT '{}'::jsonb,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, grade_id, code)
);

CREATE INDEX IF NOT EXISTS ix_tracks_school_grade ON academic.curriculum_tracks(school_id, grade_id);

COMMENT ON TABLE academic.curriculum_tracks IS 'Elective subject tracks and career orientation clusters under Giáo dục phổ thông 2018 curriculum';
COMMENT ON COLUMN academic.curriculum_tracks.code IS 'Unique code for academic track within school and grade';
COMMENT ON COLUMN academic.curriculum_tracks.career_orientation IS 'Target university entrance cluster or professional domain';
