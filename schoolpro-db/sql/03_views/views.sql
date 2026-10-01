-- =====================================================================
-- DATABASE VIEWS
-- SchoolPro 360 Education Management System
-- =====================================================================

-- View: Active Class Leadership & Squad Appointments
CREATE OR REPLACE VIEW core.v_current_class_leadership AS
SELECT
  c.id AS class_id,
  c.code AS class_code,
  c.name AS class_name,
  g.id AS grade_id,
  g.name AS grade_name,
  cg.id AS class_group_id,
  cg.name AS group_name,
  p.code AS position_code,
  p.name AS position_name,
  u.id AS user_id,
  u.full_name AS student_or_teacher_name,
  s.student_code,
  pa.start_date,
  pa.academic_year_id
FROM core.position_assignments pa
JOIN core.positions p ON p.id = pa.position_id
JOIN core.users u ON u.id = pa.user_id
JOIN core.classes c ON c.id = pa.class_id
JOIN core.grades g ON g.id = c.grade_id
LEFT JOIN core.class_groups cg ON cg.id = pa.class_group_id
LEFT JOIN core.students s ON s.user_id = u.id
WHERE pa.is_current = TRUE
ORDER BY c.code, p.code;

COMMENT ON VIEW core.v_current_class_leadership IS 'Real-time overview of current active homeroom teachers, class monitors, and squad leaders';

-- View: Teacher Workload & Class Assignments
CREATE OR REPLACE VIEW core.v_teacher_assignments AS
SELECT
  t.id AS teacher_id,
  t.teacher_code,
  u.full_name AS teacher_name,
  d.name AS department_name,
  c.code AS class_code,
  sub.name AS subject_name,
  sem.code AS semester_code,
  ay.code AS academic_year_code,
  CASE
    WHEN pa.id IS NOT NULL THEN 'HOMEROOM_TEACHER'
    ELSE 'SUBJECT_TEACHER'
  END AS assignment_type
FROM core.teachers t
JOIN core.users u ON u.id = t.user_id
LEFT JOIN core.departments d ON d.id = t.department_id
LEFT JOIN core.class_subject_teachers cst ON cst.teacher_id = t.id
LEFT JOIN core.classes c ON c.id = cst.class_id
LEFT JOIN core.subjects sub ON sub.id = cst.subject_id
LEFT JOIN core.semesters sem ON sem.id = cst.semester_id
LEFT JOIN core.academic_years ay ON ay.id = sem.academic_year_id
LEFT JOIN core.position_assignments pa ON pa.user_id = u.id
  AND pa.class_id = c.id
  AND pa.is_current = TRUE
  AND pa.position_id = (SELECT id FROM core.positions WHERE code = 'HOMEROOM_TEACHER' LIMIT 1);

COMMENT ON VIEW core.v_teacher_assignments IS 'Unified schedule view of teacher subject allocations and homeroom duties';

-- View: Resolved Dynamic Dashboard Cards per User
CREATE OR REPLACE VIEW sys.v_user_dashboard_cards AS
SELECT
  ur.user_id,
  r.code AS role_code,
  m.id AS module_id,
  m.code AS module_code,
  m.name AS module_name,
  m.description,
  m.icon,
  m.route,
  m.module_type,
  m.category,
  COALESCE(ump.is_hidden, FALSE) AS is_hidden,
  COALESCE(ump.is_pinned, rm.is_pinned_default, FALSE) AS is_pinned,
  COALESCE(ump.order_no, rm.order_no, m.default_order_no) AS display_order,
  COALESCE(rm.custom_badge, m.default_badge) AS badge_text,
  COALESCE(ump.custom_config, rm.config, jsonb_build_object('color', m.default_color)) AS ui_config
FROM core.user_roles ur
JOIN core.roles r ON r.id = ur.role_id
JOIN sys.role_modules rm ON rm.role_id = r.id AND rm.is_visible = TRUE
JOIN sys.modules m ON m.id = rm.module_id AND m.is_active = TRUE
LEFT JOIN sys.user_module_preferences ump ON ump.user_id = ur.user_id AND ump.module_id = m.id
WHERE ur.status = 'ACTIVE'
ORDER BY display_order ASC;

