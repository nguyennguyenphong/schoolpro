-- =====================================================================
-- TABLE: emulation.class_custom_criteria
-- Class-specific internal emulation rules created by homeroom teachers / class leaders
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.class_custom_criteria (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  code            VARCHAR(50) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  points          NUMERIC(6,2) NOT NULL,
  is_violation    BOOLEAN NOT NULL DEFAULT FALSE,
  target_scope    VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL'
                    CHECK (target_scope IN ('INDIVIDUAL', 'GROUP')),
  created_by      UUID NOT NULL REFERENCES core.users(id),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, code)
);

COMMENT ON TABLE emulation.class_custom_criteria IS 'Custom internal class emulation rules tailored for individual classrooms';
