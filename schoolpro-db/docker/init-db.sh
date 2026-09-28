#!/bin/bash
# =====================================================================
# DOCKER DATABASE INITIALIZATION RUNNER
# Executes all schema definitions, tables, triggers, views, and seed data
# in strict topological order to guarantee zero foreign key errors.
# =====================================================================

set -e

echo "=========================================================="
echo " Starting SchoolPro Database Initialization..."
echo " Database: ${POSTGRES_DB:-schoolpro}"
echo " User:     ${POSTGRES_USER:-postgres}"
echo "=========================================================="

SQL_DIR="/docker-entrypoint-initdb.d/sql"

execute_sql() {
  local file_path="$1"
  echo "--> Executing: $(basename "$file_path")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file_path"
}

# 1. Schemas & Extensions
echo "=== Step 1: Initializing Schemas & Extensions ==="
execute_sql "$SQL_DIR/00_schemas.sql"

# 2. Database Functions
echo "=== Step 2: Initializing Functions ==="
execute_sql "$SQL_DIR/01_functions/functions.sql"

# 3. Master Data Tables (Classification Catalogs)
echo "=== Step 3: Initializing Master Data Tables ==="
execute_sql "$SQL_DIR/02_tables/master/master_lookup_types.sql"
execute_sql "$SQL_DIR/02_tables/master/master_lookup_values.sql"
execute_sql "$SQL_DIR/02_tables/master/master_schools.sql"
execute_sql "$SQL_DIR/02_tables/master/master_academic_years.sql"
execute_sql "$SQL_DIR/02_tables/master/master_semesters.sql"

# 4. Core Infrastructure Tables
echo "=== Step 4: Initializing Core Identity & Organizational Tables ==="
execute_sql "$SQL_DIR/02_tables/core/core_custom_field_definitions.sql"
execute_sql "$SQL_DIR/02_tables/core/core_custom_field_values.sql"
execute_sql "$SQL_DIR/02_tables/core/core_users.sql"
execute_sql "$SQL_DIR/02_tables/core/core_roles.sql"
execute_sql "$SQL_DIR/02_tables/core/core_permissions.sql"
execute_sql "$SQL_DIR/02_tables/core/core_role_permissions.sql"
execute_sql "$SQL_DIR/02_tables/core/core_user_roles.sql"
execute_sql "$SQL_DIR/02_tables/master/master_departments.sql"
execute_sql "$SQL_DIR/02_tables/master/master_grades.sql"
execute_sql "$SQL_DIR/02_tables/core/core_classes.sql"
execute_sql "$SQL_DIR/02_tables/core/core_class_groups.sql"
execute_sql "$SQL_DIR/02_tables/master/master_positions.sql"
execute_sql "$SQL_DIR/02_tables/core/core_position_assignments.sql"
execute_sql "$SQL_DIR/02_tables/core/core_students.sql"
execute_sql "$SQL_DIR/02_tables/core/core_student_health_records.sql"
execute_sql "$SQL_DIR/02_tables/core/core_guardians.sql"
execute_sql "$SQL_DIR/02_tables/core/core_teachers.sql"
execute_sql "$SQL_DIR/02_tables/core/core_staff.sql"
execute_sql "$SQL_DIR/02_tables/core/core_student_class_enrollments.sql"
execute_sql "$SQL_DIR/02_tables/master/master_subjects.sql"
execute_sql "$SQL_DIR/02_tables/core/core_class_subject_teachers.sql"
execute_sql "$SQL_DIR/02_tables/core/core_clubs.sql"
execute_sql "$SQL_DIR/02_tables/core/core_club_members.sql"

