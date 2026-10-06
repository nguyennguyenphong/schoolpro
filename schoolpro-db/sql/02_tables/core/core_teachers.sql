-- =====================================================================
-- TABLE: core.teachers
-- Faculty members, pedagogical specializations, and departmental ties
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.teachers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  school_id               UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  teacher_code            VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'GV202601'
  department_id           UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  qualification           VARCHAR(100) DEFAULT 'Cử nhân Sư phạm',
  subject_major           VARCHAR(150) NOT NULL,             -- Primary subject major
  national_id_number      VARCHAR(20),                       -- CCCD / VNeID identification
  tax_code                VARCHAR(20),                       -- Personal tax ID (Mã số thuế cá nhân)
  social_insurance_number VARCHAR(30),                       -- BHXH card / book number
  academic_rank           VARCHAR(50),                       -- Cử nhân, Thạc sĩ, Tiến sĩ, PGS, GS
  years_of_experience     SMALLINT DEFAULT 0,
  teaching_certificate    VARCHAR(200),                      -- Professional teacher credential
  foreign_language_level  VARCHAR(50),                       -- E.g. B1, B2, IELTS 7.0
  it_level                VARCHAR(50),                       -- E.g. Chuẩn CNTT cơ bản / nâng cao
  standard_weekly_periods SMALLINT NOT NULL DEFAULT 17,      -- Định mức tiết dạy tiêu chuẩn/tuần (Quy định Bộ GD)
  salary_grade            VARCHAR(20),                       -- Bậc lương / hệ số lương hiện hưởng
  is_party_member         BOOLEAN NOT NULL DEFAULT FALSE,    -- Đảng viên Đảng CSVN
  party_entry_date        DATE,
  contract_number         VARCHAR(50),
  hire_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  contract_end_date       DATE,
  status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'MATERNITY_LEAVE', 'RETIRED', 'RESIGNED')),
  is_homeroom             BOOLEAN NOT NULL DEFAULT FALSE,    -- Flag indicating active homeroom teacher
  employment_type         VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME'
                            CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'PROBATION', 'CONTRACT', 'VISITING')),
  biography               TEXT,
  custom_attributes       JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_teachers_school ON core.teachers(school_id);
CREATE INDEX IF NOT EXISTS ix_teachers_department ON core.teachers(department_id);
CREATE INDEX IF NOT EXISTS ix_teachers_code ON core.teachers(teacher_code);
CREATE INDEX IF NOT EXISTS ix_teachers_status ON core.teachers(status);

COMMENT ON TABLE core.teachers IS 'Academic teaching staff profiles, credentials, tax, and employment dossier';
COMMENT ON COLUMN core.teachers.standard_weekly_periods IS 'Standard mandatory weekly teaching periods (MOET quota: 17 periods/week for high schools)';
