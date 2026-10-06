-- =====================================================================
-- TABLE: core.students
-- Extended student profile linked with user credentials
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.students (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  school_id                     UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  student_code                  VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'HS20261001'
  national_id_number            VARCHAR(20),                       -- CCCD / VNeID personal identification number
  national_id_issued_date       DATE,
  national_id_issued_place      VARCHAR(150),
  admission_date                DATE NOT NULL DEFAULT CURRENT_DATE,
  graduation_date               DATE,
  ethnicity                     VARCHAR(50) DEFAULT 'Kinh',
  religion                      VARCHAR(50) DEFAULT 'Không',
  status                        VARCHAR(20) NOT NULL DEFAULT 'STUDYING'
                                  CHECK (status IN ('STUDYING', 'GRADUATED', 'TRANSFERRED_OUT', 'RESERVED', 'DROPPED_OUT', 'SUSPENDED')),
  current_class_id              UUID REFERENCES core.classes(id) ON DELETE SET NULL,
  birth_place                   VARCHAR(100),                      -- Place of birth per MOET standard
  permanent_address             TEXT,                              -- Hộ khẩu thường trú
  temporary_address             TEXT,                              -- Địa chỉ tạm trú hiện tại
  household_registration_number VARCHAR(50),                       -- Số sổ hộ khẩu / Mã định danh hộ gia đình
  insurance_card_number         VARCHAR(30),                       -- Số thẻ Bảo hiểm Y tế (BHYT)
  policy_beneficiary            VARCHAR(100),                      -- Diện chính sách (hộ nghèo, con liệt sĩ,...)
  blood_type                    VARCHAR(5),
  allergies                     TEXT,
  is_boarder                    BOOLEAN NOT NULL DEFAULT FALSE,    -- Boarding / day-boarding flag
  is_pioneer                    BOOLEAN NOT NULL DEFAULT TRUE,     -- Đội viên Đội TNTP HCM
  pioneer_entry_date            DATE,
  is_union_member               BOOLEAN NOT NULL DEFAULT FALSE,    -- Đoàn viên Đoàn TNCS HCM
  union_entry_date              DATE,
  special_notes                 TEXT,                              -- Lưu ý sư phạm đặc biệt
  custom_attributes             JSONB DEFAULT '{}'::jsonb,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_students_school ON core.students(school_id);
CREATE INDEX IF NOT EXISTS ix_students_class ON core.students(current_class_id);
CREATE INDEX IF NOT EXISTS ix_students_national_id ON core.students(national_id_number);
CREATE INDEX IF NOT EXISTS ix_students_status ON core.students(status);

COMMENT ON TABLE core.students IS 'Comprehensive student educational lifecycle dossier conforming to MOET & VNeID digital standards';
COMMENT ON COLUMN core.students.national_id_number IS 'National identification / Personal identification number (CCCD/VNeID)';
COMMENT ON COLUMN core.students.is_union_member IS 'Youth Union (Đoàn TNCS HCM) membership flag';
