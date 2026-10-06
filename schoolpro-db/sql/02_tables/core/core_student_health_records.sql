-- =====================================================================
-- TABLE: core.student_health_records
-- Student medical profile, BMI indicators, allergies, and vision exams
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.student_health_records (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id                  UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  height_cm                   NUMERIC(5,2),
  weight_kg                   NUMERIC(5,2),
  bmi                         NUMERIC(4,2),                         -- Body Mass Index (tự động tính)
  blood_type                  VARCHAR(10),
  vision_left                 VARCHAR(10),
  vision_right                VARCHAR(10),
  hearing_status              VARCHAR(50) DEFAULT 'NORMAL',         -- Thính lực
  dental_status               VARCHAR(100),                         -- Răng hàm mặt
  skeletal_status             VARCHAR(100),                         -- Hệ vận động / cong vẹo cột sống
  allergies                   TEXT,
  chronic_illness             TEXT,                                 -- Bệnh mãn tính (hen suyễn, tim mạch,...)
  health_classification       VARCHAR(20) DEFAULT 'TYPE_1'          -- Phân loại sức khỏe Bộ Y tế (Loại 1 -> Loại 5)
                                CHECK (health_classification IN ('TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4', 'TYPE_5')),
  insurance_code              VARCHAR(50),
  examined_by_nurse_id        UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Nhân viên y tế học đường
  last_checkup_at             DATE,
  vaccination_records         JSONB DEFAULT '[]'::jsonb,            -- Danh mục lịch sử tiêm chủng
  special_care_instructions   TEXT,                                 -- Lưu ý chăm sóc cho GVCN & GV Thể dục
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_health_student ON core.student_health_records(student_id);

COMMENT ON TABLE core.student_health_records IS 'Campus medical clinic records and physical growth tracking per student';
COMMENT ON COLUMN core.student_health_records.bmi IS 'Calculated Body Mass Index (kg/m^2)';
COMMENT ON COLUMN core.student_health_records.health_classification IS 'MOH health classification standard: TYPE_1 (Tốt nhất) to TYPE_5';
