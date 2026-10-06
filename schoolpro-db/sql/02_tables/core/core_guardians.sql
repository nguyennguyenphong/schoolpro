-- =====================================================================
-- TABLE: core.guardians
-- Student parents, legal guardians, and parent committee representatives
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.guardians (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  user_id              UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Optional portal account
  full_name            VARCHAR(255) NOT NULL,
  relationship         VARCHAR(50) NOT NULL,           -- E.g. 'Cha', 'Mẹ', 'Người giám hộ'
  national_id          VARCHAR(30),                    -- CCCD phụ huynh
  phone                VARCHAR(20) NOT NULL,
  email                VARCHAR(255),
  job                  VARCHAR(150),
  workplace            VARCHAR(255),                   -- Nơi công tác
  address              TEXT,                           -- Địa chỉ liên lạc
  is_primary_contact   BOOLEAN NOT NULL DEFAULT FALSE,
  is_emergency_contact BOOLEAN NOT NULL DEFAULT TRUE,  -- Người liên hệ khẩn cấp
  is_parent_committee  BOOLEAN NOT NULL DEFAULT FALSE,
  committee_role       VARCHAR(50),                    -- Trưởng ban, Phó ban, Ủy viên Ban ĐDCMHS
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_guardians_student ON core.guardians(student_id);
CREATE INDEX IF NOT EXISTS ix_guardians_phone ON core.guardians(phone);

COMMENT ON TABLE core.guardians IS 'Parent and guardian directory for home-school omnichannel communications';
COMMENT ON COLUMN core.guardians.is_emergency_contact IS 'Designated emergency contact during school hours or critical incidents';
