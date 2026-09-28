-- =====================================================================
-- DATABASE TRIGGERS
-- SchoolPro 360 Education Management System
-- =====================================================================

-- Auto-update updated_at for core.schools
DROP TRIGGER IF EXISTS trg_schools_updated_at ON core.schools;
CREATE TRIGGER trg_schools_updated_at
  BEFORE UPDATE ON core.schools
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for core.users
DROP TRIGGER IF EXISTS trg_users_updated_at ON core.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON core.users
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.curriculum_materials
DROP TRIGGER IF EXISTS trg_materials_updated_at ON academic.curriculum_materials;
CREATE TRIGGER trg_materials_updated_at
  BEFORE UPDATE ON academic.curriculum_materials
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.assignments
DROP TRIGGER IF EXISTS trg_assignments_updated_at ON academic.assignments;
CREATE TRIGGER trg_assignments_updated_at
  BEFORE UPDATE ON academic.assignments
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.student_scores
DROP TRIGGER IF EXISTS trg_scores_updated_at ON academic.student_scores;
CREATE TRIGGER trg_scores_updated_at
  BEFORE UPDATE ON academic.student_scores
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for sys.user_module_preferences
DROP TRIGGER IF EXISTS trg_user_module_pref_updated_at ON sys.user_module_preferences;
CREATE TRIGGER trg_user_module_pref_updated_at
  BEFORE UPDATE ON sys.user_module_preferences
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();
