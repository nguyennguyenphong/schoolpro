# 🎓 SchoolPro - Enterprise High School Database Architecture

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![pgAdmin](https://img.shields.io/badge/pgAdmin-4-326690?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.pgadmin.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Future--Proof%20Relational-success?style=for-the-badge)](https://en.wikipedia.org/wiki/Relational_database)
[![Standard](https://img.shields.io/badge/MoET%20Standard-Circular%2022%20%2F%202018%20GDPT-blueviolet?style=for-the-badge)](https://moet.gov.vn)

A comprehensive, enterprise-grade **PostgreSQL 16 relational database architecture** tailored for modern High Schools (K-12 Grades 10-12). Engineered using **Future-Proof Architectural Principles**, this database features zero-lock dynamic schemas, built-in master data compliant with the **Vietnam Ministry of Education and Training (MoET) 2018 General Education Curriculum & Circular 22/2021/TT-BGDĐT**, multi-role RBAC security, and turn-key containerization with Docker and pgAdmin 4.

---

## 📑 Table of Contents

1. [Key Architectural Principles](#-key-architectural-principles)
2. [Directory Structure](#-directory-structure)
3. [The 6 Core Schemas](#-the-6-core-schemas)
4. [Comprehensive Data Dictionary (85 Tables)](#-comprehensive-data-dictionary-85-tables)
   - [4.1. Master Catalogs (`master`)](#41-master-catalogs-master)
   - [4.2. Core Organization, Identity & RBAC (`core`)](#42-core-organization-identity--rbac-core)
   - [4.3. Academic Operations & Assessment (`academic`)](#43-academic-operations--assessment-academic)
   - [4.4. Emulation, Discipline & Conduct (`emulation`)](#44-emulation-discipline--conduct-emulation)
   - [4.5. Evaluation & Classroom Facilities (`evaluation`)](#45-evaluation--classroom-facilities-evaluation)
   - [4.6. Notification & Electronic Communication (`notification`)](#46-notification--electronic-communication-notification)
   - [4.7. Intelligent Infrastructure, Dynamic Cards & Audit (`sys`)](#47-intelligent-infrastructure-dynamic-cards--audit-sys)
5. [Pre-Seeded Master Data](#-pre-seeded-master-data)
6. [Quick Start with Docker & pgAdmin 4](#-quick-start-with-docker--pgadmin-4)
7. [Essential Query Examples](#-essential-query-examples)
8. [Performance & Security Best Practices](#-performance--security-best-practices)

---

## 🛡️ Key Architectural Principles

Educational policies, assessment standards (Circular 22), national identity schemes (VNeID), and elective subject combinations frequently evolve. To eliminate table lockups, avoid dangerous production `ALTER TABLE` migrations, and preserve backend API stability, SchoolPro DB implements 6 enterprise design patterns:

1. **Dynamic Reference & Lookup Engine (`lookup_types`, `lookup_values`):**
   - Completely eliminates hardcoded PostgreSQL physical `ENUM` types.
   - Status codes, room categories, assessment modes, and educational tracks are managed via relational lookup tables. School administrators can add or modify lookup entries via the UI with zero code deployment or schema migration.

2. **Dynamic Custom Fields Engine (EAV Pattern + JSONB):**
   - Built via `core.custom_field_definitions` and `core.custom_field_values`.
   - Allows schools to define custom attributes for Students, Teachers, Classes, and Exams (e.g., *Level 2 VNeID Identifier*, *School Laptop Asset Number*, *Special Health Condition*) dynamically without schema alterations.

3. **Polymorphic Temporal Position Assignments:**
   - Powered by `core.positions` and `core.position_assignments`.
   - Records who held what leadership position, where (`SCHOOL`, `GRADE`, `CLASS`, `GROUP`, `DEPARTMENT`), and when (`start_date`, `end_date`, `is_current`).
   - Seamlessly models complex scenarios: *Teacher A was Homeroom Teacher of Class 10A1 in 2024, and becomes Head of the Math Department in 2025; Student B is Class President of 10A1, while Student C is Vice President and Student D is Group 1 Leader.*

4. **Multi-Level Dynamic Emulation System:**
   - School-wide evaluation rules are centrally maintained in `master.emulation_criteria`.
   - Simultaneously, each class can define internal criteria in `emulation.class_custom_criteria`, giving homeroom teachers and student class officers autonomy to reward or penalize internal classroom conduct.

5. **Role-Driven Dynamic Cards & 4-Tier Cascading Settings (`sys` schema):**
   - Dashboard widgets/cards are assigned per role (`sys.modules`, `sys.role_modules`), while users can customize order, pin priority, or hide cards via drag-and-drop (`sys.user_module_preferences`).
   - System settings resolve across a 4-tier hierarchical waterfall:
     $$\text{User Setting} \longrightarrow \text{Role Default} \longrightarrow \text{School Setting} \longrightarrow \text{System Default}$$

6. **Transactional Event Outbox Pattern (`sys.event_outbox`):**
   - Solves distributed consistency issues when integrating asynchronous workers (Celery, Redis, Push Notifications, Event Webhooks). State mutations (e.g., grade entry, attendance infractions, conduct ranking) publish an event atomically within the same database transaction.

---

## 📁 Directory Structure

```text
schoolpro-db/
├── README.md                       # Comprehensive Database Documentation & Schema Reference
├── docker-compose.yml              # Standalone DB stack orchestration (PostgreSQL on 5433, pgAdmin 4 on 5050)
├── docker/                         # Container configuration & automated provisioning
│   ├── init-db.sh                  # Dependency-ordered topological SQL execution script
│   └── pgadmin/                    # Auto-provisioned pgAdmin 4 server configuration
│       ├── servers.json            # Automatic registration of SchoolPro PostgreSQL server
│       └── pgpass                  # Auto-authentication password file (mode 0600)
└── sql/                            # Modular SQL scripts
    ├── 00_schemas.sql              # Extensions (uuid-ossp, citext, pg_trgm), 6 Schemas & Enums
    ├── 01_functions/               # Reusable stored functions
    │   └── functions.sql           # fn_set_updated_at() trigger function
    ├── 02_tables/                  # Table definitions (strictly one file per table)
    │   ├── master/                 # 15 tables: Shared reference & lookup catalogs
    │   ├── core/                   # 19 tables: Identity, RBAC, profiles, classes, clubs
    │   ├── academic/               # 25 tables: Timetables, question bank, online exams, TT22, fees
    │   ├── emulation/              # 7 tables: Discipline, red star patrols, rankings, awards
    │   ├── evaluation/             # 6 tables: Anonymous teacher reviews & facility maintenance
    │   ├── notification/           # 6 tables: Multichannel notices, digital contact book, messaging
    │   └── sys/                    # 7 tables: Dynamic cards, 4-tier settings, audit logs, outbox
    ├── 03_views/                   # Materialized & dynamic real-time analytical views
    │   └── views.sql               # v_current_class_leadership, v_student_360_profile, etc.
    ├── 04_triggers/                # Automated database triggers
    │   └── triggers.sql            # Automatic updated_at timestamp triggers on all entities
    └── 05_seeds/                   # Production-ready bootstrap data
        └── init.sql                # Master data & demonstration school bootstrap dataset
```

---

## 🏛️ The 6 Core Schemas

| Schema | Scope & Business Responsibility |
| :--- | :--- |
| **`core`** | Central identity, RBAC authentication, detailed profiles (students, teachers, guardians, staff), grade-class-group hierarchies, temporal position assignments, student clubs, dynamic lookups, and custom fields (EAV). |
| **`academic`** | High school curriculum operations: 10-period timetable grids, teacher substitutions, electronic class journals (sổ đầu bài), learning materials, MoET 2018 subject tracks, question banks, online examination engines, Circular 22 (TT22) grading, conduct records, digital transcripts, exemptions, extracurriculars, and tuition fee billing. |
| **`emulation`** | School discipline and moral conduct: School-wide and classroom-specific criteria, supervisor duty logs, student red flag inspector patrols (cờ đỏ), weekly/monthly class leaderboards, formal disciplinary hearings, and merit awards. |
| **`evaluation`** | Quality assurance & physical facilities: 100% anonymous end-of-term student evaluations of teacher pedagogy, classroom facility inventories, and maintenance incident tracking. |
| **`notification`** | School-to-home communication: Multichannel targeted announcements, read-receipt tracking, automated academic reminders, digital contact books (sổ liên lạc điện tử), 1-on-1 parent-teacher messaging, and FCM/APNs push tokens. |
| **`sys`** | Intelligent system infrastructure: Role-based dashboard card registries, user drag-and-drop widget preferences, 4-tier resolved configuration parameters, immutable audit logs, and the Transactional Event Outbox. |

---

## 🗄️ Comprehensive Data Dictionary (85 Tables)

### 4.1. Master Catalogs (`master`)

Foundation data and shared reference catalogs across the institution.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`core.lookup_types`** | Defines dynamic catalog groupings (e.g., GENDER, STATUS, ROOM_TYPE, TRACK_TYPE). Replaces rigid Postgres physical enums. | Parent table for `core.lookup_values`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `description` (TEXT). |
| **`core.lookup_values`** | Specific catalog values (e.g., Male/Female, Active/Locked, Natural Sciences/Social Sciences). | `lookup_type_id` $\rightarrow$ `core.lookup_types(id)`. | `id` (UUID PK), `lookup_type_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `order_no` (INT), `badge_color` (VARCHAR). |
| **`core.schools`** | Legal institutional profile, official school code, address, hotline, principal name, accreditation. | Root tenant entity. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `educational_stage` (VARCHAR), `address` (TEXT), `phone` (VARCHAR). |
| **`core.academic_years`** | Academic school years (e.g., 2024-2025, 2025-2026, 2026-2027) with active term flags. | `school_id` $\rightarrow$ `core.schools(id)`. Referenced by semesters, classes, and positions. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `is_current` (BOOL). |
| **`core.semesters`** | Academic semesters (Semester 1, Semester 2, Summer Term). | `academic_year_id` $\rightarrow$ `core.academic_years(id)`. Referenced by timetables and gradebooks. | `id` (UUID PK), `academic_year_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `is_current` (BOOL). |
| **`core.grades`** | High school grade levels (Grade 10, Grade 11, Grade 12). | `school_id` $\rightarrow$ `core.schools(id)`. Referenced by classes and curriculum tracks. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `order_no` (INT). |
| **`core.departments`** | Academic departments and administrative units (Math-IT, Literature, Supervision, Medical, Finance). | `school_id` $\rightarrow$ `core.schools(id)`. Referenced by teachers and staff. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `department_type` (VARCHAR). |
| **`core.subjects`** | MoET 2018 subject definitions (Mathematics, Literature, English, Physics, Chemistry, Biology, History, Geography, Economic & Legal Education, Experiential Activities). | `school_id` $\rightarrow$ `core.schools(id)`, `department_id` $\rightarrow$ `core.departments(id)`. | `id` (UUID PK), `code` (VARCHAR), `name` (VARCHAR), `evaluation_type` (SCORE/COMMENT), `is_compulsory` (BOOL), `metadata` (JSONB). |
| **`core.rooms`** | Physical inventory of standard classrooms, science labs, computer rooms, and multi-purpose halls. | `school_id` $\rightarrow$ `core.schools(id)`. Referenced by timetables and facility incident reports. | `id` (UUID PK), `school_id` (UUID FK), `room_code` (VARCHAR), `name` (VARCHAR), `room_type_code` (VARCHAR), `capacity` (INT). |
| **`core.periods`** | Standard 10-period timetable bell schedule (Periods 1-5 Morning, Periods 6-10 Afternoon). | `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `school_id` (UUID FK), `period_number` (INT), `shift` (MORNING/AFTERNOON), `start_time` (TIME), `end_time` (TIME). |
| **`core.score_types`** | Assessment score types under Circular 22 (Oral/Regular Assessment - coef 1, Midterm - coef 2, Final Exam - coef 3). | `school_id` $\rightarrow$ `core.schools(id)`. Referenced by student grade entries. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR), `coefficient` (NUMERIC), `min_required` (INT). |
| **`core.positions`** | Institutional position catalog: Homeroom Teacher, Class President, Vice President, Group Leader, Supervisor, Red Star Inspector. | Referenced by `core.position_assignments`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `applicable_scope` (CLASS/SCHOOL/GRADE), `rank_weight` (INT). |
| **`master.emulation_criteria`** | School-wide student conduct standards (Punctuality, Uniform, Cleanliness, Academic Excellence, Flag Ceremony). | `school_id` $\rightarrow$ `core.schools(id)`. Referenced by emulation records. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR), `title` (VARCHAR), `category` (VARCHAR), `default_points` (NUMERIC). |
| **`sys.settings_definitions`** | Master registry of system configuration parameters (UI themes, grade locking deadlines, notification settings). | Referenced by multi-tier settings tables. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `category` (VARCHAR), `data_type` (VARCHAR), `default_value` (JSONB). |
| **`sys.modules`** | Catalog of UI dashboard cards and functional modules (Timetable, Gradebook, Homework, Exams, Contact Book). | Referenced by `sys.role_modules` and user card preference tables. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `route` (VARCHAR), `icon` (VARCHAR), `category` (VARCHAR). |

---

### 4.2. Core Organization, Identity & RBAC (`core`)

User authentication, granular permissions, user profiles, and structural organization.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`core.custom_field_definitions`** | EAV schema definitions for dynamic attributes on Students, Teachers, and Classes. | `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `entity_type` (VARCHAR), `field_name` (VARCHAR), `field_code` (VARCHAR), `field_type` (TEXT/DATE/NUMBER/JSON). |
| **`core.custom_field_values`** | Physical values for custom dynamic fields mapped by entity ID. | `definition_id` $\rightarrow$ `core.custom_field_definitions(id)`. | `id` (UUID PK), `definition_id` (UUID FK), `entity_id` (UUID), `field_value` (JSONB). |
| **`core.users`** | Unified account repository with hashed passwords, identity credentials (CCCD/VNeID), email, and phone. | `school_id` $\rightarrow$ `core.schools(id)`. Parent of students, teachers, guardians, staff. | `id` (UUID PK), `school_id` (UUID FK), `username` (VARCHAR UNIQUE), `password_hash` (TEXT), `full_name` (VARCHAR), `phone` (VARCHAR). |
| **`core.roles`** | System roles: `ADMIN`, `PRINCIPAL`, `TEACHER`, `HOMEROOM_TEACHER`, `STUDENT`, `PARENT`, `SUPERVISOR`, `STAFF`. | Referenced by `user_roles`, `role_permissions`, and `role_modules`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `description` (TEXT), `badge_color` (VARCHAR). |
| **`core.permissions`** | Granular REST action permissions (e.g., `student.view`, `score.edit`, `attendance.mark`). | Referenced by `core.role_permissions`. | `id` (UUID PK), `code` (VARCHAR UNIQUE), `module` (VARCHAR), `action` (VARCHAR), `description` (TEXT). |
| **`core.role_permissions`** | Many-to-many junction mapping permissions to roles. | `role_id` $\rightarrow$ `core.roles(id)`, `permission_id` $\rightarrow$ `core.permissions(id)`. | Composite PK `(role_id, permission_id)`. |
| **`core.user_roles`** | Multi-role assignment per user (e.g., a Teacher who is also a Parent of an enrolled student). | `user_id` $\rightarrow$ `core.users(id)`, `role_id` $\rightarrow$ `core.roles(id)`. | `id` (UUID PK), `user_id` (UUID FK), `role_id` (UUID FK), `is_primary` (BOOL), `status` (VARCHAR). |
| **`core.classes`** | Academic classes (10A1, 11D1, 12A2), target capacity, and assigned homeroom facilities. | `school_id` $\rightarrow$ `core.schools(id)`, `grade_id` $\rightarrow$ `core.grades(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `code` (VARCHAR), `name` (VARCHAR), `grade_id` (UUID FK), `academic_year_id` (UUID FK), `room_id` (UUID FK). |
| **`core.class_groups`** | Classroom subgroups (Group 1, Group 2, Group 3, Group 4) for group projects and internal emulation. | `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `class_id` (UUID FK), `name` (VARCHAR), `order_no` (INT). |
| **`core.position_assignments`** | Temporal position assignments across classes, grades, or the whole school. | `user_id` $\rightarrow$ `core.users(id)`, `position_id` $\rightarrow$ `core.positions(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `user_id` (UUID FK), `position_id` (UUID FK), `class_id` (UUID FK), `start_date` (DATE), `is_current` (BOOL). |
| **`core.students`** | Student profile: Student ID (e.g., `HS20261001`), enrollment date, graduation date, policy exemptions. | `user_id` $\rightarrow$ `core.users(id)`. Core entity for grades, attendance, awards, and fees. | `id` (UUID PK), `user_id` (UUID FK UNIQUE), `student_code` (VARCHAR UNIQUE), `admission_date` (DATE), `status` (VARCHAR). |
| **`core.student_health_records`** | Comprehensive student health records: height, weight, vision, medical history, allergies, health insurance. | `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `student_id` (UUID FK), `academic_year_id` (UUID FK), `height` (NUMERIC), `weight` (NUMERIC), `allergies` (TEXT). |
| **`core.guardians`** | Parent/Guardian profiles, relationship classification (Father, Mother, Legal Guardian), emergency contacts. | `user_id` $\rightarrow$ `core.users(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `user_id` (UUID FK), `student_id` (UUID FK), `relationship_type` (VARCHAR), `is_emergency_contact` (BOOL). |
| **`core.teachers`** | Teacher profile: Teacher Code (e.g., `GV2026001`), academic degree, assigned department, hire date. | `user_id` $\rightarrow$ `core.users(id)`, `department_id` $\rightarrow$ `core.departments(id)`. | `id` (UUID PK), `user_id` (UUID FK UNIQUE), `teacher_code` (VARCHAR UNIQUE), `department_id` (UUID FK), `qualification` (VARCHAR). |
| **`core.staff`** | Administrative staff profiles: Accountant, Medical Officer, Supervisor, IT Technician, Registrar. | `user_id` $\rightarrow$ `core.users(id)`, `department_id` $\rightarrow$ `core.departments(id)`. | `id` (UUID PK), `user_id` (UUID FK UNIQUE), `staff_code` (VARCHAR UNIQUE), `job_title` (VARCHAR), `employment_status` (VARCHAR). |
| **`core.student_class_enrollments`** | Student enrollment ledger: Tracks student class placements across academic years. | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `student_id` (UUID FK), `class_id` (UUID FK), `enrollment_date` (DATE), `status` (ACTIVE/TRANSFERRED). |
| **`core.class_subject_teachers`** | Subject teaching assignments: Links teacher, class, subject, and semester. | `class_id` $\rightarrow$ `core.classes(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `class_id` (UUID FK), `subject_id` (UUID FK), `teacher_id` (UUID FK), `semester_id` (UUID FK). |
| **`core.clubs`** | School extracurricular clubs (Robotics, Basketball, Debating, Arts, Youth Union). | `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `school_id` (UUID FK), `code` (VARCHAR UNIQUE), `name` (VARCHAR), `category` (VARCHAR). |
| **`core.club_members`** | Club membership roster with officer roles (President, Vice President, Member). | `club_id` $\rightarrow$ `core.clubs(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `club_id` (UUID FK), `student_id` (UUID FK), `role_title` (VARCHAR), `status` (ACTIVE/INACTIVE). |

---

### 4.3. Academic Operations & Assessment (`academic`)

Core school business logic: schedules, class journals, examinations, Circular 22 grading, and tuition.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`academic.timetables`** | Master timetable matrix: maps Day of Week, Period, Class, Subject, Teacher, and Room. | `class_id`, `subject_id`, `teacher_id`, `period_id`, `room_id`. | `id` (UUID PK), `day_of_week` (SMALLINT 2-8), `period_id` (UUID FK), `class_id` (UUID FK), `subject_id` (UUID FK). |
| **`academic.timetable_changes`** | Schedule alterations: logs teacher substitutions, period swaps, and makeup classes. | `timetable_id` $\rightarrow$ `academic.timetables(id)`, `substitute_teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `timetable_id` (UUID FK), `change_type` (VARCHAR), `change_date` (DATE), `reason` (TEXT). |
| **`academic.class_journal_entries`** | Electronic class journal (Sổ đầu bài): lesson title, student attendance tally, lesson grading (A/B/C), remarks. | `class_id` $\rightarrow$ `core.classes(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `lesson_topic` (VARCHAR), `evaluation_grade` (VARCHAR), `teacher_notes` (TEXT). |
| **`academic.curriculum_materials`** | Digital library: lesson plans, lecture slides, syllabus reference materials. | `subject_id` $\rightarrow$ `core.subjects(id)`, `grade_id` $\rightarrow$ `core.grades(id)`. | `id` (UUID PK), `title` (VARCHAR), `description` (TEXT), `material_type` (VARCHAR), `is_published` (BOOL). |
| **`academic.material_attachments`** | Physical files attached to materials (PDF, PPTX, MP4, DOCX) with storage references. | `material_id` $\rightarrow$ `academic.curriculum_materials(id)`. | `id` (UUID PK), `material_id` (UUID FK), `file_name` (VARCHAR), `file_url` (TEXT), `file_size_bytes` (BIGINT). |
| **`academic.assignments`** | Homework, essay assignments, and term projects created by teachers. | `class_id` $\rightarrow$ `core.classes(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `title` (VARCHAR), `instructions` (TEXT), `due_date` (TIMESTAMPTZ), `max_score` (NUMERIC). |
| **`academic.assignment_submissions`** | Student assignment submissions, turn-in timestamps, grades, and teacher feedback. | `assignment_id` $\rightarrow$ `academic.assignments(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `assignment_id` (UUID FK), `student_id` (UUID FK), `submission_content` (TEXT), `score` (NUMERIC). |
| **`academic.curriculum_tracks`** | MoET 2018 General Education curriculum tracks (Natural Sciences, Social Sciences, Arts & Technology). | `school_id` $\rightarrow$ `core.schools(id)`, `grade_id` $\rightarrow$ `core.grades(id)`. | `id` (UUID PK), `school_id` (UUID FK), `grade_id` (UUID FK), `code` (VARCHAR), `name` (VARCHAR). |
| **`academic.curriculum_track_subjects`** | Specific elective subjects that compose each curriculum track. | `track_id` $\rightarrow$ `academic.curriculum_tracks(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | Composite PK `(track_id, subject_id)`, `is_specialized` (BOOL), `weekly_periods` (INT). |
| **`academic.student_track_enrollments`** | Records student registration in elective curriculum tracks per academic year. | `student_id` $\rightarrow$ `core.students(id)`, `track_id` $\rightarrow$ `academic.curriculum_tracks(id)`. | `id` (UUID PK), `student_id` (UUID FK), `track_id` (UUID FK), `academic_year_id` (UUID FK). |
| **`academic.question_bank`** | Item bank for testing: Multiple-choice & essay questions categorized by MoET cognitive levels (Knowledge, Comprehension, Application, High Application). | `subject_id` $\rightarrow$ `core.subjects(id)`, `grade_id` $\rightarrow$ `core.grades(id)`. | `id` (UUID PK), `content` (TEXT), `question_type` (VARCHAR), `options` (JSONB), `correct_answers` (JSONB). |
| **`academic.exams`** | Centralized examinations and mock National High School Graduation Tests. | `school_id` $\rightarrow$ `core.schools(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `title` (VARCHAR), `duration_minutes` (INT), `total_score` (NUMERIC), `start_time` (TIMESTAMPTZ). |
| **`academic.exam_questions`** | Exam structure: Questions selected from the question bank with order and point weight. | `exam_id` $\rightarrow$ `academic.exams(id)`, `question_id` $\rightarrow$ `academic.question_bank(id)`. | `id` (UUID PK), `exam_id` (UUID FK), `question_id` (UUID FK), `question_order` (INT), `points` (NUMERIC). |
| **`academic.exam_submissions`** | Online exam answer sheets: Start/submit timestamps, automated score calculation, status. | `exam_id` $\rightarrow$ `academic.exams(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `exam_id` (UUID FK), `student_id` (UUID FK), `score` (NUMERIC), `submitted_at` (TIMESTAMPTZ). |
| **`academic.exam_submission_answers`** | Detailed question-level responses, chosen options, and points awarded. | `submission_id` $\rightarrow$ `academic.exam_submissions(id)`. | `id` (UUID PK), `submission_id` (UUID FK), `selected_answers` (JSONB), `is_correct` (BOOL), `score_awarded` (NUMERIC). |
| **`academic.student_scores`** | Circular 22 gradebook entries: Regular oral/written tests, Midterm, and Final examination scores. | `student_id` $\rightarrow$ `core.students(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`, `score_type_id` $\rightarrow$ `core.score_types(id)`. | `id` (UUID PK), `score_value` (NUMERIC 0-10), `evaluation_remark` (TEXT), `is_locked` (BOOL). |
| **`academic.conduct_evaluations`** | Periodic student moral conduct ratings (Excellent, Good, Pass, Fail). | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `conduct_grade` (VARCHAR), `teacher_comments` (TEXT), `assessed_by` (UUID FK). |
| **`academic.report_cards`** | Official digital academic transcripts: Term GPA, academic distinction tier, conduct classification. | `student_id` $\rightarrow$ `core.students(id)`, `semester_id` $\rightarrow$ `core.semesters(id)`. | `id` (UUID PK), `gpa` (NUMERIC), `academic_rank` (VARCHAR), `conduct_rank` (VARCHAR), `title` (VARCHAR). |
| **`academic.student_term_summaries`** | Computed term and year-end weighted average scores per subject. | `student_id` $\rightarrow$ `core.students(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `average_score` (NUMERIC), `evaluation_result` (VARCHAR), `passed` (BOOL). |
| **`academic.subject_exemptions`** | Subject exemptions and deferrals (e.g., IELTS waiver for English, medical waiver for Physical Education). | `student_id` $\rightarrow$ `core.students(id)`, `subject_id` $\rightarrow$ `core.subjects(id)`. | `id` (UUID PK), `exemption_type` (VARCHAR), `reason` (TEXT), `certificate_code` (VARCHAR). |
| **`academic.extracurricular_activities`** | Experiential and vocational activities outside standard classroom lectures. | `school_id` $\rightarrow$ `core.schools(id)`. | `id` (UUID PK), `title` (VARCHAR), `activity_type` (VARCHAR), `points_reward` (INT), `event_date` (TIMESTAMPTZ). |
| **`academic.activity_participations`** | Activity attendance rosters, performance evaluation, and verification. | `activity_id` $\rightarrow$ `academic.extracurricular_activities(id)`, `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `activity_id` (UUID FK), `student_id` (UUID FK), `attendance_status` (VARCHAR). |
| **`academic.fee_items`** | Tuition fees, health insurance, and school fund items. | `school_id` $\rightarrow$ `core.schools(id)`, `academic_year_id` $\rightarrow$ `core.academic_years(id)`. | `id` (UUID PK), `code` (VARCHAR), `name` (VARCHAR), `amount` (NUMERIC), `is_mandatory` (BOOL). |
| **`academic.student_fee_bills`** | Student invoices, payment tracking, balance, and gateway transaction status. | `student_id` $\rightarrow$ `core.students(id)`, `fee_item_id` $\rightarrow$ `academic.fee_items(id)`. | `id` (UUID PK), `bill_code` (VARCHAR UNIQUE), `original_amount` (NUMERIC), `payment_status` (VARCHAR). |
| **`academic.attendance`** | Daily student attendance logs: Present, Excused Absence, Unexcused Absence, Late. | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `student_id` (UUID FK), `attendance_date` (DATE), `status` (VARCHAR). |

---

### 4.4. Emulation, Discipline & Conduct (`emulation`)

Discipline records, Red Star patrol logs, rankings, and awards.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`emulation.periods`** | Emulation calculation cycles (Week 1, Week 2, Month 10, National Teachers' Day Campaign). | `academic_year_id`, `semester_id`. | `id` (UUID PK), `period_type` (VARCHAR), `name` (VARCHAR), `start_date` (DATE), `is_closed` (BOOL). |
| **`emulation.class_custom_criteria`** | Classroom-specific internal criteria created by homeroom teachers or class leaders. | `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `class_id` (UUID FK), `name` (VARCHAR), `points` (NUMERIC), `criteria_type` (VARCHAR). |
| **`emulation.supervisor_duty_logs`** | Daily duty journal kept by the school supervision department. | `supervisor_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `duty_date` (DATE), `shift` (VARCHAR), `general_assessment` (TEXT), `incident_count` (INT). |
| **`emulation.records`** | Emulation logs for bonus or demerit points recorded by Red Star inspectors or teachers. | `class_id`, `student_id`, `period_id`. | `id` (UUID PK), `class_id` (UUID FK), `student_id` (UUID FK), `points_delta` (NUMERIC), `reason` (TEXT). |
| **`emulation.rankings`** | School-wide weekly and monthly class ranking leaderboards. | `period_id` $\rightarrow$ `emulation.periods(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `period_id` (UUID FK), `class_id` (UUID FK), `total_points` (NUMERIC), `ranking_position` (INT). |
| **`emulation.disciplinary_records`** | Formal disciplinary records for serious student infractions. | `student_id` $\rightarrow$ `core.students(id)`. | `id` (UUID PK), `student_id` (UUID FK), `infraction_description` (TEXT), `disciplinary_level` (VARCHAR). |
| **`emulation.awards`** | Honor roll, academic competition medals, and leadership recognition. | `student_id` $\rightarrow$ `core.students(id)`, `class_id` $\rightarrow$ `core.classes(id)`. | `id` (UUID PK), `title` (VARCHAR), `award_category` (VARCHAR), `prize` (VARCHAR), `bonus_points` (INT). |

---

### 4.5. Evaluation & Classroom Facilities (`evaluation`)

Anonymous pedagogical feedback and facility maintenance management.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`evaluation.forms`** | Survey templates for teacher assessments and institutional feedback. | `school_id`, `academic_year_id`. | `id` (UUID PK), `title` (VARCHAR), `target_audience` (VARCHAR), `is_anonymous` (BOOL). |
| **`evaluation.questions`** | Item questions inside survey forms (1-5 star rating, Yes/No, text feedback). | `form_id` $\rightarrow$ `evaluation.forms(id)`. | `id` (UUID PK), `form_id` (UUID FK), `question_text` (TEXT), `question_type` (VARCHAR), `order_no` (INT). |
| **`evaluation.facilities`** | Inventory of physical classroom assets (projectors, AC units, magnetic boards, lighting). | `room_id` $\rightarrow$ `core.rooms(id)`. | `id` (UUID PK), `room_id` (UUID FK), `facility_code` (VARCHAR), `name` (VARCHAR), `status` (VARCHAR). |
| **`evaluation.submissions`** | Survey submissions featuring hashed anonymity tokens to guarantee student privacy. | `form_id` $\rightarrow$ `evaluation.forms(id)`, `teacher_id` $\rightarrow$ `core.teachers(id)`. | `id` (UUID PK), `form_id` (UUID FK), `target_teacher_id` (UUID FK), `anonymous_hash` (VARCHAR UNIQUE). |
| **`evaluation.answers`** | Detailed student ratings and qualitative comments. | `submission_id`, `question_id`. | `id` (UUID PK), `submission_id` (UUID FK), `question_id` (UUID FK), `rating_score` (INT), `text_answer` (TEXT). |
| **`evaluation.facility_incident_reports`** | Broken equipment tickets reported from classrooms with repair workflow statuses. | `facility_id` $\rightarrow$ `evaluation.facilities(id)`, `reported_by` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `facility_id` (UUID FK), `description` (TEXT), `priority` (VARCHAR), `repair_status` (VARCHAR). |

---

### 4.6. Notification & Electronic Communication (`notification`)

School-family liaison, push notifications, and electronic contact books.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`notification.announcements`** | Institutional notices dispatched school-wide, per grade, or per class. | `school_id` $\rightarrow$ `core.schools(id)`, `sender_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `title` (VARCHAR), `content` (TEXT), `target_audience` (VARCHAR), `priority` (VARCHAR). |
| **`notification.announcement_reads`** | Read-receipt tracking verifying which parents or students viewed an announcement. | `announcement_id`, `user_id`. | Composite PK `(announcement_id, user_id)`, `read_at` (TIMESTAMPTZ). |
| **`notification.reminders`** | Automated personal task reminders (homework due dates, tuition payment deadlines). | `user_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `user_id` (UUID FK), `title` (VARCHAR), `remind_at` (TIMESTAMPTZ), `is_completed` (BOOL). |
| **`notification.push_tokens`** | Mobile and web device push tokens (FCM for Android, APNs for iOS, Web Push). | `user_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `user_id` (UUID FK), `token` (TEXT UNIQUE), `platform` (VARCHAR). |
| **`notification.contact_book_notes`** | Digital contact book digest: aggregates grades, attendance, and homeroom remarks for parents. | `student_id`, `class_id`, `semester_id`. | `id` (UUID PK), `period_label` (VARCHAR), `academic_digest` (JSONB), `parent_acknowledged` (BOOL). |
| **`notification.parent_teacher_messages`** | Direct 1-on-1 private messaging channel between parents and teachers. | `sender_id`, `receiver_id`, `student_id`. | `id` (UUID PK), `sender_id` (UUID FK), `receiver_id` (UUID FK), `message_text` (TEXT), `is_read` (BOOL). |

---

### 4.7. Intelligent Infrastructure, Dynamic Cards & Audit (`sys`)

Platform customization, audit trails, and transactional messaging.

| Table Name | Business Purpose | Foreign Keys & Associations | Key Columns & Data Types |
| :--- | :--- | :--- | :--- |
| **`sys.role_modules`** | Default dashboard card configuration and visibility mapped per role. | `role_id` $\rightarrow$ `core.roles(id)`, `module_id` $\rightarrow$ `sys.modules(id)`. | `id` (UUID PK), `role_id` (UUID FK), `module_id` (UUID FK), `is_visible` (BOOL), `order_no` (INT). |
| **`sys.user_module_preferences`** | User-specific widget customizations (drag-and-drop order, pinned cards, hidden cards). | `user_id` $\rightarrow$ `core.users(id)`, `module_id` $\rightarrow$ `sys.modules(id)`. | `id` (UUID PK), `user_id` (UUID FK), `module_id` (UUID FK), `is_pinned` (BOOL), `order_no` (INT). |
| **`sys.role_settings_defaults`** | Default configuration values applied to an entire role group. | `role_id`, `setting_id`. | `id` (UUID PK), `role_id` (UUID FK), `setting_id` (UUID FK), `value` (JSONB). |
| **`sys.system_settings`** | School-wide or platform-wide configuration settings (grade entry locking, SMTP credentials). | `setting_id`, `school_id`. | `id` (UUID PK), `setting_id` (UUID FK), `school_id` (UUID FK), `value` (JSONB). |
| **`sys.user_settings`** | User personal preferences (dark mode, interface language, sound alerts). | `user_id`, `setting_id`. | `id` (UUID PK), `user_id` (UUID FK), `setting_id` (UUID FK), `value` (JSONB). |
| **`sys.audit_logs`** | Immutable compliance audit ledger recording table mutations (Before/After JSONB snapshots, IP). | `user_id` $\rightarrow$ `core.users(id)`. | `id` (UUID PK), `user_id` (UUID FK), `action` (VARCHAR), `table_name` (VARCHAR), `old_data` (JSONB), `new_data` (JSONB). |
| **`sys.event_outbox`** | Transactional Outbox table guaranteeing reliable async event dispatch to Celery/Kafka. | Standalone transactional outbox. | `id` (UUID PK), `event_type` (VARCHAR), `aggregate_type` (VARCHAR), `aggregate_id` (UUID), `payload` (JSONB), `status` (VARCHAR). |

---

## 📦 Pre-Seeded Master Data

Executing the database initialization script (`sql/05_seeds/init.sql`) provisions a complete, production-ready dataset:

1. **Benchmark School:** Lê Quý Đôn High School (`THPT_LEQUYDON`).
2. **Academic Calendar:** Years 2024-2025, 2025-2026, 2026-2027 (current active) with Semesters 1, 2, and Summer Term.
3. **High School Grades:** Grade 10, Grade 11, and Grade 12.
4. **11 Academic & Administrative Departments:** Math - Computer Science, Literature, Foreign Languages, Physics, Chemistry - Biology, History - Geography - Civic Law, Physical Education - Defense, Supervision, Health Clinic, Finance, Youth Union.
5. **15 MoET 2018 General Curriculum Subjects:** Math, Literature, English, History, Physical Education, National Defense, Experiential & Career Activities, Local Education, Physics, Chemistry, Biology, Geography, Economic & Legal Education, Informatics, Technology.
6. **Classes & Student Groups:** 10A1, 10A2, 10D1, 10D2, 11A1, 11D1, 12A1, 12D1, each divided into Groups 1, 2, 3, and 4.
7. **Timetable Shifts:** Morning Shift (Periods 1-5 starting at 07:00), Afternoon Shift (Periods 6-10 starting at 12:45).
8. **Rooms & Equipment:** Classrooms A101, A102, B101; Physics/Chemistry/Biology Labs; Computer Labs; Central Library; 500-seat Auditorium.
9. **Circular 22 Score Configurations:** Oral/15-min Regular (coefficient 1), Midterm (coefficient 2), Final (coefficient 3).
10. **Predefined Positions:** Homeroom Teacher, Subject Teacher, Class President, Vice President of Academics, Vice President of Discipline, Group Leader, Red Star Inspector, Grade Supervisor.
11. **17 Role-Based UI Dashboard Modules:** Timetable, Gradebook, Homework, Exams, Class Journal, Anonymous Teacher Reviews, Facility Reporting, Emulation Rankings.
12. **10 Emulation Criteria:** Punctuality, Uniforms & Badges, Classroom Sanitation, Good Lesson Grades, Perfect Score Flowers.

---

## 🚀 Quick Start with Docker & pgAdmin 4

The database stack runs in isolated Docker containers with automated SQL script execution in topological order, **guaranteeing zero foreign key constraint violations**.

### 1. Booting Containers

#### Option A: One-Click via VS Code Tasks (Recommended)
Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) $\rightarrow$ Select **Tasks: Run Task** $\rightarrow$ Click **`🗄️ Database: Start PostgreSQL & pgAdmin`**.

#### Option B: Terminal Command
```bash
# Navigate to the database directory
cd schoolpro-db

# Launch PostgreSQL and pgAdmin 4 in detached mode
docker compose up -d
```

### 2. Accessing the pgAdmin 4 Web Console

Navigate to **`http://localhost:5050`** in your browser:

- **Login Email:** `admin@schoolpro.edu.vn`
- **Login Password:** `admin`

> 💡 **Auto-Mounted Server Profile:** Thanks to pre-configured `docker/pgadmin/servers.json` and `docker/pgadmin/pgpass` files, the **"SchoolPro High School PostgreSQL"** connection is already mounted and authenticated inside pgAdmin 4! Simply click to expand the 6 schemas, tables, views, and functions without typing credentials.

### Direct Connection Parameters (Backend API / DBeaver / TablePlus)

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Host** | `localhost` | `postgres` when connecting from within the Docker network |
| **Port** | `5433` | Host-mapped port to avoid conflict with local PostgreSQL installations |
| **Database** | `schoolpro` | Primary production database |
| **Username** | `postgres` | Superuser |
| **Password** | `password123` | Configurable in `.env` |

---

## 🔍 Essential Query Examples

### 1. Retrieve Current Class Officers and Homeroom Teacher
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

### 2. Retrieve Personalized Dashboard Cards for a Student
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

### 3. Resolve 4-Tier Hierarchical Configuration for a Specific User
```sql
SELECT 
    setting_code, 
    setting_name, 
    effective_value, 
    resolved_from
FROM sys.v_user_effective_settings
WHERE user_id = '00000000-0000-0000-0000-000000000003';
```

### 4. Fetch the Complete 360-Degree Profile of a Student
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

---

## ⚡ Performance & Security Best Practices

- **UUIDv4 Primary Keys**: Guarantees globally unique identifiers across all tables, prevents sequential ID harvesting attacks, and simplifies distributed data replication.
- **Foreign Key Indexing**: All foreign key columns feature explicit B-tree indexes to eliminate full table sequential scans during relational joins.
- **JSONB Indexing**: GIN indexes are applied to semi-structured columns (`metadata`, `payload`, `answers`) for high-speed sub-document querying.
- **Trigram Fuzzy Search**: The `pg_trgm` extension is enabled alongside GIN indexes to allow millisecond-level fuzzy text search across student names and teacher directories.
- **Audit Compliance**: All schema mutations trigger automated timestamp updates via `fn_set_updated_at()`, and critical data actions write immutable before/after diffs to `sys.audit_logs`.

---

## 📄 License

SchoolPro Enterprise Database is distributed under proprietary license by the SchoolPro Architecture and Development Team. All rights reserved.
