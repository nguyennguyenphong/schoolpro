# 🎓 SchoolPro - Enterprise High School Database Architecture

Hệ thống cơ sở dữ liệu **PostgreSQL Enterprise** toàn diện cho Trường Trung học Phổ thông (Cấp 3), được thiết kế theo chuẩn **Kiến trúc chống phá vỡ cấu trúc (Future-Proof Architecture)**, tích hợp sẵn **Master Data theo Chương trình GDPT 2018 & Thông tư 22/2021/TT-BGDĐT**, hỗ trợ đa vai trò linh hoạt và vận hành tức thì qua Docker & pgAdmin 4.

---

## 📑 Mục lục
1. [Nguyên tắc thiết kế Chống phá vỡ cấu trúc](#-nguyên-tắc-thiết-kế-chống-phá-vỡ-cấu-trúc)
2. [Cấu trúc Thư mục Chuẩn Enterprise](#-cấu-trúc-thư-mục-chuẩn-enterprise)
3. [Tổng quan 6 Schemas](#-tổng-quan-6-schemas)
4. [Mô tả Chi tiết Toàn bộ 85 Bảng Dữ liệu](#-mô-tả-chi-tiết-toàn-bộ-85-bảng-dữ-liệu)
   - [4.1. Phân hệ Danh mục & Dữ liệu Nền tảng (Master Catalogs)](#41-phân-hệ-danh-mục--dữ-liệu-nền-tảng-master-catalogs)
   - [4.2. Phân hệ Cơ cấu Tổ chức, Định danh & Phân quyền (Core Identity & RBAC)](#42-phân-hệ-cơ-cấu-tổ-chức-định-danh--phân-quyền-core-identity--rbac)
   - [4.3. Phân hệ Nghiệp vụ Học vụ & Khảo thí (Academic Operations & Assessment)](#43-phân-hệ-nghiệp-vụ-học-vụ--khảo-thí-academic-operations--assessment)
   - [4.4. Phân hệ Thi đua, Khen thưởng & Nề nếp (Emulation & Discipline)](#44-phân-hệ-thi-đua-khen-thưởng--nề-nếp-emulation--discipline)
   - [4.5. Phân hệ Khảo sát Đánh giá & Cơ sở vật chất (Evaluation & Facilities)](#45-phân-hệ-khảo-sát-đánh-giá--cơ-sở-vật-chất-evaluation--facilities)
   - [4.6. Phân hệ Thông báo & Sổ liên lạc Điện tử (Notification & Communication)](#46-phân-hệ-thông-báo--sổ-liên-lạc-điện-tử-notification--communication)
   - [4.7. Phân hệ Hạ tầng Hệ thống, Dashboard Động & Nhật ký (System & Audit)](#47-phân-hệ-hạ-tầng-hệ-thống-dashboard-động--nhật-ký-system--audit)
5. [Master Data nạp sẵn trong Hệ thống](#-master-data-nạp-sẵn-trong-hệ-thống)
6. [Khởi chạy Nhanh với Docker & Kết nối pgAdmin 4](#-khởi-chạy-nhanh-với-docker--kết-nối-pgadmin-4)
7. [Các câu lệnh truy vấn mẫu hữu ích](#-các-câu-lệnh-truy-vấn-mẫu-hữu-ích)

---

## 🛡️ Nguyên tắc thiết kế Chống phá vỡ cấu trúc

Hệ thống giáo dục thường xuyên thay đổi quy chế (thông tư điểm số mới, định danh học sinh VNeID, tổ hợp môn tự chọn,...). Để database **không bao giờ bị lock bảng, không phải chạy ALTER TABLE nguy hiểm, và không phá vỡ logic backend**, database áp dụng 6 giải pháp sau:

1. **Dynamic Reference & Lookup Engine (`lookup_types`, `lookup_values`):**
   - Loại bỏ hoàn toàn physical `ENUM` cứng của PostgreSQL.
   - Mọi danh mục trạng thái, loại phòng, hình thức đánh giá, ban học tập... đều quản lý qua bảng. Admin có thể thêm mới ngay trên giao diện Web mà không cần dev can thiệp.
2. **Dynamic Custom Fields Engine (EAV Pattern + JSONB):**
   - Bảng `core.custom_field_definitions` và `core.custom_field_values` cho phép trường tự định nghĩa thêm trường thông tin mới cho Học sinh, Giáo viên, Lớp học, Bài thi (VD: *Mã định danh VNeID mức 2*, *Số hiệu máy tính xách tay*,...) mà không cần thêm cột vào DDL.
3. **Phân quyền chức vụ theo Không gian & Thời gian (Polymorphic Temporal Positions):**
   - Bảng `core.positions` và `core.position_assignments` theo dõi ai đã từng hoặc đang giữ chức vụ gì ở đâu (`SCHOOL`, `GRADE`, `CLASS`, `GROUP`, `DEPARTMENT`, `INDIVIDUAL`) kèm `start_date`, `end_date`, `is_current`.
   - Đáp ứng trọn vẹn: *Thầy A là GVCN lớp 10A1 năm 2024, năm 2025 là Tổ trưởng tổ Toán; Em B là Lớp trưởng lớp 10A1, em C là Lớp phó lao động, em D là Tổ trưởng Tổ 1.*
4. **Hệ thống Thi đua đa cấp động (Multi-Level Emulation):**
   - Tiêu chí toàn trường lưu ở `master.emulation_criteria`.
   - Đồng thời, mỗi lớp học có bảng `emulation.class_custom_criteria` để GVCN và ban cán sự lớp tự tạo tiêu chí chấm điểm thi đua nội bộ trong lớp.
5. **Card giao diện & Cài đặt 4 tầng cá nhân hóa (`sys` schema):**
   - Danh mục Card chức năng được phân quyền theo Role (`sys.modules`, `sys.role_modules`), người dùng được tự ghim, ẩn, đổi thứ tự kéo thả (`sys.user_module_preferences`).
   - Cài đặt hệ thống giải quyết theo 4 tầng ưu tiên: **Cá nhân (User) $\rightarrow$ Vai trò (Role) $\rightarrow$ Trường học (School) $\rightarrow$ Mặc định (Default)**.
6. **Transactional Event Outbox Pattern (`sys.event_outbox`):**
   - Đảm bảo an toàn giao dịch khi kết nối các hệ thống bất đồng bộ (Celery, Redis, Webhooks, Push Notification) khi phát sinh sự kiện quan trọng (nhập điểm, vắng học, xếp hạng thi đua).

---

## 📁 Cấu trúc Thư mục Chuẩn Enterprise

```
schoolpro-db/
├── README.md                       # Tài liệu hướng dẫn kiến trúc và mô tả chi tiết 85 tables
├── docker-compose.yml              # File khởi chạy Docker Compose tại thư mục gốc (Port 5433 & 5050)
├── docker/                         # Cấu hình container và kịch bản khởi động
│   ├── init-db.sh                  # Kịch bản thực thi SQL theo thứ tự topo phụ thuộc chuẩn
│   └── pgadmin/                    # Cấu hình tự động kết nối và chứng thực cho pgAdmin 4
│       ├── servers.json            # Tự động đăng ký PostgreSQL server vào pgAdmin
│       └── pgpass                  # Tự động chứng thực mật khẩu kết nối (0600)
└── sql/                            # Toàn bộ mã nguồn SQL được phân chia khoa học
    ├── 00_schemas.sql              # Khởi tạo Extensions, 6 Schemas và Enum scope
    ├── 01_functions/               # Các hàm thủ tục lưu trữ (Stored Functions)
    │   └── functions.sql           # fn_set_updated_at() tự động cập nhật timestamp
    ├── 02_tables/                  # Định nghĩa bảng (Mỗi table 1 file riêng biệt)
    │   ├── master/                 # 15 bảng danh mục và master data dùng chung
    │   ├── core/                   # 19 bảng người dùng, vai trò, chức vụ, hồ sơ, lớp, CLB
    │   ├── academic/               # 25 bảng học vụ: TKB, ngân hàng câu hỏi, bài thi, TT22, học phí
    │   ├── emulation/              # 7 bảng thi đua nề nếp, cờ đỏ, xếp hạng, khen thưởng & kỷ luật
    │   ├── evaluation/             # 6 bảng đánh giá giáo viên ẩn danh & sự cố cơ sở vật chất
    │   ├── notification/           # 6 bảng thông báo, sổ liên lạc điện tử, tin nhắn PH-GV, tokens
    │   └── sys/                    # 7 bảng cấu hình card động theo role, user settings, audit logs
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
| **`academic`** | Nghiệp vụ học đường THPT: TKB ca - tiết, sổ đầu bài, tài liệu, bài tập, tổ hợp môn GDPT 2018, ngân hàng câu hỏi & thi trắc nghiệm online, điểm số & đánh giá rèn luyện/học bạ TT22, miễn giảm môn học, hoạt động ngoại khóa trải nghiệm, quản lý học phí & khoản thu. |
| **`emulation`** | Thi đua & Nề nếp: Tiêu chí chung toàn trường & nội bộ riêng của lớp, sổ trực ban giám thị, nề nếp cờ đỏ, bảng tổng sắp xếp hạng tuần/tháng, sổ vàng khen thưởng & kỷ luật. |
| **`evaluation`** | Đánh giá khảo sát: Học sinh đánh giá giáo viên cuối kỳ (hoàn toàn ẩn danh); Báo cáo hỏng hóc và theo dõi sửa chữa cơ sở vật chất (máy chiếu, đèn, bàn ghế,...). |
| **`notification`** | Kênh thông tin liên lạc: Thông báo đa kênh; Sổ liên lạc điện tử định kỳ; Nhắn tin trực tiếp 1-1 Phụ huynh - Giáo viên; Nhắc nhở học vụ; Token thông báo đẩy FCM/APNs. |
| **`sys`** | Hạ tầng thông minh: Thẻ chức năng Dashboard động theo Role, tùy biến sắp xếp của người dùng, Cài đặt cá nhân hóa 4 tầng, Audit logs, Event Outbox Pattern. |

---

## 🗄️ Mô tả Chi tiết Toàn bộ 85 Bảng Dữ liệu

---

### 4.1. Phân hệ Danh mục & Dữ liệu Nền tảng (Master Catalogs)

Phân hệ này quản lý các thông tin dùng chung toàn trường, các danh mục động và dữ liệu ít thay đổi.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`core.lookup_types`** | Định nghĩa nhóm danh mục tham chiếu động (VD: Giới tính, Trạng thái, Loại phòng, Ban học tập). Thay thế enum cứng của Postgres. | Là bảng cha cho `core.lookup_values`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `description` (TEXT). |
| **`core.lookup_values`** | Chứa các giá trị cụ thể của từng nhóm tham chiếu (VD: Nam/Nữ, Active/Locked, KHTN/KHXH). | `lookup_type_id` $\rightarrow$ `core.lookup_types(id)`. Được tham chiếu bởi các bảng nghiệp vụ. | `id` (UUID PK), `lookup_type_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `order_no` (INT), `badge_color` (VARCHAR). |
| **`core.schools`** | Quản lý thông tin pháp nhân trường học, địa chỉ, số điện thoại, website, tên hiệu trưởng. | Là bảng gốc của hệ thống (Root Tenant). Hầu hết các bảng `core`, `academic` đều liên kết về đây. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `educational_stage` (VARCHAR), `address` (TEXT), `phone` (VARCHAR). |
| **`core.academic_years`** | Quản lý niên khóa/năm học (VD: 2024-2025, 2025-2026, 2026-2027), xác định năm học hiện hành. | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi `semesters`, `classes`, `position_assignments`, `awards`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `is_current` (BOOL). |
| **`core.semesters`** | Quản lý học kỳ trong năm học (Học kỳ 1, Học kỳ 2, Học kỳ Hè). | `academic_year_id` $\rightarrow$ `core.academic_years(id)`. Được tham chiếu bởi TKB, điểm số, sổ liên lạc, học phí. | `id` (UUID PK), `academic_year_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `is_current` (BOOL). |
| **`core.grades`** | Quản lý khối lớp THPT (Khối 10, Khối 11, Khối 12). | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi `classes`, `curriculum_tracks`, `question_bank`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `order_no` (INT). |
| **`core.departments`** | Quản lý tổ chuyên môn và phòng ban (Tổ Toán - Tin, Tổ Ngữ văn, Ban Giám thị, Y tế, Tài vụ). | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi `teachers`, `subjects`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `department_type` (VARCHAR). |
| **`core.subjects`** | Danh mục môn học GDPT 2018 (Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, GDKT&PL, HĐTN&HN...). | `school_id` $\rightarrow$ `core.schools(id)`, `department_id` $\rightarrow$ `core.departments(id)`. Được tham chiếu bởi TKB, giáo viên bộ môn, điểm số. | `id` (UUID PK), `code` (VARCHAR), `name` (VARCHAR), `evaluation_type` (SCORE/COMMENT), `is_compulsory` (BOOL), `metadata` (JSONB). |
| **`core.rooms`** | Danh mục phòng học, phòng thí nghiệm, phòng chức năng, nhà thi đấu thể thao. | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi thời khóa biểu `timetables` và báo hỏng `evaluation_facilities`. | `id` (UUID PK), `school_id` (UUID FK), `room_code` (VARCHAR), `name` (VARCHAR), `room_type_code` (VARCHAR), `capacity` (INT). |
| **`core.periods`** | Khung giờ chuẩn cho 10 tiết học THPT (Tiết 1 đến 5 ca sáng, tiết 6 đến 10 ca chiều). | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu trực tiếp bởi `timetables`. | `id` (UUID PK), `school_id` (UUID FK), `period_number` (INT), `shift` (MORNING/AFTERNOON), `start_time` (TIME), `end_time` (TIME). |
| **`core.score_types`** | Định nghĩa các đầu điểm theo Thông tư 22 (Miệng, 15 phút, Giữa kỳ, Cuối kỳ) cùng hệ số điểm. | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi bảng điểm học sinh `student_scores`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `coefficient` (NUMERIC), `min_required` (INT). |
| **`core.positions`** | Danh mục chức vụ học đường: GVCN, Lớp trưởng, Lớp phó, Bí thư, Tổ trưởng, Giám thị, Cờ đỏ. | Không có FK phụ thuộc. Được tham chiếu bởi bảng phân công chức vụ `position_assignments`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `applicable_scope` (CLASS/SCHOOL/GRADE), `rank_weight` (INT). |
| **`master.emulation_criteria`** | Bảng tiêu chí thi đua toàn trường (Đi học muộn, Không mặc đồng phục, Giờ học tốt, Vệ sinh). | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi các bản ghi nề nếp `emulation.records`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `title` (VARCHAR), `category` (VARCHAR), `default_points` (NUMERIC). |
| **`sys.settings_definitions`** | Định nghĩa các khóa cài đặt hệ thống (Giao diện, thông báo, thời hạn khóa sổ điểm, bảo mật). | Được tham chiếu bởi các bảng cấu hình 4 tầng (`sys_role_settings_defaults`, `sys_system_settings`, `sys_user_settings`). | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `category` (VARCHAR), `data_type` (VARCHAR), `default_value` (JSONB). |
| **`sys.modules`** | Danh mục các thẻ/module chức năng trên giao diện (Thời khóa biểu, Học bạ, Điểm số, Đề thi, Sổ liên lạc). | Được tham chiếu bởi bảng phân quyền thẻ `sys.role_modules` và tùy biến cá nhân `sys.user_module_preferences`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `route` (VARCHAR), `icon` (VARCHAR), `category` (VARCHAR). |

---

### 4.2. Phân hệ Cơ cấu Tổ chức, Định danh & Phân quyền (Core Identity & RBAC)

Phân hệ quản lý tài khoản người dùng, phân quyền vai trò (Role-Based Access Control), hồ sơ đối tượng và liên kết lớp học.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`core.custom_field_definitions`** | Định nghĩa các trường động mở rộng cho từng thực thể (STUDENT, TEACHER, CLASS) theo mô hình EAV. | `school_id` $\rightarrow$ `core.schools(id)`. Được tham chiếu bởi `core.custom_field_values`. | `id` (UUID PK), `entity_type` (VARCHAR), `field_name` (VARCHAR), `field_code` (VARCHAR), `field_type` (TEXT/DATE/NUMBER/JSON). |
| **`core.custom_field_values`** | Lưu giá trị thực tế của các trường tùy biến mở rộng theo từng ID đối tượng. | `definition_id` $\rightarrow$ `core.custom_field_definitions(id)`. | `id` (UUID PK), `definition_id` (UUID FK), `entity_id` (UUID), `field_value` (JSONB). |
| **`core.users`** | Bảng định danh tập trung lưu thông tin tài khoản, mật khẩu băm, email, số điện thoại, họ tên, CCCD/VNeID. | `school_id` $\rightarrow$ `core.schools(id)`. Là thực thể cha của `students`, `teachers`, `guardians`, `staff`, `user_roles`. | `id` (UUID PK), `school_id` (UUID FK), `username` (VARCHAR UNIQUE), `password_hash` (TEXT), `full_name` (VARCHAR), `gender_code` (VARCHAR), `phone` (VARCHAR). |
| **`core.roles`** | Định nghĩa các vai trò trong trường: ADMIN, PRINCIPAL, TEACHER, HOMEROOM_TEACHER, STUDENT, PARENT, SUPERVISOR. | Được tham chiếu bởi `core.user_roles`, `core.role_permissions`, `sys.role_modules`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `description` (TEXT), `badge_color` (VARCHAR). |
| **`core.permissions`** | Danh mục quyền hạn chi tiết theo chuẩn REST/Domain (VD: `student.view`, `score.edit`, `attendance.mark`). | Được tham chiếu bởi bảng gán quyền vai trò `core.role_permissions`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `module` (VARCHAR), `action` (VARCHAR), `description` (TEXT). |
| **`core.role_permissions`** | Bảng quan hệ nhiều-nhiều liên kết quyền hạn cụ thể cho từng vai trò. | `role_id` $\rightarrow$ `core.roles(id)`, `permission_id` $\rightarrow$ `core.permissions(id)`. | `role_id` (UUID), `permission_id` (UUID). Khóa chính kết hợp `(role_id, permission_id)`. |
| **`core.user_roles`** | Gán vai trò cho người dùng (Một người có thể có nhiều vai trò, ví dụ: vừa là Giáo viên, vừa là Phụ huynh). | `user_id` $\rightarrow$ `core.users(id)`, `role_id` $\rightarrow$ `core.roles(id)`. | `id` (UUID PK), `user_id` (UUID FK), `role_id` (UUID FK), `is_primary` (BOOL), `status` (ACTIVE/INACTIVE). |
| **`core.classes`** | Quản lý thông tin lớp học (10A1, 11D1, 12A2), sỉ số mục tiêu, phòng học cố định. | `school_id` $\rightarrow$ `core.schools(id)`, `grade_id` $\rightarrow$ `core.grades(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `code` (VARCHAR), `name` (VARCHAR), `grade_id` (UUID FK), `academic_year_id` (UUID FK), `room_id` (UUID FK). |
| **`core.class_groups`** | Chia nhỏ lớp thành các tổ/nhóm học tập (Tổ 1, Tổ 2, Tổ 3, Tổ 4) để chấm điểm thi đua hoặc phân nhóm. | `class_id` $\rightarrow$ `core.classes(id)`. Được tham chiếu bởi `position_assignments`. | `id` (UUID PK), `class_id` (UUID FK), `name` (VARCHAR), `order_no` (INT). |
| **`core.position_assignments`** | Phân công chức vụ theo không gian và thời gian: GVCN, Lớp trưởng, Tổ trưởng theo năm học và lớp học. | `user_id` $\rightarrow$ `core.users(id)`, `position_id` $\rightarrow$ `core.positions(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `user_id` (UUID FK), `position_id` (UUID FK), `class_id` (UUID FK), `start_date` (DATE), `is_current` (BOOL). |
| **`core.students`** | Hồ sơ nghiệp vụ học sinh: Mã học sinh (HS2026...), ngày nhập học, ngày tốt nghiệp, dân tộc, diện chính sách. | `user_id` $\rightarrow$ `core.users(id)`. Là trung tâm liên kết của điểm số, học phí, chuyên cần, khen thưởng. | `id` (UUID PK), `user_id` (UUID FK UNIQUE), `student_code` (VARCHAR UNIQUE), `admission_date` (DATE), `status` (STUDYING/...). |
| **`core.student_health_records`** | Sổ theo dõi sức khỏe học sinh: Chiều cao, cân nặng, thị lực, tiền sử bệnh án, dị ứng, BHYT. | `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `student_id` (UUID FK), `academic_year_id` (UUID FK), `height` (NUMERIC), `weight` (NUMERIC), `allergies` (TEXT). |
| **`core.guardians`** | Hồ sơ phụ huynh/người giám hộ, quan hệ với học sinh (Bố, Mẹ, Người bảo hộ), quyền liên lạc chính. | `user_id` $\rightarrow$ `core.users(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `user_id` (UUID FK), `student_id` (UUID FK), `relationship_type` (FATHER/MOTHER/...), `is_emergency_contact` (BOOL). |
| **`core.teachers`** | Hồ sơ giáo viên: Mã giáo viên (GV2026...), trình độ chuyên môn, tổ bộ môn, ngày vào ngành. | `user_id` $\rightarrow$ `core.users(id)`, `department_id` $\rightarrow$ `core.departments(id)`. | `id` (UUID PK), `user_id` (UUID FK UNIQUE), `teacher_code` (VARCHAR UNIQUE), `department_id` (UUID FK), `qualification` (VARCHAR). |
| **`core.staff`** | Hồ sơ nhân viên văn phòng, giám thị, y tế, kế toán, văn thư, kỹ thuật viên tin học. | `user_id` $\rightarrow$ `core.users(id)`, `department_id` $\rightarrow$ `core.departments(id)`. | `id` (UUID PK), `user_id` (UUID FK UNIQUE), `staff_code` (VARCHAR UNIQUE), `job_title` (VARCHAR), `employment_status` (VARCHAR). |
| **`core.student_class_enrollments`** | Phân lớp học sinh: Ghi nhận học sinh nào học lớp nào trong niên khóa nào, trạng thái (Đang học, chuyển lớp). | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `student_id` (UUID FK), `class_id` (UUID FK), `enrollment_date` (DATE), `status` (ACTIVE/TRANSFERRED). |
| **`core.class_subject_teachers`** | Phân công giảng dạy bộ môn: Thầy nào dạy môn gì tại lớp nào trong từng học kỳ. | `class_id` $\rightarrow$ `core.classes(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `class_id` (UUID FK), `subject_id` (UUID FK), `teacher_id` (UUID FK), `semester_id` (UUID FK). |
| **`core.clubs`** | Danh mục các Câu lạc bộ học thuật, văn hóa nghệ thuật, thể thao và Đoàn trường (Robotics, Bóng rổ, Guitar...). | `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `category` (ACADEMIC/SPORTS/ART). |
| **`core.club_members`** | Quản lý danh sách thành viên tham gia Câu lạc bộ, vai trò (Chủ nhiệm, Phó chủ nhiệm, Thành viên). | `club_id` $\rightarrow$ `core.clubs(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `club_id` (UUID FK), `student_id` (UUID FK), `role_title` (VARCHAR), `joined_date` (DATE), `status` (ACTIVE/INACTIVE). |

---

### 4.3. Phân hệ Nghiệp vụ Học vụ & Khảo thí (Academic Operations & Assessment)

Phân hệ quản lý toàn bộ vòng đời học tập: Thời khóa biểu, sổ đầu bài, bài tập, ngân hàng câu hỏi, thi trực tuyến, điểm số Thông tư 22, đánh giá học bạ và học phí.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`academic.timetables`** | Lịch thời khóa biểu chính khóa: Phân định Thứ, Tiết, Lớp, Môn học, Giáo viên và Phòng học. | `class_id` $\rightarrow$ `core.classes(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`, `period_id` $\rightarrow$ `core.periods(id)`. | `id` (UUID PK), `day_of_week` (SMALLINT 2-8), `period_id` (UUID FK), `class_id` (UUID FK), `subject_id` (UUID FK), `room_id` (UUID FK). |
| **`academic.timetable_changes`** | Nhật ký báo dạy thay, dạy bù, đổi tiết giữa các giáo viên hoặc nghỉ học đột xuất. | `timetable_id` $\rightarrow$ `academic.timetables(id)`, `substitute_teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `timetable_id` (UUID FK), `change_type` (SUBSTITUTE/SWAP/CANCEL), `change_date` (DATE), `reason` (TEXT). |
| **`academic.class_journal_entries`** | Sổ đầu bài điện tử: Giáo viên ghi nhận bài học, sĩ số hiện diện, nhận xét tiết học và xếp loại tiết (A, B, C). | `class_id` $\rightarrow$ `core.classes(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `lesson_topic` (VARCHAR), `evaluation_grade` (A/B/C/D), `teacher_notes` (TEXT), `absent_students` (TEXT). |
| **`academic.curriculum_materials`** | Thư viện bài giảng, giáo án điện tử, tài liệu tham khảo theo môn học và khối lớp. | `subject_id` $\rightarrow$ `core.subjects(id)`, `grade_id` $\rightarrow$ `core.grades(id)`, `created_by` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `title` (VARCHAR), `description` (TEXT), `material_type` (SLIDE/DOCUMENT/VIDEO), `is_published` (BOOL). |
| **`academic.material_attachments`** | Tệp tin đính kèm cho bài giảng/tài liệu (PDF, PPTX, MP4, DOCX) cùng đường dẫn lưu trữ. | `material_id` $\rightarrow$ `academic.curriculum_materials(id)`. | `id` (UUID PK), `material_id` (UUID FK), `file_name` (VARCHAR), `file_url` (TEXT), `file_size_bytes` (BIGINT), `mime_type` (VARCHAR). |
| **`academic.assignments`** | Quản lý bài tập về nhà, tiểu luận hoặc dự án học tập do giáo viên giao cho lớp. | `class_id` $\rightarrow$ `core.classes(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `title` (VARCHAR), `instructions` (TEXT), `due_date` (TIMESTAMPTZ), `max_score` (NUMERIC), `attachment_url` (TEXT). |
| **`academic.assignment_submissions`** | Bài làm nộp của học sinh, thời điểm nộp bài, điểm số chấm và lời phê của giáo viên. | `assignment_id` $\rightarrow$ `academic.assignments(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `assignment_id` (UUID FK), `student_id` (UUID FK), `submission_content` (TEXT), `score` (NUMERIC), `feedback` (TEXT). |
| **`academic.curriculum_tracks`** | Định nghĩa tổ hợp ban học tập theo Chương trình GDPT 2018 (Ban KHTN A00, Ban KHXH D01, Ban Nghệ thuật). | `school_id` $\rightarrow$ `core.schools(id)`, `grade_id` $\rightarrow$ `core.grades(id)`. | `id` (UUID PK), `school_id` (UUID FK), `grade_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `career_orientation` (TEXT). |
| **`academic.curriculum_track_subjects`** | Danh sách các môn học lựa chọn cấu thành nên tổ hợp ban môn học đó. | `track_id` $\rightarrow$ `academic.curriculum_tracks(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `track_id` (UUID), `subject_id` (UUID), `is_specialized` (BOOL), `weekly_periods` (INT). PK `(track_id, subject_id)`. |
| **`academic.student_track_enrollments`** | Ghi nhận học sinh đăng ký và học theo tổ hợp môn/ban học tập nào trong từng niên khóa. | `student_id` $\rightarrow$ `core.students(id)`, `track_id` $\rightarrow$ `academic.curriculum_tracks(id)`. | `id` (UUID PK), `student_id` (UUID FK), `track_id` (UUID FK), `academic_year_id` (UUID FK), `status` (ACTIVE/CHANGED). |
| **`academic.question_bank`** | Ngân hàng câu hỏi trắc nghiệm & tự luận theo ma trận đề: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao. | `subject_id` $\rightarrow$ `core.subjects(id)`, `grade_id` $\rightarrow$ `core.grades(id)`. | `id` (UUID PK), `content` (TEXT), `question_type` (SINGLE/MULTI/ESSAY), `options` (JSONB), `correct_answers` (JSONB), `solution` (TEXT). |
| **`academic.exams`** | Quản lý kỳ kiểm tra/kỳ thi (Giữa kỳ, Cuối kỳ, Khảo sát chất lượng, Thi thử THPT Quốc gia). | `school_id` $\rightarrow$ `core.schools(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `title` (VARCHAR), `duration_minutes` (INT), `total_score` (NUMERIC), `start_time` (TIMESTAMPTZ), `end_time` (TIMESTAMPTZ). |
| **`academic.exam_questions`** | Đề thi chi tiết: Gán các câu hỏi từ ngân hàng câu hỏi vào bài thi theo thứ tự và điểm số. | `exam_id` $\rightarrow$ `academic.exams(id)`, `question_id` $\rightarrow$ `academic.question_bank(id)`. | `id` (UUID PK), `exam_id` (UUID FK), `question_id` (UUID FK), `question_order` (INT), `points` (NUMERIC). |
| **`academic.exam_submissions`** | Phiếu làm bài thi trực tuyến của học sinh: Thời gian bắt đầu, nộp bài, số câu đúng và tổng điểm tự động. | `exam_id` $\rightarrow$ `academic.exams(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `exam_id` (UUID FK), `student_id` (UUID FK), `score` (NUMERIC), `started_at` (TIMESTAMPTZ), `submitted_at` (TIMESTAMPTZ). |
| **`academic.exam_submission_answers`** | Câu trả lời chi tiết của từng câu trong bài thi, đáp án học sinh chọn và điểm câu đó đạt được. | `submission_id` $\rightarrow$ `academic.exam_submissions(id)`, `exam_question_id` $\rightarrow$ `academic.exam_questions(id)`. | `id` (UUID PK), `submission_id` (UUID FK), `selected_answers` (JSONB), `is_correct` (BOOL), `score_awarded` (NUMERIC). |
| **`academic.student_scores`** | Bảng điểm môn học chi tiết theo Thông tư 22 (ĐĐGtx hệ số 1, ĐĐGgk hệ số 2, ĐĐGck hệ số 3). | `student_id` $\rightarrow$ `core.students(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `score_type_id` $\rightarrow$ `core.score_types(id)`. | `id` (UUID PK), `score_value` (NUMERIC 0-10), `evaluation_remark` (TEXT), `entered_by` (UUID FK), `is_locked` (BOOL). |
| **`academic.conduct_evaluations`** | Đánh giá kết quả rèn luyện hạnh kiểm từng tháng/kỳ của học sinh (Tốt, Khá, Đạt, Chưa đạt). | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `conduct_grade` (EXCELLENT/GOOD/AVERAGE/POOR), `teacher_comments` (TEXT), `assessed_by` (UUID FK). |
| **`academic.report_cards`** | Tổng kết sổ học bạ điện tử định kỳ: Điểm trung bình môn, xếp loại học lực, xếp loại rèn luyện và danh hiệu thi đua. | `student_id` $\rightarrow$ `core.students(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `gpa` (NUMERIC), `academic_rank` (XUAT_SAC/GIOI/KHA/DAT/CHUA_DAT), `conduct_rank` (TOT/KHA/DAT), `title` (VARCHAR). |
| **`academic.student_term_summaries`** | Bảng điểm tổng kết học kỳ và cả năm theo từng môn học đã được tính trung bình có trọng số. | `student_id` $\rightarrow$ `core.students(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `average_score` (NUMERIC), `evaluation_result` (DAT/CHUA_DAT), `passed` (BOOL). |
| **`academic.subject_exemptions`** | Quản lý diện miễn giảm, hoãn học hoặc miễn thi các môn (VD: Miễn Tiếng Anh khi có IELTS, Miễn GDTC vì lý do sức khỏe). | `student_id` $\rightarrow$ `core.students(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `exemption_type` (TOTAL/PARTIAL), `reason` (TEXT), `certificate_code` (VARCHAR), `approved_by` (UUID FK). |
| **`academic.extracurricular_activities`** | Quản lý các hoạt động ngoại khóa, chuyên đề học tập, hướng nghiệp và thiện nguyện ngoài giờ lên lớp. | `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `title` (VARCHAR), `activity_type` (COMMUNITY/ACADEMIC/CAREER), `points_reward` (INT), `event_date` (TIMESTAMPTZ). |
| **`academic.activity_participations`** | Danh sách học sinh đăng ký, tham gia thực tế và kết quả rèn luyện qua hoạt động ngoại khóa. | `activity_id` $\rightarrow$ `academic.extracurricular_activities(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `activity_id` (UUID FK), `student_id` (UUID FK), `attendance_status` (PRESENT/ABSENT), `verified_by` (UUID FK). |
| **`academic.fee_items`** | Danh mục các khoản thu học phí, BHYT, tiền nước uống, quỹ hội khuyến học theo quy định. | `school_id` $\rightarrow$ `core.schools(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `code` (VARCHAR), `name` (VARCHAR), `amount` (NUMERIC), `category` (TUITION/INSURANCE/...), `is_mandatory` (BOOL). |
| **`academic.student_fee_bills`** | Hóa đơn/biên lai thu tiền từng học sinh, số tiền đã đóng, trạng thái thanh toán và cổng thanh toán. | `student_id` $\rightarrow$ `core.students(id)`, `fee_item_id` $\rightarrow$ `academic.fee_items(id)`. | `id` (UUID PK), `bill_code` (VARCHAR UNIQUE), `original_amount` (NUMERIC), `paid_amount` (NUMERIC), `payment_status` (PAID/UNPAID). |
| **`academic.attendance`** | Điểm danh chuyên cần hàng ngày của học sinh (Có mặt, Nghỉ có phép, Nghỉ không phép, Đi muộn). | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `student_id` (UUID FK), `attendance_date` (DATE), `status` (PRESENT/EXCUSED_ABSENCE/UNEXCUSED_ABSENCE/LATE). |

---

### 4.4. Phân hệ Thi đua, Khen thưởng & Nề nếp (Emulation & Discipline)

Phân hệ quản lý nề nếp kỷ cương trường học: Chấm điểm cờ đỏ, trực ban giám thị, bảng xếp hạng thi đua giữa các lớp, khen thưởng và biên bản kỷ luật.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`emulation.periods`** | Chu kỳ tính điểm thi đua nề nếp (Tuần 1, Tuần 2, Tháng 10, Đợt thi đua 20/11). | `academic_year_id` $\rightarrow$ `core.academic_years(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `period_type` (WEEKLY/MONTHLY/CAMPAIGN), `name` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `is_closed` (BOOL). |
| **`emulation.class_custom_criteria`** | Tiêu chí chấm thi đua nội bộ do riêng từng lớp tự ban hành thêm (VD: Quên mang vở bài tập, trực nhật bẩn). | `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `class_id` (UUID FK), `name` (VARCHAR), `points` (NUMERIC), `criteria_type` (BONUS/PENALTY). |
| **`emulation.supervisor_duty_logs`** | Sổ nhật ký trực ban hàng ngày của đội ngũ Giám thị: Tình hình an ninh trật tự, sự cố cổng trường, giờ ra chơi. | `supervisor_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `duty_date` (DATE), `shift` (MORNING/AFTERNOON), `general_assessment` (TEXT), `incident_count` (INT). |
| **`emulation.records`** | Nhật ký chấm lỗi hoặc cộng điểm nề nếp của từng học sinh hoặc tập thể lớp do Cờ đỏ/Giám thị ghi nhận. | `class_id` $\rightarrow$ `core.classes(id)`, `student_id` $\rightarrow$ `core.students(id)`, `period_id` $\rightarrow$ `emulation.periods(id)`. | `id` (UUID PK), `class_id` (UUID FK), `student_id` (UUID FK), `points_delta` (NUMERIC), `reason` (TEXT), `recorded_by` (UUID FK). |
| **`emulation.rankings`** | Bảng tổng sắp xếp hạng thi đua giữa các lớp trong toàn trường hoặc toàn khối theo tuần/tháng. | `period_id` $\rightarrow$ `emulation.periods(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `period_id` (UUID FK), `class_id` (UUID FK), `total_points` (NUMERIC), `ranking_position` (INT), `rank_tier` (XUAT_SAC/...). |
| **`emulation.disciplinary_records`** | Hồ sơ xử lý kỷ luật học sinh vi phạm nghiêm trọng (Cảnh cáo trước cờ, tạm đình chỉ học tập, hạ hạnh kiểm). | `student_id` $\rightarrow$ `core.students(id)`, `decision_signed_by` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `student_id` (UUID FK), `infraction_description` (TEXT), `disciplinary_level` (REPRIMAND/SUSPENSION/...), `decision_number` (VARCHAR). |
| **`emulation.awards`** | Sổ vàng khen thưởng học sinh và tập thể: Học sinh giỏi, giải Olympic, sáng tạo KHKT, danh hiệu Cháu ngoan Bác Hồ. | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `title` (VARCHAR), `award_category` (ACADEMIC/SPORTS/LEADERSHIP), `prize` (FIRST/SECOND/...), `bonus_points` (INT). |

---

### 4.5. Phân hệ Khảo sát Đánh giá & Cơ sở vật chất (Evaluation & Facilities)

Phân hệ phục vụ công tác nâng cao chất lượng đào tạo và quản lý hạ tầng: Học sinh đánh giá giáo viên cuối kỳ (ẩn danh 100%) và tiếp nhận báo hỏng cơ sở vật chất lớp học.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`evaluation.forms`** | Quản lý các mẫu phiếu khảo sát (Khảo sát đánh giá phương pháp dạy học, Ý kiến đóng góp bữa ăn bán trú). | `school_id` $\rightarrow$ `core.schools(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `title` (VARCHAR), `description` (TEXT), `target_audience` (STUDENTS/PARENTS/TEACHERS), `is_anonymous` (BOOL). |
| **`evaluation.questions`** | Ngân hàng câu hỏi trong phiếu khảo sát (Đánh giá mức độ hài lòng theo thang điểm 1-5, câu hỏi tự luận đóng góp). | `form_id` $\rightarrow$ `evaluation.forms(id)`. | `id` (UUID PK), `form_id` (UUID FK), `question_text` (TEXT), `question_type` (RATING_1_5/YES_NO/TEXT), `order_no` (INT). |
| **`evaluation.facilities`** | Danh mục trang thiết bị vật chất phòng học (Máy chiếu, Máy lạnh, Quạt trần, Bàn ghế, Bảng từ, Đèn tuýp). | `room_id` $\rightarrow$ `core.rooms(id)`. | `id` (UUID PK), `room_id` (UUID FK), `facility_code` (VARCHAR), `name` (VARCHAR), `category` (ELECTRONICS/FURNITURE/...), `status` (GOOD/DAMAGED/REPAIRING). |
| **`evaluation.submissions`** | Phiếu nộp phản hồi khảo sát: Được mã hóa hash bảo mật danh tính học sinh, đảm bảo trung thực và khách quan. | `form_id` $\rightarrow$ `evaluation.forms(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `form_id` (UUID FK), `target_teacher_id` (UUID FK), `anonymous_hash` (VARCHAR UNIQUE), `submitted_at` (TIMESTAMPTZ). |
| **`evaluation.answers`** | Câu trả lời chi tiết của học sinh cho từng câu hỏi khảo sát trong phiếu nộp. | `submission_id` $\rightarrow$ `evaluation.submissions(id)`, `question_id` $\rightarrow$ `evaluation.questions(id)`. | `id` (UUID PK), `submission_id` (UUID FK), `question_id` (UUID FK), `rating_score` (INT 1-5), `text_answer` (TEXT). |
| **`evaluation.facility_incident_reports`** | Tiếp nhận báo cáo sự cố hư hỏng thiết bị từ lớp học (VD: Quạt trần kêu to, máy chiếu mờ, hỏng công tắc điện) và quy trình sửa chữa. | `facility_id` $\rightarrow$ `evaluation.facilities(id)`, `reported_by` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `facility_id` (UUID FK), `description` (TEXT), `priority` (HIGH/MEDIUM/LOW), `repair_status` (REPORTED/IN_PROGRESS/FIXED). |

---

### 4.6. Phân hệ Thông báo & Sổ liên lạc Điện tử (Notification & Communication)

Phân hệ kết nối Nhà trường - Giáo viên - Học sinh - Phụ huynh: Thông báo đa kênh, sổ liên lạc điện tử định kỳ, nhắn tin 1-1 và token thông báo đẩy thiết bị di động.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`notification.announcements`** | Bảng tin thông báo của nhà trường và giáo viên gửi tới toàn trường, từng khối, từng lớp hoặc nhóm phụ huynh. | `school_id` $\rightarrow$ `core.schools(id)`, `sender_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `title` (VARCHAR), `content` (TEXT), `target_audience` (ALL/GRADE/CLASS/PARENTS), `priority` (URGENT/NORMAL), `published_at` (TIMESTAMPTZ). |
| **`notification.announcement_reads`** | Theo dõi học sinh hoặc phụ huynh nào đã xem/đọc thông báo để nắm tỷ lệ tiếp cận thông tin. | `announcement_id` $\rightarrow$ `notification.announcements(id)`, `user_id` $\rightarrow$ `core.users(id)`. | `announcement_id` (UUID), `user_id` (UUID), `read_at` (TIMESTAMPTZ). Khóa chính kết hợp `(announcement_id, user_id)`. |
| **`notification.reminders`** | Nhắc nhở công việc cá nhân tự động (Nhắc nộp bài tập về nhà, nhắc đóng học phí, lịch họp phụ huynh). | `user_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `user_id` (UUID FK), `title` (VARCHAR), `remind_at` (TIMESTAMPTZ), `is_completed` (BOOL). |
| **`notification.push_tokens`** | Quản lý Device Push Tokens (FCM cho Android, APNs cho iOS, Web Push) để gửi thông báo tức thời ra màn hình khóa điện thoại. | `user_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `user_id` (UUID FK), `token` (TEXT UNIQUE), `platform` (ANDROID/IOS/WEB), `last_used_at` (TIMESTAMPTZ). |
| **`notification.contact_book_notes`** | Phiếu Sổ liên lạc điện tử định kỳ (Tuần, Tháng, Kỳ): Tổng hợp điểm số, ngày công chuyên cần, nề nếp và nhận xét của GVCN gửi phụ huynh ký nhận. | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `student_id` (UUID FK), `period_label` (VARCHAR), `academic_digest` (JSONB), `attendance_digest` (JSONB), `parent_acknowledged` (BOOL). |
| **`notification.parent_teacher_messages`** | Hộp thư tin nhắn riêng tư 1-1 giữa Phụ huynh học sinh và Giáo viên chủ nhiệm/Giáo viên bộ môn. | `sender_id` $\rightarrow$ `core.users(id)`, `receiver_id` $\rightarrow$ `core.users(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `sender_id` (UUID FK), `receiver_id` (UUID FK), `student_id` (UUID FK), `message_text` (TEXT), `is_read` (BOOL). |

---

### 4.7. Phân hệ Hạ tầng Hệ thống, Dashboard Động & Nhật ký (System & Audit)

Phân hệ đảm bảo vận hành thông minh: Thẻ chức năng Dashboard cá nhân hóa theo từng người dùng, cài đặt đa tầng phân cấp, nhật ký kiểm toán và truyền thông điệp bất đồng bộ an toàn.

| Tên Bảng | Làm gì / Dùng để làm gì | Khóa ngoại & Liên kết | Cột & Cấu trúc Chính |
| :--- | :--- | :--- | :--- |
| **`sys.role_modules`** | Phân quyền danh mục thẻ chức năng mặc định cho từng vai trò (Học sinh thấy Thời khóa biểu, Điểm thi; Hiệu trưởng thấy Báo cáo). | `role_id` $\rightarrow$ `core.roles(id)`, `module_id` $\rightarrow$ `sys.modules(id)`. | `id` (UUID PK), `role_id` (UUID FK), `module_id` (UUID FK), `is_visible` (BOOL), `is_pinned_default` (BOOL), `order_no` (INT). |
| **`sys.user_module_preferences`** | Lưu tùy biến kéo thả của riêng từng cá nhân: Người dùng có thể tự ghim lên đầu, ẩn bớt thẻ không dùng, đổi thứ tự hiển thị. | `user_id` $\rightarrow$ `core.users(id)`, `module_id` $\rightarrow$ `sys.modules(id)`. | `id` (UUID PK), `user_id` (UUID FK), `module_id` (UUID FK), `is_pinned` (BOOL), `is_hidden` (BOOL), `order_no` (INT). |
| **`sys.role_settings_defaults`** | Giá trị cài đặt mặc định áp dụng chung cho một vai trò cụ thể (VD: Quyền tải tài liệu của Giáo viên, giới hạn hiển thị). | `role_id` $\rightarrow$ `core.roles(id)`, `setting_id` $\rightarrow$ `sys.settings_definitions(id)`. | `id` (UUID PK), `role_id` (UUID FK), `setting_id` (UUID FK), `value` (JSONB). |
| **`sys.system_settings`** | Cấu hình cấp trường hoặc cấp toàn hệ thống (Thời gian khóa nhập điểm, chính sách mật khẩu, cấu hình SMTP). | `setting_id` $\rightarrow$ `sys.settings_definitions(id)`, `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `setting_id` (UUID FK), `school_id` (UUID FK), `value` (JSONB). |
| **`sys.user_settings`** | Giá trị cài đặt ghi đè theo sở thích của riêng cá nhân người dùng (Chế độ Dark mode, ngôn ngữ, âm thông báo). | `user_id` $\rightarrow$ `core.users(id)`, `setting_id` $\rightarrow$ `sys.settings_definitions(id)`. | `id` (UUID PK), `user_id` (UUID FK), `setting_id` (UUID FK), `value` (JSONB). |
| **`sys.audit_logs`** | Sổ nhật ký kiểm toán bất biến: Ghi nhận ai làm gì, lúc nào, trên bảng nào, dữ liệu trước và sau khi thay đổi (Before/After JSONB). | `user_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `user_id` (UUID FK), `action` (INSERT/UPDATE/DELETE), `table_name` (VARCHAR), `old_data` (JSONB), `new_data` (JSONB), `ip_address` (VARCHAR). |
| **`sys.event_outbox`** | Bảng lưu sự kiện giao dịch theo mô hình Transactional Outbox Pattern: Đảm bảo không mất mát thông điệp khi kết nối Celery/Kafka. | Độc lập không phụ thuộc DDL. | `id` (UUID PK), `event_type` (VARCHAR), `aggregate_type` (VARCHAR), `aggregate_id` (UUID), `payload` (JSONB), `status` (PENDING/PROCESSED/FAILED). |

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
11. **17 Modules Card giao diện:** Thời khóa biểu, Bảng điểm học bạ, Bài tập, Đề thi, Sổ đầu bài, Đánh giá GV ẩn danh, Báo hỏng thiết bị, Xếp hạng thi đua,...
12. **10 Tiêu chí thi đua:** Nề nếp đi học đúng giờ, đồng phục phù hiệu, vệ sinh lớp học, giờ học tốt điểm A, hoa điểm 10,...

---

## 🚀 Khởi chạy Nhanh với Docker & Kết nối pgAdmin 4

Thư mục đã được trang bị sẵn `docker-compose.yml` cùng cơ chế tự động thực thi các file SQL theo đúng thứ tự phụ thuộc, **100% không bị lỗi Foreign Key**.

### 1. Khởi động Container qua VS Code Tasks hoặc Terminal

* **Cách 1 (Khuyên dùng)**: Nhấn `Ctrl + Shift + P` -> **Tasks: Run Task** -> Chọn **`🗄️ Database: Start PostgreSQL & pgAdmin`**.
* **Cách 2 (Terminal)**:
  ```bash
  cd schoolpro-db
  docker compose up -d
  ```

### 2. Đăng nhập pgAdmin 4 Web

Mở trình duyệt truy cập: **`http://localhost:5050`**

- **Email đăng nhập:** `admin@schoolpro.edu.vn`
- **Mật khẩu:** `admin`

> 💡 **Tự động kết nối:** Nhờ file cấu hình `docker/pgadmin/servers.json` và `docker/pgadmin/pgpass`, server **"SchoolPro High School PostgreSQL"** đã được **kết nối sẵn tự động** trong danh sách server của pgAdmin! Bạn chỉ cần bấm vào là có thể xem ngay 6 schemas, các tables, views và triggers mà không cần cấu hình host/port thủ công.

### Thông số kết nối trực tiếp (Backend / DBeaver / TablePlus):
- **Host:** `localhost`
- **Port:** `5433` *(Đã map cổng 5433 để tránh xung đột với PostgreSQL cục bộ trên máy)*
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

### 4. Truy vấn Hồ sơ 360 Độ tổng hợp của một Học sinh
```sql
SELECT 
  student_code,
  student_name,
  class_name,
  homeroom_teacher_name,
  homeroom_teacher_phone,
  track_name,
  active_clubs_count,
  awards_count,
  unpaid_fee_bills_count
FROM core.v_student_360_profile
WHERE student_code = 'HS20261001';
```
