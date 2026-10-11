# KIẾN TRÚC THƯ MỤC CHUẨN ENTERPRISE - SCHOOLPRO BACKEND

> **Phiên bản:** 2.0 (Cập nhật đồng bộ 100% với 67 bảng CSDL trong `schoolpro-db/sql/02_tables`)  
> **Mô hình kiến trúc:** **Domain-Driven Modular Monolith** kết hợp **Clean / Layered Architecture**.  
> **Công nghệ chính:** Python 3.13, Django 6.1, Django REST Framework, SimpleJWT, Celery, Redis, Channels, PostgreSQL.

---

## 1. CÂY THƯ MỤC TỔNG THỂ

```text
schoolpro-backend/
│
├── config/                          # Cấu hình dự án Django toàn cục
│   ├── settings/                    # Đa môi trường (Multi-environment Settings)
│   │   ├── __init__.py              # Tự động nạp cấu hình theo biến môi trường DJANGO_ENV
│   │   ├── base.py                  # Cấu hình gốc (Installed Apps, Middleware, DRF, JWT, Swagger)
│   │   ├── development.py           # Môi trường Local Development (Debug=True, CORS all, SQLite/Local Postgres)
│   │   ├── staging.py               # Môi trường Kiểm thử Staging
│   │   ├── production.py            # Môi trường Production (Bảo mật cao, SSL, Sentry, Redis Cache)
│   │   └── testing.py               # Môi trường chạy Unit/Integration Test (In-memory DB, Fast Hasher)
│   ├── asgi.py                      # Cấu hình ASGI (Hỗ trợ WebSockets qua Django Channels + HTTP)
│   ├── wsgi.py                      # Cấu hình WSGI (Chạy với Gunicorn cho HTTP APIs)
│   ├── celery.py                    # Khởi tạo Celery Application & Beat Schedulers
│   └── urls.py                      # Master URL Router (Định tuyến API v1, Swagger UI, ReDoc, Healthcheck)
│
├── apps/                            # 7 DOMAIN APPS (Phản ánh chính xác 7 Schemas trong CSDL)
│   ├── core/                        # [Domain 1] Tổ chức cốt lõi, Định danh & Phân quyền (Schema: core_)
│   ├── master/                      # [Domain 2] Dữ liệu tham chiếu & Danh mục toàn trường (Schema: master_)
│   ├── academic/                    # [Domain 3] Học vụ, Thời khóa biểu, Điểm, Thi cử, Học phí (Schema: academic_)
│   ├── emulation/                   # [Domain 4] Thi đua, Nề nếp, Kỷ luật, Trực ban cờ đỏ (Schema: emulation_)
│   ├── evaluation/                  # [Domain 5] Khảo sát, Đánh giá chất lượng & Cơ sở vật chất (Schema: evaluation_)
│   ├── notification/                # [Domain 6] Thông báo, Sổ liên lạc, Push FCM, Trao đổi (Schema: notification_)
│   └── system/                      # [Domain 7] Quản trị hệ thống, Audit Logs & Outbox Event (Schema: sys_)
│
├── common/                          # SHARED KERNEL (Thành phần dùng chung cho tất cả các apps)
│   ├── models/                      # BaseModel (UUID, TimeStamped, SoftDelete, Auditable)
│   ├── responses/                   # Chuẩn hóa định dạng Response API ({success, code, data, meta})
│   ├── exceptions/                  # Global Exception Handler cho DRF, Custom Business Exceptions
│   ├── permissions/                 # Hệ thống Dynamic RBAC Permissions, IsAdmin, IsTeacher, IsStudent...
│   ├── pagination/                  # Phân trang chuẩn (StandardPagination, CursorPagination)
│   ├── middleware/                  # RequestIDMiddleware, AuditLogMiddleware, SecurityHeadersMiddleware
│   ├── repositories/                # BaseRepository (Generic CRUD, Bulk Operations, Query Optimizers)
│   ├── services/                    # BaseService (Transaction Decorators, Event Emitters)
│   ├── constants/                   # ErrorCodes, RoleEnums, StatusEnums, CacheKeys, QueueNames
│   ├── filters/                     # BaseFilterSet cho django-filter
│   ├── utils/                       # Xử lý Excel (openpyxl), PDF, Datetime, String tiếng Việt, Hash
│   └── validators/                  # Kiểm tra định dạng SĐT, CCCD, Email, Kích thước file
│
├── tests/                           # E2E & Integration Tests đa module
│   ├── conftest.py                  # Pytest fixtures dùng chung
│   ├── e2e/                         # Luồng nghiệp vụ toàn trình (Đăng ký -> Nhập học -> Chấm điểm...)
│   └── performance/                 # Kịch bản kiểm thử tải với Locust
│
├── scripts/                         # Script vận hành, DevOps & Quản trị
│   ├── entrypoint.sh                # Script khởi động Docker container (wait db, migrate, start)
│   ├── seed_data.py                 # Nạp dữ liệu mẫu ban đầu (Master data, Admin account)
│   └── wait_for_db.py               # Kiểm tra kết nối cơ sở dữ liệu trước khi start app
│
├── docs/                            # Tài liệu kỹ thuật dự án
│   ├── architecture.md              # Chi tiết kiến trúc Clean Architecture & Domain Design
│   ├── api_guidelines.md            # Quy chuẩn thiết kế RESTful API
│   └── database_diagram.md          # Sơ đồ quan hệ thực thể (ERD)
│
├── requirements/                    # Quản lý thư viện phụ thuộc theo môi trường
│   ├── base.txt                     # Thư viện dùng chung (Django, DRF, Celery, Redis...)
│   ├── development.txt              # Thư viện debug (django-debug-toolbar, ruff, ipython)
│   ├── testing.txt                  # Thư viện test (pytest, pytest-django, factory-boy)
│   └── production.txt               # Thư viện prod (gunicorn, sentry-sdk, psycopg2)
│
├── .env.example                     # Mẫu biến môi trường
├── pyproject.toml                   # Cấu hình ruff linter, mypy type checker, pytest
├── manage.py                        # Django Management CLI
└── docker-compose.yml               # Môi trường chạy Docker (PostgreSQL, Redis, Celery, Backend)
```

