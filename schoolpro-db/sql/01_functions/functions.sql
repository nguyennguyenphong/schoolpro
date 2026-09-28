-- =====================================================================
-- DATABASE FUNCTIONS
-- SchoolPro 360 Education Management System
-- =====================================================================

-- Automatically updates updated_at timestamp column on row modification
CREATE OR REPLACE FUNCTION core.fn_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION core.fn_set_updated_at() IS 'Trigger function to automatically maintain updated_at timestamps across all operational tables';
