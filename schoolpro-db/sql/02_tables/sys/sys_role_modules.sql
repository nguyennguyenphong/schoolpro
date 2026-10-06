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
  grid_col_span      SMALLINT NOT NULL DEFAULT 1,      -- Number of grid columns occupied
  grid_row_span      SMALLINT NOT NULL DEFAULT 1,      -- Number of grid rows occupied
  min_screen_width   VARCHAR(20) NOT NULL DEFAULT 'ALL'-- Responsive threshold ('ALL', 'SM', 'MD', 'LG', 'XL')
                       CHECK (min_screen_width IN ('ALL', 'SM', 'MD', 'LG', 'XL')),
  can_hide           BOOLEAN NOT NULL DEFAULT TRUE,    -- Whether users can hide this mandatory card
  custom_badge       VARCHAR(50),
  config             JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role_id, module_id)
);

CREATE INDEX IF NOT EXISTS ix_role_modules_role ON sys.role_modules(role_id);

COMMENT ON TABLE sys.role_modules IS 'Default dashboard functional card layout and accessibility mapped per user role';
COMMENT ON COLUMN sys.role_modules.can_hide IS 'Flag preventing users from hiding mandatory institutional cards';