---

## 2. BẢNG MAPPING CHI TIẾT: DATABASE SCHEMAS & DJANGO APPS

Toàn bộ **67 bảng CSDL** tại `schoolpro-db/sql/02_tables` được phân bổ chính xác vào 7 Domain Apps, giải quyết triệt để vấn đề phụ thuộc vòng (Circular Dependencies) và vi phạm Single Responsibility:

### 2.1. App `apps/core` (19 Tables - Schema `core_`)
*Trọng tâm: Định danh người dùng, vai trò phân quyền (RBAC), hồ sơ người dùng, phân lớp, phân công giảng dạy, Câu lạc bộ.*
- **Người dùng & Phân quyền:** `core_users`, `core_roles`, `core_permissions`, `core_user_roles`, `core_role_permissions`.
- **Hồ sơ nhân sự & Học sinh:** `core_students`, `core_teachers`, `core_guardians`, `core_staff`, `core_student_health_records`.
- **Tổ chức lớp học & Phân công:** `core_classes`, `core_class_groups`, `core_student_class_enrollments`, `core_class_subject_teachers`, `core_position_assignments`.
- **Hoạt động & Mở rộng:** `core_clubs`, `core_club_members`, `core_custom_field_definitions`, `core_custom_field_values`.

### 2.2. App `apps/master` (15 Tables - Schema `master_`)
*Trọng tâm: Danh mục tham chiếu dùng chung toàn trường.*
- **Trường học & Thời gian:** `master_schools`, `master_academic_years`, `master_semesters`, `master_periods`.
- **Cơ cấu tổ chức & Cơ sở vật chất:** `master_grades`, `master_departments`, `master_positions`, `master_rooms`.
- **Môn học & Tiêu chí:** `master_subjects`, `master_score_types`, `master_emulation_criteria`.
- **Bảng mã tra cứu & Tham số:** `master_lookup_types`, `master_lookup_values`, `master_modules`, `master_settings_definitions`.

