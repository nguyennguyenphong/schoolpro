-- =====================================================================
-- INITIALIZATION & MASTER DATA SEED SCRIPT (init.sql)
-- SchoolPro 360 Education Management System
-- =====================================================================

-- 1. MASTER DATA: Dynamic Lookup Types
INSERT INTO core.lookup_types (code, name, description) VALUES
  ('GENDER',              'Giới tính',                   'Nam, Nữ, Khác'),
  ('ACCOUNT_STATUS',      'Trạng thái tài khoản',        'Hoạt động, Tạm khóa, Chờ duyệt'),
  ('CLASS_STREAM',        'Ban học tập THPT',            'Khoa học Tự nhiên, Khoa học Xã hội, Chuyên'),
  ('ROOM_TYPE',           'Phân loại phòng ốc',          'Phòng học lý thuyết, Phòng thí nghiệm, Thư viện'),
  ('FACILITY_CATEGORY',   'Danh mục cơ sở vật chất',     'Thiết bị điện tử, Bàn ghế, Chiếu sáng, Thể thao')
ON CONFLICT (code) DO NOTHING;

-- 2. MASTER DATA: Dynamic Lookup Values
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'MALE', 'Nam', 1, '#3B82F6', TRUE FROM core.lookup_types WHERE code = 'GENDER'
UNION ALL SELECT id, 'FEMALE', 'Nữ', 2, '#EC4899', FALSE FROM core.lookup_types WHERE code = 'GENDER'
UNION ALL SELECT id, 'OTHER', 'Khác', 3, '#94A3B8', FALSE FROM core.lookup_types WHERE code = 'GENDER'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'ACTIVE', 'Đang hoạt động', 1, '#10B981', TRUE FROM core.lookup_types WHERE code = 'ACCOUNT_STATUS'
UNION ALL SELECT id, 'LOCKED', 'Tạm khóa', 2, '#EF4444', FALSE FROM core.lookup_types WHERE code = 'ACCOUNT_STATUS'
UNION ALL SELECT id, 'PENDING', 'Chờ duyệt', 3, '#F59E0B', FALSE FROM core.lookup_types WHERE code = 'ACCOUNT_STATUS'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'KHTN', 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', 1, '#2563EB', TRUE FROM core.lookup_types WHERE code = 'CLASS_STREAM'
UNION ALL SELECT id, 'KHXH', 'Khoa học Xã hội (Sử - Địa - GDKT&PL)', 2, '#D97706', FALSE FROM core.lookup_types WHERE code = 'CLASS_STREAM'
UNION ALL SELECT id, 'SPECIALIZED', 'Chuyên sâu / Năng khiếu', 3, '#7C3AED', FALSE FROM core.lookup_types WHERE code = 'CLASS_STREAM'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- 3. MASTER DATA: School Campus Profile
INSERT INTO core.schools (id, code, name, educational_stage, established_year, address, phone, email, website, principal_name)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'THPT_LEQUYDON',
  'Trường Trung học Phổ thông Lê Quý Đôn',
  'HIGH_SCHOOL',
  1874,
  'Số 110 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
  '028 3930 2000',
  'c3lequydon.hcm@moet.edu.vn',
  'https://thpt-lequydon-hcm.edu.vn',
  'NGUYỄN VĂN AN'
) ON CONFLICT (code) DO NOTHING;

-- 4. MASTER DATA: Academic Years
INSERT INTO core.academic_years (id, school_id, code, name, start_date, end_date, is_current) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2024-2025', 'Năm học 2024 - 2025', '2024-09-05', '2025-05-31', FALSE),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2025-2026', 'Năm học 2025 - 2026', '2025-09-05', '2026-05-31', FALSE),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-2027', 'Năm học 2026 - 2027', '2026-09-05', '2027-05-31', TRUE)
ON CONFLICT (school_id, code) DO NOTHING;

-- 5. MASTER DATA: Semesters
INSERT INTO core.semesters (id, academic_year_id, code, name, start_date, end_date, is_current) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'HK1', 'Học kỳ 1 (2026 - 2027)', '2026-09-05', '2027-01-16', TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'HK2', 'Học kỳ 2 (2026 - 2027)', '2027-01-18', '2027-05-31', FALSE),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'HE',  'Học kỳ Hè (2027)',        '2027-06-01', '2027-07-31', FALSE)
ON CONFLICT (academic_year_id, code) DO NOTHING;

-- 6. MASTER DATA: Roles
INSERT INTO core.roles (id, code, name, description, badge_color, is_system) VALUES
  ('10000000-0000-0000-0000-000000000001', 'ADMIN',       'Quản trị viên hệ thống', 'Toàn quyền cấu hình và quản trị',          '#1E293B', TRUE),
  ('10000000-0000-0000-0000-000000000002', 'PRINCIPAL',   'Hiệu trưởng / BGH',      'Ban giám hiệu trường THPT',                 '#4F46E5', TRUE),
  ('10000000-0000-0000-0000-000000000003', 'TEACHER',     'Giáo viên',              'Giáo viên bộ môn & chủ nhiệm',              '#2563EB', TRUE),
  ('10000000-0000-0000-0000-000000000004', 'STUDENT',     'Học sinh',               'Học sinh trường THPT',                      '#059669', TRUE),
  ('10000000-0000-0000-0000-000000000005', 'SUPERVISOR',  'Giám thị',               'Ban giám thị quản lý nề nếp thi đua',       '#D97706', TRUE),
  ('10000000-0000-0000-0000-000000000006', 'STAFF',       'Cán bộ nhân viên',       'Y tế, Thư viện, Kế toán, Thiết bị',         '#0D9488', TRUE),
  ('10000000-0000-0000-0000-000000000007', 'PARENT',      'Phụ huynh học sinh',     'Cha mẹ hoặc người giám hộ hợp pháp',        '#EA580C', FALSE)
