-- =====================================================================
-- TABLE: core.staff
-- Administrative personnel, supervisors, librarians, accountants, and nurses
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  staff_code      VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'NV202601'
  department_id   UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  job_title       VARCHAR(150) NOT NULL,             -- E.g. 'Giám thị', 'Y tế học đường', 'Kế toán'
  hire_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'RESIGNED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.staff IS 'Non-teaching administrative staff, supervisors, and auxiliary professionals';
