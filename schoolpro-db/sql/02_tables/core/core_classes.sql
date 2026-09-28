-- =====================================================================
-- TABLE: core.classes
-- School classes for each academic year (e.g. 10A1, 11B2, 12A1)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.classes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  grade_id            UUID NOT NULL REFERENCES core.grades(id),
  code                VARCHAR(20) NOT NULL,        -- E.g. '10A1'
  name                VARCHAR(100) NOT NULL,       -- E.g. 'Lớp 10A1'
  room_name           VARCHAR(50),                 -- Assigned permanent classroom
  class_stream_code   VARCHAR(30) DEFAULT 'KHTN',  -- Natural Sciences vs Social Sciences ('CLASS_STREAM')
  max_students        SMALLINT DEFAULT 45,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  metadata            JSONB DEFAULT '{}'::jsonb,   -- Subject track configuration per GDPT 2018
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_classes_grade ON core.classes(grade_id);

COMMENT ON TABLE core.classes IS 'Annual high school class rooms grouped by grade level and academic track';