### 2.3. App `apps/academic` (17 Tables - Schema `academic_`)
*Trọng tâm: Nghiệp vụ học vụ, thời khóa biểu, điểm số, kỳ thi, chuyên cần, học liệu, học phí.*
- **Thời khóa biểu:** `academic_timetables`, `academic_timetable_changes`.
- **Điểm danh & Chuyên cần:** `academic_attendances`, `academic_attendance_sessions`, `academic_attendance_leaves`, `academic_attendance_summaries`.
- **Phân ban & Điểm số:** `academic_class_subject_enrollments`, `academic_student_track_enrollments`, `academic_subject_exemptions`, `academic_student_scores`, `academic_grade_weight_configs`, `academic_student_term_summaries`.
- **Kỳ thi tập trung:** `academic_exams`, `academic_exam_classes`, `academic_exam_schedules`, `academic_exam_supervisors`, `academic_exam_results`.
- **Học tập & Giáo án:** `academic_homework_assignments`, `academic_homework_submissions`, `academic_materials`, `academic_lesson_plans`.
- **Học phí & Học bạ:** `academic_fee_items`, `academic_student_fee_bills`, `academic_report_cards`.

### 2.4. App `apps/emulation` (7 Tables - Schema `emulation_`)
*Trọng tâm: Quản lý phong trào thi đua, chấm điểm nề nếp, kỷ luật, xếp hạng.*
- `emulation_periods`, `emulation_class_custom_criteria`, `emulation_records`, `emulation_disciplinary_records`, `emulation_supervisor_duty_logs`, `emulation_rankings`, `emulation_awards`.

### 2.5. App `apps/evaluation` (6 Tables - Schema `evaluation_`)
*Trọng tâm: Khảo sát, đánh giá chất lượng dạy và học, phản ánh cơ sở vật chất.*
- `evaluation_forms`, `evaluation_questions`, `evaluation_answers`, `evaluation_submissions`, `evaluation_facilities`, `evaluation_facility_incident_reports`.

### 2.6. App `apps/notification` (6 Tables - Schema `notification_`)
*Trọng tâm: Thông tin liên lạc giữa nhà trường và gia đình.*
- `notification_announcements`, `notification_announcement_reads`, `notification_contact_book_notes`, `notification_parent_teacher_messages`, `notification_push_tokens`, `notification_reminders`.

### 2.7. App `apps/system` (7 Tables - Schema `sys_`)
*Trọng tâm: Cấu hình hệ thống, Audit Logs & Outbox Transactional Events.*
- `sys_system_settings`, `sys_audit_logs`, `sys_event_outbox`, `sys_role_modules`, `sys_role_settings_defaults`, `sys_user_module_preferences`, `sys_user_settings`.

---

## 3. CẤU TRÚC PHÂN TẦNG NỘI BỘ MỖI APP (CLEAN ARCHITECTURE)

Mỗi app trong `apps/` được tổ chức đồng nhất theo 4 tầng trách nhiệm rõ ràng:

