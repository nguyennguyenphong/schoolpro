-- =====================================================================
-- INITIALIZATION SEED SCRIPT (init.sql)
-- SchoolPro 360 Education Management System
-- Creates ONLY the system superadmin account, basic system role, and permissions
-- All business data, school profiles, academic data, classes, students,
-- teachers, and timetables are to be created manually through admin interfaces.
-- =====================================================================

-- 1. Default Superadmin Role
INSERT INTO core.roles (id, code, name, description, badge_color, icon, is_system, is_active) VALUES
  ('d96c271e-0b8d-4727-b2e9-a4f164a7c8d5', 'R_ADMIN_839201', 'Quản trị viên hệ thống', 'Toàn quyền cấu hình, vận hành và quản trị kỹ thuật', '#1E293B', 'shield-check', TRUE, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  badge_color = EXCLUDED.badge_color,
  description = EXCLUDED.description;

-- 2. System Permissions Directory
INSERT INTO core.permissions (code, name, group_code, description) VALUES
  ('CORE_USER_VIEW',             'Xem danh sách người dùng',          'CORE',         'Quyền tra cứu hồ sơ cá nhân và tài khoản'),
  ('CORE_USER_MANAGE',           'Quản trị tài khoản & phân quyền',   'CORE',         'Quyền tạo mới, khóa và cấp quyền người dùng'),
  ('CORE_CLASS_VIEW',            'Xem danh sách lớp học',             'CORE',         'Tra cứu danh sách lớp và phân bổ học sinh'),
  ('CORE_CLASS_MANAGE',          'Quản lý sơ đồ & tổ chức lớp',       'CORE',         'Quyền tạo lớp, chia tổ và phân công ban cán sự'),
  ('ACADEMIC_TIMETABLE_VIEW',    'Xem thời khóa biểu',                'ACADEMIC',     'Tra cứu lịch giảng dạy và lịch học theo tuần'),
  ('ACADEMIC_TIMETABLE_MANAGE',  'Sắp xếp & chỉnh sửa TKB',           'ACADEMIC',     'Quyền phân công tiết dạy và xếp lịch phòng'),
  ('ACADEMIC_GRADE_VIEW',        'Xem bảng điểm môn học',             'ACADEMIC',     'Tra cứu điểm số thường xuyên, giữa kỳ, cuối kỳ'),
  ('ACADEMIC_GRADE_ENTRY',       'Nhập & chỉnh sửa điểm số',          'ACADEMIC',     'Quyền ghi nhận điểm sổ cái theo phân công môn'),
  ('ACADEMIC_EXAM_VIEW',         'Xem ngân hàng đề thi & lịch thi',   'ACADEMIC',     'Tra cứu lịch thi và phòng thi'),
  ('ACADEMIC_EXAM_MANAGE',       'Quản lý kỳ thi & ngân hàng câu hỏi','ACADEMIC',     'Quyền ra đề thi, tạo kỳ thi và chấm bài trắc nghiệm'),
  ('ACADEMIC_ATTENDANCE_VIEW',   'Xem báo cáo điểm danh chuyên cần',  'ACADEMIC',     'Tra cứu lịch sử điểm danh vắng/trễ'),
  ('ACADEMIC_ATTENDANCE_MARK',   'Thực hiện điểm danh lớp học',       'ACADEMIC',     'Quyền điểm danh đầu giờ và từng tiết'),
  ('EMULATION_RECORD_VIEW',      'Xem điểm thi đua & nề nếp',         'EMULATION',    'Tra cứu điểm thưởng/phạt và bảng xếp hạng tuần'),
  ('EMULATION_RECORD_CREATE',    'Ghi nhận vi phạm & điểm cộng',      'EMULATION',    'Quyền ghi biên bản cờ đỏ và giám thị trực ban'),
  ('EMULATION_RANKING_VIEW',     'Xem xếp hạng thi đua trường/khối',  'EMULATION',    'Thống kê tổng kết cờ thi đua hàng tuần'),
  ('EMULATION_APPEAL_MANAGE',    'Duyệt khiếu nại điểm thi đua',      'EMULATION',    'Quyền phản hồi và xử lý khiếu nại cờ đỏ'),
  ('EVALUATION_TEACHER_SUBMIT',  'Tham gia khảo sát đánh giá GV',     'EVALUATION',   'Học sinh gửi nhận xét chất lượng giờ dạy (ẩn danh)'),
  ('EVALUATION_FACILITY_REPORT', 'Báo cáo sự cố cơ sở vật chất',      'EVALUATION',   'Gửi phiếu báo hỏng thiết bị phòng học'),
  ('EVALUATION_REPORT_VIEW',     'Xem báo cáo khảo sát chất lượng',   'EVALUATION',   'Ban giám hiệu xem tổng hợp đánh giá giảng viên'),
  ('NOTIFICATION_VIEW',          'Nhận & xem thông báo học đường',    'NOTIFICATION', 'Xem bản tin từ trường, đoàn thể và GVCN'),
  ('NOTIFICATION_SEND',          'Soạn & phát hành thông báo',        'NOTIFICATION', 'Quyền đăng thông báo diện rộng hoặc gửi SMS/App'),
  ('CONTACT_BOOK_VIEW',          'Xem sổ liên lạc điện tử',           'NOTIFICATION', 'Phụ huynh tra cứu báo cáo học tập định kỳ'),
  ('CONTACT_BOOK_SIGN',          'Ký duyệt & nhận xét sổ liên lạc',   'NOTIFICATION', 'GVCN gửi phiếu nhận xét và phụ huynh xác nhận'),
  ('SYSTEM_SETTINGS_VIEW',       'Xem cấu hình hệ thống',             'SYSTEM',       'Xem các thông số và cờ tính năng toàn trường'),
  ('SYSTEM_SETTINGS_MANAGE',     'Hiệu chỉnh thông số hệ thống',      'SYSTEM',       'Thay đổi cấu hình kỹ thuật, giao diện, bảo mật'),
  ('AUDIT_LOG_VIEW',             'Tra cứu nhật ký an ninh (Audit Log)','SYSTEM',      'Giám sát các thao tác đăng nhập, sửa điểm, xóa dữ liệu')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  group_code = EXCLUDED.group_code,
  description = EXCLUDED.description;

-- 3. Grant All Permissions to Admin Role
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 'd96c271e-0b8d-4727-b2e9-a4f164a7c8d5', id FROM core.permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. Create Single Superadmin Account
-- Username / Email: admin@schoolpro.edu.vn (also allows 'admin')
-- Password: admin (hashed with Blowfish bcrypt: $2b$08$)
-- Using PostgreSQL pgcrypto crypt('admin', gen_salt('bf', 8))
INSERT INTO core.users (
  id, school_id, username, email, phone, password_hash,
  full_name, date_of_birth, gender_code, national_id, address, status_code
) VALUES (
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NULL,
  'admin@schoolpro.edu.vn',
  'admin@schoolpro.edu.vn',
  '0901234567',
  crypt('admin', gen_salt('bf', 8)),
  'Quản trị viên Hệ thống (Super Admin)',
  '1990-01-01',
  'MALE',
  '079085001234',
  'Trụ sở Trường Học Thông Minh SchoolPro',
  'ACTIVE'
) ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  status_code = EXCLUDED.status_code;

-- 5. Assign Superadmin Role to User
INSERT INTO core.user_roles (user_id, role_id, is_primary, effective_from, status)
SELECT 
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  'd96c271e-0b8d-4727-b2e9-a4f164a7c8d5',
  TRUE,
  CURRENT_DATE,
  'ACTIVE'
ON CONFLICT DO NOTHING;
