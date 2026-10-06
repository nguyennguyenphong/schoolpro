-- =====================================================================
-- TABLE: sys.user_module_preferences
-- Individual student/teacher customizations for dashboard cards
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.user_module_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  module_id       UUID NOT NULL REFERENCES sys.modules(id) ON DELETE CASCADE,
  custom_title    VARCHAR(150),                    -- User personalized card label
  custom_color    VARCHAR(30),                     -- User personalized accent color
  custom_col_span SMALLINT,                        -- User resized grid column span
  custom_row_span SMALLINT,                        -- User resized grid row span
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,  -- Favorite pinned card
  is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,  -- Hidden from home view
  order_no        SMALLINT,                        -- Drag-and-drop sort position
  custom_config   JSONB,                           -- Custom card color, badge, or widget filters
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS ix_user_mod_pref_user ON sys.user_module_preferences(user_id);

COMMENT ON TABLE sys.user_module_preferences IS 'User-specific personalized overrides for dashboard card arrangement and visibility';
COMMENT ON COLUMN sys.user_module_preferences.custom_title IS 'Renamed custom title chosen by user for fast identification';