# 5. Academic Operations Tables
echo "=== Step 5: Initializing Academic Operations Tables ==="
execute_sql "$SQL_DIR/02_tables/master/master_rooms.sql"
execute_sql "$SQL_DIR/02_tables/master/master_periods.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_timetables.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_timetable_changes.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_class_journal_entries.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_curriculum_materials.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_material_attachments.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_assignments.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_assignment_submissions.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_curriculum_tracks.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_curriculum_track_subjects.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_student_track_enrollments.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_question_bank.sql"
execute_sql "$SQL_DIR/02_tables/master/master_score_types.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_exams.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_exam_questions.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_exam_submissions.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_exam_submission_answers.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_student_scores.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_conduct_evaluations.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_report_cards.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_student_term_summaries.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_subject_exemptions.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_extracurricular_activities.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_activity_participations.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_fee_items.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_student_fee_bills.sql"
execute_sql "$SQL_DIR/02_tables/academic/academic_attendance.sql"

# 6. Emulation 360 Tables
echo "=== Step 6: Initializing Emulation & Discipline Tables ==="
execute_sql "$SQL_DIR/02_tables/emulation/emulation_periods.sql"
execute_sql "$SQL_DIR/02_tables/master/master_emulation_criteria.sql"
execute_sql "$SQL_DIR/02_tables/emulation/emulation_class_custom_criteria.sql"
execute_sql "$SQL_DIR/02_tables/emulation/emulation_supervisor_duty_logs.sql"
execute_sql "$SQL_DIR/02_tables/emulation/emulation_records.sql"
execute_sql "$SQL_DIR/02_tables/emulation/emulation_rankings.sql"
execute_sql "$SQL_DIR/02_tables/emulation/emulation_disciplinary_records.sql"
execute_sql "$SQL_DIR/02_tables/emulation/emulation_awards.sql"

# 7. Evaluation & Facility Maintenance Tables
echo "=== Step 7: Initializing Evaluation & Facility Tables ==="
execute_sql "$SQL_DIR/02_tables/evaluation/evaluation_forms.sql"
execute_sql "$SQL_DIR/02_tables/evaluation/evaluation_questions.sql"
execute_sql "$SQL_DIR/02_tables/evaluation/evaluation_facilities.sql"
execute_sql "$SQL_DIR/02_tables/evaluation/evaluation_submissions.sql"
execute_sql "$SQL_DIR/02_tables/evaluation/evaluation_answers.sql"
execute_sql "$SQL_DIR/02_tables/evaluation/evaluation_facility_incident_reports.sql"

# 8. Notification & Communication Tables
echo "=== Step 8: Initializing Notification & Communication Tables ==="
execute_sql "$SQL_DIR/02_tables/notification/notification_announcements.sql"
execute_sql "$SQL_DIR/02_tables/notification/notification_announcement_reads.sql"
execute_sql "$SQL_DIR/02_tables/notification/notification_reminders.sql"
execute_sql "$SQL_DIR/02_tables/notification/notification_push_tokens.sql"
execute_sql "$SQL_DIR/02_tables/notification/notification_contact_book_notes.sql"
execute_sql "$SQL_DIR/02_tables/notification/notification_parent_teacher_messages.sql"

# 9. Dynamic System & Dashboard Cards Tables
echo "=== Step 9: Initializing Dynamic Dashboard Cards & Settings Tables ==="
execute_sql "$SQL_DIR/02_tables/master/master_modules.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_role_modules.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_user_module_preferences.sql"
execute_sql "$SQL_DIR/02_tables/master/master_settings_definitions.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_role_settings_defaults.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_system_settings.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_user_settings.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_audit_logs.sql"
execute_sql "$SQL_DIR/02_tables/sys/sys_event_outbox.sql"

# 10. Views
echo "=== Step 10: Creating Database Views ==="
execute_sql "$SQL_DIR/03_views/views.sql"

# 11. Triggers
echo "=== Step 11: Registering Database Triggers ==="
execute_sql "$SQL_DIR/04_triggers/triggers.sql"

# 12. Master & Seed Data (INSERT Statements)
echo "=== Step 12: Populating Master Data & Seed Records ==="
execute_sql "$SQL_DIR/05_seeds/init.sql"

echo "=========================================================="
echo " SchoolPro Database Initialization Finished Successfully! "
echo "=========================================================="
