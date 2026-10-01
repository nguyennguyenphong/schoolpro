# 🎓 SchoolPro - Enterprise School Management Platform

SchoolPro is a modular monolith school management platform architected for high reliability, strict role-based access control (RBAC), and clean domain separation.

---

## 🏛 Architecture Overview

```
schoolpro/
├── .github/workflows/ci.yml    # Enterprise 4-stage GitHub Actions CI/CD Pipeline
├── .vscode/tasks.json          # Pre-configured One-Click VS Code Runner Tasks
├── docker-compose.yml          # Container orchestration (Postgres, pgAdmin, Redis, Backend, Frontend)
├── schoolpro-backend/          # Django 6.1 + DRF Clean Architecture Modular Monolith
│   ├── apps/                   # 7 Isolated Domain Apps (core, master, academic, evaluation, emulation, notification, system)
│   ├── common/                 # Enterprise Shared Kernel (models, responses, exceptions, permissions, repository, service)
│   ├── config/                 # Settings matrix (development, staging, production, testing) & API v1 routing
│   └── requirements/           # Pin-versioned Python dependencies
├── schoolpro-frontend/         # React 19 + TypeScript + Vite + Tailwind CSS + Ant Design
│   ├── src/modules/            # Feature-driven modular frontend
│   ├── nginx.conf              # Production Nginx reverse-proxy & SPA routing
│   └── Dockerfile              # Multi-stage production build
└── schoolpro-db/               # Database migrations, schemas & seed scripts (PostgreSQL 16)
    ├── sql/01_extensions/      # PostgreSQL extensions (uuid-ossp, citext, pg_trgm, unaccent)
    ├── sql/02_tables/          # 67 Normalized Database Tables
    └── docker/                 # pgAdmin automation & server profile definitions
```

---

## 🚀 Quick Start with VS Code Tasks

Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) -> Select **Tasks: Run Task**:

| Task Name | Description | Command Under the Hood |
| :--- | :--- | :--- |
| **`exe db`** | Starts PostgreSQL 16 & pgAdmin 4 with auto-mounted tables | `docker compose up -d postgres pgadmin` |
| **`exe backend`** | Activates `.venv` and boots Django development server | `python manage.py runserver 0.0.0.0:8000` |
| **`exe frontend`** | Starts Vite development server at `http://localhost:5173` | `npm run dev` |
| **`exe check`** | Runs full static analysis for backend (Ruff & Django) & frontend (Oxlint & TSC) | Automated multi-project validation |
| **`exe db:stop`** | Gracefully stops database containers | `docker compose stop postgres pgadmin` |
| **`exe db:reset`** | Clears persistent volumes & re-initializes all 67 tables | `docker compose down -v && docker compose up -d` |

---

## 🐳 Running Full Stack with Docker Compose

To boot the entire ecosystem in isolated containers:

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Build and run all services
docker compose up -d --build

# 3. Check running services
docker compose ps
```

### Access Endpoints:
- **Frontend SPA**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)
- **Healthcheck**: [http://localhost:8000/api/health/](http://localhost:8000/api/health/)
- **pgAdmin 4**: [http://localhost:5050](http://localhost:5050)
  - **Email**: `admin@schoolpro.edu.vn`
  - **Password**: `admin`
  - *PostgreSQL server is pre-configured and auto-mounted in pgAdmin.*

---

## 🔒 Security & Code Quality Standards

- **Backend**:
  - **Ruff**: Modern Python linter and formatter enforcing PEP 8 and PEP 695 typing.
  - **Django Security**: Hardened session cookies, CSRF protection, and `django-axes` brute-force login prevention.
  - **Repository Pattern**: Strict decoupling of ORM queries from business logic.
- **Frontend**:
  - **Oxlint**: High-performance JavaScript/TypeScript linter.
  - **TypeScript Strict Mode**: Fully typed React 19 components and state management with Zustand.
- **CI/CD Pipeline**:
  - GitHub Actions runs 4 automated parallel workflows on every push and pull-request (`frontend-ci`, `backend-ci`, `database-ci`, `docker-ci`).

---

## 📄 License
Internal proprietary license - SchoolPro Development Team.