ON CONFLICT (code) DO NOTHING;

-- 7. MASTER DATA: Grades (Grade 10, 11, 12)
INSERT INTO core.grades (id, school_id, code, name, order_no) VALUES
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '10', 'Khối 10', 1),
  ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', '11', 'Khối 11', 2),
  ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', '12', 'Khối 12', 3)
ON CONFLICT (school_id, code) DO NOTHING;

-- 8. MASTER DATA: Departments
INSERT INTO core.departments (id, school_id, code, name, department_type) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'TO_TOAN_TIN',     'Tổ Toán - Tin học',                        'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'TO_NGU_VAN',     'Tổ Ngữ văn',                               'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'TO_NGOAI_NGU',   'Tổ Ngoại ngữ (Tiếng Anh)',                 'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'TO_VAT_LY',      'Tổ Vật lý - Công nghệ',                    'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'TO_HOA_SINH',    'Tổ Hóa học - Sinh học',                    'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'TO_SU_DIA_GDCD', 'Tổ Lịch sử - Địa lý - GDKT&PL',            'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'TO_THE_DUC_QP',  'Tổ Thể dục - GD Quốc phòng & An ninh',     'SUBJECT'),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'BAN_GIAM_THI',   'Ban Giám thị & Quản lý Nề nếp',           'ADMINISTRATION'),
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'PHONG_Y_TE',     'Phòng Y tế Học đường',                     'ADMINISTRATION'),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'PHONG_TAI_VU',   'Phòng Kế toán - Tài vụ',                   'ADMINISTRATION'),
  ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'DOAN_TRUONG',    'Ban Chấp hành Đoàn trường THPT',           'UNION')
ON CONFLICT (school_id, code) DO NOTHING;

-- 9. MASTER DATA: High School Subjects (GDPT 2018)
INSERT INTO core.subjects (school_id, department_id, code, name, evaluation_type, is_compulsory, metadata) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'TOAN',      'Toán học',                                'SCORE',   TRUE,  '{"periods_per_year": 105, "weight": 1.0}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'VAN',       'Ngữ văn',                                 'SCORE',   TRUE,  '{"periods_per_year": 105, "weight": 1.0}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'ANH',       'Tiếng Anh',                               'SCORE',   TRUE,  '{"periods_per_year": 105, "weight": 1.0}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'SU',        'Lịch sử',                                 'SCORE',   TRUE,  '{"periods_per_year": 52,  "weight": 1.0}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 'GDTC',      'Giáo dục thể chất',                       'COMMENT', TRUE,  '{"periods_per_year": 70}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 'GDQP_AN',   'Giáo dục Quốc phòng và An ninh',           'COMMENT', TRUE,  '{"periods_per_year": 35}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000011', 'HDTN_HN',   'Hoạt động trải nghiệm, hướng nghiệp',     'COMMENT', TRUE,  '{"periods_per_year": 105}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'GD_DP',     'Nội dung giáo dục địa phương',            'COMMENT', TRUE,  '{"periods_per_year": 35}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'VAT_LY',    'Vật lý',                                  'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHTN"}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'HOA_HOC',   'Hóa học',                                 'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHTN"}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'SINH_HOC',  'Sinh học',                                'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHTN"}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'DIA_LY',    'Địa lý',                                  'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHXH"}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'GDKT_PL',   'Giáo dục Kinh tế và Pháp luật',            'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHXH"}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'TIN_HOC',   'Tin học',                                 'SCORE',   FALSE, '{"periods_per_year": 70, "group": "TECH"}'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'CONG_NGHE', 'Công nghệ',                               'SCORE',   FALSE, '{"periods_per_year": 70, "group": "TECH"}')
ON CONFLICT (school_id, code) DO NOTHING;

-- 10. MASTER DATA: High School Classes
INSERT INTO core.classes (id, academic_year_id, grade_id, code, name, room_name, class_stream_code, max_students) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000010', '10A1', 'Lớp 10A1 (KHTN - Chuyên Toán)', 'Phòng A101', 'KHTN', 45),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000010', '10A2', 'Lớp 10A2 (KHTN)',                 'Phòng A102', 'KHTN', 45),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000010', '10D1', 'Lớp 10D1 (KHXH - Chuyên Anh)',  'Phòng A103', 'KHXH', 45),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000010', '10D2', 'Lớp 10D2 (KHXH)',                 'Phòng A104', 'KHXH', 45),
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000011', '11A1', 'Lớp 11A1 (KHTN)',                 'Phòng B201', 'KHTN', 45),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000011', '11D1', 'Lớp 11D1 (KHXH)',                 'Phòng B202', 'KHXH', 45),
  ('f0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000012', '12A1', 'Lớp 12A1 (KHTN - Luyện thi ĐH)', 'Phòng A301', 'KHTN', 45),
  ('f0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000012', '12D1', 'Lớp 12D1 (KHXH - Luyện thi ĐH)', 'Phòng A302', 'KHXH', 45)
ON CONFLICT (academic_year_id, code) DO NOTHING;

