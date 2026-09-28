-- =====================================================================
-- TABLE: sys.role_modules
-- Dynamic card module permissions and layout defaults per role
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.role_modules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id            UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  module_id          UUID NOT NULL REFERENCES sys.modules(id) ON DELETE CASCADE,
  is_visible         BOOLEAN NOT NULL DEFAULT TRUE,
  is_pinned_default  BOOLEAN NOT NULL DEFAULT FALSE,
  order_no           SMALLINT NOT NULL DEFAULT 0,
  grid_col_span      SMALLINT DEFAULT 1,
  custom_badge       VARCHAR(50),
  config             JSONB,
  UNIQUE (role_id, module_id)
);

COMMENT ON TABLE sys.role_modules IS 'Default dashboard functional card layout and accessibility mapped per user role';
