-- =====================================================================
-- TABLE: core.students
-- Extended student profile linked with user credentials
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  student_code    VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'HS20261001'
  admission_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  graduation_date DATE,
  ethnicity       VARCHAR(50) DEFAULT 'Kinh',
  religion        VARCHAR(50) DEFAULT 'Không',
  status          VARCHAR(20) NOT NULL DEFAULT 'STUDYING'
                    CHECK (status IN ('STUDYING', 'GRADUATED', 'TRANSFERRED_OUT', 'RESERVED', 'DROPPED_OUT', 'SUSPENDED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.students IS 'Comprehensive student educational lifecycle dossier';
