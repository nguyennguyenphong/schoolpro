-- =====================================================================
-- TABLE: emulation.disciplinary_records
-- Formal disciplinary council notices, suspension orders, and commendations
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.disciplinary_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  record_type     VARCHAR(20) NOT NULL
                    CHECK (record_type IN ('COMMENDATION', 'DISCIPLINE')),
  level           VARCHAR(50) NOT NULL,            -- E.g. 'WARNING', 'REPRIMAND', 'SUSPENSION'
  title           VARCHAR(255) NOT NULL,
  decision_no     VARCHAR(100),
  decision_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  conduct_impact  VARCHAR(50),
  description     TEXT,
  signed_by       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  attachment_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE emulation.disciplinary_records IS 'Formal disciplinary decisions and honorary citations';
