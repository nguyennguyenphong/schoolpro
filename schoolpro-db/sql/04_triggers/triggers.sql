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

-- Auto-update updated_at for academic.curriculum_tracks
DROP TRIGGER IF EXISTS trg_tracks_updated_at ON academic.curriculum_tracks;
CREATE TRIGGER trg_tracks_updated_at
  BEFORE UPDATE ON academic.curriculum_tracks
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.question_bank
DROP TRIGGER IF EXISTS trg_qbank_updated_at ON academic.question_bank;
CREATE TRIGGER trg_qbank_updated_at
  BEFORE UPDATE ON academic.question_bank
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.exam_submissions
DROP TRIGGER IF EXISTS trg_exam_sub_updated_at ON academic.exam_submissions;
CREATE TRIGGER trg_exam_sub_updated_at
  BEFORE UPDATE ON academic.exam_submissions
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.conduct_evaluations
DROP TRIGGER IF EXISTS trg_conduct_eval_updated_at ON academic.conduct_evaluations;
CREATE TRIGGER trg_conduct_eval_updated_at
  BEFORE UPDATE ON academic.conduct_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.student_term_summaries
DROP TRIGGER IF EXISTS trg_term_sum_updated_at ON academic.student_term_summaries;
CREATE TRIGGER trg_term_sum_updated_at
  BEFORE UPDATE ON academic.student_term_summaries
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.subject_exemptions
DROP TRIGGER IF EXISTS trg_exemptions_updated_at ON academic.subject_exemptions;
CREATE TRIGGER trg_exemptions_updated_at
  BEFORE UPDATE ON academic.subject_exemptions
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for core.clubs
DROP TRIGGER IF EXISTS trg_clubs_updated_at ON core.clubs;
CREATE TRIGGER trg_clubs_updated_at
  BEFORE UPDATE ON core.clubs
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.extracurricular_activities
DROP TRIGGER IF EXISTS trg_extra_act_updated_at ON academic.extracurricular_activities;
CREATE TRIGGER trg_extra_act_updated_at
  BEFORE UPDATE ON academic.extracurricular_activities
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for notification.contact_book_notes
DROP TRIGGER IF EXISTS trg_contact_book_updated_at ON notification.contact_book_notes;
CREATE TRIGGER trg_contact_book_updated_at
  BEFORE UPDATE ON notification.contact_book_notes
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.fee_items
DROP TRIGGER IF EXISTS trg_fee_items_updated_at ON academic.fee_items;
CREATE TRIGGER trg_fee_items_updated_at
  BEFORE UPDATE ON academic.fee_items
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.student_fee_bills
DROP TRIGGER IF EXISTS trg_student_fee_bills_updated_at ON academic.student_fee_bills;
CREATE TRIGGER trg_student_fee_bills_updated_at
  BEFORE UPDATE ON academic.student_fee_bills
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.attendance_sessions
DROP TRIGGER IF EXISTS trg_attendance_sessions_updated_at ON academic.attendance_sessions;
CREATE TRIGGER trg_attendance_sessions_updated_at
  BEFORE UPDATE ON academic.attendance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();
