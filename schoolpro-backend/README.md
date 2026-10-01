# ⚡ SchoolPro Backend

Clean Architecture Modular Monolith backend for SchoolPro built with **Django 6.1**, **Django REST Framework**, **Celery**, and **PostgreSQL 16**.

---

## 🏗 Architecture Layers

```
schoolpro-backend/
├── apps/                         # Domain-driven Bounded Contexts
│   ├── core/                     # Identity, School, Tenant, User, Profile, Auth
│   ├── master/                   # Academic Years, Semesters, Subjects, Rooms, Grades
│   ├── academic/                 # Classes, Enrollments, Schedules, Timetables, Attendance
│   ├── evaluation/               # Assessments, Exams, Scores, Transcripts, GPA
│   ├── emulation/                # Discipline, Merits, Demerits, Violations, Ranking
│   ├── notification/             # Announcements, Messages, Push Notifications, Reminders
│   └── system/                   # Audit Logs, Configuration, Backup, System Health
│
├── common/                       # Enterprise Shared Kernel
│   ├── constants/                # System roles, status codes, and error constants
│   ├── exceptions/               # Custom enterprise DRF exception handler
│   ├── middleware/               # Request ID tracking, logging, security middleware
│   ├── models/                   # BaseModel, UUIDModel, SoftDeleteModel, AuditableModel
│   ├── pagination/               # Standard pagination with metadata wrappers
│   ├── permissions/              # Granular RBAC permissions
│   ├── repositories/             # Generic BaseRepository[T] data access pattern
│   ├── responses/                # Unified JSend/JSON API response structure
│   └── services/                 # Base business logic service layer
│
├── config/                       # Application Configuration
│   ├── settings/                 # Environment-specific settings (base, dev, prod, staging, test)
│   ├── urls.py                   # OpenAPI 3 docs, JWT endpoints, and domain routes
│   ├── wsgi.py & asgi.py         # Web server interfaces
│   └── celery.py                 # Distributed background job broker
│
├── requirements/                 # Pin-versioned dependencies
│   ├── base.txt                  # Core DRF, Celery, Channels, JWT, Postgres
│   ├── local.txt                 # Development & debugging tools (Ruff, IPython)
│   └── production.txt            # Production servers (Gunicorn, Uvicorn)
└── pyproject.toml                # Ruff linting & formatting standards
```

---

## 🛠 Local Setup

```bash
# 1. Create and activate virtual environment
python3.13 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements/local.txt

# 3. Environment configuration
cp .env.example .env

# 4. Run database migrations
python manage.py migrate

# 5. Start development server
python manage.py runserver 0.0.0.0:8000
```

---

## 🧪 Testing & Linting

```bash
# Check code style with Ruff
ruff check .
ruff format --check .

# Automatically apply Ruff fixes
ruff check --fix .
ruff format .

# Run Django system checks
python manage.py check

# Run test suite
DJANGO_ENV=testing pytest
```

---

## 📚 API Documentation

Once the server is running, navigate to:
- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)
- **OpenAPI Schema**: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)
- **Health Check**: [http://localhost:8000/api/health/](http://localhost:8000/api/health/)