COMMENT ON VIEW sys.v_user_dashboard_cards IS 'Computed card stream for user homepage merging role defaults with personal drag/pin preferences';

-- View: 4-Tier Resolved Settings Hierarchy
CREATE OR REPLACE VIEW sys.v_user_effective_settings AS
SELECT
  u.id AS user_id,
  sd.code AS setting_code,
  sd.name AS setting_name,
  sd.category,
  COALESCE(us.value, rsd.value, ss.value, sd.default_value) AS effective_value,
  CASE
    WHEN us.value IS NOT NULL THEN 'USER_CUSTOM'
    WHEN rsd.value IS NOT NULL THEN 'ROLE_DEFAULT'
    WHEN ss.value IS NOT NULL THEN 'SCHOOL_DEFAULT'
    ELSE 'SYSTEM_DEFAULT'
  END AS resolved_from
FROM core.users u
CROSS JOIN sys.settings_definitions sd
LEFT JOIN sys.user_settings us ON us.user_id = u.id AND us.setting_id = sd.id
LEFT JOIN core.user_roles ur ON ur.user_id = u.id AND ur.is_primary = TRUE AND ur.status = 'ACTIVE'
LEFT JOIN sys.role_settings_defaults rsd ON rsd.role_id = ur.role_id AND rsd.setting_id = sd.id
LEFT JOIN sys.system_settings ss ON ss.setting_id = sd.id AND (ss.school_id = u.school_id OR ss.school_id IS NULL)
WHERE sd.is_active = TRUE;

COMMENT ON VIEW sys.v_user_effective_settings IS 'Settings resolution engine resolving User Preference -> Role Override -> School Policy -> System Default';

-- View: Student 360 Comprehensive Profile
CREATE OR REPLACE VIEW core.v_student_360_profile AS
SELECT
  s.id AS student_id,
  s.student_code,
  u.full_name AS student_name,
  u.gender_code AS gender,
  u.email,
  u.phone AS phone_number,
  c.id AS class_id,
  c.code AS class_code,
  c.name AS class_name,
  g.name AS grade_name,
  sch.name AS school_name,
  t.name AS track_name,
  t.career_orientation,
  homeroom_u.full_name AS homeroom_teacher_name,
  homeroom_u.phone AS homeroom_teacher_phone,
  (SELECT COUNT(*) FROM core.club_members cm WHERE cm.student_id = s.id AND cm.status = 'ACTIVE') AS active_clubs_count,
  (SELECT COUNT(*) FROM emulation.awards aw WHERE aw.student_id = s.id) AS awards_count,
  (SELECT COUNT(*) FROM academic.student_fee_bills fb WHERE fb.student_id = s.id AND fb.payment_status = 'UNPAID') AS unpaid_fee_bills_count
FROM core.students s
JOIN core.users u ON u.id = s.user_id
JOIN core.schools sch ON sch.id = u.school_id
LEFT JOIN core.student_class_enrollments sce ON sce.student_id = s.id AND sce.status = 'ACTIVE'
LEFT JOIN core.classes c ON c.id = sce.class_id
LEFT JOIN core.grades g ON g.id = c.grade_id
LEFT JOIN academic.student_track_enrollments ste ON ste.student_id = s.id AND ste.status = 'ACTIVE'
LEFT JOIN academic.curriculum_tracks t ON t.id = ste.track_id
LEFT JOIN core.position_assignments pa ON pa.class_id = c.id AND pa.is_current = TRUE
  AND pa.position_id = (SELECT id FROM core.positions WHERE code = 'HOMEROOM_TEACHER' LIMIT 1)
LEFT JOIN core.users homeroom_u ON homeroom_u.id = pa.user_id
LEFT JOIN core.teachers homeroom_t ON homeroom_t.user_id = homeroom_u.id;

COMMENT ON VIEW core.v_student_360_profile IS '360-degree synthesized profile of a student aggregating classroom, homeroom mentor, track, clubs, awards, and fees';
