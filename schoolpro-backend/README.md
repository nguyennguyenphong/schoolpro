# ⚡ SchoolPro Backend - Enterprise Modular Monolith API

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-6.1.1-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.18.1-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Celery](https://img.shields.io/badge/Celery-5.6.3-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0%20(Swagger%2FReDoc)-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![Code Style: Ruff](https://img.shields.io/badge/Code%20Style-Ruff-black?style=for-the-badge&logo=ruff&logoColor=white)](https://docs.astral.sh/ruff/)

An enterprise-grade, high-performance **Clean Architecture Modular Monolith backend** powering the SchoolPro High School Management Platform. Developed with **Python 3.13**, **Django 6.1**, **Django REST Framework (DRF)**, **Celery**, and **PostgreSQL 16**, the system strictly enforces Domain-Driven Design (DDD), 4-tier layer isolation, granular Role-Based Access Control (RBAC), and 100% compliance with Vietnam's **Circular 22/2021/TT-BGDĐT** and the **2018 General Education Curriculum**.

---

## 📑 Table of Contents

1. [Architecture Philosophy](#-architecture-philosophy)
2. [Project Layout](#-project-layout)
3. [The 4-Layer Clean Architecture](#-the-4-layer-clean-architecture)
4. [Domain Modules (7 Bounded Contexts)](#-domain-modules-7-bounded-contexts)
5. [Enterprise Shared Kernel (`common`)](#-enterprise-shared-kernel-common)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
7. [Environment Configuration Matrix](#-environment-configuration-matrix)
8. [Database Migration & Seeding](#-database-migration--seeding)
9. [Running Background Workers (Celery & Redis)](#-running-background-workers-celery--redis)
10. [API Documentation & Health Endpoints](#-api-documentation--health-endpoints)
11. [Code Quality, Linting & Testing](#-code-quality-linting--testing)
12. [Docker Deployment](#-docker-deployment)

---

## 🏗 Architecture Philosophy

SchoolPro Backend rejects the pitfalls of monolithic spaghetti code while bypassing the premature operational complexity of microservices. It adopts a **Domain-Driven Modular Monolith** structured around clean layered boundaries:

- **Strict Domain Encapsulation**: 7 independent apps directly map to database schemas (`core_`, `master_`, `academic_`, `emulation_`, `evaluation_`, `notification_`, `sys_`), preventing circular module dependencies.
- **Decoupled Data Access**: Business services never query models directly; all database operations pass through typed `BaseRepository[T]` interfaces with eager loading (`select_related`, `prefetch_related`) to eliminate $N+1$ queries.
- **Predictable API Contracts**: Unified JSend-compliant responses with standardized envelope schemas (`success`, `code`, `data`, `meta`).
- **Resilient Background Execution**: Long-running workflows (bulk grade imports, report card PDF generation, push notifications) are executed asynchronously via Celery workers backed by Redis.
- **Transactional Event Outbox**: Critical domain events are reliably queued in PostgreSQL before dispatch to message brokers.

---

## 📁 Project Layout

```text
schoolpro-backend/
├── config/                          # Global Django project orchestration
│   ├── settings/                    # Environment-specific settings
│   │   ├── __init__.py              # Dynamic loader via DJANGO_ENV
│   │   ├── base.py                  # Core installed apps, DRF, JWT, and middleware
│   │   ├── development.py           # Local dev settings (CORS, debug toolbar, logging)
│   │   ├── staging.py               # Staging verification configuration
│   │   ├── production.py            # Hardened production (SSL, secure cookies, Sentry)
│   │   └── testing.py               # Optimized in-memory test configuration
│   ├── asgi.py                      # ASGI interface (WebSocket via Django Channels)
│   ├── wsgi.py                      # WSGI HTTP entrypoint for Gunicorn
│   ├── celery.py                    # Celery application & beat scheduler setup
│   └── urls.py                      # Master router (API v1, OpenAPI docs, healthcheck)
│
├── apps/                            # 7 Domain Bounded Contexts
│   ├── core/                        # Identity, Auth, RBAC, Profiles, Classes, Clubs
│   ├── master/                      # Institutional Calendars, Grades, Rooms, Lookups
│   ├── academic/                    # Timetables, Attendance, MoET 2018, Exams, TT22 Grades
│   ├── emulation/                   # Emulation Cycles, Red Star Patrols, Class Rankings
│   ├── evaluation/                  # Anonymous Teacher Reviews, Facility Reports
│   ├── notification/                # Multichannel Notices, Contact Book, Push Tokens
│   └── system/                      # Dynamic Dashboard Cards, Audit Logs, Event Outbox
│
├── common/                          # Enterprise Shared Kernel
│   ├── models/                      # BaseModel, UUIDModel, SoftDeleteModel, AuditableModel
│   ├── repositories/                # Generic BaseRepository[T] data access pattern
│   ├── services/                    # BaseService with transaction and event decorators
│   ├── responses/                   # Standardized JSend envelope formatters
│   ├── exceptions/                  # Global DRF Exception Handler & Business Exceptions
│   ├── permissions/                 # Granular Dynamic RBAC permission classes
│   ├── pagination/                  # Standard & Cursor Pagination with metadata
│   ├── middleware/                  # Request ID, Audit Log, and Security Headers
│   ├── constants/                   # Roles, Status, Error Codes, and Queue Names
│   ├── utils/                       # Excel handlers, PDF generation, Vietnamese slugify
│   └── validators/                  # National ID (CCCD), Phone, and File validators
│
├── requirements/                    # Pinned dependency requirements
│   ├── base.txt                     # Core dependencies (Django, DRF, Celery, psycopg)
│   ├── local.txt                    # Development & debugging (Ruff, IPython)
│   └── production.txt               # Production webserver (Gunicorn, Uvicorn, Sentry)
│
├── scripts/                         # DevOps, migration, and management utilities
│   ├── entrypoint.sh                # Container entrypoint script
│   ├── seed_data.py                 # Initial data seeder
│   └── wait_for_db.py               # Database readiness prober
│
├── manage.py                        # Django CLI entrypoint
├── Dockerfile                       # Multi-stage production container build
├── pyproject.toml                   # Ruff linter/formatter configuration
├── pytest.ini                       # Pytest test runner configuration
├── AGENT.md                         # Coding & AI agent operational guidelines
└── STRUCTURE.md                     # Deep architectural specifications
```

---

## 🏛 The 4-Layer Clean Architecture

Each domain app within `apps/<domain>/` strictly implements a 4-layer architecture:

```text
apps/<domain>/
├── models/                          # [Layer 1: Domain Entities]
│   └── *.py                         # Subclassed from common.models.BaseModel
├── serializers/                     # [Layer 2: Data Transfer Objects]
│   └── *.py                         # Strict DRF input/output serialization
├── repositories/                    # [Layer 3: Data Access Layer]
│   └── *.py                         # BaseRepository[T] implementations with query optimization
├── services/                        # [Layer 4: Business Logic Layer]
│   └── *.py                         # Pure domain logic wrapped in DB transactions
├── views.py                         # [Interface Layer: DRF ViewSets]
├── permissions.py                   # [Interface Layer: RBAC Authorization rules]
├── filters.py                       # [Interface Layer: DjangoFilterSet query filters]
├── urls.py                          # [Interface Layer: Module routing]
├── tasks.py                         # [Async Layer: Celery async jobs]
├── admin.py                         # Django Admin registration
└── tests/                           # Unit & integration test suites
```

---

## 📦 Domain Modules (7 Bounded Contexts)

### 1. `apps/core` (Identity & Core Governance)
- **Authentication & RBAC**: JWT token management, permissions matrix (`core_roles`, `core_permissions`, `core_role_permissions`).
- **User Profiles**: Segregated polymorphic profiles (`core_students`, `core_teachers`, `core_guardians`, `core_staff`).
- **Structural Hierarchies**: Classes, classroom subgroups (Groups 1-4), student enrollments, and teaching assignments.
- **Temporal Leadership**: `core_position_assignments` tracking student and faculty positions across academic years.
- **Extracurricular Activities**: Clubs and student club membership rosters.
- **Dynamic Extensibility**: EAV Custom Field Definitions and Values for zero-migration attributes.

### 2. `apps/master` (Master Reference & Catalogs)
- **Institutional Profile**: School accreditation and legal information (`master_schools`).
- **Academic Calendar**: Academic years, semesters, and terms.
- **Physical Campus**: Classrooms, science labs, computer rooms, and multi-purpose halls.
- **Curriculum Fundamentals**: Subject definitions, 10-period bell schedules, and Circular 22 assessment types.
- **Dynamic Lookups**: Dynamic categorization engine (`lookup_types`, `lookup_values`).

### 3. `apps/academic` (Academic Operations & Assessment)
- **Timetables**: 10-period schedule grid with support for swaps, teacher substitutions, and cancelations.
- **Attendance**: Daily session-based attendance tracking (Present, Excused Absence, Unexcused, Late).
- **MoET 2018 Tracks**: Elective track combinations (Natural Sciences, Social Sciences, Arts).
- **Examinations Engine**: Question bank categorized by Bloom/MoET cognitive levels, online exam generation, auto-graded submissions.
- **Circular 22 (TT22) Gradebook**: Regular oral tests, 15-minute quizzes, midterm, and final assessments with automated weighted average calculation.
- **Official Transcripts**: Term report cards, academic ranks, conduct grading, and subject exemptions (IELTS waivers).
- **Tuition & Fees**: Fee items, student bills, and payment status ledgers.

### 4. `apps/emulation` (Emulation, Discipline & Conduct)
- **Evaluation Cycles**: Weekly, monthly, and campaign-based emulation periods.
- **Dual Criteria Engine**: School-wide criteria + class-specific internal rules.
- **Supervision**: Daily supervisor duty logs and Red Star inspector reports.
- **Leaderboards**: Automated weekly and monthly class ranking calculations.
- **Student Conduct**: Formal disciplinary hearing records and academic/extracurricular awards.

### 5. `apps/evaluation` (Quality Assurance & Facility Auditing)
- **Anonymous Teacher Feedback**: Term-end student evaluation surveys featuring cryptographic hash anonymization.
- **Classroom Facilities**: Physical asset registry per room.
- **Incident Tickets**: Classroom equipment breakdown reporting with real-time maintenance dispatch tracking.

### 6. `apps/notification` (Communication & Electronic Contact Book)
- **Multichannel Announcements**: Targeted school/grade/class broadcasts with read-receipt tracking.
- **Electronic Contact Book**: Digital contact digest aggregating grades, attendance, and homeroom remarks for parents.
- **Direct Messaging**: Private 1-on-1 parent-teacher communications.
- **Mobile Push Notifications**: Firebase Cloud Messaging (FCM) & Apple Push Notification Service (APNs) device tokens.
- **Personal Reminders**: Automated academic and deadline alerts.

### 7. `apps/system` (Infrastructure & Audit Trails)
- **Dynamic Dashboard Cards**: Role-based widget catalog and individual user drag-and-drop preferences.
- **4-Tier Cascading Settings**: Automatic fallback across User $\rightarrow$ Role $\rightarrow$ School $\rightarrow$ System levels.
- **Immutable Audit Logs**: Comprehensive historical diffs (Before/After JSONB) capturing IP and user mutation events.
- **Transactional Event Outbox**: At-least-once message delivery pattern for asynchronous worker dispatch.

---

## 🛡️ Enterprise Shared Kernel (`common`)

Located in `common/`, the Shared Kernel enforces consistency across all domain apps:

- **`BaseModel`**: Abstract base model providing UUIDv4 primary keys, `created_at`, `updated_at`, `is_deleted` (soft delete support), and `created_by` / `updated_by` audit hooks.
- **`BaseRepository[T]`**: Generic data access pattern encapsulating ORM queries:
  ```python
  class StudentRepository(BaseRepository[Student]):
      def get_active_students_by_class(self, class_id: UUID) -> QuerySet[Student]:
          return self.get_queryset().filter(class_id=class_id, is_deleted=False).select_related("user")
  ```
- **Standardized API Responses**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Student profile retrieved successfully",
    "data": { ... },
    "meta": {
      "pagination": {
        "page": 1,
        "page_size": 20,
        "total_items": 1250,
        "total_pages": 63
      }
    }
  }
  ```
- **Global DRF Exception Handler**: Translates all Python exceptions, validation errors, and Django database integrity exceptions into uniform error payloads.

---

## 🛠 Getting Started & Local Setup

### Prerequisites
- **Python**: 3.13 or newer
- **PostgreSQL**: 16+ (Running natively or via `schoolpro-db` container on port `5433`)
- **Redis**: 7+ (Running natively or via Docker on port `6379`)

### 1. Clone & Set Up Virtual Environment

```bash
cd schoolpro-backend

# Create virtual environment with Python 3.13
python3.13 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate
```

### 2. Install Dependencies

```bash
# Install development and testing dependencies
pip install --upgrade pip
pip install -r requirements/local.txt
```

### 3. Configure Environment Variables

```bash
# Copy example environment configuration
cp .env.local.example .env
```

Ensure your `.env` contains the correct database credentials:
```env
DJANGO_ENV=development
DEBUG=True
SECRET_KEY=django-insecure-schoolpro-dev-key-change-in-production
DATABASE_URL=postgres://postgres:password123@localhost:5433/schoolpro
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🗄 Database Migration & Seeding

```bash
# Verify connection to PostgreSQL
python manage.py check

# Run Django database migrations
python manage.py migrate

# Seed foundational master data, admin accounts, and demonstration school
python manage.py db_seed
```

---

## ⚡ Running Background Workers (Celery & Redis)

In separate terminal sessions (with `.venv` activated):

```bash
# 1. Start Celery worker
celery -A config worker --loglevel=info

# 2. Start Celery Beat periodic scheduler (optional)
celery -A config beat --loglevel=info
```

---

## 🚀 Starting the Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 📚 API Documentation & Health Endpoints

Once the backend is booted, access interactive OpenAPI 3 documentation:

| Interface | URL | Description |
| :--- | :--- | :--- |
| **Swagger UI** | [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) | Interactive API explorer & testing sandbox |
| **ReDoc** | [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/) | Modern, clean three-panel API documentation |
| **OpenAPI Schema** | [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/) | Raw OpenAPI 3.0 YAML/JSON specification |
| **System Health Check** | [http://localhost:8000/api/health/](http://localhost:8000/api/health/) | Database, cache, and service availability probe |
| **Django Admin** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Administrative management dashboard |

---

## 🧪 Code Quality, Linting & Testing

The project enforces strict code formatting, linting, and automated testing via **Ruff** and **Pytest**:

```bash
# 1. Run Ruff lint check
ruff check .

# 2. Automatically fix autofixable lint errors
ruff check --fix .

# 3. Check code formatting
ruff format --check .

# 4. Auto-format all code to PEP 8 standards
ruff format .

# 5. Run Django system checks
python manage.py check

# 6. Execute automated test suite
DJANGO_ENV=testing pytest -v
```

---

## 🐳 Docker Deployment

The backend provides a production-hardened `Dockerfile` with multi-stage builds and non-root execution:

```bash
# Build the backend container image
docker build -t schoolpro-backend:latest .

# Run container with environment configuration
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name schoolpro-backend \
  schoolpro-backend:latest
```

When operating inside the root `docker-compose.yml`, the backend automatically orchestrates alongside PostgreSQL, Redis, Celery, and the React frontend.

---

## 📄 License

SchoolPro Backend is proprietary software developed by the SchoolPro Engineering Team. All rights reserved.