```text
apps/<domain_name>/
├── __init__.py
├── apps.py                          # Định danh AppConfig, app label
├── admin.py                         # Cấu hình Django Admin tùy biến
├── urls.py                          # Định tuyến API endpoint riêng của module
│
├── models/                          # [Domain Layer] Mỗi Model là 1 file riêng, kế thừa BaseModel
│   ├── __init__.py                  # Export tất cả models để Django nhận diện migrations
│   ├── entity_a.py
│   └── entity_b.py
│
├── repositories/                    # [Data Access Layer] Tối ưu hóa câu truy vấn database
│   ├── __init__.py
│   ├── base.py
│   └── entity_repository.py         # Chứa select_related, prefetch_related, caching queries
│
├── services/                        # [Business Logic Layer] Xử lý nghiệp vụ thuần túy
│   ├── __init__.py
│   ├── entity_service.py            # Chứa các transaction, tính toán điểm số, xếp loại, validation
│   └── command_handlers.py
│
├── serializers/                     # [Interface Adapters] Định dạng Request / Response DTOs
│   ├── __init__.py
│   ├── request_serializers.py       # Validate payload từ client
│   └── response_serializers.py      # Serialize dữ liệu trả về cho client
│
├── views/                           # [Presentation Layer] REST API Controllers
│   ├── __init__.py
│   └── viewsets.py                  # Kế thừa ModelViewSet / GenericAPIView, gọi sang Services
│
├── filters/                         # [Query Filters] Bộ lọc tìm kiếm django-filter
│   ├── __init__.py
│   └── entity_filter.py
│
├── permissions/                     # [Security Layer] Quyền hạn đặc thù của App
│   ├── __init__.py
│   └── entity_permission.py
│
├── tasks/                           # [Background Jobs] Celery Asynchronous Tasks
│   ├── __init__.py
│   └── async_tasks.py               # Gửi email, tính điểm hàng loạt, bắn push notification
│
├── signals/                         # [Domain Events] Bắt sự kiện tạo/sửa bản ghi
│   ├── __init__.py
│   └── handlers.py
│
└── tests/                           # [Test Layer] Kiểm thử tự động cho app
    ├── __init__.py
    ├── test_models.py
    ├── test_services.py
    └── test_views.py
```

---

## 4. QUY CHUẨN API & SHARED KERNEL (`common/`)

### 4.1. Chuẩn hóa Định dạng Phản hồi (Standard Response)
Tất cả các API đều trả về cấu trúc thống nhất qua `APIResponse`:

**Thành công (200 / 201):**
```json
{
  "success": true,
  "code": 200,
  "message": "Thành công",
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 142,
      "total_pages": 8
    }
  }
}
```

**Thất bại (400 / 401 / 403 / 404 / 500):**
```json
{
  "success": false,
  "code": 400,
  "error_code": "STUDENT_NOT_ELIGIBLE_FOR_EXAM",
  "message": "Học sinh không đủ điều kiện dự thi do vượt quá số buổi nghỉ phép.",
  "errors": [
    { "field": "unexcused_absences", "detail": "Số buổi không phép hiện tại là 5 (vượt quá 4 buổi)" }
  ]
}
```

### 4.2. Base Model Chuẩn Enterprise
Mọi model đều kế thừa từ `BaseModel` trong `common.models.base`:
- `id`: Khóa chính kiểu `UUIDv4` an toàn, chống duyệt tuần tự (Enumeration Attacks).
- `created_at`, `updated_at`: Tự động đánh index và cập nhật thời gian theo múi giờ `Asia/Ho_Chi_Minh`.
- `is_deleted`, `deleted_at`: Cơ chế **Soft Delete** an toàn với `SoftDeleteManager`.
- `created_by_id`, `updated_by_id`: Lưu trữ định danh người thực hiện thao tác phục vụ kiểm toán (Audit Trail).

---

## 5. NGUYÊN TẮC PHÁT TRIỂN & BẢO TRÌ (MAINTENANCE GUIDELINES)

1. **Không viết Business Logic vào Views hoặc Models:**
   - `views/` chỉ đóng vai trò phân tích request, kiểm tra quyền, và gọi vào `services/`.
   - `services/` đảm nhận toàn bộ tính toán, kiểm tra nghiệp vụ và quản lý `@transaction.atomic`.
   - `repositories/` xử lý các câu truy vấn phức tạp, tránh triệt để lỗi N+1 Query.
2. **Quản lý Foreign Key liên App:**
   - Tránh import trực tiếp Class Model từ app khác nếu không cần thiết; ưu tiên dùng string reference (ví dụ: `"core.Student"` thay vì `from apps.core.models import Student`).
3. **Mỗi Table SQL tương ứng với 1 File Model riêng biệt:**
   - Đặt trong thư mục `models/` của từng app và export qua `__init__.py` để codebase luôn ngăn nắp, dễ đọc và dễ phân công nhóm làm việc.
4. **Tất cả các tác vụ nặng phải đưa vào Celery Task:**
   - Gửi Email/SMS/Push Notification, xuất bảng điểm Excel hàng ngàn học sinh, tính toán xếp hạng thi đua tuần đều phải chạy bất đồng bộ qua `tasks/`.