-- 11. MASTER DATA: Class Study Squads (Tổ 1..4 in Class 10A1)
INSERT INTO core.class_groups (class_id, code, name, order_no) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'TO_1', 'Tổ 1 (Lớp 10A1)', 1),
  ('f0000000-0000-0000-0000-000000000001', 'TO_2', 'Tổ 2 (Lớp 10A1)', 2),
  ('f0000000-0000-0000-0000-000000000001', 'TO_3', 'Tổ 3 (Lớp 10A1)', 3),
  ('f0000000-0000-0000-0000-000000000001', 'TO_4', 'Tổ 4 (Lớp 10A1)', 4)
ON CONFLICT (class_id, code) DO NOTHING;

-- 12. MASTER DATA: Bell Schedule (Period 1 to 10)
INSERT INTO academic.periods (school_id, period_no, shift, start_time, end_time) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'MORNING',   '07:00:00', '07:45:00'),
  ('a0000000-0000-0000-0000-000000000001', 2, 'MORNING',   '07:50:00', '08:35:00'),
  ('a0000000-0000-0000-0000-000000000001', 3, 'MORNING',   '08:55:00', '09:40:00'),
  ('a0000000-0000-0000-0000-000000000001', 4, 'MORNING',   '09:45:00', '10:30:00'),
  ('a0000000-0000-0000-0000-000000000001', 5, 'MORNING',   '10:35:00', '11:20:00'),
  ('a0000000-0000-0000-0000-000000000001', 6, 'AFTERNOON', '12:45:00', '13:30:00'),
  ('a0000000-0000-0000-0000-000000000001', 7, 'AFTERNOON', '13:35:00', '14:20:00'),
  ('a0000000-0000-0000-0000-000000000001', 8, 'AFTERNOON', '14:40:00', '15:25:00'),
  ('a0000000-0000-0000-0000-000000000001', 9, 'AFTERNOON', '15:30:00', '16:15:00'),
  ('a0000000-0000-0000-0000-000000000001', 10,'AFTERNOON', '16:20:00', '17:05:00')
ON CONFLICT (school_id, period_no, shift) DO NOTHING;

