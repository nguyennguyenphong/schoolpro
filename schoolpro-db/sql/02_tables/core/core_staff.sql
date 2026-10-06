-- =====================================================================
-- TABLE: core.staff
-- Administrative personnel, supervisors, librarians, accountants, and nurses
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.staff (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  school_id               UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  staff_code              VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'NV202601'
  department_id           UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  job_title               VARCHAR(150) NOT NULL,             -- E.g. 'Giám thị', 'Y tế học đường', 'Kế toán', 'Thủ thư'
  national_id_number      VARCHAR(20),
  tax_code                VARCHAR(20),
  social_insurance_number VARCHAR(30),
  qualification           VARCHAR(100),                      -- Trình độ chuyên môn (Cử nhân, Kỹ sư, Cao đẳng)
  employment_type         VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME'
                            CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'PROBATION', 'CONTRACT')),
  contract_number         VARCHAR(50),
  contract_end_date       DATE,
  hire_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'RETIRED')),
  custom_attributes       JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_staff_school ON core.staff(school_id);
CREATE INDEX IF NOT EXISTS ix_staff_department ON core.staff(department_id);
CREATE INDEX IF NOT EXISTS ix_staff_code ON core.staff(staff_code);

COMMENT ON TABLE core.staff IS 'Non-teaching administrative staff, supervisors, and auxiliary professionals';
