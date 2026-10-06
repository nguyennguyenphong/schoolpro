-- =====================================================================
-- TABLE: core.subjects (Master Data)
-- Subjects taught according to national curriculum standard (GDPT 2018)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.subjects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id         UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  department_id     UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  code              VARCHAR(20) NOT NULL,              -- E.g. 'TOAN', 'VAN', 'ANH', 'VAT_LY'
  name              VARCHAR(150) NOT NULL,             -- E.g. 'Toán học', 'Ngữ văn'
  short_name        VARCHAR(50),                       -- Tên viết tắt: 'Toán', 'Văn', 'Anh'
  grade_level       SMALLINT CHECK (grade_level IN (10, 11, 12)),
  evaluation_type   VARCHAR(20) NOT NULL DEFAULT 'SCORE'
                      CHECK (evaluation_type IN ('SCORE', 'COMMENT')), -- Numeric score or pass/fail qualitative
  periods_per_year  SMALLINT DEFAULT 105,              -- Tổng số tiết định mức trong năm học
  is_compulsory     BOOLEAN NOT NULL DEFAULT TRUE,     -- Compulsory vs elective subject track
  color_code        VARCHAR(30) DEFAULT '#3B82F6',     -- Màu nhận diện môn học trên TKB & Lịch thi
  icon              VARCHAR(50) DEFAULT 'book',
  order_no          SMALLINT NOT NULL DEFAULT 0,       -- Thứ tự hiển thị trong sổ điểm học bạ
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  metadata          JSONB DEFAULT '{}'::jsonb,         -- Periods per year, subject stream, curriculum codes
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS ix_subjects_school ON core.subjects(school_id);
CREATE INDEX IF NOT EXISTS ix_subjects_department ON core.subjects(department_id);

COMMENT ON TABLE core.subjects IS 'Master subjects directory aligned with Vietnamese high school curriculum (GDPT 2018)';
COMMENT ON COLUMN core.subjects.periods_per_year IS 'Total mandatory curriculum periods per school academic year';