-- 13. MASTER DATA: School Rooms & Facilities
INSERT INTO academic.rooms (school_id, code, name, room_type, capacity, building, floor) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'P_A101', 'Phòng học 101 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 1),
  ('a0000000-0000-0000-0000-000000000001', 'P_A102', 'Phòng học 102 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 1),
  ('a0000000-0000-0000-0000-000000000001', 'P_A201', 'Phòng học 201 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 2),
  ('a0000000-0000-0000-0000-000000000001', 'P_B101', 'Phòng học 101 - Dãy B', 'CLASSROOM',     45, 'Dãy B', 1),
  ('a0000000-0000-0000-0000-000000000001', 'LAB_LY',  'Phòng Thí nghiệm Vật lý', 'LAB',          40, 'Dãy C', 2),
  ('a0000000-0000-0000-0000-000000000001', 'LAB_HOA', 'Phòng Thí nghiệm Hóa học','LAB',         40, 'Dãy C', 2),
  ('a0000000-0000-0000-0000-000000000001', 'LAB_SINH','Phòng Thực hành Sinh học','LAB',         40, 'Dãy C', 3),
  ('a0000000-0000-0000-0000-000000000001', 'TIN_01',  'Phòng Máy tính 01 (45 máy)','COMPUTER_ROOM',45,'Dãy C', 1),
  ('a0000000-0000-0000-0000-000000000001', 'THU_VIEN','Thư viện & Phòng tự học','LIBRARY',       80, 'Dãy D', 1),
  ('a0000000-0000-0000-0000-000000000001', 'HOI_TRUONG','Hội trường lớn 500 chỗ','AUDITORIUM',  500,'Nhà E', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Y_TE',   'Phòng Y tế Học đường',    'HEALTH_ROOM',   10, 'Dãy D', 1),
  ('a0000000-0000-0000-0000-000000000001', 'NHA_DA_NANG','Nhà thi đấu thể thao đa năng','GYM',  300,'Sân tập',1)
ON CONFLICT (school_id, code) DO NOTHING;

-- 14. MASTER DATA: Assessment Score Types (Circular 22)
INSERT INTO academic.score_types (code, name, coefficient, min_evaluations) VALUES
  ('DDG_TX_MIENG', 'Đánh giá thường xuyên (Kiểm tra miệng)',  1, 1),
  ('DDG_TX_15P',   'Đánh giá thường xuyên (Kiểm tra 15 phút)', 1, 2),
  ('DDG_GK',       'Đánh giá giữa kỳ (Hệ số 2)',               2, 1),
  ('DDG_CK',       'Đánh giá cuối kỳ (Hệ số 3)',               3, 1)
ON CONFLICT (code) DO NOTHING;

-- 15. MASTER DATA: Positions Directory
INSERT INTO core.positions (code, name, scope_type, max_holders, is_leadership, description) VALUES
  ('HOMEROOM_TEACHER',       'Giáo viên chủ nhiệm',       'CLASS',      1,    TRUE,  'Chủ nhiệm toàn diện một lớp học'),
  ('SUBJECT_TEACHER',        'Giáo viên bộ môn',          'CLASS',      NULL, FALSE, 'Giảng dạy một môn học cụ thể cho lớp'),
  ('CLASS_MONITOR',          'Lớp trưởng',                'CLASS',      1,    TRUE,  'Đại diện học sinh phụ trách chung lớp học'),
  ('VICE_MONITOR_STUDY',     'Lớp phó học tập',           'CLASS',      1,    TRUE,  'Phụ trách học bài, kiểm tra bài tập và học tập của lớp'),
  ('VICE_MONITOR_LABOR',     'Lớp phó lao động',          'CLASS',      1,    TRUE,  'Phụ trách trực nhật, vệ sinh, lao động và cơ sở vật chất'),
  ('VICE_MONITOR_DISCIPLINE','Lớp phó trật tự (Nề nếp)',  'CLASS',      1,    TRUE,  'Phụ trách điểm danh, chấm thi đua nội bộ lớp'),
  ('VICE_MONITOR_ACTIVITY',  'Lớp phó phong trào',        'CLASS',      1,    TRUE,  'Phụ trách văn nghệ, thể dục thể thao, báo tường'),
  ('CLASS_TREASURER',        'Thủ quỹ lớp',               'CLASS',      1,    FALSE, 'Phụ trách thu chi quỹ lớp dưới sự đồng ý của GVCN'),
  ('CLASS_SECRETARY',        'Bí thư chi đoàn',           'CLASS',      1,    TRUE,  'Phụ trách công tác Đoàn thanh niên chi đoàn lớp'),
  ('GROUP_LEADER',           'Tổ trưởng',                 'GROUP',      1,    TRUE,  'Điều hành và theo dõi thi đua trong tổ học tập'),
  ('GROUP_VICE_LEADER',      'Tổ phó',                    'GROUP',      1,    FALSE, 'Hỗ trợ tổ trưởng'),
  ('RED_FLAG_MEMBER',        'Đội cờ đỏ (Sao đỏ)',        'GRADE',      NULL, FALSE, 'Chấm điểm thi đua nề nếp các lớp khác'),
  ('DEPT_HEAD',              'Tổ trưởng chuyên môn',      'DEPARTMENT', 1,    TRUE,  'Tổ trưởng phụ trách nhóm môn (VD: Tổ Toán)'),
  ('DEPT_VICE_HEAD',         'Tổ phó chuyên môn',         'DEPARTMENT', 1,    FALSE, 'Tổ phó phụ trách nhóm môn'),
  ('GRADE_SUPERVISOR',       'Giám thị phụ trách khối',   'GRADE',      NULL, TRUE,  'Giám thị chịu trách nhiệm nề nếp khối 10/11/12'),
  ('PARENT_REP_CLASS',       'Trưởng ban đại diện CMHS',  'CLASS',      1,    TRUE,  'Trưởng ban đại diện phụ huynh học sinh của lớp')
ON CONFLICT (code) DO NOTHING;

-- 16. MASTER DATA: Settings Definitions
INSERT INTO sys.settings_definitions (code, name, data_type, default_value, allowed_values, scope, category, description) VALUES
  ('theme',              'Giao diện sáng / tối',           'ENUM',   'light',       '["light", "dark", "system"]',                                         'USER',   'APPEARANCE',    'Giao diện màu nền ứng dụng'),
  ('primary_color',      'Màu sắc chủ đạo (Brand Color)',  'COLOR',  '#2563EB',     '["#2563EB", "#10B981", "#7C3AED", "#EA580C", "#0D9488", "#E11D48"]', 'USER',   'APPEARANCE',    'Tông màu nhấn của button, card, header'),
  ('date_format',        'Định dạng ngày tháng',           'ENUM',   'DD/MM/YYYY',  '["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]',                          'USER',   'LOCALIZATION',  'Quy chuẩn hiển thị ngày tháng trên hệ thống'),
  ('time_format',        'Định dạng giờ',                  'ENUM',   '24h',         '["24h", "12h"]',                                                      'USER',   'LOCALIZATION',  'Hiển thị định dạng 24 giờ hoặc 12 giờ AM/PM'),
  ('number_format',      'Định dạng số thập phân',         'ENUM',   '#,##0.00',    '["#,##0.00", "#.##0,00"]',                                            'USER',   'LOCALIZATION',  'Dấu phân cách hàng nghìn và chữ số thập phân'),
  ('language',           'Ngôn ngữ giao diện',             'ENUM',   'vi',          '["vi", "en", "ja", "ko", "zh"]',                                      'USER',   'LOCALIZATION',  'Đa ngôn ngữ i18n'),
  ('dashboard_density',  'Mật độ hiển thị Dashboard',      'ENUM',   'comfortable', '["compact", "comfortable", "spacious"]',                              'USER',   'APPEARANCE',    'Độ giãn dòng của lưới card'),
  ('sound_notification', 'Âm thanh thông báo',             'BOOLEAN', 'true',       '["true", "false"]',                                                   'USER',   'NOTIFICATIONS', 'Phát chuông khi có nhắc nhở hoặc thông báo mới'),
  ('email_digest',       'Nhận email tổng hợp tuần',       'BOOLEAN', 'true',       '["true", "false"]',                                                   'USER',   'NOTIFICATIONS', 'Gửi báo cáo học tập hoặc nề nếp qua email định kỳ')
ON CONFLICT (code) DO NOTHING;

-- 17. MASTER DATA: Dynamic Modules / Cards
INSERT INTO sys.modules (code, name, short_name, description, icon, route, module_type, category, default_color, default_badge) VALUES
  ('STUDENT_TIMETABLE',   'Thời khóa biểu 360',        'TKB',        'Tra cứu lịch học tuần, ca sáng/chiều, phòng học và giảng viên', 'calendar',   '/student/timetable',    'CARD', 'ACADEMIC',      '#3B82F6', 'Hôm nay'),
  ('STUDENT_MATERIALS',   'Tài liệu môn học',          'Tài liệu',   'Giáo trình điện tử, slide bài giảng, đề cương ôn tập tải về',   'download',   '/student/materials',    'CARD', 'ACADEMIC',      '#10B981', '18 mới'),
  ('STUDENT_ASSIGNMENTS', 'Bài tập & Đồ án',           'Bài tập',    'Danh sách bài tập về nhà, nộp bài trực tuyến và nhận xét GV',    'edit',       '/student/assignments',  'CARD', 'ACADEMIC',      '#F59E0B', '2 đến hạn'),
  ('STUDENT_EXAMS',       'Bài kiểm tra & Phòng thi',  'Kiểm tra',   'Lịch thi định kỳ, trắc nghiệm trực tuyến, số báo danh',         'file',       '/student/exams',        'CARD', 'ACADEMIC',      '#EC4899', 'Tuần tới'),
  ('STUDENT_REPORT_CARD', 'Bảng điểm & Học bạ',        'Bảng điểm',  'Xem điểm thường xuyên, giữa kỳ, cuối kỳ và xếp loại học lực',   'chart',      '/student/dashboard',    'CARD', 'ACADEMIC',      '#8B5CF6', 'GPA 3.62'),
  ('STUDENT_REMINDERS',   'Nhắc nhở học tập',          'Nhắc nhở',   'Hạn nộp bài, lịch trực nhật, lịch họp chi đoàn',                'clock',      '/student/reminders',    'CARD', 'COMMUNICATION', '#06B6D4', '4 việc'),
  ('STUDENT_ANNOUNCE',    'Thông báo nhà trường',      'Thông báo',  'Tin tức chính thức từ BGH, Đoàn trường và Giáo viên chủ nhiệm', 'bell',       '/student/announcements','CARD', 'COMMUNICATION', '#EF4444', '3 tin mới'),
  ('TEACHER_EVALUATION',  'Đánh giá Giáo viên',        'Đánh giá GV','Khảo sát chất lượng giờ dạy cuối kỳ (hoàn toàn ẩn danh)',       'star',       '/student/evaluations/teacher', 'CARD', 'EVALUATION', '#F97316', 'Chờ đánh giá'),
  ('FACILITY_EVALUATION', 'Đánh giá & Báo hỏng CSVC',  'Báo hỏng',   'Phản ánh tình trạng máy chiếu, quạt, bàn ghế phòng học',         'tool',       '/student/evaluations/facility','CARD', 'EVALUATION', '#64748B', 'Sửa chữa'),
  ('EMULATION_STUDENT',   'Thi đua cá nhân & Tổ lớp',  'Thi đua',    'Điểm nề nếp, điểm cộng học tập, xếp hạng thi đua trong lớp',    'award',      '/student/emulation',    'CARD', 'EMULATION',     '#EAB308', 'Hạng 2'),
  ('TEACHER_JOURNAL',     'Sổ đầu bài điện tử',        'Sổ đầu bài', 'Ghi nhận bài học, sĩ số, nhận xét và xếp loại tiết học A/B/C/D','book',       '/teacher/journal',      'CARD', 'ACADEMIC',      '#10B981', 'Ký nhận'),
  ('TEACHER_GRADE_ENTRY', 'Sổ điểm điện tử',           'Nhập điểm',  'Nhập điểm thường xuyên, giữa kỳ, cuối kỳ theo chuẩn TT22',      'edit',       '/teacher/grades',       'CARD', 'ACADEMIC',      '#3B82F6', 'Cần nhập'),
  ('TEACHER_ATTENDANCE',  'Điểm danh lớp học',         'Điểm danh',  'Điểm danh chuyên cần theo tiết hoặc theo buổi học',             'check',      '/teacher/attendance',   'CARD', 'ACADEMIC',      '#059669', 'Hôm nay'),
  ('HOMEROOM_MANAGEMENT', 'Quản lý Lớp chủ nhiệm',     'Lớp CN',     'Theo dõi học lực, hạnh kiểm, ban cán sự lớp và liên hệ CMHS',   'user',       '/teacher/homeroom',     'CARD', 'MANAGEMENT',    '#7C3AED', '45 HS'),
  ('SUPERVISOR_DUTY',     'Chấm nề nếp & Cờ đỏ',       'Trực ban',   'Sổ trực ban giám thị, ghi nhận vi phạm trang phục, trễ giờ',    'clipboard',  '/supervisor/duty',      'CARD', 'EMULATION',     '#D97706', 'Đang trực'),
  ('DISCIPLINE_MANAGER',  'Quản lý Kỷ luật trường',    'Kỷ luật',    'Lập biên bản vi phạm, gửi thông báo đến PH, mời họp hội đồng',  'alert-triangle','/supervisor/discipline','CARD', 'EMULATION',  '#DC2626', 'Xử lý'),
  ('PRINCIPAL_ANALYTICS', 'Báo cáo Toàn diện 360',     'Analytics',  'Thống kê tổng thể chất lượng dạy & học, tỷ lệ đỗ, nề nếp toàn trường', 'chart', '/principal/analytics', 'CARD', 'MANAGEMENT', '#1E293B', 'Báo cáo')
ON CONFLICT (code) DO NOTHING;

-- 18. MASTER DATA: Role-Module Mappings (Student, Teacher, Supervisor, Principal)
-- Student Card Set
INSERT INTO sys.role_modules (role_id, module_id, is_visible, is_pinned_default, order_no)
SELECT r.id, m.id, TRUE, TRUE, 1 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_TIMETABLE'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 2 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_ASSIGNMENTS'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 3 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_MATERIALS'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 4 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_EXAMS'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 5 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_REPORT_CARD'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 6 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_REMINDERS'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 7 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_ANNOUNCE'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 8 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'TEACHER_EVALUATION'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 9 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'FACILITY_EVALUATION'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 10 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'EMULATION_STUDENT'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Teacher Card Set
INSERT INTO sys.role_modules (role_id, module_id, is_visible, is_pinned_default, order_no)
SELECT r.id, m.id, TRUE, TRUE, 1 FROM core.roles r, sys.modules m WHERE r.code = 'TEACHER' AND m.code = 'TEACHER_JOURNAL'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 2 FROM core.roles r, sys.modules m WHERE r.code = 'TEACHER' AND m.code = 'TEACHER_GRADE_ENTRY'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 3 FROM core.roles r, sys.modules m WHERE r.code = 'TEACHER' AND m.code = 'TEACHER_ATTENDANCE'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 4 FROM core.roles r, sys.modules m WHERE r.code = 'TEACHER' AND m.code = 'HOMEROOM_MANAGEMENT'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 5 FROM core.roles r, sys.modules m WHERE r.code = 'TEACHER' AND m.code = 'STUDENT_TIMETABLE'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 6 FROM core.roles r, sys.modules m WHERE r.code = 'TEACHER' AND m.code = 'STUDENT_MATERIALS'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- 19. MASTER DATA: Emulation Evaluation Criteria
INSERT INTO emulation.criteria (code, name, category, scope_type, points, is_violation, description) VALUES
  ('NE_NEP_DI_HOC_DUNG_GIO', 'Đi học đúng giờ, xếp hàng nghiêm túc', 'DISCIPLINE', 'CLASS',       2.0, FALSE, 'Không có học sinh nào đi trễ trong buổi học'),
  ('NE_NEP_DI_TRE',          'Đi học trễ (sau hiệu lệnh trống)',     'DISCIPLINE', 'INDIVIDUAL', -2.0, TRUE,  'Học sinh đến trường muộn không có lý do chính đáng'),
  ('NE_NEP_SAI_DONG_PHUC',   'Mặc sai quy định đồng phục / phù hiệu','DISCIPLINE', 'INDIVIDUAL', -2.0, TRUE,  'Không đeo phù hiệu, mặc áo khác quy định'),
  ('HOC_TAP_TIET_TOT',       'Tiết học đạt điểm Tốt (Điểm A)',       'ACADEMIC',   'CLASS',       5.0, FALSE, 'Được giáo viên bộ môn phê tiết học tốt vào sổ đầu bài'),
  ('HOC_TAP_DIEM_KEM',       'Tiết học không đạt (Điểm C hoặc D)',   'ACADEMIC',   'CLASS',      -5.0, TRUE,  'Tiết học mất trật tự hoặc nhiều bạn chưa thuộc bài'),
  ('HOC_TAP_DIEM_10',        'Học sinh đạt điểm 9 hoặc 10 bài cũ',   'ACADEMIC',   'INDIVIDUAL',  2.0, FALSE, 'Được ghi nhận điểm tốt miệng hoặc 15 phút'),
  ('VE_SINH_LOP_SACH',       'Trực nhật lớp sạch sẽ, bàn ghế ngay ngắn','HYGIENE', 'CLASS',       3.0, FALSE, 'Được cờ đỏ / giám thị chấm đạt điểm tối đa'),
  ('VE_SINH_BAN',            'Lớp học có rác sau giờ tan học',       'HYGIENE',    'CLASS',      -3.0, TRUE,  'Để rác trong hộc bàn hoặc sàn lớp'),
  ('KY_LUAT_SU_DUNG_DT',     'Sử dụng điện thoại trong giờ không xin phép','DISCIPLINE','INDIVIDUAL',-5.0,TRUE, 'Dùng điện thoại chơi game / lướt mạng trong giờ học'),
  ('PHONG_TRAO_VAN_NGHE',    'Tham gia biểu diễn văn nghệ / thể thao Cấp Trường','ACTIVITY','CLASS',10.0,FALSE,'Đóng góp tích cực cho phong trào thi đua của trường')
ON CONFLICT (code) DO NOTHING;

-- 20. SAMPLE SEED DATA: Administrator, Teachers, and Students
-- Passwords below are encrypted with bcrypt for 'SchoolPro@2026'
INSERT INTO core.users (id, school_id, username, email, phone, password_hash, full_name, date_of_birth, gender_code, status_code) VALUES
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin', 'admin@schoolpro.edu.vn', '0901234567', crypt('SchoolPro@2026', gen_salt('bf', 8)), 'Quản trị viên Hệ thống', '1985-05-15', 'MALE', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'gv_toan_minh', 'nguyenvanminh@schoolpro.edu.vn', '0912345678', crypt('SchoolPro@2026', gen_salt('bf', 8)), 'ThS. Nguyễn Văn Minh', '1982-11-20', 'MALE', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'hs_le_hoang_nam', 'lehoangnam@schoolpro.edu.vn', '0987654321', crypt('SchoolPro@2026', gen_salt('bf', 8)), 'Lê Hoàng Nam', '2010-03-25', 'MALE', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- User Roles
INSERT INTO core.user_roles (user_id, role_id, is_primary)
SELECT u.id, r.id, TRUE FROM core.users u, core.roles r WHERE u.username = 'admin' AND r.code = 'ADMIN'
UNION ALL SELECT u.id, r.id, TRUE FROM core.users u, core.roles r WHERE u.username = 'gv_toan_minh' AND r.code = 'TEACHER'
UNION ALL SELECT u.id, r.id, TRUE FROM core.users u, core.roles r WHERE u.username = 'hs_le_hoang_nam' AND r.code = 'STUDENT'
ON CONFLICT DO NOTHING;

-- Teacher Profile
INSERT INTO core.teachers (id, user_id, teacher_code, department_id, qualification, subject_major)
SELECT '20000000-0000-0000-0000-000000000001', u.id, 'GV202601', 'e0000000-0000-0000-0000-000000000001', 'Thạc sĩ Toán giải tích', 'Toán học'
FROM core.users u WHERE u.username = 'gv_toan_minh'
ON CONFLICT (teacher_code) DO NOTHING;

-- Student Profile
INSERT INTO core.students (id, user_id, student_code, ethnicity, religion, status)
SELECT '30000000-0000-0000-0000-000000000001', u.id, 'HS20261001', 'Kinh', 'Không', 'STUDYING'
FROM core.users u WHERE u.username = 'hs_le_hoang_nam'
ON CONFLICT (student_code) DO NOTHING;

-- Student Class Enrollment (Lê Hoàng Nam in 10A1, Tổ 1)
INSERT INTO core.student_class_enrollments (student_id, class_id, class_group_id, status)
SELECT s.id, 'f0000000-0000-0000-0000-000000000001', cg.id, 'ACTIVE'
FROM core.students s
JOIN core.class_groups cg ON cg.class_id = 'f0000000-0000-0000-0000-000000000001' AND cg.code = 'TO_1'
WHERE s.student_code = 'HS20261001'
ON CONFLICT (student_id, class_id) DO NOTHING;

-- Position Assignments: Thầy Minh is Homeroom Teacher (GVCN) of 10A1; Em Nam is Class Monitor (Lớp trưởng) of 10A1
INSERT INTO core.position_assignments (user_id, position_id, academic_year_id, scope_type, class_id, is_current, note)
SELECT u.id, p.id, 'b0000000-0000-0000-0000-000000000003', 'CLASS', 'f0000000-0000-0000-0000-000000000001', TRUE, 'Chủ nhiệm lớp 10A1'
FROM core.users u, core.positions p WHERE u.username = 'gv_toan_minh' AND p.code = 'HOMEROOM_TEACHER';

INSERT INTO core.position_assignments (user_id, position_id, academic_year_id, scope_type, class_id, is_current, note)
SELECT u.id, p.id, 'b0000000-0000-0000-0000-000000000003', 'CLASS', 'f0000000-0000-0000-0000-000000000001', TRUE, 'Lớp trưởng 10A1 phụ trách chung'
FROM core.users u, core.positions p WHERE u.username = 'hs_le_hoang_nam' AND p.code = 'CLASS_MONITOR';

-- 21. MASTER DATA: Additional 360 Modules
INSERT INTO sys.modules (code, name, short_name, description, icon, route, module_type, category, default_color, default_badge) VALUES
  ('STUDENT_CONTACT_BOOK', 'Sổ liên lạc điện tử',  'Sổ liên lạc', 'Xem phiếu nhận xét định kỳ từ GVCN và ký xác nhận',          'book-open',  '/student/contact-book', 'CARD', 'COMMUNICATION', '#0284C7', 'Mới'),
  ('STUDENT_CLUBS',        'Câu lạc bộ & Ngoại khóa','CLB Đoàn',   'Đăng ký tham gia CLB, hoạt động tình nguyện, ngày hội STEM', 'users',      '/student/clubs',        'CARD', 'EMULATION',     '#8B5CF6', '2 CLB'),
  ('STUDENT_FEES',         'Học phí & Khoản thu',    'Học phí',    'Tra cứu hóa đơn học phí, bảo hiểm y tế và thanh toán online', 'credit-card','/student/fees',         'CARD', 'MANAGEMENT',    '#10B981', 'Học kỳ 1'),
  ('STUDENT_TRACK',        'Tổ hợp môn GDPT 2018',   'Tổ hợp môn', 'Thông tin ban học tập, cụm chuyên đề lựa chọn',               'layers',     '/student/track',        'CARD', 'ACADEMIC',      '#6366F1', 'Ban A00'),
  ('STUDENT_ONLINE_TEST',  'Khảo thí Trắc nghiệm',   'Thi online', 'Làm bài kiểm tra trực tuyến, trắc nghiệm tính giờ',           'check-circle','/student/online-test', 'CARD', 'ACADEMIC',      '#F43F5E', 'Sắp tới')
ON CONFLICT (code) DO NOTHING;

-- Map additional modules to Student role
INSERT INTO sys.role_modules (role_id, module_id, is_visible, is_pinned_default, order_no)
SELECT r.id, m.id, TRUE, FALSE, 11 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_CONTACT_BOOK'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 12 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_CLUBS'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 13 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_FEES'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 14 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_TRACK'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 15 FROM core.roles r, sys.modules m WHERE r.code = 'STUDENT' AND m.code = 'STUDENT_ONLINE_TEST'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- 22. SAMPLE SEED DATA: Curriculum Tracks GDPT 2018
INSERT INTO academic.curriculum_tracks (id, school_id, grade_id, code, name, career_orientation, description) VALUES
  ('70000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'TRACK_TN_A00', 'Ban Tự nhiên A00 (Toán - Vật lý - Hóa học - Tin học)', 'Kỹ thuật, Công nghệ thông tin, Bách khoa', 'Tổ hợp môn định hướng khối ngành khoa học kỹ thuật'),
  ('70000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'TRACK_XH_D01', 'Ban Xã hội D01 (Ngữ văn - Lịch sử - Địa lý - GDKT&PL)', 'Kinh tế, Luật, Báo chí truyền thông, Ngoại giao', 'Tổ hợp môn định hướng khối ngành khoa học xã hội')
ON CONFLICT (school_id, grade_id, code) DO NOTHING;

-- Student Track Enrollment for Nam
INSERT INTO academic.student_track_enrollments (student_id, track_id, academic_year_id, status)
SELECT s.id, '70000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'ACTIVE'
FROM core.students s WHERE s.student_code = 'HS20261001'
ON CONFLICT (student_id, academic_year_id) DO NOTHING;

-- 23. SAMPLE SEED DATA: Question Bank
INSERT INTO academic.question_bank (id, subject_id, grade_id, chapter_name, difficulty_level, question_type, content, options, correct_answers, solution_explanation, default_score) VALUES
  ('80000000-0000-0000-0000-000000000001', (SELECT id FROM core.subjects WHERE code = 'TOAN' LIMIT 1), 'd0000000-0000-0000-0000-000000000010', 'Mệnh đề & Tập hợp', 'RECOGNITION', 'SINGLE_CHOICE',
   'Cho tập hợp $A = \{x \in \mathbb{R} \mid x^2 - 4 = 0\}$. Số phần tử của tập hợp $A$ là:',
   '[{"key":"A","text":"0"},{"key":"B","text":"1"},{"key":"C","text":"2"},{"key":"D","text":"4"}]'::jsonb,
   '["C"]'::jsonb,
   'Phương trình $x^2 - 4 = 0 \Leftrightarrow x = \pm 2$. Cả hai nghiệm đều là số thực, vậy $A = \{-2; 2\}$ có 2 phần tử.', 0.25)
ON CONFLICT DO NOTHING;

-- 24. SAMPLE SEED DATA: Clubs & Membership
INSERT INTO core.clubs (id, school_id, code, name, category, description) VALUES
  ('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CLUB_ROBOTICS', 'CLB Sáng tạo Robotics & STEM', 'ACADEMIC', 'Nghiên cứu lập trình nhúng, thiết kế robot thi đấu VEX'),
  ('90000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'CLUB_BASKETBALL', 'CLB Bóng rổ THPT Lê Quý Đôn', 'SPORTS', 'Tập luyện và thi đấu giải bóng rổ học sinh thành phố')
ON CONFLICT (code) DO NOTHING;

INSERT INTO core.club_members (club_id, student_id, role_title, status)
SELECT '90000000-0000-0000-0000-000000000001', s.id, 'HEAD_OF_COMMITTEE', 'ACTIVE'
FROM core.students s WHERE s.student_code = 'HS20261001'
ON CONFLICT (club_id, student_id) DO NOTHING;

-- 25. SAMPLE SEED DATA: Tuition & Fees
INSERT INTO academic.fee_items (id, school_id, academic_year_id, semester_id, code, name, category, amount, is_mandatory, due_date) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'FEE_BHYT_2026', 'Bảo hiểm y tế học sinh năm học 2026-2027', 'HEALTH_INSURANCE', 680400.00, TRUE, '2026-10-31'),
  ('a1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'FEE_HOCPHI_HK1', 'Học phí Học kỳ 1 (Quy định Nhà nước)', 'TUITION', 300000.00, TRUE, '2026-11-15')
ON CONFLICT (school_id, academic_year_id, code) DO NOTHING;

INSERT INTO academic.student_fee_bills (student_id, fee_item_id, bill_code, original_amount, final_amount, paid_amount, payment_status, payment_method, paid_at)
SELECT s.id, 'a1000000-0000-0000-0000-000000000001', 'BILL-2026-10A1-001', 680400.00, 680400.00, 680400.00, 'PAID', 'BANK_TRANSFER', now()
FROM core.students s WHERE s.student_code = 'HS20261001'
ON CONFLICT (student_id, fee_item_id) DO NOTHING;

-- 26. SAMPLE SEED DATA: Emulation Awards
INSERT INTO emulation.awards (student_id, academic_year_id, award_category, level, prize, title, decision_number, bonus_points, signed_by)
SELECT s.id, 'b0000000-0000-0000-0000-000000000003', 'STEM_INNOVATION', 'PROVINCIAL', 'FIRST_PRIZE', 'Giải Nhất Hội thi Sáng tạo Robot Cấp Thành phố', 'QĐ-142/SGDĐT', 20, 'Giám đốc Sở GD&ĐT'
FROM core.students s WHERE s.student_code = 'HS20261001'
ON CONFLICT DO NOTHING;

-- 27. SAMPLE SEED DATA: Electronic Contact Book
INSERT INTO notification.contact_book_notes (student_id, class_id, semester_id, period_type, period_label, academic_digest, attendance_digest, emulation_digest, teacher_remarks, parent_acknowledged, created_by)
SELECT s.id, 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'WEEKLY', 'Tuần 4 (22/09 - 27/09)',
  '{"toan": 9.5, "ngu_van": 8.0, "tieng_anh": 9.0}'::jsonb,
  '{"present": 5, "absent": 0, "late": 0}'::jsonb,
  '{"bonus_points": 15, "violations": 0}'::jsonb,
  'Em Nam gương mẫu, hoàn thành xuất sắc nhiệm vụ điều hành sinh hoạt 15 phút đầu giờ của lớp.',
  TRUE,
  u.id
FROM core.students s, core.users u
WHERE s.student_code = 'HS20261001' AND u.username = 'gv_toan_minh'
ON CONFLICT (student_id, semester_id, period_type, period_label) DO NOTHING;

