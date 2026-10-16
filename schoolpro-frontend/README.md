# 🎨 SchoolPro Frontend - High-Performance Enterprise React 19 Portal

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-6.6.3-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)](https://ant.design/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.15-443e38?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![i18next](https://img.shields.io/badge/i18n-5%20Languages-26A69A?style=for-the-badge&logo=i18next&logoColor=white)](https://www.i18next.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-orange?style=for-the-badge)](https://oxc.rs/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)

An enterprise-grade, blazing-fast **Single Page Application (SPA)** powering the SchoolPro High School Management Platform. Built on the cutting-edge **React 19**, **TypeScript**, and **Vite 8** ecosystem, styled with **Tailwind CSS v4** and **Ant Design 6**, and powered by **Zustand** state management. The frontend delivers a responsive, accessible, and localization-ready user experience for Students, Teachers, Parents, and Administrators.

---

## 📑 Table of Contents

1. [Key Features & Highlights](#-key-features--highlights)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Project Layout](#-architecture--project-layout)
4. [Functional Modules](#-functional-modules)
   - [4.1. Student Portal Modules](#41-student-portal-modules)
   - [4.2. Authentication & Security Flows](#42-authentication--security-flows)
   - [4.3. Administrative & Staff Modules](#43-administrative--staff-modules)
5. [Internationalization (i18n)](#-internationalization-i18n)
6. [State Management & Data Layer](#-state-management--data-layer)
7. [Design System & UI Components](#-design-system--ui-components)
8. [Local Development & Setup](#-local-development--setup)
9. [Code Quality, Linting & Testing](#-code-quality-linting--testing)
10. [Production Build & Docker Deployment](#-production-build--docker-deployment)

---

## 🌟 Key Features & Highlights

- **Next-Gen React 19 Architecture**: Leverages React 19 concurrent rendering, transitions, and modern hooks for zero-lag UI response times.
- **Strict TypeScript & Path Aliasing**: 100% typed code with complete alias mapping (`@/...`) for maintainable, refactor-safe development.
- **Feature-Driven Modular Architecture**: Logic, components, custom hooks, services, and types are co-located within discrete domain feature folders (`src/modules/*`).
- **Circular 22 & MoET 2018 Compliant**: Native visual components for Circular 22 gradebooks, weighted average calculations, conduct rankings, and 10-period timetable grids.
- **Multi-Language Support (5 Locales)**: Seamless runtime switching between Vietnamese (`vi` - default), English (`en`), Japanese (`ja`), Korean (`ko`), and Chinese (`zh`).
- **Interactive Visualizations**: High-performance charts powered by **Apache ECharts** for academic grade trends, attendance statistics, and emulation rankings.
- **In-Browser Document & PDF Viewer**: Integrated **React PDF Viewer** with page navigation, zoom, and text search for viewing syllabi and lecture slides.
- **Online Examination Suite**: Full-featured exam runner with multiple-choice questions, countdown timer, auto-submission triggers, and immediate score breakdowns.

---

## 🛠 Technology Stack

| Category | Library / Framework | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [React](https://react.dev/) | `^19.2.8` | UI component library with concurrent features |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `~6.0.2` | Static typing, interfaces, and compile-time safety |
| **Build Tooling** | [Vite](https://vitejs.dev/) | `^8.2.2` | Next-generation fast bundler with instant HMR |
| **Component UI** | [Ant Design](https://ant.design/) | `^6.6.3` | Enterprise design system and accessible primitives |
| **Utility Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.3` | Modern CSS-first utility-class framework |
| **Icons** | [Lucide React](https://lucide.dev/) | `^1.43.0` | Crisp, accessible SVG icons |
| **State Management**| [Zustand](https://github.com/pmndrs/zustand) | `^5.0.15` | Minimalist, unopinionated client state store |
| **Routing** | [React Router](https://reactrouter.com/) | `^7.18.3` | Declarative, nested, and protected client-side routing |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.20.0` | Type-safe REST client with request/response interceptors |
| **Data Visualization**| [Apache ECharts](https://echarts.apache.org/) | `^6.1.0` | Interactive charts for academic trends and KPIs |
| **PDF Viewer** | [@react-pdf-viewer/core](https://react-pdf-viewer.dev/) | `^3.12.0` | Native in-app rendering for lecture slides and documents |
| **Date & Time** | [Day.js](https://day.js.org/) | `^1.11.23` | Lightweight, immutable date and time utility |
| **Internationalization**| [i18next](https://www.i18next.com/) | `^26.4.2` | Multi-language translation engine with browser language detection |
| **Linter** | [Oxlint](https://oxc.rs/) | `^1.79.0` | Ultra-fast Rust-based JavaScript/TypeScript linter |
| **Test Runner** | [Vitest](https://vitest.dev/) | `^4.1.11` | Vite-native unit and component test framework |

---

## 📁 Architecture & Project Layout

The repository follows a clean, feature-driven structure:

```text
schoolpro-frontend/
├── public/                          # Static public assets (favicons, logos)
├── src/
│   ├── app/                         # Global providers, router configuration, store registries
│   ├── assets/                      # Application images, SVGs, and brand styling
│   ├── components/                  # Shared atomic UI components (Custom AntD wrappers, loaders)
│   ├── hooks/                       # Reusable hooks (useAuth, useResponsive, useDebounce)
│   ├── i18n/                        # Multi-language configuration and component-scoped translations
│   │   ├── locales/                 # Translation JSONs: vi, en, ja, ko, zh
│   │   └── index.ts                 # i18next initialization and language detector setup
│   ├── layouts/                     # Master layout templates
│   │   ├── MainLayout.tsx           # Authenticated application shell (Sidebar, Header, Breadcrumbs)
│   │   └── AuthLayout.tsx           # Authentication shell for login and onboarding
│   ├── modules/                     # Domain Feature Modules
│   │   ├── students/                # Complete Student Experience Portal
│   │   │   ├── features/            # Feature slices (dashboard, timetable, gradebook, etc.)
│   │   │   ├── hooks/               # Student-specific data-fetching hooks
│   │   │   ├── layouts/             # Student dashboard layouts
│   │   │   ├── pages/               # Student page containers
│   │   │   ├── routers/             # Student route definitions
│   │   │   ├── services/            # Student API service abstractions
│   │   │   ├── types/               # TypeScript interfaces for student domain
│   │   │   └── utils/               # Student calculations & formatters
│   │   └── admin/                   # Administrative Management Modules
│   ├── pages/                       # Standalone & Auth Pages
│   │   ├── Login/                   # Multi-role authentication entrypoint
│   │   ├── ForgotPassword/          # Password recovery initiation
│   │   ├── VerifyOtp/               # One-time passcode challenge
│   │   ├── ResetPassword/           # Credential update screen
│   │   ├── RoleHome/                # Dynamic landing dispatcher based on assigned role
│   │   └── Errors/                  # Error boundary views (403, 404, 500)
│   ├── shared/                      # Global constants, Axios client, shared utilities
│   ├── types/                       # Global system and DTO TypeScript declarations
│   ├── App.tsx                      # Root application component with Ant Design ConfigProvider
│   ├── main.tsx                     # Application entrypoint & DOM hydration
│   └── setupTests.ts                # Testing setup (Jest-DOM matchers, mock observers)
│
├── .oxlintrc.json                   # Oxlint configuration
├── nginx.conf                       # Production Nginx reverse-proxy & SPA fallback configuration
├── Dockerfile                       # Multi-stage production container build
├── package.json                     # Dependency manifests & build scripts
├── tsconfig.json                    # Base TypeScript compiler configuration
├── tsconfig.app.json                # Application-specific TypeScript options
├── vite.config.ts                   # Vite bundler configuration with Tailwind plugin
└── AGENT.md                         # Frontend engineering rules & guidelines
```

---

## 🧩 Functional Modules

### 4.1. Student Portal Modules (`src/modules/students/features`)

The Student Portal offers a comprehensive suite of tools for secondary school learners:

1. **Dashboard (`dashboard`)**: Real-time morning/afternoon period schedule overview, quick KPI cards, recent grade alerts, pending homework reminders, and school-wide announcements.
2. **Timetable (`timetable`)**: Interactive 10-period timetable grid categorized by Morning and Afternoon shifts, highlighting classroom numbers, subject teachers, and live substitution notices.
3. **Circular 22 Gradebook (`gradebook`)**: Term-by-term academic scorecard featuring oral evaluations, 15-minute quizzes, midterm tests, and final exam grades with automated weighted GPA calculation and conduct evaluation badges.
4. **Attendance Tracker (`attendance`)**: Detailed attendance ledger with monthly percentage gauges, authorized leave counts, and unexcused tardiness statistics.
5. **Leave Requests (`leave-requests`)**: Absence request management allowing students and parents to submit excuse notes, attach doctor slips, and monitor homeroom teacher approval workflows.
6. **Assignments & Homework (`assignments`)**: Assignment tracking system displaying deadlines, task instructions, file attachments, and submission portals with teacher review feedback.
7. **Online Examination Suite (`exams`)**: Online examination interface with question navigation palettes, multiple-choice radio groups, persistent countdown timers, auto-save, and automated submission triggers.
8. **Digital Contact Book (`contact-book`)**: Digital replica of the traditional Vietnamese *Sổ liên lạc điện tử*, consolidating academic performance, attendance records, and homeroom teacher remarks for parent acknowledgment.
9. **Announcements (`announcements`)**: Filterable notification stream categorized by School, Grade, and Class, featuring high-priority alert banners and read confirmations.
10. **Curriculum Materials (`materials`)**: Digital classroom library providing downloadable textbooks, study guides, and an in-browser slide/document viewer via `@react-pdf-viewer`.
11. **Teacher Evaluation (`evaluation`)**: End-of-semester pedagogical survey with 5-star rating metrics and qualitative feedback, completely protected by cryptographic anonymity.
12. **Reminders (`reminders`)**: Personalized academic task and calendar reminder scheduler.
13. **Student Profile (`profile`)**: 360-degree student profile displaying national identity code, class placement, health metrics, guardian contacts, enrolled clubs, and merit awards.
14. **Settings & Password (`settings`, `change-password`)**: Security center for password updates, notification preferences, theme customization, and language switching.

### 4.2. Authentication & Security Flows

- **Credential Login**: Secure login with JWT Bearer token generation.
- **Role-Based Routing**: Dynamic routing redirects authenticated users to their corresponding dashboard (`/student`, `/teacher`, `/admin`).
- **Token Lifecycle**: Automated refresh token rotation via Axios response interceptors.
- **Account Recovery**: End-to-end self-service password recovery flow (`ForgotPassword` $\rightarrow$ `VerifyOtp` $\rightarrow$ `ResetPassword`).

---

## 🌐 Internationalization (i18n)

The application complies with international accessibility and multicultural education standards, supporting 5 fully-translated locales:

- 🇻🇳 **Vietnamese (`vi`)** — *Default System Language*
- 🇬🇧 **English (`en`)**
- 🇯🇵 **Japanese (`ja`)**
- 🇰🇷 **Korean (`ko`)**
- 🇨🇳 **Chinese (`zh`)**

### Implementation Guidelines
- **Component-Scoped Organization**: In accordance with `AGENT.md`, translation resource bundles are organized around components rather than sprawling global files, maximizing reusability.
- **Language Detection**: Automatically persists user preferences in `localStorage` and detects browser language settings via `i18next-browser-languagedetector`.

---

## ⚡ State Management & Data Layer

- **Zustand Stores**: Global states (authentication, current user identity, active academic term, notification badge counts, and user card preferences) are managed via lightweight, decoupled Zustand stores.
- **LocalStorage Synchronization**: Critical session parameters and user preferences are automatically synced with local storage.
- **Axios HTTP Client**: Centralized API client configured in `src/shared/services/api.ts`:
  - Automatically injects JWT Bearer tokens in outgoing requests.
  - Intercepts `401 Unauthorized` responses to seamlessly refresh expired access tokens.
  - Normalizes API error payloads into user-friendly localized toast notifications.

---

## 🎨 Design System & UI Components

- **Ant Design 6 Tokens**: Configured with a modern educational palette, standard border radii, accessible contrast ratios, and unified typography across all screens.
- **Tailwind CSS v4 Utility Classes**: Accelerates custom layout creation with responsive flexbox and grid utilities without writing redundant CSS files.
- **Responsive Viewport Support**: Seamlessly transitions from mobile screens (375px+) to tablets and 4K desktop displays.
- **UX States**: Every data view includes explicit skeleton loading states, empty state illustrations, and descriptive error banners.

---

## 🚀 Local Development & Setup

### Prerequisites
- **Node.js**: `v20.x` or newer (LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`
- **Backend API**: SchoolPro Backend running on `http://localhost:8000`

### 1. Installation

```bash
cd schoolpro-frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Create local environment configuration
cp .env.example .env
```

Ensure your `.env` contains the backend API endpoint:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEFAULT_LANGUAGE=vi
VITE_APP_NAME="SchoolPro High School"
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be accessible at: **`http://localhost:5173`** (with instant Hot Module Replacement).

---

## 🧪 Code Quality, Linting & Testing

The frontend codebase maintains high quality standards through strict static analysis and automated unit/component tests:

```bash
# 1. Run ultra-fast Oxlint check
npm run lint

# 2. Verify TypeScript types across the entire project
npm run build

# 3. Run component and unit tests with Vitest
npx vitest run

# 4. Run Vitest in interactive watch mode
npx vitest
```

---

## 🐳 Production Build & Docker Deployment

### 1. Building for Production

```bash
# Compile TypeScript and bundle assets with Vite
npm run build

# Preview production build locally
npm run preview
```

Production artifacts are output to the `dist/` directory.

### 2. Multi-Stage Docker Container

The production `Dockerfile` uses a two-stage build:
1. **Build Stage**: Uses Node.js to install dependencies and bundle assets.
2. **Production Stage**: Uses a lightweight Alpine-based Nginx container to serve static assets with gzip compression, security headers, and client-side SPA routing (`try_files $uri $uri/ /index.html`).

```bash
# Build Docker image
docker build -t schoolpro-frontend:latest .

# Run Docker container on port 3000
docker run -d -p 3000:80 --name schoolpro-frontend schoolpro-frontend:latest
```

---

## 📄 License

SchoolPro Frontend is proprietary software developed by the SchoolPro Frontend & QA Engineering Team. All rights reserved.
