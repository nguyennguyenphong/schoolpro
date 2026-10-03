-- =====================================================================
-- TABLE: core.teachers
-- Faculty members, pedagogical specializations, and departmental ties
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.teachers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  teacher_code    VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'GV202601'
  department_id   UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  qualification   VARCHAR(100) DEFAULT 'Cử nhân Sư phạm',
  subject_major   VARCHAR(150) NOT NULL,             -- Primary subject major
  hire_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'MATERNITY_LEAVE', 'RETIRED', 'RESIGNED')),
  is_homeroom     BOOLEAN NOT NULL DEFAULT FALSE,    -- Flag indicating active homeroom teacher
  employment_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME'
                    CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'PROBATION', 'CONTRACT', 'VISITING')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.teachers IS 'Academic teaching staff profiles and department assignments';
