# 🎓 SchoolPro 360 - Enterprise High School Database Architecture

Hệ thống cơ sở dữ liệu **PostgreSQL Enterprise** toàn diện cho Trường Trung học Phổ thông (Cấp 3), được thiết kế theo chuẩn **Kiến trúc chống phá vỡ cấu trúc (Future-Proof Architecture)**, tích hợp sẵn **Master Data theo Chương trình GDPT 2018 & Thông tư 22/2021/TT-BGDĐT**, hỗ trợ đa vai trò linh hoạt và vận hành tức thì qua Docker & pgAdmin 4.

---

## 📑 Mục lục
1. [Nguyên tắc thiết kế Chống phá vỡ cấu trúc](#-nguyên-tắc-thiết-kế-chống-phá-vỡ-cấu-trúc)
2. [Cấu trúc Thư mục Chuẩn Enterprise](#-cấu-trúc-thư-mục-chuẩn-enterprise)
3. [Tổng quan 6 Schemas](#-tổng-quan-6-schemas)
4. [Danh mục Bảng & Phân hệ Chức năng](#-danh-mục-bảng--phân-hệ-chức-năng)
5. [Master Data nạp sẵn trong Hệ thống](#-master-data-nạp-sẵn-trong-hệ-thống)
6. [Khởi chạy Nhanh với Docker & Kết nối pgAdmin 4](#-khởi-chạy-nhanh-với-docker--kết-nối-pgadmin-4)
7. [Các câu lệnh truy vấn mẫu hữu ích](#-các-câu-lệnh-truy-vấn-mẫu-hữu-ích)

---

## 🛡️ Nguyên tắc thiết kế Chống phá vỡ cấu trúc

Hệ thống giáo dục thường xuyên thay đổi quy chế (thông tư điểm số mới, định danh học sinh VNeID, tổ hợp môn tự chọn,...). Để database **không bao giờ bị lock bảng, không phải chạy ALTER TABLE nguy hiểm, và không phá vỡ logic backend**, database áp dụng 6 giải pháp sau:

1. **Dynamic Reference & Lookup Engine (`master_lookup_types.sql`, `master_lookup_values.sql`):**
   - Loại bỏ hoàn toàn physical `ENUM` cứng của PostgreSQL.
   - Mọi danh mục trạng thái, loại phòng, hình thức đánh giá, ban học tập... đều quản lý qua bảng. Admin có thể thêm mới ngay trên giao diện Web mà không cần dev can thiệp.
2. **Dynamic Custom Fields Engine (EAV Pattern + JSONB):**
   - Bảng `core_custom_field_definitions.sql` và `core_custom_field_values.sql` cho phép trường tự định nghĩa thêm trường thông tin mới cho Học sinh, Giáo viên, Lớp học, Bài thi (VD: *Mã định danh VNeID mức 2*, *Số hiệu máy tính xách tay*,...) mà không cần thêm cột vào DDL.
3. **Phân quyền chức vụ theo Không gian & Thời gian (Polymorphic Temporal Positions):**
   - Bảng `master_positions.sql` và `core_position_assignments.sql` theo dõi ai đã từng hoặc đang giữ chức vụ gì ở đâu (`SCHOOL`, `GRADE`, `CLASS`, `GROUP`, `DEPARTMENT`, `INDIVIDUAL`) kèm `start_date`, `end_date`, `is_current`.
   - Đáp ứng trọn vẹn: *Thầy A là GVCN lớp 10A1 năm 2024, năm 2025 là Tổ trưởng tổ Toán; Em B là Lớp trưởng lớp 10A1, em C là Lớp phó lao động, em D là Tổ trưởng Tổ 1.*
4. **Hệ thống Thi đua đa cấp động (Multi-Level Emulation):**
   - Tiêu chí toàn trường lưu ở `master_emulation_criteria.sql`.
   - Đồng thời, mỗi lớp học có bảng `emulation_class_custom_criteria.sql` để GVCN và ban cán sự lớp tự tạo tiêu chí chấm điểm thi đua nội bộ trong lớp.
5. **Card giao diện & Cài đặt 4 tầng cá nhân hóa (`sys` schema):**
   - Danh mục Card chức năng được phân quyền theo Role (`master_modules.sql`, `sys_role_modules.sql`), người dùng được tự ghim, ẩn, đổi thứ tự kéo thả (`sys_user_module_preferences.sql`).
   - Cài đặt hệ thống giải quyết theo 4 tầng ưu tiên: **Cá nhân (User) $\rightarrow$ Vai trò (Role) $\rightarrow$ Trường học (School) $\rightarrow$ Mặc định (Default)**.
6. **Transactional Event Outbox Pattern (`sys_event_outbox.sql`):**
   - Đảm bảo an toàn giao dịch khi kết nối các hệ thống bất đồng bộ (Kafka, RabbitMQ, Webhooks, Push Notification) khi phát sinh sự kiện quan trọng (nhập điểm, vắng học, xếp hạng thi đua).

---

## 📁 Cấu trúc Thư mục Chuẩn Enterprise

Thư mục dự án được tổ chức khoa học theo chuẩn cơ sở dữ liệu doanh nghiệp:

```
schoolpro-db/
├── README.md                       # Tài liệu hướng dẫn kiến trúc và vận hành
├── docker-compose.yml              # File khởi chạy Docker Compose tại thư mục gốc
├── docker/                         # Cấu hình container và kịch bản khởi động
│   ├── init-db.sh                  # Kịch bản thực thi SQL theo thứ tự topo phụ thuộc chuẩn
│   └── pgadmin/                    # Cấu hình tự động kết nối và chứng thực cho pgAdmin 4
│       ├── servers.json            # Tự động đăng ký PostgreSQL server vào pgAdmin
│       └── pgpass                  # Tự động chứng thực mật khẩu kết nối
└── sql/                            # Toàn bộ mã nguồn SQL được phân chia khoa học
    ├── 00_schemas.sql              # Khởi tạo Extensions, 6 Schemas và Enum scope
    ├── 01_functions/               # Các hàm thủ tục lưu trữ (Stored Functions)
    │   └── functions.sql           # fn_set_updated_at() tự động cập nhật timestamp
    ├── 02_tables/                  # Định nghĩa bảng (Mỗi table 1 file riêng biệt)
    │   ├── master/                 # Các bảng danh mục và master data dùng chung
    │   │   ├── master_lookup_types.sql
    │   │   ├── master_lookup_values.sql
    │   │   ├── master_schools.sql
    │   │   ├── master_academic_years.sql
    │   │   ├── master_semesters.sql
    │   │   ├── master_grades.sql
    │   │   ├── master_departments.sql
    │   │   ├── master_subjects.sql
    │   │   ├── master_rooms.sql
    │   │   ├── master_periods.sql
    │   │   ├── master_score_types.sql
    │   │   ├── master_positions.sql
    │   │   ├── master_emulation_criteria.sql
    │   │   ├── master_settings_definitions.sql
    │   │   └── master_modules.sql
    │   ├── core/                   # Người dùng, vai trò, chức vụ, hồ sơ thành viên, CLB
    │   │   ├── core_custom_field_definitions.sql
    │   │   ├── core_custom_field_values.sql
    │   │   ├── core_users.sql
    │   │   ├── core_roles.sql
    │   │   ├── core_permissions.sql
    │   │   ├── core_role_permissions.sql
    │   │   ├── core_user_roles.sql
    │   │   ├── core_classes.sql
    │   │   ├── core_class_groups.sql
    │   │   ├── core_position_assignments.sql
    │   │   ├── core_students.sql
    │   │   ├── core_student_health_records.sql
    │   │   ├── core_guardians.sql
    │   │   ├── core_teachers.sql
    │   │   ├── core_staff.sql
    │   │   ├── core_student_class_enrollments.sql
    │   │   ├── core_class_subject_teachers.sql
    │   │   ├── core_clubs.sql
    │   │   └── core_club_members.sql
    │   ├── academic/               # Nghiệp vụ học vụ: TKB, ngân hàng câu hỏi, bài thi online, TT22, tổ hợp môn, học phí
    │   │   ├── academic_timetables.sql
    │   │   ├── academic_timetable_changes.sql
    │   │   ├── academic_class_journal_entries.sql
    │   │   ├── academic_curriculum_materials.sql
    │   │   ├── academic_material_attachments.sql
    │   │   ├── academic_assignments.sql
    │   │   ├── academic_assignment_submissions.sql
    │   │   ├── academic_curriculum_tracks.sql
    │   │   ├── academic_curriculum_track_subjects.sql
    │   │   ├── academic_student_track_enrollments.sql
    │   │   ├── academic_question_bank.sql
    │   │   ├── academic_exams.sql
    │   │   ├── academic_exam_questions.sql
    │   │   ├── academic_exam_submissions.sql
    │   │   ├── academic_exam_submission_answers.sql
    │   │   ├── academic_student_scores.sql
    │   │   ├── academic_conduct_evaluations.sql
    │   │   ├── academic_report_cards.sql
    │   │   ├── academic_student_term_summaries.sql
    │   │   ├── academic_subject_exemptions.sql
    │   │   ├── academic_extracurricular_activities.sql
    │   │   ├── academic_activity_participations.sql
    │   │   ├── academic_fee_items.sql
    │   │   ├── academic_student_fee_bills.sql
    │   │   └── academic_attendance.sql
    │   ├── emulation/              # Thi đua nề nếp, cờ đỏ, bảng xếp hạng đa cấp, khen thưởng & kỷ luật
    │   │   ├── emulation_periods.sql
    │   │   ├── emulation_class_custom_criteria.sql
    │   │   ├── emulation_supervisor_duty_logs.sql
    │   │   ├── emulation_records.sql
    │   │   ├── emulation_rankings.sql
    │   │   ├── emulation_disciplinary_records.sql
    │   │   └── emulation_awards.sql
    │   ├── evaluation/             # Đánh giá giáo viên ẩn danh & Báo hỏng cơ sở vật chất
    │   │   ├── evaluation_forms.sql
    │   │   ├── evaluation_questions.sql
    │   │   ├── evaluation_facilities.sql
    │   │   ├── evaluation_submissions.sql
    │   │   ├── evaluation_answers.sql
    │   │   └── evaluation_facility_incident_reports.sql
    │   ├── notification/           # Thông báo, sổ liên lạc điện tử, tin nhắn PH-GV, nhắc nhở cá nhân, push tokens
    │   │   ├── notification_announcements.sql
    │   │   ├── notification_announcement_reads.sql
    │   │   ├── notification_reminders.sql
    │   │   ├── notification_push_tokens.sql
    │   │   ├── notification_contact_book_notes.sql
    │   │   └── notification_parent_teacher_messages.sql
    │   └── sys/                    # Cấu hình card động theo role, user settings, audit logs
    │       ├── sys_role_modules.sql
    │       ├── sys_user_module_preferences.sql
    │       ├── sys_role_settings_defaults.sql
    │       ├── sys_system_settings.sql
    │       ├── sys_user_settings.sql
    │       ├── sys_audit_logs.sql
    │       └── sys_event_outbox.sql
    ├── 03_views/                   # Các View tổng hợp dữ liệu thời gian thực
    │   └── views.sql               # v_current_class_leadership, v_student_360_profile,...
    ├── 04_triggers/                # Đăng ký Triggers
    │   └── triggers.sql            # Triggers tự động cập nhật updated_at cho tất cả bảng
    └── 05_seeds/                   # Dữ liệu khởi tạo (INSERT statements)
        └── init.sql                # Master Data & tài khoản seed mẫu
```

---

## 🏛️ Tổng quan 6 Schemas

| Schema | Vai trò nghiệp vụ |
| :--- | :--- |
| **`core`** | Quản lý người dùng, phân quyền RBAC, hồ sơ học sinh/giáo viên/phụ huynh, cơ cấu khối - lớp - tổ, phân công chức vụ theo niên khóa, Câu lạc bộ Đoàn - Hội, Lookup Engine & Custom Fields. |
| **`academic`** | Nghiệp vụ học đường THPT 360: TKB ca - tiết, sổ đầu bài, tài liệu, bài tập, tổ hợp môn GDPT 2018, ngân hàng câu hỏi & thi trắc nghiệm online, điểm số & đánh giá rèn luyện/học bạ TT22, miễn giảm môn học, hoạt động ngoại khóa trải nghiệm, quản lý học phí & khoản thu. |
| **`emulation`** | Thi đua 360 độ: Tiêu chí chung toàn trường & nội bộ riêng của lớp, sổ trực ban giám thị, nề nếp cờ đỏ, bảng tổng sắp xếp hạng tuần/tháng, sổ vàng khen thưởng & kỷ luật. |
| **`evaluation`** | Đánh giá khảo sát: Học sinh đánh giá giáo viên cuối kỳ (hoàn toàn ẩn danh); Báo cáo hỏng hóc và theo dõi sửa chữa cơ sở vật chất (máy chiếu, đèn, bàn ghế,...). |
| **`notification`** | Kênh thông tin liên lạc 360: Thông báo đa kênh; Sổ liên lạc điện tử định kỳ; Nhắn tin trực tiếp 1-1 Phụ huynh - Giáo viên; Nhắc nhở học vụ; Token thông báo đẩy FCM/APNs. |
| **`sys`** | Hạ tầng thông minh: Thẻ chức năng Dashboard động theo Role, tùy biến sắp xếp của người dùng, Cài đặt cá nhân hóa 4 tầng, Audit logs, Event Outbox Pattern. |

---

## 📦 Master Data nạp sẵn trong Hệ thống

Khi chạy `init.sql`, hệ thống tự động nạp toàn bộ danh mục sản xuất:

1. **Trường học mẫu:** THPT Lê Quý Đôn (`THPT_LEQUYDON`).
2. **Niên khóa & Học kỳ:** 2024-2025, 2025-2026, 2026-2027 (hiện hành) cùng HK1, HK2, Khóa Hè.
3. **Khối lớp:** Khối 10, Khối 11, Khối 12.
4. **11 Tổ chuyên môn:** Toán - Tin học, Ngữ văn, Ngoại ngữ, Vật lý, Hóa học - Sinh học, Lịch sử - Địa lý - GDKT&PL, Thể dục - GDQP&AN, Ban Giám thị, Phòng Y tế, Tài vụ, Đoàn trường.
5. **15 Môn học chuẩn GDPT 2018:** Toán, Ngữ văn, Tiếng Anh, Lịch sử, GDTC, GDQP&AN, HĐTN&HN, GD địa phương, Vật lý, Hóa học, Sinh học, Địa lý, GDKT&PL, Tin học, Công nghệ.
6. **Lớp học & Tổ học tập:** Các lớp 10A1, 10A2, 10D1, 10D2, 11A1, 11D1, 12A1, 12D1 (Ban Tự nhiên & Xã hội), Tổ 1, 2, 3, 4 trong từng lớp.
7. **Ca học & 10 Tiết chuẩn THPT:** Ca Sáng (Tiết 1 đến 5 từ 07:00), Ca Chiều (Tiết 6 đến 10 từ 12:45).
8. **Phòng học & Cơ sở vật chất:** Phòng học A101, A102, B101; Phòng thí nghiệm Lý - Hóa - Sinh; Phòng máy tính Tin học; Thư viện; Hội trường 500 chỗ; Nhà đa năng.
9. **Cột điểm Thông tư 22:** Kiểm tra miệng, 15 phút (ĐĐGtx - hệ số 1), Giữa kỳ (ĐĐGgk - hệ số 2), Cuối kỳ (ĐĐGck - hệ số 3).
10. **Chức vụ đối tượng:** Giáo viên chủ nhiệm, GV bộ môn, Lớp trưởng, Lớp phó học tập, Lớp phó lao động, Lớp phó nề nếp, Bí thư chi đoàn, Tổ trưởng, Đội viên cờ đỏ, Giám thị khối,...
11. **17 Modules Card giao diện:** TKB 360, Bảng điểm học bạ, Bài tập, Đề thi, Sổ đầu bài, Đánh giá GV ẩn danh, Báo hỏng thiết bị, Xếp hạng thi đua,...
12. **10 Tiêu chí thi đua:** Nề nếp đi học đúng giờ, đồng phục phù hiệu, vệ sinh lớp học, giờ học tốt điểm A, hoa điểm 10,...

---

## 🚀 Khởi chạy Nhanh với Docker & Kết nối pgAdmin 4

Thư mục đã được trang bị sẵn `docker-compose.yml` cùng cơ chế tự động thực thi các file SQL theo đúng thứ tự phụ thuộc, **100% không bị lỗi Foreign Key**.

### 1. Khởi động Container

Mở terminal tại thư mục `schoolpro-db` và chạy:

```bash
cd /Users/nguyennguyenphong/Documents/code/project/schoolpro/schoolpro-db
docker compose up -d
```

### 2. Kiểm tra tiến trình khởi tạo Database

```bash
docker logs -f schoolpro-postgres
```
Bạn sẽ thấy thông báo:
```
==========================================================
 SchoolPro Database Initialization Finished Successfully! 
==========================================================
```

### 3. Đăng nhập pgAdmin 4

Mở trình duyệt truy cập: **`http://localhost:5050`**

- **Email đăng nhập:** `admin@schoolpro.edu.vn`
- **Mật khẩu:** `admin`

> 💡 **Tự động kết nối:** Nhờ file cấu hình `docker/pgadmin/servers.json` và `docker/pgadmin/pgpass`, server **"SchoolPro High School PostgreSQL"** đã được **kết nối sẵn tự động** trong danh sách server của pgAdmin! Bạn chỉ cần bấm vào là có thể xem ngay 6 schemas, các tables, views và triggers mà không cần cấu hình host/port thủ công.

### Thông số kết nối trực tiếp (Backend / CLI):
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `schoolpro`
- **Username:** `postgres`
- **Password:** `password123`

---

## 🔍 Các câu lệnh truy vấn mẫu hữu ích

### 1. Truy vấn Danh sách Ban cán sự & GVCN hiện tại của từng lớp
```sql
SELECT 
  class_code, 
  position_name, 
  student_or_teacher_name, 
  student_code, 
  group_name
FROM core.v_current_class_leadership
WHERE class_code = '10A1';
```

### 2. Truy vấn Luồng Card Dashboard hiển thị cho Học sinh
```sql
SELECT 
  module_code, 
  module_name, 
  badge_text, 
  display_order, 
  is_pinned, 
  ui_config->>'color' AS card_color
FROM sys.v_user_dashboard_cards
WHERE role_code = 'STUDENT'
ORDER BY display_order ASC;
```

### 3. Lấy thông tin Cài đặt đã được phân giải 4 tầng cho một người dùng
```sql
SELECT 
  setting_code, 
  setting_name, 
  effective_value, 
  resolved_from
FROM sys.v_user_effective_settings
WHERE user_id = '00000000-0000-0000-0000-000000000003';
```

### 4. Truy vấn Lịch sử Chức vụ của một Học sinh qua các năm
```sql
SELECT 
  u.full_name,
  p.name AS position_title,
  c.name AS class_name,
  ay.name AS academic_year,
  pa.start_date,
  pa.end_date,
  pa.is_current
FROM core.position_assignments pa
JOIN core.positions p ON p.id = pa.position_id
JOIN core.users u ON u.id = pa.user_id
JOIN core.academic_years ay ON ay.id = pa.academic_year_id
LEFT JOIN core.classes c ON c.id = pa.class_id
WHERE u.username = 'hs_le_hoang_nam'
ORDER BY pa.start_date DESC;
```
