-- =====================================================================
-- TABLE: core.guardians
-- Student parents, legal guardians, and parent committee representatives
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.guardians (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Optional portal account
  full_name           VARCHAR(255) NOT NULL,
  relationship        VARCHAR(50) NOT NULL,           -- E.g. 'Cha', 'Mẹ', 'Người giám hộ'
  phone               VARCHAR(20) NOT NULL,
  email               VARCHAR(255),
  job                 VARCHAR(150),
  is_primary_contact  BOOLEAN NOT NULL DEFAULT FALSE,
  is_parent_committee BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE core.guardians IS 'Parent and guardian directory for home-school omnichannel communications';
