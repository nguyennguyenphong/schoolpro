-- =====================================================================
-- TABLE: core.user_roles
-- User role memberships with primary role and validity intervals
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.user_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,   -- Default active role upon sign-in
  effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to    DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS ix_user_roles_user ON core.user_roles(user_id);
CREATE INDEX IF NOT EXISTS ix_user_roles_role ON core.user_roles(role_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_roles_primary
  ON core.user_roles(user_id) WHERE is_primary = TRUE AND status = 'ACTIVE';

COMMENT ON TABLE core.user_roles IS 'User-to-role assignment with primary role flag and expiration dates';
