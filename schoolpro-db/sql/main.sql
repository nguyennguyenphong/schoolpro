-- ===========================================================================
-- SCHOOLPRO ENTERPRISE - UNIFIED DATABASE SCHEMA & SEED SCRIPT
-- Generated from all modular SQL definitions in strict topological order
-- Database: PostgreSQL 16+ (Schemas: master, core, academic, emulation,
--                           evaluation, notification, sys)
-- Total modular source files: 91
-- ===========================================================================

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;


-- ===========================================================================
-- STEP 1: INITIALIZING SCHEMAS & EXTENSIONS
-- Description: 1. Schemas & Extensions
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 00_schemas.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- 00. SCHEMAS, EXTENSIONS & ENUMS SETUP
-- SchoolPro 360 Education Management System
-- =====================================================================

-- Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- Provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- Trigram fuzzy text search (Vietnamese full name search)
CREATE EXTENSION IF NOT EXISTS btree_gist; -- Non-overlapping temporal range constraints

-- System Schemas
CREATE SCHEMA IF NOT EXISTS core;         -- Core organizational units, users, roles, dynamic lookups
CREATE SCHEMA IF NOT EXISTS academic;     -- Academic operations: timetables, courses, materials, exams, grades (TT22)
CREATE SCHEMA IF NOT EXISTS emulation;    -- Multi-level 360 emulation: criteria, records, weekly rankings
CREATE SCHEMA IF NOT EXISTS evaluation;   -- Teacher evaluations (anonymous) and facility issue reporting
CREATE SCHEMA IF NOT EXISTS notification; -- Multi-channel announcements, personal study reminders, push tokens
CREATE SCHEMA IF NOT EXISTS sys;          -- Dynamic role card dashboard, 4-tier resolved settings, audit logs, outbox

-- Schema Comments
COMMENT ON SCHEMA core IS 'Core infrastructure: users, dynamic roles, organizational hierarchy, master lookups';
COMMENT ON SCHEMA academic IS 'Academic operations: timetable, class journal, syllabus materials, exams, gradebook';
COMMENT ON SCHEMA emulation IS 'Multi-tier emulation: school/grade/class criteria, violation tracking, ranking';
COMMENT ON SCHEMA evaluation IS 'Quality surveys, anonymous teacher reviews, and school facility monitoring';
COMMENT ON SCHEMA notification IS 'Omnichannel announcements and student task reminders';
COMMENT ON SCHEMA sys IS 'Dynamic dashboard card system, 4-tier user settings, audit trail, and event outbox';

-- Polymorphic Scope Enumeration for Positions and Emulation
CREATE TYPE core.scope_type_enum AS ENUM ('SCHOOL', 'GRADE', 'CLASS', 'GROUP', 'DEPARTMENT', 'INDIVIDUAL');
COMMENT ON TYPE core.scope_type_enum IS 'Hierarchy scope: School-wide, Grade level, Class, Class group, Subject department, or Individual user';


-- ===========================================================================
-- STEP 2: INITIALIZING FUNCTIONS
-- Description: 2. Database Functions
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 01_functions/functions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- DATABASE FUNCTIONS
-- SchoolPro 360 Education Management System
-- =====================================================================

-- Automatically updates updated_at timestamp column on row modification
CREATE OR REPLACE FUNCTION core.fn_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION core.fn_set_updated_at() IS 'Trigger function to automatically maintain updated_at timestamps across all operational tables';


-- ===========================================================================
-- STEP 3: INITIALIZING MASTER DATA TABLES
-- Description: 3. Master Data Tables (Classification Catalogs)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_lookup_types.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.lookup_types (Master Data)
-- Dynamic lookup catalog definitions avoiding rigid physical ENUMs
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.lookup_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'GENDER', 'ACCOUNT_STATUS', 'ROOM_TYPE', 'CLASS_STREAM'
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT TRUE,     -- System categories cannot be deleted by users
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.lookup_types IS 'Master definition table for dynamic extensible enum categories';
COMMENT ON COLUMN core.lookup_types.code IS 'Unique alphanumeric code for lookup category';
COMMENT ON COLUMN core.lookup_types.is_system IS 'Protection flag preventing accidental removal of core system categories';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_lookup_values.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.lookup_values (Master Data)
-- Dynamic lookup items associated with lookup_types
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.lookup_values (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookup_type_id UUID NOT NULL REFERENCES core.lookup_types(id) ON DELETE CASCADE,
  code           VARCHAR(60) NOT NULL,           -- E.g. 'MALE', 'FEMALE', 'KHTN', 'KHXH'
  name           VARCHAR(150) NOT NULL,          -- Display text in Vietnamese/English
  order_no       SMALLINT NOT NULL DEFAULT 0,
  badge_color    VARCHAR(30),                    -- Hex/CSS badge color for UI rendering
  icon           VARCHAR(50),
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  metadata       JSONB DEFAULT '{}'::jsonb,      -- Custom extension properties
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lookup_type_id, code)
);

CREATE INDEX IF NOT EXISTS ix_lookups_type_code ON core.lookup_values(lookup_type_id, code);

COMMENT ON TABLE core.lookup_values IS 'Master dynamic values for lookup dropdowns, badges, and validation rules';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_schools.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.schools (Master Data)
-- School institutions and campus headquarters
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.schools (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'THPT_LEQUYDON'
  name               VARCHAR(255) NOT NULL,             -- E.g. 'Trường THPT Lê Quý Đôn'
  educational_stage  VARCHAR(30) NOT NULL DEFAULT 'HIGH_SCHOOL', -- High school (Cấp 3)
  established_year   SMALLINT,
  address            TEXT,
  province_code      VARCHAR(20),
  district_code      VARCHAR(20),
  phone              VARCHAR(20),
  email              VARCHAR(255),
  website            VARCHAR(255),
  logo_url           TEXT,
  principal_name     VARCHAR(255),
  metadata           JSONB DEFAULT '{}'::jsonb,         -- Accreditation info, stamp, digital signatures
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.schools IS 'Master high school campus profile, administrative metadata, and contacts';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_academic_years.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.academic_years (Master Data)
-- School academic fiscal and educational years
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.academic_years (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code          VARCHAR(20) NOT NULL,              -- E.g. '2026-2027'
  name          VARCHAR(100) NOT NULL,             -- E.g. 'Năm học 2026 - 2027'
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_current    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code),
  CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_academic_years_current
  ON core.academic_years (school_id)
  WHERE is_current = TRUE;

COMMENT ON TABLE core.academic_years IS 'Master academic school years with active term indicators';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_semesters.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.semesters (Master Data)
-- School semesters / academic terms within an academic year
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.semesters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id  UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  code              VARCHAR(20) NOT NULL,          -- E.g. 'HK1', 'HK2', 'HE'
  name              VARCHAR(100) NOT NULL,         -- E.g. 'Học kỳ 1', 'Học kỳ 2'
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  is_current        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, code),
  CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_semesters_current
  ON core.semesters (academic_year_id)
  WHERE is_current = TRUE;

COMMENT ON TABLE core.semesters IS 'Master academic semesters (Term 1, Term 2, Summer) with date boundaries';


-- ===========================================================================
-- STEP 4: INITIALIZING CORE IDENTITY & ORGANIZATIONAL TABLES
-- Description: 4. Core Infrastructure Tables
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_custom_field_definitions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.custom_field_definitions
-- Extensible EAV schema definitions for runtime attribute extensions
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.custom_field_definitions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type    VARCHAR(50) NOT NULL,           -- E.g. 'STUDENT', 'TEACHER', 'CLASS', 'EXAM'
  field_code     VARCHAR(60) NOT NULL,           -- E.g. 'vneid_level2', 'laptop_serial'
  field_label    VARCHAR(150) NOT NULL,          -- Vietnamese/English display label
  data_type      VARCHAR(30) NOT NULL
                   CHECK (data_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'MULTI_SELECT', 'JSON')),
  options        JSONB,                          -- Optional list of choices for SELECT: ["Yes", "No"]
  is_required    BOOLEAN NOT NULL DEFAULT FALSE,
  default_value  TEXT,
  display_order  SMALLINT DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, field_code)
);

COMMENT ON TABLE core.custom_field_definitions IS 'Registry for dynamic entity custom fields without altering relational table schemas';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_custom_field_values.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.custom_field_values
-- Runtime custom attribute storage per entity instance
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.custom_field_values (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id       UUID NOT NULL REFERENCES core.custom_field_definitions(id) ON DELETE CASCADE,
  entity_id      UUID NOT NULL,                  -- Target entity ID (user_id, class_id, exam_id)
  field_value    TEXT,
  json_value     JSONB,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (field_id, entity_id)
);

CREATE INDEX IF NOT EXISTS ix_custom_fields_entity ON core.custom_field_values(entity_id);

COMMENT ON TABLE core.custom_field_values IS 'Values stored for custom dynamic attributes per individual entity record';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_users.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.users
-- Central identity directory for students, teachers, supervisors, and staff
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            UUID REFERENCES core.schools(id) ON DELETE SET NULL,
  username             VARCHAR(100) NOT NULL UNIQUE,
  email                VARCHAR(255) UNIQUE,
  phone                VARCHAR(20),
  password_hash        TEXT NOT NULL,
  full_name            VARCHAR(255) NOT NULL,
  date_of_birth        DATE,
  gender_code          VARCHAR(20) DEFAULT 'MALE',   -- References core.lookup_values ('GENDER')
  national_id          VARCHAR(30),                  -- Citizen identification number / VNeID
  avatar_url           TEXT,
  address              TEXT,
  status_code          VARCHAR(20) DEFAULT 'ACTIVE', -- References core.lookup_values ('ACCOUNT_STATUS')
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_at            TIMESTAMPTZ,
  locked_until         TIMESTAMPTZ,
  lock_reason          VARCHAR(255),
  password_changed_at  TIMESTAMPTZ,
  email_verified_at    TIMESTAMPTZ,
  phone_verified_at    TIMESTAMPTZ,
  is_2fa_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret    VARCHAR(255),
  last_login_at        TIMESTAMPTZ,
  last_login_ip        VARCHAR(45),
  metadata             JSONB DEFAULT '{}'::jsonb,    -- Flexible JSON payload without DDL locks
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_full_name_trgm ON core.users USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_users_school ON core.users(school_id);

COMMENT ON TABLE core.users IS 'Unified identity authentication and personal profile table';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_roles.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.roles
-- Dynamic RBAC security roles with UI custom badges
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(50) NOT NULL UNIQUE,       -- E.g. 'STUDENT', 'TEACHER', 'SUPERVISOR', 'PRINCIPAL'
  name          VARCHAR(150) NOT NULL,             -- E.g. 'Học sinh', 'Giáo viên', 'Giám thị', 'Hiệu trưởng'
  description   TEXT,
  badge_color   VARCHAR(30) DEFAULT '#2563EB',
  icon          VARCHAR(50) DEFAULT 'user',
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.roles IS 'Dynamic role definitions allowing new administrative or student roles at any time';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_permissions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.permissions
-- Granular security operation codes
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(100) NOT NULL UNIQUE,      -- E.g. 'TIMETABLE_VIEW', 'GRADE_EDIT'
  name          VARCHAR(255) NOT NULL,
  group_code    VARCHAR(50) NOT NULL,              -- E.g. 'ACADEMIC', 'EMULATION', 'EVALUATION', 'SYSTEM'
  description   TEXT
);

COMMENT ON TABLE core.permissions IS 'Atomic permission privileges for endpoint and UI access control';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_role_permissions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.role_permissions
-- Mapping between roles and their granted permissions
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.role_permissions (
  role_id       UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE core.role_permissions IS 'Many-to-many junction assigning permissions to security roles';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_user_roles.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.user_roles
-- User role memberships with primary role and validity intervals
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.user_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,   -- Default active role upon sign-in
  effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to    DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS ix_user_roles_user ON core.user_roles(user_id);
CREATE INDEX IF NOT EXISTS ix_user_roles_role ON core.user_roles(role_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_roles_primary
  ON core.user_roles(user_id) WHERE is_primary = TRUE AND status = 'ACTIVE';

COMMENT ON TABLE core.user_roles IS 'User-to-role assignment with primary role flag and expiration dates';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_departments.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.departments (Master Data)
-- Subject departments, school board, youth union, and administrative offices
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.departments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id          UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code               VARCHAR(30) NOT NULL,         -- E.g. 'TO_TOAN_TIN', 'BAN_GIAM_THI', 'DOAN_TRUONG'
  name               VARCHAR(150) NOT NULL,        -- E.g. 'Tổ Toán - Tin học', 'Tổ Ngữ văn'
  department_type    VARCHAR(30) NOT NULL DEFAULT 'SUBJECT'
                       CHECK (department_type IN ('SUBJECT', 'ADMINISTRATION', 'UNION', 'BOARD')),
  leader_teacher_id  UUID REFERENCES core.users(id) ON DELETE SET NULL,
  vice_leader_id     UUID REFERENCES core.users(id) ON DELETE SET NULL,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

COMMENT ON TABLE core.departments IS 'Master educational subject departments and administrative divisions';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_grades.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.grades (Master Data)
-- High school grade levels (Grade 10, Grade 11, Grade 12)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.grades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code          VARCHAR(10) NOT NULL,              -- E.g. '10', '11', '12'
  name          VARCHAR(50) NOT NULL,              -- E.g. 'Khối 10', 'Khối 11', 'Khối 12'
  order_no      SMALLINT NOT NULL DEFAULT 0,
  supervisor_id UUID,                              -- Will reference core.users(id) once created
  UNIQUE (school_id, code)
);

COMMENT ON TABLE core.grades IS 'Master high school grade tiers (Grade 10, 11, 12) and assigned grade supervisor';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_classes.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.classes
-- School classes for each academic year (e.g. 10A1, 11B2, 12A1)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.classes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  grade_id            UUID NOT NULL REFERENCES core.grades(id),
  code                VARCHAR(20) NOT NULL,        -- E.g. '10A1'
  name                VARCHAR(100) NOT NULL,       -- E.g. 'Lớp 10A1'
  room_name           VARCHAR(50),                 -- Assigned permanent classroom
  class_stream_code   VARCHAR(30) DEFAULT 'KHTN',  -- Natural Sciences vs Social Sciences ('CLASS_STREAM')
  max_students        SMALLINT DEFAULT 45,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  metadata            JSONB DEFAULT '{}'::jsonb,   -- Subject track configuration per GDPT 2018
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_classes_grade ON core.classes(grade_id);

COMMENT ON TABLE core.classes IS 'Annual high school class rooms grouped by grade level and academic track';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_class_groups.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.class_groups
-- Internal study and labor groups within a class (e.g. Group 1, 2, 3, 4)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.class_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  code          VARCHAR(20) NOT NULL,             -- E.g. 'TO_1', 'TO_2'
  name          VARCHAR(100) NOT NULL,            -- E.g. 'Tổ 1', 'Tổ 2'
  order_no      SMALLINT DEFAULT 1,
  UNIQUE (class_id, code)
);

COMMENT ON TABLE core.class_groups IS 'Class internal squads/teams (Tổ học tập & trực nhật) for granular emulation';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_positions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.positions (Master Data)
-- Organizational position titles across school, classes, and groups
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.positions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'HOMEROOM_TEACHER', 'CLASS_MONITOR'
  name          VARCHAR(150) NOT NULL,             -- E.g. 'Giáo viên chủ nhiệm', 'Lớp trưởng'
  scope_type    core.scope_type_enum NOT NULL,     -- 'CLASS', 'GROUP', 'GRADE', 'SCHOOL', 'DEPARTMENT'
  applicable_role_id UUID REFERENCES core.roles(id) ON DELETE SET NULL,
  max_holders   SMALLINT,                          -- E.g. Homeroom teacher = 1, Class monitor = 1
  is_leadership BOOLEAN NOT NULL DEFAULT FALSE,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE core.positions IS 'Master catalog of positions held by teachers, staff, or students across organizational scopes';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_position_assignments.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.position_assignments
-- Historical and active position assignment across any organizational scope
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.position_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  position_id       UUID NOT NULL REFERENCES core.positions(id),
  academic_year_id  UUID NOT NULL REFERENCES core.academic_years(id),
  scope_type        core.scope_type_enum NOT NULL,
  school_id         UUID REFERENCES core.schools(id),
  grade_id          UUID REFERENCES core.grades(id),
  class_id          UUID REFERENCES core.classes(id),
  class_group_id    UUID REFERENCES core.class_groups(id),
  department_id     UUID REFERENCES core.departments(id),
  start_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date          DATE,
  is_current        BOOLEAN NOT NULL DEFAULT TRUE,
  note              TEXT,
  created_by        UUID REFERENCES core.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date),
  CHECK (
    (scope_type = 'SCHOOL'     AND school_id IS NOT NULL      AND grade_id IS NULL AND class_id IS NULL AND class_group_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'GRADE'      AND grade_id IS NOT NULL       AND school_id IS NULL AND class_id IS NULL AND class_group_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'CLASS'      AND class_id IS NOT NULL       AND school_id IS NULL AND grade_id IS NULL AND class_group_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'GROUP'      AND class_group_id IS NOT NULL AND school_id IS NULL AND grade_id IS NULL AND class_id IS NULL AND department_id IS NULL) OR
    (scope_type = 'DEPARTMENT' AND department_id IS NOT NULL  AND school_id IS NULL AND grade_id IS NULL AND class_id IS NULL AND class_group_id IS NULL) OR
    (scope_type = 'INDIVIDUAL' AND school_id IS NULL AND grade_id IS NULL AND class_id IS NULL AND class_group_id IS NULL AND department_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_pos_assign_user ON core.position_assignments(user_id);
CREATE INDEX IF NOT EXISTS ix_pos_assign_class ON core.position_assignments(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_pos_assign_group ON core.position_assignments(class_group_id) WHERE class_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_pos_assign_active ON core.position_assignments(position_id, class_id, is_current) WHERE is_current = TRUE;

COMMENT ON TABLE core.position_assignments IS 'Temporal polymorphic history of positions held by users in classes, groups, departments, or grades';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_students.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.students
-- Extended student profile linked with user credentials
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  student_code    VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'HS20261001'
  admission_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  graduation_date DATE,
  ethnicity       VARCHAR(50) DEFAULT 'Kinh',
  religion        VARCHAR(50) DEFAULT 'Không',
  status          VARCHAR(20) NOT NULL DEFAULT 'STUDYING'
                    CHECK (status IN ('STUDYING', 'GRADUATED', 'TRANSFERRED_OUT', 'RESERVED', 'DROPPED_OUT', 'SUSPENDED')),
  current_class_id UUID REFERENCES core.classes(id) ON DELETE SET NULL,
  birth_place     VARCHAR(100),                      -- Place of birth per MOET standard
  is_boarder      BOOLEAN NOT NULL DEFAULT FALSE,    -- Boarding / day-boarding flag
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.students IS 'Comprehensive student educational lifecycle dossier';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_student_health_records.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.student_health_records
-- Student medical profile, BMI indicators, allergies, and vision exams
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.student_health_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  height_cm       NUMERIC(5,2),
  weight_kg       NUMERIC(5,2),
  blood_type      VARCHAR(10),
  allergies       TEXT,
  chronic_illness TEXT,
  vision_left     VARCHAR(10),
  vision_right    VARCHAR(10),
  insurance_code  VARCHAR(50),
  last_checkup_at DATE,
  notes           TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.student_health_records IS 'Campus medical clinic records and physical growth tracking per student';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_guardians.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.guardians
-- Student parents, legal guardians, and parent committee representatives
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.guardians (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Optional portal account
  full_name           VARCHAR(255) NOT NULL,
  relationship        VARCHAR(50) NOT NULL,           -- E.g. 'Cha', 'Mẹ', 'Người giám hộ'
  phone               VARCHAR(20) NOT NULL,
  email               VARCHAR(255),
  job                 VARCHAR(150),
  is_primary_contact  BOOLEAN NOT NULL DEFAULT FALSE,
  is_parent_committee BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE core.guardians IS 'Parent and guardian directory for home-school omnichannel communications';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_teachers.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.teachers
-- Faculty members, pedagogical specializations, and departmental ties
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.teachers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  teacher_code    VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'GV202601'
  department_id   UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  qualification   VARCHAR(100) DEFAULT 'Cử nhân Sư phạm',
  subject_major   VARCHAR(150) NOT NULL,             -- Primary subject major
  hire_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'MATERNITY_LEAVE', 'RETIRED', 'RESIGNED')),
  is_homeroom     BOOLEAN NOT NULL DEFAULT FALSE,    -- Flag indicating active homeroom teacher
  employment_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME'
                    CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'PROBATION', 'CONTRACT', 'VISITING')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.teachers IS 'Academic teaching staff profiles and department assignments';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_staff.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.staff
-- Administrative personnel, supervisors, librarians, accountants, and nurses
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES core.users(id) ON DELETE CASCADE,
  staff_code      VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'NV202601'
  department_id   UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  job_title       VARCHAR(150) NOT NULL,             -- E.g. 'Giám thị', 'Y tế học đường', 'Kế toán'
  hire_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'RESIGNED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.staff IS 'Non-teaching administrative staff, supervisors, and auxiliary professionals';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_student_class_enrollments.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.student_class_enrollments
-- Class roster enrollments linking students to classes and study groups
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.student_class_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  class_group_id  UUID REFERENCES core.class_groups(id) ON DELETE SET NULL, -- Assigned study squad
  enroll_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  leave_date      DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'COMPLETED')),
  UNIQUE (student_id, class_id)
);

CREATE INDEX IF NOT EXISTS ix_enroll_class ON core.student_class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS ix_enroll_group ON core.student_class_enrollments(class_group_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_enroll_active_per_student
  ON core.student_class_enrollments(student_id) WHERE status = 'ACTIVE';

COMMENT ON TABLE core.student_class_enrollments IS 'Annual official class roster memberships and internal squad placements';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_subjects.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.subjects (Master Data)
-- Subjects taught according to national curriculum standard (GDPT 2018)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.subjects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  code            VARCHAR(20) NOT NULL,              -- E.g. 'TOAN', 'VAN', 'ANH', 'VAT_LY'
  name            VARCHAR(150) NOT NULL,             -- E.g. 'Toán học', 'Ngữ văn'
  grade_level     SMALLINT CHECK (grade_level IN (10, 11, 12)),
  evaluation_type VARCHAR(20) NOT NULL DEFAULT 'SCORE'
                    CHECK (evaluation_type IN ('SCORE', 'COMMENT')), -- Numeric score or pass/fail qualitative
  is_compulsory   BOOLEAN NOT NULL DEFAULT TRUE,     -- Compulsory vs elective subject track
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB DEFAULT '{}'::jsonb,         -- Periods per year, subject stream, curriculum codes
  UNIQUE (school_id, code)
);

COMMENT ON TABLE core.subjects IS 'Master subjects directory aligned with Vietnamese high school curriculum (GDPT 2018)';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_class_subject_teachers.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.class_subject_teachers
-- Teaching assignments mapping teachers to subjects per class and semester
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.class_subject_teachers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  teacher_id        UUID NOT NULL REFERENCES core.teachers(id) ON DELETE CASCADE,
  semester_id       UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  periods_per_week  SMALLINT NOT NULL DEFAULT 3,     -- Weekly teaching workload
  notes             TEXT,
  UNIQUE (class_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_cst_teacher ON core.class_subject_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS ix_cst_class ON core.class_subject_teachers(class_id);

COMMENT ON TABLE core.class_subject_teachers IS 'Semester teaching assignments linking teachers to specific subject classes';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_clubs.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.clubs
-- Student clubs, artistic ensembles, and academic societies
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.clubs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code                  VARCHAR(50) NOT NULL UNIQUE,       -- E.g. 'CLUB_ROBOTICS', 'CLUB_ENGLISH'
  name                  VARCHAR(150) NOT NULL,
  category              VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC'
                          CHECK (category IN ('ACADEMIC', 'SPORTS', 'ARTS', 'COMMUNITY', 'CAREER_SKILLS')),
  advisor_teacher_id    UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  president_student_id  UUID REFERENCES core.students(id) ON DELETE SET NULL,
  description           TEXT,
  logo_url              TEXT,
  established_date      DATE DEFAULT CURRENT_DATE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_clubs_school ON core.clubs(school_id);

COMMENT ON TABLE core.clubs IS 'Extracurricular student clubs, sports teams, and volunteer societies';

-- ---------------------------------------------------------------------------
-- File: 02_tables/core/core_club_members.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: core.club_members
-- Student club enrollments, executive boards, and activity rosters
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.club_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id           UUID NOT NULL REFERENCES core.clubs(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  role_title        VARCHAR(50) NOT NULL DEFAULT 'MEMBER'
                      CHECK (role_title IN ('PRESIDENT', 'VICE_PRESIDENT', 'TREASURER', 'HEAD_OF_COMMITTEE', 'MEMBER')),
  joined_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'INACTIVE', 'ALUMNI')),
  contribution_notes TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_club_members_club ON core.club_members(club_id);
CREATE INDEX IF NOT EXISTS ix_club_members_student ON core.club_members(student_id);

COMMENT ON TABLE core.club_members IS 'Roster of student club participants, leaders, and executive positions';


-- ===========================================================================
-- STEP 5: INITIALIZING ACADEMIC OPERATIONS TABLES
-- Description: 5. Academic Operations Tables
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_rooms.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.rooms (Master Data)
-- School physical rooms, science labs, libraries, and sports halls
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code          VARCHAR(30) NOT NULL,              -- E.g. 'P_A101', 'LAB_LY', 'TIN_01'
  name          VARCHAR(100) NOT NULL,             -- E.g. 'Phòng học 101 - Dãy A'
  room_type     VARCHAR(30) NOT NULL DEFAULT 'CLASSROOM'
                  CHECK (room_type IN ('CLASSROOM', 'LAB', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_ROOM', 'CANTEEN', 'HEALTH_ROOM')),
  capacity      SMALLINT DEFAULT 45,
  building      VARCHAR(100),
  floor         SMALLINT,
  status        VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                  CHECK (status IN ('AVAILABLE', 'UNDER_MAINTENANCE', 'UNAVAILABLE')),
  UNIQUE (school_id, code)
);

COMMENT ON TABLE academic.rooms IS 'Master physical spaces, classrooms, laboratories, and specialized facilities';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_periods.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.periods (Master Data)
-- High school period bell schedules (Periods 1 to 10, Morning & Afternoon)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  period_no     SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 12),
  shift         VARCHAR(10) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON', 'EVENING')),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  UNIQUE (school_id, period_no, shift)
);

COMMENT ON TABLE academic.periods IS 'Master daily bell schedule periods and shift time intervals for high school';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_timetables.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.timetables
-- Master weekly schedule matrix mapping classes, periods, and rooms
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.timetables (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id                 UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  semester_id              UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  day_of_week              SMALLINT NOT NULL CHECK (day_of_week BETWEEN 2 AND 8), -- 2 = Monday, ..., 8 = Sunday
  period_id                UUID NOT NULL REFERENCES academic.periods(id),
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  room_id                  UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  class_type               VARCHAR(20) NOT NULL DEFAULT 'THEORY' CHECK (class_type IN ('THEORY', 'PRACTICE', 'SEMINAR', 'EXAM')),
  is_online                BOOLEAN NOT NULL DEFAULT FALSE,
  online_url               VARCHAR(500),
  lesson_topic             VARCHAR(255),
  notes                    TEXT,
  color_theme              VARCHAR(30) DEFAULT 'blue',
  effective_from           DATE NOT NULL,
  effective_to             DATE,
  UNIQUE (class_id, semester_id, day_of_week, period_id, effective_from)
);

CREATE INDEX IF NOT EXISTS ix_tkb_class ON academic.timetables(class_id);
CREATE INDEX IF NOT EXISTS ix_tkb_cst ON academic.timetables(class_subject_teacher_id);
CREATE INDEX IF NOT EXISTS ix_tkb_period ON academic.timetables(period_id);
CREATE INDEX IF NOT EXISTS ix_tkb_day ON academic.timetables(day_of_week);

COMMENT ON TABLE academic.timetables IS 'Weekly recurring timetable schedule slots by class, day of week, period, and venue';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_timetable_changes.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.timetable_changes
-- Ad-hoc schedule adjustments (substitute teachers, room relocations)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.timetable_changes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id    UUID NOT NULL REFERENCES academic.timetables(id) ON DELETE CASCADE,
  change_date     DATE NOT NULL,
  change_type     VARCHAR(20) NOT NULL
                    CHECK (change_type IN ('SUBSTITUTE_TEACHER', 'ROOM_CHANGE', 'CANCELLED', 'MAKE_UP_CLASS')),
  new_teacher_id  UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  new_room_id     UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  reason          TEXT,
  approved_by     UUID REFERENCES core.users(id) ON DELETE SET NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (timetable_id, change_date)
);

COMMENT ON TABLE academic.timetable_changes IS 'Daily operational substitutions and room change logs';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_class_journal_entries.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.class_journal_entries
-- Electronic class register / lesson diary (Sổ đầu bài điện tử)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.class_journal_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  session_date      DATE NOT NULL,
  period_no         SMALLINT NOT NULL,
  lesson_title      VARCHAR(255) NOT NULL,
  present_count     SMALLINT NOT NULL,
  absent_count      SMALLINT NOT NULL DEFAULT 0,
  absent_names      TEXT,
  lesson_rating     VARCHAR(5) NOT NULL DEFAULT 'A'
                      CHECK (lesson_rating IN ('A', 'B', 'C', 'D')), -- Grade A (Good), B, C, D
  teacher_feedback  TEXT,
  teacher_signature_time TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_journal_class_date ON academic.class_journal_entries(class_id, session_date);

COMMENT ON TABLE academic.class_journal_entries IS 'Official electronic class journal recording syllabus progress, attendance, and period rating';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_curriculum_materials.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.curriculum_materials
-- Syllabus documents, slide decks, reference books, and lecture videos
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  subject_id      UUID NOT NULL REFERENCES core.subjects(id),
  title           VARCHAR(255) NOT NULL,
  chapter_name    VARCHAR(150),
  description     TEXT,
  material_type   VARCHAR(20) NOT NULL DEFAULT 'DOCUMENT'
                    CHECK (material_type IN ('DOCUMENT', 'VIDEO', 'LINK', 'SLIDE', 'EXAM_PREP', 'SAMPLE_EXERCISE')),
  target_grade_id UUID REFERENCES core.grades(id) ON DELETE SET NULL,
  is_shared_all_classes BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID NOT NULL REFERENCES core.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.curriculum_materials IS 'Online learning resources, slides, and syllabus documents';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_material_attachments.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.material_attachments
-- Physical files and download trackers associated with curriculum materials
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.material_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES academic.curriculum_materials(id) ON DELETE CASCADE,
  file_name       VARCHAR(255) NOT NULL,
  file_url        TEXT NOT NULL,
  file_type       VARCHAR(50),
  file_size_bytes BIGINT,
  download_count  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.material_attachments IS 'Binary attachment references (PDF, DOCX, MP4) for materials';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_assignments.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.assignments
-- Homework tasks, projects, essays, and exam revision exercises
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  assignment_type VARCHAR(20) NOT NULL DEFAULT 'HOMEWORK'
                    CHECK (assignment_type IN ('HOMEWORK', 'PROJECT', 'ESSAY', 'REVISION')),
  assigned_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        TIMESTAMPTZ NOT NULL,
  max_score       NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  attachments     JSONB,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES core.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.assignments IS 'Homework tasks and group projects assigned by subject teachers';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_assignment_submissions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.assignment_submissions
-- Student homework turn-ins, attachments, scores, and teacher comments
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignment_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES academic.assignments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  submitted_at    TIMESTAMPTZ,
  content_text    TEXT,
  attachments     JSONB,
  score           NUMERIC(4,2) CHECK (score >= 0 AND score <= 10),
  feedback        TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED')),
  graded_by       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at       TIMESTAMPTZ,
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_submissions_student ON academic.assignment_submissions(student_id);

COMMENT ON TABLE academic.assignment_submissions IS 'Student homework answers, uploaded files, and graded feedback';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_curriculum_tracks.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.curriculum_tracks
-- High school academic tracks and subject combinations (GDPT 2018)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_tracks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  grade_id            UUID NOT NULL REFERENCES core.grades(id) ON DELETE CASCADE,
  code                VARCHAR(50) NOT NULL,               -- E.g. 'TRACK_KHTN_A00', 'TRACK_KHXH_D01'
  name                VARCHAR(255) NOT NULL,              -- E.g. 'Ban Khoa học Tự nhiên A00 (Toán-Lý-Hóa-Tin)'
  career_orientation  VARCHAR(100),                       -- E.g. 'Kỹ thuật - Công nghệ - Y Dược'
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, grade_id, code)
);

CREATE INDEX IF NOT EXISTS ix_tracks_school_grade ON academic.curriculum_tracks(school_id, grade_id);

COMMENT ON TABLE academic.curriculum_tracks IS 'Elective subject tracks and career orientation clusters under GDPT 2018 curriculum';
COMMENT ON COLUMN academic.curriculum_tracks.code IS 'Unique code for academic track within school and grade';
COMMENT ON COLUMN academic.curriculum_tracks.career_orientation IS 'Target university entrance cluster or professional domain';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_curriculum_track_subjects.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.curriculum_track_subjects
-- Mapping of elective subjects and study modules to curriculum tracks
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_track_subjects (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id                UUID NOT NULL REFERENCES academic.curriculum_tracks(id) ON DELETE CASCADE,
  subject_id              UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  is_track_core           BOOLEAN NOT NULL DEFAULT TRUE,     -- TRUE = core elective of track, FALSE = optional module
  credit_periods_per_year SMALLINT NOT NULL DEFAULT 70,       -- Typical MOET periods per school year
  study_cluster_topic     VARCHAR(150),                       -- Special study topic (Chuyên đề học tập lựa chọn)
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (track_id, subject_id)
);

CREATE INDEX IF NOT EXISTS ix_track_subjects_track ON academic.curriculum_track_subjects(track_id);

COMMENT ON TABLE academic.curriculum_track_subjects IS 'Subject composition and specialized learning clusters per academic track';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_student_track_enrollments.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.student_track_enrollments
-- Individual student academic track registration per school year
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_track_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  track_id          UUID NOT NULL REFERENCES academic.curriculum_tracks(id) ON DELETE CASCADE,
  academic_year_id  UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  enrolled_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'CHANGED', 'DROPPED')),
  change_reason     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS ix_student_track_student ON academic.student_track_enrollments(student_id);
CREATE INDEX IF NOT EXISTS ix_student_track_track ON academic.student_track_enrollments(track_id);

COMMENT ON TABLE academic.student_track_enrollments IS 'Annual student subject combination and career track assignment';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_question_bank.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.question_bank
-- Question repository supporting LaTeX, rich text, and multiple formats
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.question_bank (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id            UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  grade_id              UUID NOT NULL REFERENCES core.grades(id) ON DELETE CASCADE,
  chapter_name          VARCHAR(150),
  difficulty_level      VARCHAR(30) NOT NULL DEFAULT 'RECOGNITION'
                          CHECK (difficulty_level IN ('RECOGNITION', 'COMPREHENSION', 'APPLICATION', 'HIGH_APPLICATION')),
  question_type         VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE'
                          CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY')),
  content               TEXT NOT NULL,                    -- Markdown or LaTeX supported problem statement
  options               JSONB,                            -- Array of answer choices: [{"key":"A","text":"..."}, ...]
  correct_answers       JSONB NOT NULL,                   -- Keys of correct answers: ["A"] or specific text for fill-in
  solution_explanation  TEXT,                             -- Detailed step-by-step solution
  default_score         NUMERIC(4,2) NOT NULL DEFAULT 0.25,
  author_id             UUID REFERENCES core.users(id) ON DELETE SET NULL,
  is_shared             BOOLEAN NOT NULL DEFAULT TRUE,    -- Shared across all teachers in subject department
  tags                  TEXT[],                           -- Knowledge tags: e.g. ARRAY['Hàm số', 'Cực trị', 'GDPT2018']
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_question_bank_subject_grade ON academic.question_bank(subject_id, grade_id);
CREATE INDEX IF NOT EXISTS ix_question_bank_difficulty ON academic.question_bank(difficulty_level);

COMMENT ON TABLE academic.question_bank IS 'Centralized educational question repository categorized by Bloom cognitive taxonomy';
COMMENT ON COLUMN academic.question_bank.difficulty_level IS 'Taxonomy levels: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_score_types.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.score_types (Master Data)
-- Assessment weightings and score types (Circular 22/2021/TT-BGDĐT)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.score_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(30) NOT NULL UNIQUE,     -- E.g. 'DDG_TX_MIENG', 'DDG_TX_15P', 'DDG_GK', 'DDG_CK'
  name            VARCHAR(100) NOT NULL,
  coefficient     SMALLINT NOT NULL DEFAULT 1,     -- Regular=1, Mid-term=2, Final=3
  min_evaluations SMALLINT DEFAULT 4,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE academic.score_types IS 'Master evaluation score columns and calculation coefficients per MOET Circular 22';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_exams.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.exams
-- Scheduled examination sittings, test slots, and room allocations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  score_type_id   UUID NOT NULL REFERENCES academic.score_types(id),
  title           VARCHAR(255) NOT NULL,
  exam_date       DATE NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 45,
  max_score       NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  room_id         UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  description     TEXT,
  created_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.exams IS 'Formal examination events (15-min tests, mid-term, final term exams)';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_exam_questions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.exam_questions
-- Composition of questions within an examination paper
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id           UUID NOT NULL REFERENCES academic.exams(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES academic.question_bank(id) ON DELETE CASCADE,
  order_no          SMALLINT NOT NULL,                    -- Question sequence in exam paper (1, 2, 3...)
  score_weight      NUMERIC(4,2) NOT NULL DEFAULT 0.25,   -- Allocated score for this specific question
  paper_code        VARCHAR(20) DEFAULT 'STANDARD',       -- Paper version/variant code (e.g. '101', '102', '103')
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, paper_code, order_no)
);

CREATE INDEX IF NOT EXISTS ix_exam_questions_exam ON academic.exam_questions(exam_id);

COMMENT ON TABLE academic.exam_questions IS 'Examination paper structure linking tests to question repository items';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_exam_submissions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.exam_submissions
-- Student online test attempts, durations, and aggregate scores
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id           UUID NOT NULL REFERENCES academic.exams(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  paper_code        VARCHAR(20) DEFAULT 'STANDARD',
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at      TIMESTAMPTZ,
  auto_score        NUMERIC(4,2) DEFAULT 0.00,            -- Automatically calculated multiple-choice score
  manual_score      NUMERIC(4,2) DEFAULT 0.00,            -- Teacher-graded essay/writing score
  total_score       NUMERIC(4,2) DEFAULT 0.00,
  status            VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                      CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'LATE', 'ABANDONED')),
  teacher_feedback  TEXT,
  graded_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_exam_sub_student ON academic.exam_submissions(student_id);
CREATE INDEX IF NOT EXISTS ix_exam_sub_exam ON academic.exam_submissions(exam_id);

COMMENT ON TABLE academic.exam_submissions IS 'Student examination attempts and final test grading status';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_exam_submission_answers.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.exam_submission_answers
-- Itemized student responses, auto-validation, and grader annotations
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.exam_submission_answers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id     UUID NOT NULL REFERENCES academic.exam_submissions(id) ON DELETE CASCADE,
  exam_question_id  UUID NOT NULL REFERENCES academic.exam_questions(id) ON DELETE CASCADE,
  selected_answers  JSONB,                                -- Array of selected option keys (e.g. ["A", "C"])
  text_response     TEXT,                                 -- Essay / free-form text entered by student
  is_correct        BOOLEAN,                              -- Nullable for manual grading
  awarded_score     NUMERIC(4,2) DEFAULT 0.00,
  teacher_note      TEXT,
  graded_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, exam_question_id)
);

CREATE INDEX IF NOT EXISTS ix_exam_sub_ans_submission ON academic.exam_submission_answers(submission_id);

COMMENT ON TABLE academic.exam_submission_answers IS 'Individual question answers submitted by students with evaluation results';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_student_scores.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.student_scores
-- Atomic student grades and qualitative evaluations (Circular 22/2021)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  score_type_id   UUID NOT NULL REFERENCES academic.score_types(id),
  exam_id         UUID REFERENCES academic.exams(id) ON DELETE SET NULL,
  score_value     NUMERIC(4,2) CHECK (score_value >= 0 AND score_value <= 10),
  comment_result  VARCHAR(20) CHECK (comment_result IN ('PASSED', 'NOT_PASSED')),
  score_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  note            TEXT,
  entered_by      UUID NOT NULL REFERENCES core.users(id),
  entered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_locked       BOOLEAN NOT NULL DEFAULT FALSE,    -- Lock mark status to prevent modification
  locked_at       TIMESTAMPTZ,
  locked_by       UUID REFERENCES core.users(id)
);

CREATE INDEX IF NOT EXISTS ix_scores_student ON academic.student_scores(student_id);
CREATE INDEX IF NOT EXISTS ix_scores_cst ON academic.student_scores(class_subject_teacher_id);

COMMENT ON TABLE academic.student_scores IS 'Granular evaluation marks per score category (oral, 15m, mid-term, end-term)';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_conduct_evaluations.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.conduct_evaluations
-- Student conduct & moral assessment workflow per Circular 22/2021
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.conduct_evaluations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  semester_id             UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  self_rating             VARCHAR(20) CHECK (self_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  class_vote_rating       VARCHAR(20) CHECK (class_vote_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  emulation_demerit_points SMALLINT NOT NULL DEFAULT 0,
  homeroom_teacher_rating VARCHAR(20) NOT NULL
                            CHECK (homeroom_teacher_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  final_rating            VARCHAR(20) NOT NULL
                            CHECK (final_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  homeroom_comments       TEXT,
  principal_approved      BOOLEAN NOT NULL DEFAULT FALSE,
  status                  VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED')),
  evaluated_by            UUID NOT NULL REFERENCES core.users(id),
  evaluated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_conduct_student ON academic.conduct_evaluations(student_id);
CREATE INDEX IF NOT EXISTS ix_conduct_semester ON academic.conduct_evaluations(semester_id);

COMMENT ON TABLE academic.conduct_evaluations IS 'Official student moral and behavioral conduct evaluation workflow (Tốt, Khá, Đạt, Chưa đạt)';
COMMENT ON COLUMN academic.conduct_evaluations.final_rating IS 'Final conduct classification ratified by Principal Council under Circular 22/2021';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_report_cards.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.report_cards
-- Semester final academic report card summaries and honor roll ratings
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.report_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES core.subjects(id),
  semester_id       UUID NOT NULL REFERENCES core.semesters(id),
  average_score     NUMERIC(4,2),                  -- Semester subject grade point average (ĐTBmhk)
  subject_eval      VARCHAR(20),                   -- Pass/Fail qualitative result for physical education/defense
  conduct_rating    VARCHAR(20)
                      CHECK (conduct_rating IN ('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR')),
  academic_rating   VARCHAR(20)
                      CHECK (academic_rating IN ('OUTSTANDING', 'GOOD', 'FAIR', 'PASS', 'FAIL')),
  honor_title       VARCHAR(50),
  rank_in_class     SMALLINT,
  teacher_comment   TEXT,
  is_locked         BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_reportcards_student ON academic.report_cards(student_id);

COMMENT ON TABLE academic.report_cards IS 'Official academic report transcripts complying with MOET high school grading norms';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_student_term_summaries.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.student_term_summaries
-- Comprehensive term transcript & promotion status per Circular 22
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_term_summaries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  semester_id           UUID REFERENCES core.semesters(id) ON DELETE CASCADE,
  academic_year_id      UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  term_type             VARCHAR(20) NOT NULL DEFAULT 'SEMESTER'
                          CHECK (term_type IN ('SEMESTER', 'FULL_YEAR')),
  gpa_score             NUMERIC(4,2),                         -- Grade Point Average (ĐTB các môn)
  academic_rating       VARCHAR(20) NOT NULL
                          CHECK (academic_rating IN ('OUTSTANDING', 'GOOD', 'FAIR', 'PASS', 'FAIL')),
  conduct_rating        VARCHAR(20) NOT NULL
                          CHECK (conduct_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  honor_title           VARCHAR(50),                          -- E.g. 'Học sinh Xuất sắc', 'Học sinh Giỏi'
  rank_in_class         SMALLINT,
  rank_in_grade         SMALLINT,
  excused_absences      SMALLINT NOT NULL DEFAULT 0,
  unexcused_absences    SMALLINT NOT NULL DEFAULT 0,
  is_promoted           BOOLEAN NOT NULL DEFAULT TRUE,        -- Promotion to next grade level
  requires_summer_retest BOOLEAN NOT NULL DEFAULT FALSE,      -- Required re-evaluation or summer conduct training
  homeroom_remarks      TEXT,
  is_locked             BOOLEAN NOT NULL DEFAULT FALSE,
  certified_by          UUID REFERENCES core.users(id) ON DELETE SET NULL,
  certified_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id, term_type, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_term_sum_student ON academic.student_term_summaries(student_id);
CREATE INDEX IF NOT EXISTS ix_term_sum_year ON academic.student_term_summaries(academic_year_id);

COMMENT ON TABLE academic.student_term_summaries IS 'Comprehensive official student transcript and honor roll summaries per term and school year';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_subject_exemptions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.subject_exemptions
-- Formal exemptions and standardized certificate score conversions
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.subject_exemptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  subject_id          UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  semester_id         UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  exemption_type      VARCHAR(30) NOT NULL
                        CHECK (exemption_type IN ('FULL_EXEMPTION', 'PRACTICAL_EXEMPTION', 'CERTIFICATE_CONVERSION')),
  reason              TEXT NOT NULL,
  certificate_name    VARCHAR(100),                       -- E.g. 'IELTS', 'TOEFL iBT', 'Medical Disability'
  certificate_score   VARCHAR(50),                        -- E.g. '7.5', '105'
  converted_score     NUMERIC(4,2),                       -- Equivalent conversion score (e.g. 10.00)
  decision_number     VARCHAR(100),                       -- Official school decision reference
  valid_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to            DATE,
  approved_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_exemptions_student ON academic.subject_exemptions(student_id);

COMMENT ON TABLE academic.subject_exemptions IS 'Authorized medical waivers, military drill exemptions, and international certificate conversions';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_extracurricular_activities.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.extracurricular_activities
-- School-wide events, volunteer campaigns, and STEM workshops
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.extracurricular_activities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  semester_id           UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  activity_type         VARCHAR(30) NOT NULL DEFAULT 'COMMUNITY_SERVICE'
                          CHECK (activity_type IN ('COMMUNITY_SERVICE', 'CAREER_ORIENTATION', 'STEM_FAIR', 'SPORTS_FESTIVAL', 'YOUTH_UNION_EVENT', 'ARTS_FESTIVAL')),
  organizer_unit        VARCHAR(150) NOT NULL,            -- E.g. 'Đoàn trường', 'Tổ Ngoại ngữ'
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ NOT NULL,
  location              VARCHAR(255),
  description           TEXT,
  emulation_bonus_points SMALLINT NOT NULL DEFAULT 5,
  max_participants      INTEGER,
  is_published          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_activities_school ON academic.extracurricular_activities(school_id);
CREATE INDEX IF NOT EXISTS ix_activities_semester ON academic.extracurricular_activities(semester_id);

COMMENT ON TABLE academic.extracurricular_activities IS 'Experiential and vocational orientation activities under GDPT 2018';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_activity_participations.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.activity_participations
-- Student event attendance, performance roles, and merit awards
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.activity_participations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id           UUID NOT NULL REFERENCES academic.extracurricular_activities(id) ON DELETE CASCADE,
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  role                  VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT', -- E.g. 'PARTICIPANT', 'ORGANIZER', 'PRESENTER'
  attendance_status     VARCHAR(20) NOT NULL DEFAULT 'ATTENDED'
                          CHECK (attendance_status IN ('REGISTERED', 'ATTENDED', 'ABSENT', 'EXCUSED')),
  bonus_points_awarded  SMALLINT NOT NULL DEFAULT 0,
  achievement_note      VARCHAR(255),
  certificate_url       TEXT,
  verified_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_act_part_student ON academic.activity_participations(student_id);
CREATE INDEX IF NOT EXISTS ix_act_part_activity ON academic.activity_participations(activity_id);

COMMENT ON TABLE academic.activity_participations IS 'Individual student participation logs in experiential and extracurricular activities';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_fee_items.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.fee_items
-- Catalog of tuition fees, health insurance, and academic surcharges
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.fee_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  semester_id         UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  grade_id            UUID REFERENCES core.grades(id) ON DELETE SET NULL,
  code                VARCHAR(50) NOT NULL,               -- E.g. 'FEE_TUITION_HK1', 'FEE_BHYT_2026'
  name                VARCHAR(255) NOT NULL,
  category            VARCHAR(30) NOT NULL DEFAULT 'TUITION'
                        CHECK (category IN ('TUITION', 'HEALTH_INSURANCE', 'FACILITY_ENHANCEMENT', 'STUDY_SESSION_2', 'BOARDING', 'STUDENT_ORGANIZATION')),
  amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  is_mandatory        BOOLEAN NOT NULL DEFAULT TRUE,
  due_date            DATE,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_fee_items_school_year ON academic.fee_items(school_id, academic_year_id);

COMMENT ON TABLE academic.fee_items IS 'Master fee schedule for tuition and statutory student fees';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_student_fee_bills.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.student_fee_bills
-- Individual student tuition invoices, policy waivers, and settlements
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_fee_bills (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  fee_item_id           UUID NOT NULL REFERENCES academic.fee_items(id) ON DELETE CASCADE,
  bill_code             VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'INV2026-10A1-001'
  original_amount       NUMERIC(12,2) NOT NULL,
  waiver_percentage     NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- Welfare waiver policy (0% to 100%)
  waiver_amount         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  waiver_reason         VARCHAR(255),                      -- E.g. 'Con thương binh, liệt sĩ', 'Hộ nghèo'
  final_amount          NUMERIC(12,2) NOT NULL,            -- original_amount - waiver_amount
  paid_amount           NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_status        VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
                          CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'EXEMPTED')),
  payment_method        VARCHAR(30)                        -- E.g. 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'CASH'
                          CHECK (payment_method IN ('BANK_TRANSFER', 'VNPAY', 'MOMO', 'CASH', 'POS')),
  transaction_ref       VARCHAR(100),                      -- Gateway reference code
  paid_at               TIMESTAMPTZ,
  cashier_user_id       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, fee_item_id)
);

CREATE INDEX IF NOT EXISTS ix_student_bills_student ON academic.student_fee_bills(student_id);
CREATE INDEX IF NOT EXISTS ix_student_bills_status ON academic.student_fee_bills(payment_status);

COMMENT ON TABLE academic.student_fee_bills IS 'Student fee accounts, payment reconciliation records, and social welfare subsidies';

-- ---------------------------------------------------------------------------
-- File: 02_tables/academic/academic_attendance.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: academic.attendance
-- Daily and period-based student attendance records
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  period_id       UUID REFERENCES academic.periods(id) ON DELETE SET NULL,
  status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('PRESENT', 'ABSENT_EXCUSED', 'ABSENT_UNEXCUSED', 'LATE')),
  note            TEXT,
  recorded_by     UUID NOT NULL REFERENCES core.users(id),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, attendance_date, period_id)
);

CREATE INDEX IF NOT EXISTS ix_attendance_class_date ON academic.attendance(class_id, attendance_date);

COMMENT ON TABLE academic.attendance IS 'Daily student attendance roll-call tracking excuses and tardiness';


-- ===========================================================================
-- STEP 6: INITIALIZING EMULATION & DISCIPLINE TABLES
-- Description: 6. Emulation 360 Tables
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_periods.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.periods
-- Emulation evaluation cycles (weekly sprints, monthly campaigns, semesters)
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.periods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  code            VARCHAR(30) NOT NULL,            -- E.g. 'TUAN_01', 'THANG_10'
  name            VARCHAR(150) NOT NULL,           -- E.g. 'Tuần thi đua 01', 'Tháng 10 cao điểm'
  period_type     VARCHAR(20) NOT NULL
                    CHECK (period_type IN ('WEEK', 'MONTH', 'SEMESTER', 'YEAR', 'CAMPAIGN')),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_closed       BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (academic_year_id, code)
);

COMMENT ON TABLE emulation.periods IS 'Configured tracking intervals for point accumulation and leaderboard calculation';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_emulation_criteria.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.criteria (Master Data)
-- School-wide standard emulation evaluation criteria and point weights
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.criteria (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               VARCHAR(60) NOT NULL UNIQUE,      -- E.g. 'NE_NEP_DI_HOC_DUNG_GIO', 'HOC_TAP_DIEM_10'
  name               VARCHAR(255) NOT NULL,
  category           VARCHAR(50) NOT NULL DEFAULT 'DISCIPLINE'
                       CHECK (category IN ('DISCIPLINE', 'ACADEMIC', 'HYGIENE', 'ACTIVITY', 'ETHICS')),
  scope_type         core.scope_type_enum NOT NULL,    -- Applicable scope (CLASS, INDIVIDUAL, etc.)
  points             NUMERIC(6,2) NOT NULL,            -- Positive bonus points or negative penalty points
  is_violation       BOOLEAN NOT NULL DEFAULT FALSE,
  applicable_role_id UUID REFERENCES core.roles(id) ON DELETE SET NULL,
  description        TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE emulation.criteria IS 'Master emulation point criteria for weekly discipline, academics, and activities';

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_class_custom_criteria.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.class_custom_criteria
-- Class-specific internal emulation rules created by homeroom teachers / class leaders
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.class_custom_criteria (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  code            VARCHAR(50) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  points          NUMERIC(6,2) NOT NULL,
  is_violation    BOOLEAN NOT NULL DEFAULT FALSE,
  target_scope    VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL'
                    CHECK (target_scope IN ('INDIVIDUAL', 'GROUP')),
  created_by      UUID NOT NULL REFERENCES core.users(id),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, code)
);

COMMENT ON TABLE emulation.class_custom_criteria IS 'Custom internal class emulation rules tailored for individual classrooms';

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_supervisor_duty_logs.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.supervisor_duty_logs
-- Daily school gate / classroom inspection rounds conducted by supervisors
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.supervisor_duty_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duty_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  shift             VARCHAR(10) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON')),
  supervisor_id     UUID NOT NULL REFERENCES core.users(id),
  class_id          UUID NOT NULL REFERENCES core.classes(id),
  cleanliness_score NUMERIC(4,2) DEFAULT 10.0,
  orderliness_score NUMERIC(4,2) DEFAULT 10.0,
  uniform_score     NUMERIC(4,2) DEFAULT 10.0,
  general_feedback  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE emulation.supervisor_duty_logs IS 'Daily supervisor and red-flag brigade inspection evaluation checklists';

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_records.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.records
-- Point transactions awarded or deducted across multi-tier hierarchy
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id          UUID NOT NULL REFERENCES emulation.periods(id) ON DELETE CASCADE,
  criteria_id        UUID REFERENCES emulation.criteria(id) ON DELETE SET NULL,
  class_criteria_id  UUID REFERENCES emulation.class_custom_criteria(id) ON DELETE SET NULL,
  scope_type         core.scope_type_enum NOT NULL,
  student_id         UUID REFERENCES core.students(id) ON DELETE CASCADE,
  class_group_id     UUID REFERENCES core.class_groups(id) ON DELETE CASCADE,
  class_id           UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  grade_id           UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  school_id          UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  points             NUMERIC(6,2) NOT NULL,
  evidence_url       TEXT,
  note               TEXT,
  recorded_by        UUID NOT NULL REFERENCES core.users(id),
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (scope_type = 'INDIVIDUAL' AND student_id IS NOT NULL) OR
    (scope_type = 'GROUP'      AND class_group_id IS NOT NULL) OR
    (scope_type = 'CLASS'      AND class_id IS NOT NULL) OR
    (scope_type = 'GRADE'      AND grade_id IS NOT NULL) OR
    (scope_type = 'SCHOOL'     AND school_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS ix_emu_records_period ON emulation.records(period_id);
CREATE INDEX IF NOT EXISTS ix_emu_records_student ON emulation.records(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_emu_records_class ON emulation.records(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_emu_records_group ON emulation.records(class_group_id) WHERE class_group_id IS NOT NULL;

COMMENT ON TABLE emulation.records IS 'Granular point journal for commendations and violations across all scopes';

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_rankings.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.rankings
-- Computed leaderboard rankings and award flags per period
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.rankings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id       UUID NOT NULL REFERENCES emulation.periods(id) ON DELETE CASCADE,
  scope_type      core.scope_type_enum NOT NULL,
  student_id      UUID REFERENCES core.students(id) ON DELETE CASCADE,
  class_group_id  UUID REFERENCES core.class_groups(id) ON DELETE CASCADE,
  class_id        UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  grade_id        UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  base_score      NUMERIC(8,2) NOT NULL DEFAULT 100.0,
  bonus_score     NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  penalty_score   NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  final_score     NUMERIC(8,2) NOT NULL,
  rank_position   SMALLINT,
  awarded_flag    VARCHAR(50),                     -- E.g. 'FLAG_EXCELLENT', 'FLAG_FIRST_PLACE'
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period_id, scope_type, student_id, class_group_id, class_id, grade_id)
);

CREATE INDEX IF NOT EXISTS ix_emu_rankings_period ON emulation.rankings(period_id, scope_type);

COMMENT ON TABLE emulation.rankings IS 'Periodic leaderboard standings and award flag determinations';

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_disciplinary_records.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.disciplinary_records
-- Formal disciplinary council notices, suspension orders, and commendations
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.disciplinary_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  record_type     VARCHAR(20) NOT NULL
                    CHECK (record_type IN ('COMMENDATION', 'DISCIPLINE')),
  level           VARCHAR(50) NOT NULL,            -- E.g. 'WARNING', 'REPRIMAND', 'SUSPENSION'
  title           VARCHAR(255) NOT NULL,
  decision_no     VARCHAR(100),
  decision_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  conduct_impact  VARCHAR(50),
  description     TEXT,
  signed_by       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  attachment_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE emulation.disciplinary_records IS 'Formal disciplinary decisions and honorary citations';

-- ---------------------------------------------------------------------------
-- File: 02_tables/emulation/emulation_awards.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: emulation.awards
-- Student honors, academic Olympiad prizes, and sports commendations
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.awards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  award_category      VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC'
                        CHECK (award_category IN ('ACADEMIC', 'SPORTS', 'ARTS_CULTURE', 'STEM_INNOVATION', 'COMMUNITY_MODEL')),
  level               VARCHAR(20) NOT NULL DEFAULT 'SCHOOL'
                        CHECK (level IN ('SCHOOL', 'DISTRICT', 'PROVINCIAL', 'NATIONAL', 'INTERNATIONAL')),
  prize               VARCHAR(30) NOT NULL DEFAULT 'FIRST_PRIZE'
                        CHECK (prize IN ('SPECIAL_PRIZE', 'FIRST_PRIZE', 'SECOND_PRIZE', 'THIRD_PRIZE', 'CONSOLATION', 'CERTIFICATE_OF_MERIT')),
  title               VARCHAR(255) NOT NULL,              -- E.g. 'Giải Nhất Học sinh Giỏi Toán Cấp Tỉnh'
  decision_number     VARCHAR(100),                       -- Official certificate or decision number
  decision_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_amount       NUMERIC(10,2) DEFAULT 0.00,
  bonus_points        SMALLINT NOT NULL DEFAULT 10,       -- Emulation bonus points added to class/student
  signed_by           VARCHAR(150),                       -- Signer title/name: E.g. 'Giám đốc Sở GD&ĐT'
  certificate_url     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_awards_student ON emulation.awards(student_id);
CREATE INDEX IF NOT EXISTS ix_awards_year ON emulation.awards(academic_year_id);

COMMENT ON TABLE emulation.awards IS 'Golden book of student accolades, Olympiad laureates, and state honors';


-- ===========================================================================
-- STEP 7: INITIALIZING EVALUATION & FACILITY TABLES
-- Description: 7. Evaluation & Facility Maintenance Tables
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/evaluation/evaluation_forms.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: evaluation.forms
-- Survey form templates for anonymous teacher feedback and school surveys
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(60) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  target_type     VARCHAR(30) NOT NULL
                    CHECK (target_type IN ('TEACHER', 'FACILITY', 'SCHOOL_SERVICE', 'CANTEEN')),
  description     TEXT,
  is_anonymous    BOOLEAN NOT NULL DEFAULT TRUE,   -- Preserves student confidentiality
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from      DATE,
  valid_to        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE evaluation.forms IS 'Survey questionnaires for confidential pedagogical reviews and campus satisfaction';

-- ---------------------------------------------------------------------------
-- File: 02_tables/evaluation/evaluation_questions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: evaluation.questions
-- Individual questionnaire items (Likert scale 1-5, multiple choice, text)
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID NOT NULL REFERENCES evaluation.forms(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  question_type   VARCHAR(20) NOT NULL DEFAULT 'RATING_1_5'
                    CHECK (question_type IN ('RATING_1_5', 'TEXT', 'YES_NO', 'MULTIPLE_CHOICE')),
  options         JSONB,
  order_no        SMALLINT NOT NULL DEFAULT 0,
  is_required     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_eval_questions_form ON evaluation.questions(form_id);

COMMENT ON TABLE evaluation.questions IS 'Itemized survey questions for rating teaching methods, fairness, and clarity';

-- ---------------------------------------------------------------------------
-- File: 02_tables/evaluation/evaluation_facilities.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: evaluation.facilities
-- School physical equipment, lab apparatus, projectors, and air conditioning
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.facilities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  room_id         UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  code            VARCHAR(40) NOT NULL UNIQUE,     -- E.g. 'MAY_CHIEU_A101', 'QUAT_TRAN_B1'
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,           -- References lookup 'FACILITY_CATEGORY'
  status          VARCHAR(20) NOT NULL DEFAULT 'GOOD'
                    CHECK (status IN ('GOOD', 'NEEDS_REPAIR', 'BROKEN', 'UNDER_MAINTENANCE')),
  location        VARCHAR(150),
  installed_date  DATE,
  last_maintenance_date DATE
);

COMMENT ON TABLE evaluation.facilities IS 'Tracked campus assets, classroom projectors, fans, and laboratory kits';

-- ---------------------------------------------------------------------------
-- File: 02_tables/evaluation/evaluation_submissions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: evaluation.submissions
-- Form submission header linking student response to target teacher/facility
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id             UUID NOT NULL REFERENCES evaluation.forms(id) ON DELETE CASCADE,
  submitted_by        UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  target_teacher_id   UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  target_facility_id  UUID REFERENCES evaluation.facilities(id) ON DELETE SET NULL,
  semester_id         UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (target_teacher_id IS NOT NULL OR target_facility_id IS NOT NULL)
);

COMMENT ON TABLE evaluation.submissions IS 'Header record for submitted survey responses';

-- ---------------------------------------------------------------------------
-- File: 02_tables/evaluation/evaluation_answers.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: evaluation.answers
-- Specific question responses within a survey submission
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES evaluation.submissions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES evaluation.questions(id) ON DELETE CASCADE,
  answer_value    JSONB NOT NULL,
  UNIQUE (submission_id, question_id)
);

COMMENT ON TABLE evaluation.answers IS 'Atomic answers provided for survey questions';

-- ---------------------------------------------------------------------------
-- File: 02_tables/evaluation/evaluation_facility_incident_reports.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: evaluation.facility_incident_reports
-- Broken equipment and facility repair tickets submitted by students/teachers
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.facility_incident_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id     UUID REFERENCES evaluation.facilities(id) ON DELETE SET NULL,
  room_id         UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  image_urls      JSONB,
  priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status          VARCHAR(20) NOT NULL DEFAULT 'REPORTED'
                    CHECK (status IN ('REPORTED', 'RECEIVED', 'REPAIRING', 'RESOLVED', 'REJECTED')),
  reported_by     UUID NOT NULL REFERENCES core.users(id),
  handled_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  reported_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

COMMENT ON TABLE evaluation.facility_incident_reports IS 'Maintenance trouble tickets for repairing lighting, desks, or electronics';


-- ===========================================================================
-- STEP 8: INITIALIZING NOTIFICATION & COMMUNICATION TABLES
-- Description: 8. Notification & Communication Tables
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/notification/notification_announcements.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: notification.announcements
-- Broadcast announcements targeted to school, grade, class, or roles
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  summary         TEXT,
  content         TEXT NOT NULL,
  category        VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC'
                    CHECK (category IN ('ACADEMIC', 'EXAM', 'EMULATION', 'FEES', 'EVENTS', 'GENERAL')),
  target_type     VARCHAR(20) NOT NULL
                    CHECK (target_type IN ('SCHOOL', 'GRADE', 'CLASS', 'ROLE', 'USER')),
  target_grade_id UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  target_class_id UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  target_role_id  UUID REFERENCES core.roles(id) ON DELETE CASCADE,
  target_user_id  UUID REFERENCES core.users(id) ON DELETE CASCADE,
  priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  views_count     INT NOT NULL DEFAULT 0,
  department      VARCHAR(100) DEFAULT 'Phòng Đào Tạo',
  attachments     JSONB,
  published_by    UUID NOT NULL REFERENCES core.users(id),
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_announcements_target
  ON notification.announcements(target_type, target_class_id, target_grade_id, target_role_id);

COMMENT ON TABLE notification.announcements IS 'Official school news bulletins, grade circulars, and class notices';

-- ---------------------------------------------------------------------------
-- File: 02_tables/notification/notification_announcement_reads.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: notification.announcement_reads
-- Read confirmation audit trail tracking which users have seen an announcement
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.announcement_reads (
  announcement_id UUID NOT NULL REFERENCES notification.announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

COMMENT ON TABLE notification.announcement_reads IS 'Proof-of-read receipt log for official school notifications';

-- ---------------------------------------------------------------------------
-- File: 02_tables/notification/notification_reminders.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: notification.reminders
-- Personal study reminders, assignment deadlines, and duty tasks
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  content         TEXT,
  remind_at       TIMESTAMPTZ NOT NULL,
  related_entity  VARCHAR(80),                      -- E.g. 'ASSIGNMENT', 'EXAM', 'DUTY'
  related_id      UUID,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_reminders_user_time ON notification.reminders(user_id, remind_at);

COMMENT ON TABLE notification.reminders IS 'Personal task reminders for upcoming homework deadlines, exam dates, and cleaning duty';

-- ---------------------------------------------------------------------------
-- File: 02_tables/notification/notification_push_tokens.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: notification.push_tokens
-- Mobile and web push notification device registry (FCM / APNs)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  device_token    TEXT NOT NULL UNIQUE,
  platform        VARCHAR(20) CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notification.push_tokens IS 'Registered FCM/APNs push notification endpoints per device';

-- ---------------------------------------------------------------------------
-- File: 02_tables/notification/notification_contact_book_notes.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: notification.contact_book_notes
-- Periodic electronic home-school contact book bulletins
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.contact_book_notes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id              UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  semester_id           UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  period_type           VARCHAR(20) NOT NULL DEFAULT 'WEEKLY'
                          CHECK (period_type IN ('WEEKLY', 'MONTHLY', 'MID_TERM', 'FINAL_TERM')),
  period_label          VARCHAR(50) NOT NULL,               -- E.g. 'Tuần 8 (14/10 - 19/10)', 'Tháng 10/2026'
  academic_digest       JSONB,                              -- Snapshot of latest test scores and homework completion
  attendance_digest     JSONB,                              -- Number of present, late, excused/unexcused absences
  emulation_digest      JSONB,                              -- Commendations, discipline flags, conduct points
  teacher_remarks       TEXT,                               -- Homeroom teacher direct qualitative feedback
  parent_viewed_at      TIMESTAMPTZ,
  parent_acknowledged   BOOLEAN NOT NULL DEFAULT FALSE,
  parent_feedback       TEXT,                               -- Feedback or confirmation notes from parents
  created_by            UUID NOT NULL REFERENCES core.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, semester_id, period_type, period_label)
);

CREATE INDEX IF NOT EXISTS ix_contact_book_student ON notification.contact_book_notes(student_id);
CREATE INDEX IF NOT EXISTS ix_contact_book_class ON notification.contact_book_notes(class_id);

COMMENT ON TABLE notification.contact_book_notes IS 'Structured electronic communication logbook between homeroom teachers and parents';

-- ---------------------------------------------------------------------------
-- File: 02_tables/notification/notification_parent_teacher_messages.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: notification.parent_teacher_messages
-- Direct bilateral communication channel between parents and teachers
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification.parent_teacher_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  guardian_id       UUID NOT NULL REFERENCES core.guardians(id) ON DELETE CASCADE,
  teacher_id        UUID NOT NULL REFERENCES core.teachers(id) ON DELETE CASCADE,
  sender_user_id    UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  message_content   TEXT NOT NULL,
  attachments       JSONB,                                -- Array of file attachments [{"url": "...", "name": "..."}]
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_pt_msg_student ON notification.parent_teacher_messages(student_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_teacher ON notification.parent_teacher_messages(teacher_id);
CREATE INDEX IF NOT EXISTS ix_pt_msg_guardian ON notification.parent_teacher_messages(guardian_id);

COMMENT ON TABLE notification.parent_teacher_messages IS 'Encrypted home-school communication thread between parents and subject/homeroom teachers';


-- ===========================================================================
-- STEP 9: INITIALIZING DYNAMIC DASHBOARD CARDS & SETTINGS TABLES
-- Description: 9. Dynamic System & Dashboard Cards Tables
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_modules.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.modules (Master Data)
-- Dynamic dashboard cards, widgets, and functional navigation modules
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.modules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             VARCHAR(80) NOT NULL UNIQUE,       -- E.g. 'STUDENT_TIMETABLE', 'STUDENT_REPORT_CARD'
  name             VARCHAR(150) NOT NULL,
  short_name       VARCHAR(80),
  description      TEXT,
  icon             VARCHAR(100) NOT NULL,
  route            VARCHAR(255) NOT NULL,
  module_type      VARCHAR(20) NOT NULL DEFAULT 'CARD'
                     CHECK (module_type IN ('CARD', 'MENU', 'WIDGET', 'QUICK_ACTION', 'BANNER')),
  category         VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC'
                     CHECK (category IN ('ACADEMIC', 'EMULATION', 'EVALUATION', 'COMMUNICATION', 'MANAGEMENT', 'UTILITY')),
  default_color    VARCHAR(30) DEFAULT '#3B82F6',
  default_badge    VARCHAR(50),
  component_name   VARCHAR(100),
  parent_module_id UUID REFERENCES sys.modules(id) ON DELETE SET NULL,
  default_order_no SMALLINT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE sys.modules IS 'Master functional card modules available for personalized role-based dashboards';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_role_modules.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.role_modules
-- Dynamic card module permissions and layout defaults per role
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.role_modules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id            UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  module_id          UUID NOT NULL REFERENCES sys.modules(id) ON DELETE CASCADE,
  is_visible         BOOLEAN NOT NULL DEFAULT TRUE,
  is_pinned_default  BOOLEAN NOT NULL DEFAULT FALSE,
  order_no           SMALLINT NOT NULL DEFAULT 0,
  grid_col_span      SMALLINT DEFAULT 1,
  custom_badge       VARCHAR(50),
  config             JSONB,
  UNIQUE (role_id, module_id)
);

COMMENT ON TABLE sys.role_modules IS 'Default dashboard functional card layout and accessibility mapped per user role';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_user_module_preferences.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.user_module_preferences
-- Individual student/teacher customizations for dashboard cards
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.user_module_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  module_id       UUID NOT NULL REFERENCES sys.modules(id) ON DELETE CASCADE,
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,  -- Favorite pinned card
  is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,  -- Hidden from home view
  order_no        SMALLINT,                        -- Drag-and-drop sort position
  custom_config   JSONB,                           -- Custom card color, badge, or widget filters
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

COMMENT ON TABLE sys.user_module_preferences IS 'User-specific personalized overrides for dashboard card arrangement and visibility';

-- ---------------------------------------------------------------------------
-- File: 02_tables/master/master_settings_definitions.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.settings_definitions (Master Data)
-- Dynamic system and user settings catalog definitions
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.settings_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(80) NOT NULL UNIQUE,       -- E.g. 'theme', 'primary_color', 'date_format'
  name            VARCHAR(150) NOT NULL,
  data_type       VARCHAR(20) NOT NULL
                    CHECK (data_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'COLOR', 'ENUM')),
  default_value   TEXT NOT NULL,
  allowed_values  JSONB,
  scope           VARCHAR(20) NOT NULL DEFAULT 'USER'
                    CHECK (scope IN ('SYSTEM', 'SCHOOL', 'ROLE', 'USER')),
  category        VARCHAR(50) DEFAULT 'APPEARANCE'
                    CHECK (category IN ('APPEARANCE', 'LOCALIZATION', 'NOTIFICATIONS', 'ACCESSIBILITY')),
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE sys.settings_definitions IS 'Master registry of customizable application settings and appearance parameters';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_role_settings_defaults.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.role_settings_defaults
-- Default setting overrides defined at the role level
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.role_settings_defaults (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  UNIQUE (role_id, setting_id)
);

COMMENT ON TABLE sys.role_settings_defaults IS 'Default setting values automatically inherited by members of a specific role';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_system_settings.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.system_settings
-- Campus and system-wide setting configurations
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.system_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  updated_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, setting_id)
);

COMMENT ON TABLE sys.system_settings IS 'School-wide default configuration parameters';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_user_settings.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.user_settings
-- Personalized user preferences overriding role and system defaults
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.user_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  setting_id      UUID NOT NULL REFERENCES sys.settings_definitions(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, setting_id)
);

CREATE INDEX IF NOT EXISTS ix_user_settings_user ON sys.user_settings(user_id);

COMMENT ON TABLE sys.user_settings IS 'Top-priority user personalized setting values (theme, color, date format, notifications)';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_export_templates.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.export_templates
-- Storage and management for document export and print templates (HTML/PDF/Excel/Word)
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.export_templates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 VARCHAR(100) NOT NULL,
  name                 VARCHAR(255) NOT NULL,
  description          TEXT,
  template_type        VARCHAR(50) NOT NULL DEFAULT 'ANNOUNCEMENT'
                         CHECK (template_type IN ('ANNOUNCEMENT', 'ACADEMIC', 'STUDENT_PROFILE', 'ATTENDANCE', 'EMULATION', 'FEE_RECEIPT', 'GENERAL')),
  file_format          VARCHAR(30) NOT NULL DEFAULT 'HTML_PRINT'
                         CHECK (file_format IN ('HTML_PRINT', 'PDF', 'EXCEL', 'WORD')),
  content              TEXT NOT NULL DEFAULT '',
  header_content       TEXT NOT NULL DEFAULT '',
  footer_content       TEXT NOT NULL DEFAULT '',
  style_content        TEXT NOT NULL DEFAULT '',
  page_size            VARCHAR(20) NOT NULL DEFAULT 'A4',
  page_orientation     VARCHAR(20) NOT NULL DEFAULT 'PORTRAIT',
  margins              JSONB NOT NULL DEFAULT '{"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "20mm"}'::jsonb,
  placeholders_schema  JSONB NOT NULL DEFAULT '[]'::jsonb,
  sample_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default           BOOLEAN NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  school_id            UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  department_id        UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  created_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  updated_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  is_deleted           BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_export_templates_code_school ON sys.export_templates(code, school_id);
CREATE INDEX IF NOT EXISTS ix_export_templates_type_active ON sys.export_templates(template_type, is_active);
CREATE INDEX IF NOT EXISTS ix_export_templates_school ON sys.export_templates(school_id);
CREATE INDEX IF NOT EXISTS ix_export_templates_department ON sys.export_templates(department_id);

COMMENT ON TABLE sys.export_templates IS 'Export and print document templates configurable per school/department';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_audit_logs.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.audit_logs
-- Immutable security audit trail recording critical changes and user actions
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  action          VARCHAR(50) NOT NULL,            -- E.g. 'INSERT', 'UPDATE', 'DELETE', 'LOGIN'
  table_name      VARCHAR(150) NOT NULL,
  record_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_audit_table_record ON sys.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS ix_audit_user ON sys.audit_logs(user_id);

COMMENT ON TABLE sys.audit_logs IS 'System audit trail tracking transactional changes for security compliance and governance';

-- ---------------------------------------------------------------------------
-- File: 02_tables/sys/sys_event_outbox.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- TABLE: sys.event_outbox
-- Transactional Outbox Pattern for reliable asynchronous event publication
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.event_outbox (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      VARCHAR(100) NOT NULL,           -- E.g. 'GRADE_SUBMITTED', 'STUDENT_ABSENT', 'EMULATION_RANKED'
  aggregate_type  VARCHAR(80) NOT NULL,            -- E.g. 'STUDENT', 'EXAM', 'CLASS'
  aggregate_id    UUID NOT NULL,
  payload         JSONB NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
  retry_count     SMALLINT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_outbox_pending ON sys.event_outbox(status, created_at) WHERE status = 'PENDING';

COMMENT ON TABLE sys.event_outbox IS 'Reliable outbox queue for event-driven message brokers (Kafka/RabbitMQ) and webhook deliveries';


-- ===========================================================================
-- STEP 10: CREATING DATABASE VIEWS
-- Description: 10. Views
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 03_views/views.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- DATABASE VIEWS
-- SchoolPro 360 Education Management System
-- =====================================================================

-- View: Active Class Leadership & Squad Appointments
CREATE OR REPLACE VIEW core.v_current_class_leadership AS
SELECT
  c.id AS class_id,
  c.code AS class_code,
  c.name AS class_name,
  g.id AS grade_id,
  g.name AS grade_name,
  cg.id AS class_group_id,
  cg.name AS group_name,
  p.code AS position_code,
  p.name AS position_name,
  u.id AS user_id,
  u.full_name AS student_or_teacher_name,
  s.student_code,
  pa.start_date,
  pa.academic_year_id
FROM core.position_assignments pa
JOIN core.positions p ON p.id = pa.position_id
JOIN core.users u ON u.id = pa.user_id
JOIN core.classes c ON c.id = pa.class_id
JOIN core.grades g ON g.id = c.grade_id
LEFT JOIN core.class_groups cg ON cg.id = pa.class_group_id
LEFT JOIN core.students s ON s.user_id = u.id
WHERE pa.is_current = TRUE
ORDER BY c.code, p.code;

COMMENT ON VIEW core.v_current_class_leadership IS 'Real-time overview of current active homeroom teachers, class monitors, and squad leaders';

-- View: Teacher Workload & Class Assignments
CREATE OR REPLACE VIEW core.v_teacher_assignments AS
SELECT
  t.id AS teacher_id,
  t.teacher_code,
  u.full_name AS teacher_name,
  d.name AS department_name,
  c.code AS class_code,
  sub.name AS subject_name,
  sem.code AS semester_code,
  ay.code AS academic_year_code,
  CASE
    WHEN pa.id IS NOT NULL THEN 'HOMEROOM_TEACHER'
    ELSE 'SUBJECT_TEACHER'
  END AS assignment_type
FROM core.teachers t
JOIN core.users u ON u.id = t.user_id
LEFT JOIN core.departments d ON d.id = t.department_id
LEFT JOIN core.class_subject_teachers cst ON cst.teacher_id = t.id
LEFT JOIN core.classes c ON c.id = cst.class_id
LEFT JOIN core.subjects sub ON sub.id = cst.subject_id
LEFT JOIN core.semesters sem ON sem.id = cst.semester_id
LEFT JOIN core.academic_years ay ON ay.id = sem.academic_year_id
LEFT JOIN core.position_assignments pa ON pa.user_id = u.id
  AND pa.class_id = c.id
  AND pa.is_current = TRUE
  AND pa.position_id = (SELECT id FROM core.positions WHERE code = 'HOMEROOM_TEACHER' LIMIT 1);

COMMENT ON VIEW core.v_teacher_assignments IS 'Unified schedule view of teacher subject allocations and homeroom duties';

-- View: Resolved Dynamic Dashboard Cards per User
CREATE OR REPLACE VIEW sys.v_user_dashboard_cards AS
SELECT
  ur.user_id,
  r.code AS role_code,
  m.id AS module_id,
  m.code AS module_code,
  m.name AS module_name,
  m.description,
  m.icon,
  m.route,
  m.module_type,
  m.category,
  COALESCE(ump.is_hidden, FALSE) AS is_hidden,
  COALESCE(ump.is_pinned, rm.is_pinned_default, FALSE) AS is_pinned,
  COALESCE(ump.order_no, rm.order_no, m.default_order_no) AS display_order,
  COALESCE(rm.custom_badge, m.default_badge) AS badge_text,
  COALESCE(ump.custom_config, rm.config, jsonb_build_object('color', m.default_color)) AS ui_config
FROM core.user_roles ur
JOIN core.roles r ON r.id = ur.role_id
JOIN sys.role_modules rm ON rm.role_id = r.id AND rm.is_visible = TRUE
JOIN sys.modules m ON m.id = rm.module_id AND m.is_active = TRUE
LEFT JOIN sys.user_module_preferences ump ON ump.user_id = ur.user_id AND ump.module_id = m.id
WHERE ur.status = 'ACTIVE'
ORDER BY display_order ASC;

COMMENT ON VIEW sys.v_user_dashboard_cards IS 'Computed card stream for user homepage merging role defaults with personal drag/pin preferences';

-- View: 4-Tier Resolved Settings Hierarchy
CREATE OR REPLACE VIEW sys.v_user_effective_settings AS
SELECT
  u.id AS user_id,
  sd.code AS setting_code,
  sd.name AS setting_name,
  sd.category,
  COALESCE(us.value, rsd.value, ss.value, sd.default_value) AS effective_value,
  CASE
    WHEN us.value IS NOT NULL THEN 'USER_CUSTOM'
    WHEN rsd.value IS NOT NULL THEN 'ROLE_DEFAULT'
    WHEN ss.value IS NOT NULL THEN 'SCHOOL_DEFAULT'
    ELSE 'SYSTEM_DEFAULT'
  END AS resolved_from
FROM core.users u
CROSS JOIN sys.settings_definitions sd
LEFT JOIN sys.user_settings us ON us.user_id = u.id AND us.setting_id = sd.id
LEFT JOIN core.user_roles ur ON ur.user_id = u.id AND ur.is_primary = TRUE AND ur.status = 'ACTIVE'
LEFT JOIN sys.role_settings_defaults rsd ON rsd.role_id = ur.role_id AND rsd.setting_id = sd.id
LEFT JOIN sys.system_settings ss ON ss.setting_id = sd.id AND (ss.school_id = u.school_id OR ss.school_id IS NULL)
WHERE sd.is_active = TRUE;

COMMENT ON VIEW sys.v_user_effective_settings IS 'Settings resolution engine resolving User Preference -> Role Override -> School Policy -> System Default';

-- View: Student 360 Comprehensive Profile
CREATE OR REPLACE VIEW core.v_student_360_profile AS
SELECT
  s.id AS student_id,
  s.student_code,
  u.full_name AS student_name,
  u.gender_code AS gender,
  u.email,
  u.phone AS phone_number,
  c.id AS class_id,
  c.code AS class_code,
  c.name AS class_name,
  g.name AS grade_name,
  sch.name AS school_name,
  t.name AS track_name,
  t.career_orientation,
  homeroom_u.full_name AS homeroom_teacher_name,
  homeroom_u.phone AS homeroom_teacher_phone,
  (SELECT COUNT(*) FROM core.club_members cm WHERE cm.student_id = s.id AND cm.status = 'ACTIVE') AS active_clubs_count,
  (SELECT COUNT(*) FROM emulation.awards aw WHERE aw.student_id = s.id) AS awards_count,
  (SELECT COUNT(*) FROM academic.student_fee_bills fb WHERE fb.student_id = s.id AND fb.payment_status = 'UNPAID') AS unpaid_fee_bills_count
FROM core.students s
JOIN core.users u ON u.id = s.user_id
JOIN core.schools sch ON sch.id = u.school_id
LEFT JOIN core.student_class_enrollments sce ON sce.student_id = s.id AND sce.status = 'ACTIVE'
LEFT JOIN core.classes c ON c.id = sce.class_id
LEFT JOIN core.grades g ON g.id = c.grade_id
LEFT JOIN academic.student_track_enrollments ste ON ste.student_id = s.id AND ste.status = 'ACTIVE'
LEFT JOIN academic.curriculum_tracks t ON t.id = ste.track_id
LEFT JOIN core.position_assignments pa ON pa.class_id = c.id AND pa.is_current = TRUE
  AND pa.position_id = (SELECT id FROM core.positions WHERE code = 'HOMEROOM_TEACHER' LIMIT 1)
LEFT JOIN core.users homeroom_u ON homeroom_u.id = pa.user_id
LEFT JOIN core.teachers homeroom_t ON homeroom_t.user_id = homeroom_u.id;

COMMENT ON VIEW core.v_student_360_profile IS '360-degree synthesized profile of a student aggregating classroom, homeroom mentor, track, clubs, awards, and fees';


-- ===========================================================================
-- STEP 11: REGISTERING DATABASE TRIGGERS
-- Description: 11. Triggers
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 04_triggers/triggers.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- DATABASE TRIGGERS
-- SchoolPro 360 Education Management System
-- =====================================================================

-- Auto-update updated_at for core.schools
DROP TRIGGER IF EXISTS trg_schools_updated_at ON core.schools;
CREATE TRIGGER trg_schools_updated_at
  BEFORE UPDATE ON core.schools
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for core.users
DROP TRIGGER IF EXISTS trg_users_updated_at ON core.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON core.users
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.curriculum_materials
DROP TRIGGER IF EXISTS trg_materials_updated_at ON academic.curriculum_materials;
CREATE TRIGGER trg_materials_updated_at
  BEFORE UPDATE ON academic.curriculum_materials
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.assignments
DROP TRIGGER IF EXISTS trg_assignments_updated_at ON academic.assignments;
CREATE TRIGGER trg_assignments_updated_at
  BEFORE UPDATE ON academic.assignments
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.student_scores
DROP TRIGGER IF EXISTS trg_scores_updated_at ON academic.student_scores;
CREATE TRIGGER trg_scores_updated_at
  BEFORE UPDATE ON academic.student_scores
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for sys.user_module_preferences
DROP TRIGGER IF EXISTS trg_user_module_pref_updated_at ON sys.user_module_preferences;
CREATE TRIGGER trg_user_module_pref_updated_at
  BEFORE UPDATE ON sys.user_module_preferences
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.curriculum_tracks
DROP TRIGGER IF EXISTS trg_tracks_updated_at ON academic.curriculum_tracks;
CREATE TRIGGER trg_tracks_updated_at
  BEFORE UPDATE ON academic.curriculum_tracks
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.question_bank
DROP TRIGGER IF EXISTS trg_qbank_updated_at ON academic.question_bank;
CREATE TRIGGER trg_qbank_updated_at
  BEFORE UPDATE ON academic.question_bank
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.exam_submissions
DROP TRIGGER IF EXISTS trg_exam_sub_updated_at ON academic.exam_submissions;
CREATE TRIGGER trg_exam_sub_updated_at
  BEFORE UPDATE ON academic.exam_submissions
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.conduct_evaluations
DROP TRIGGER IF EXISTS trg_conduct_eval_updated_at ON academic.conduct_evaluations;
CREATE TRIGGER trg_conduct_eval_updated_at
  BEFORE UPDATE ON academic.conduct_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.student_term_summaries
DROP TRIGGER IF EXISTS trg_term_sum_updated_at ON academic.student_term_summaries;
CREATE TRIGGER trg_term_sum_updated_at
  BEFORE UPDATE ON academic.student_term_summaries
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.subject_exemptions
DROP TRIGGER IF EXISTS trg_exemptions_updated_at ON academic.subject_exemptions;
CREATE TRIGGER trg_exemptions_updated_at
  BEFORE UPDATE ON academic.subject_exemptions
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for core.clubs
DROP TRIGGER IF EXISTS trg_clubs_updated_at ON core.clubs;
CREATE TRIGGER trg_clubs_updated_at
  BEFORE UPDATE ON core.clubs
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.extracurricular_activities
DROP TRIGGER IF EXISTS trg_extra_act_updated_at ON academic.extracurricular_activities;
CREATE TRIGGER trg_extra_act_updated_at
  BEFORE UPDATE ON academic.extracurricular_activities
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for notification.contact_book_notes
DROP TRIGGER IF EXISTS trg_contact_book_updated_at ON notification.contact_book_notes;
CREATE TRIGGER trg_contact_book_updated_at
  BEFORE UPDATE ON notification.contact_book_notes
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.fee_items
DROP TRIGGER IF EXISTS trg_fee_items_updated_at ON academic.fee_items;
CREATE TRIGGER trg_fee_items_updated_at
  BEFORE UPDATE ON academic.fee_items
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();

-- Auto-update updated_at for academic.student_fee_bills
DROP TRIGGER IF EXISTS trg_student_fee_bills_updated_at ON academic.student_fee_bills;
CREATE TRIGGER trg_student_fee_bills_updated_at
  BEFORE UPDATE ON academic.student_fee_bills
  FOR EACH ROW
  EXECUTE FUNCTION core.fn_set_updated_at();


-- ===========================================================================
-- STEP 12: POPULATING MASTER DATA & SEED RECORDS
-- Description: 12. Master & Seed Data (INSERT Statements)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- File: 05_seeds/init.sql
-- ---------------------------------------------------------------------------
-- =====================================================================
-- INITIALIZATION & MASTER DATA SEED SCRIPT (init.sql)
-- SchoolPro 360 Education Management System
-- Schema Coverage: 100% of core and master domain tables
-- Standards: Real RFC 4122 v4 UUIDs, English abbreviation code prefix,
--            Strict relational integrity, Circular 22/2021/TT-BGDĐT
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. MASTER: Dynamic Lookup Types (core.lookup_types)
-- ---------------------------------------------------------------------
INSERT INTO core.lookup_types (code, name, description, is_system) VALUES
  ('GENDER',              'Giới tính',                   'Nam, Nữ, Khác',                                  TRUE),
  ('ACCOUNT_STATUS',      'Trạng thái tài khoản',        'Hoạt động, Tạm khóa, Chờ duyệt',                 TRUE),
  ('CLASS_STREAM',        'Ban học tập THPT',            'Khoa học Tự nhiên, Khoa học Xã hội, Chuyên',     TRUE),
  ('ROOM_TYPE',           'Phân loại phòng ốc',          'Phòng học lý thuyết, Thí nghiệm, Tin học, Y tế', TRUE),
  ('FACILITY_CATEGORY',   'Danh mục cơ sở vật chất',     'Điện tử, Bàn ghế, Chiếu sáng, Thể thao',         TRUE),
  ('ETHNICITY',           'Dân tộc',                     'Kinh, Tày, Thái, Mường, H''Mông, Khơ-me...',      TRUE),
  ('RELIGION',            'Tôn giáo',                    'Không, Phật giáo, Công giáo, Tin lành...',       TRUE),
  ('ATTENDANCE_STATUS',   'Trạng thái điểm danh',        'Có mặt, Vắng có phép, Vắng không phép, Đi trễ',  TRUE),
  ('LEAVE_REASON',        'Lý do nghỉ phép',             'Ốm đau, Việc gia đình, Tham gia thi HSG',        TRUE),
  ('BLOOD_TYPE',          'Nhóm máu',                    'Nhóm máu hệ ABO (A, B, AB, O)',                  TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ---------------------------------------------------------------------
-- 2. MASTER: Dynamic Lookup Values (core.lookup_values)
-- ---------------------------------------------------------------------
-- Gender
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'MALE', 'Nam', 1, '#3B82F6', TRUE FROM core.lookup_types WHERE code = 'GENDER'
UNION ALL SELECT id, 'FEMALE', 'Nữ', 2, '#EC4899', FALSE FROM core.lookup_types WHERE code = 'GENDER'
UNION ALL SELECT id, 'OTHER', 'Khác', 3, '#94A3B8', FALSE FROM core.lookup_types WHERE code = 'GENDER'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- Account Status
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'ACTIVE', 'Đang hoạt động', 1, '#10B981', TRUE FROM core.lookup_types WHERE code = 'ACCOUNT_STATUS'
UNION ALL SELECT id, 'LOCKED', 'Tạm khóa', 2, '#EF4444', FALSE FROM core.lookup_types WHERE code = 'ACCOUNT_STATUS'
UNION ALL SELECT id, 'PENDING', 'Chờ duyệt', 3, '#F59E0B', FALSE FROM core.lookup_types WHERE code = 'ACCOUNT_STATUS'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- Class Stream
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'KHTN', 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', 1, '#2563EB', TRUE FROM core.lookup_types WHERE code = 'CLASS_STREAM'
UNION ALL SELECT id, 'KHXH', 'Khoa học Xã hội (Sử - Địa - GDKT&PL)', 2, '#D97706', FALSE FROM core.lookup_types WHERE code = 'CLASS_STREAM'
UNION ALL SELECT id, 'SPECIALIZED', 'Chuyên sâu / Năng khiếu', 3, '#7C3AED', FALSE FROM core.lookup_types WHERE code = 'CLASS_STREAM'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- Room Type
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'CLASSROOM', 'Phòng học văn hóa', 1, '#3B82F6', TRUE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
UNION ALL SELECT id, 'LAB', 'Phòng thí nghiệm thực hành', 2, '#10B981', FALSE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
UNION ALL SELECT id, 'COMPUTER_ROOM', 'Phòng máy vi tính', 3, '#6366F1', FALSE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
UNION ALL SELECT id, 'LIBRARY', 'Thư viện & Không gian mở', 4, '#F59E0B', FALSE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
UNION ALL SELECT id, 'AUDITORIUM', 'Hội trường lớn', 5, '#EC4899', FALSE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
UNION ALL SELECT id, 'GYM', 'Nhà thi đấu đa năng', 6, '#14B8A6', FALSE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
UNION ALL SELECT id, 'HEALTH_ROOM', 'Phòng Y tế học đường', 7, '#EF4444', FALSE FROM core.lookup_types WHERE code = 'ROOM_TYPE'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- Attendance Status
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'PRESENT', 'Có mặt', 1, '#10B981', TRUE FROM core.lookup_types WHERE code = 'ATTENDANCE_STATUS'
UNION ALL SELECT id, 'EXCUSED_ABSENCE', 'Vắng có phép', 2, '#F59E0B', FALSE FROM core.lookup_types WHERE code = 'ATTENDANCE_STATUS'
UNION ALL SELECT id, 'UNEXCUSED_ABSENCE', 'Vắng không phép', 3, '#EF4444', FALSE FROM core.lookup_types WHERE code = 'ATTENDANCE_STATUS'
UNION ALL SELECT id, 'LATE', 'Đi trễ', 4, '#F97316', FALSE FROM core.lookup_types WHERE code = 'ATTENDANCE_STATUS'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- Blood Type
INSERT INTO core.lookup_values (lookup_type_id, code, name, order_no, badge_color, is_default)
SELECT id, 'O', 'Nhóm máu O', 1, '#EF4444', TRUE FROM core.lookup_types WHERE code = 'BLOOD_TYPE'
UNION ALL SELECT id, 'A', 'Nhóm máu A', 2, '#3B82F6', FALSE FROM core.lookup_types WHERE code = 'BLOOD_TYPE'
UNION ALL SELECT id, 'B', 'Nhóm máu B', 3, '#10B981', FALSE FROM core.lookup_types WHERE code = 'BLOOD_TYPE'
UNION ALL SELECT id, 'AB', 'Nhóm máu AB', 4, '#8B5CF6', FALSE FROM core.lookup_types WHERE code = 'BLOOD_TYPE'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3. MASTER: School Campus Profile (core.schools)
-- Code: SCH839201
-- ---------------------------------------------------------------------
INSERT INTO core.schools (
  id, code, name, educational_stage, established_year,
  address, province_code, district_code, phone, email, website,
  logo_url, principal_name, metadata, is_active
) VALUES (
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'SCH839201',
  'Trường Trung học Phổ thông Lê Quý Đôn',
  'HIGH_SCHOOL',
  1874,
  'Số 110 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
  '79', '770',
  '028 3930 2000',
  'c3lequydon.hcm@moet.edu.vn',
  'https://thpt-lequydon-hcm.edu.vn',
  'https://assets.schoolpro.edu.vn/logos/le_quy_don.png',
  'NGUYỄN VĂN AN',
  '{"accreditation": "LEVEL_3_NATIONAL_STANDARD", "motto": "Tiên học lễ - Hậu học văn - Vững tri thức - Sáng tương lai"}'::jsonb,
  TRUE
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  principal_name = EXCLUDED.principal_name;

-- ---------------------------------------------------------------------
-- 4. MASTER: Academic Years (core.academic_years)
-- Codes: AY2425_839201, AY2526_748292, AY2627_659183
-- ---------------------------------------------------------------------
INSERT INTO core.academic_years (id, school_id, code, name, start_date, end_date, is_current) VALUES
  ('bbd48441-8b7e-4135-959b-c8e82843dd5f', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'AY2425_839201', 'Năm học 2024 - 2025', '2024-09-05', '2025-05-31', FALSE),
  ('f8bb3932-88a8-44fd-8005-bd18723974f9', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'AY2526_748292', 'Năm học 2025 - 2026', '2025-09-05', '2026-05-31', FALSE),
  ('d6e893be-2b6f-413c-90f3-01747b60c01d', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'AY2627_659183', 'Năm học 2026 - 2027', '2026-09-05', '2027-05-31', TRUE)
ON CONFLICT (school_id, code) DO UPDATE SET
  is_current = EXCLUDED.is_current,
  name = EXCLUDED.name;

-- ---------------------------------------------------------------------
-- 5. MASTER: Semesters (core.semesters)
-- Codes: SEM1_839201, SEM2_748292, SEM_SUM_659183
-- ---------------------------------------------------------------------
INSERT INTO core.semesters (id, academic_year_id, code, name, start_date, end_date, is_current) VALUES
  ('53a5dc39-38dc-41bb-a7db-04745fa7d73a', 'd6e893be-2b6f-413c-90f3-01747b60c01d', 'SEM1_839201',     'Học kỳ 1 (2026 - 2027)', '2026-09-05', '2027-01-16', TRUE),
  ('dd98a91f-ff99-4694-ba2a-2afc28b43a6a', 'd6e893be-2b6f-413c-90f3-01747b60c01d', 'SEM2_748292',     'Học kỳ 2 (2026 - 2027)', '2027-01-18', '2027-05-31', FALSE),
  ('2cae43cb-669f-4b3e-8f92-599dec68a858',  'd6e893be-2b6f-413c-90f3-01747b60c01d', 'SEM_SUM_659183', 'Học kỳ Hè (2027)',        '2027-06-01', '2027-07-31', FALSE)
ON CONFLICT (academic_year_id, code) DO UPDATE SET
  is_current = EXCLUDED.is_current,
  name = EXCLUDED.name;

-- ---------------------------------------------------------------------
-- 6. MASTER: High School Grades (core.grades)
-- Codes: G10_8392, G11_7482, G12_6591
-- ---------------------------------------------------------------------
INSERT INTO core.grades (id, school_id, code, name, order_no) VALUES
  ('6294ceb2-291c-4e72-b839-2a72f0950b21', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'G10_8392', 'Khối 10', 1),
  ('099deb6d-dfca-42d8-b098-1e6691de3f49', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'G11_7482', 'Khối 11', 2),
  ('d5b78093-a0ab-455a-a53e-f1febc1cce2f', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'G12_6591', 'Khối 12', 3)
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  order_no = EXCLUDED.order_no;

-- ---------------------------------------------------------------------
-- 7. MASTER: Departments & Divisions (core.departments)
-- Codes: DEP_M839201, DEP_L928374, DEP_E837465, DEP_P298374...
-- ---------------------------------------------------------------------
INSERT INTO core.departments (id, school_id, code, name, department_type, is_active) VALUES
  ('ecf6a9a8-cd10-4b32-9287-cd6f394c1571',   'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_M839201',   'Tổ Toán - Tin học',                        'SUBJECT',        TRUE),
  ('e95ff85f-ecbe-4286-ab55-95ffeed75e07',   'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_L928374',   'Tổ Ngữ văn',                               'SUBJECT',        TRUE),
  ('8d0001fd-3eed-40b3-a861-e3b48ea2be0b', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_E837465',   'Tổ Ngoại ngữ (Tiếng Anh)',                 'SUBJECT',        TRUE),
  ('fffc5c55-3003-4df0-b28b-fe746414fd31',    'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_P298374',   'Tổ Vật lý - Công nghệ',                    'SUBJECT',        TRUE),
  ('710d4b60-71f8-480e-adfa-b6e2a1c36fe9',  'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_C187465',   'Tổ Hóa học - Sinh học',                    'SUBJECT',        TRUE),
  ('d1d7e2cf-e0f8-4bda-a214-bebc90440592',    'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_H746582',   'Tổ Lịch sử - Địa lý - GDKT&PL',            'SUBJECT',        TRUE),
  ('fcaa669a-a251-4db9-a86e-be04c3013fdd',   'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_PE657483',  'Tổ Thể dục - GD Quốc phòng & An ninh',     'SUBJECT',        TRUE),
  ('5401faa0-f169-4225-a637-e2d419b3d18e',  'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_SUP839210', 'Ban Giám thị & Quản lý Nề nếp',           'ADMINISTRATION', TRUE),
  ('f6f9361e-bc85-42eb-8bc5-2b5c8a8faddc',      'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_MED748291', 'Phòng Y tế Học đường',                     'ADMINISTRATION', TRUE),
  ('7d35eb57-e173-4fde-8df3-d72f8488b658',    'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_ACC659182', 'Phòng Kế toán - Tài vụ',                   'ADMINISTRATION', TRUE),
  ('a5145357-1472-4f7e-85ce-bded2bea1d43','b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_YTH568293', 'Ban Chấp hành Đoàn trường THPT',           'UNION',          TRUE),
  ('757a8002-d004-4198-9f22-31b06995bc28',       'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'DEP_BOD479104', 'Ban Giám hiệu Trường THPT',                'BOARD',          TRUE)
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  department_type = EXCLUDED.department_type;

-- ---------------------------------------------------------------------
-- 8. MASTER: High School Subjects (core.subjects - GDPT 2018)
-- Codes: M839201, L928374, E837465, P298374, C187465...
-- ---------------------------------------------------------------------
INSERT INTO core.subjects (school_id, department_id, code, name, evaluation_type, is_compulsory, metadata) VALUES
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'ecf6a9a8-cd10-4b32-9287-cd6f394c1571',   'M839201',  'Toán học',                                'SCORE',   TRUE,  '{"periods_per_year": 105, "weight": 1.0}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'e95ff85f-ecbe-4286-ab55-95ffeed75e07',   'L928374',  'Ngữ văn',                                 'SCORE',   TRUE,  '{"periods_per_year": 105, "weight": 1.0}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', '8d0001fd-3eed-40b3-a861-e3b48ea2be0b', 'E837465',  'Tiếng Anh',                               'SCORE',   TRUE,  '{"periods_per_year": 105, "weight": 1.0}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'd1d7e2cf-e0f8-4bda-a214-bebc90440592',    'H746582',  'Lịch sử',                                 'SCORE',   TRUE,  '{"periods_per_year": 52,  "weight": 1.0}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'fcaa669a-a251-4db9-a86e-be04c3013fdd',   'PE657483', 'Giáo dục thể chất',                       'COMMENT', TRUE,  '{"periods_per_year": 70}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'fcaa669a-a251-4db9-a86e-be04c3013fdd',   'ND568392', 'Giáo dục Quốc phòng và An ninh',           'COMMENT', TRUE,  '{"periods_per_year": 35}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'a5145357-1472-4f7e-85ce-bded2bea1d43','EA479281','Hoạt động trải nghiệm, hướng nghiệp',     'COMMENT', TRUE,  '{"periods_per_year": 105}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'd1d7e2cf-e0f8-4bda-a214-bebc90440592',    'LE389172', 'Nội dung giáo dục địa phương',            'COMMENT', TRUE,  '{"periods_per_year": 35}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'fffc5c55-3003-4df0-b28b-fe746414fd31',    'P298374',  'Vật lý',                                  'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHTN"}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', '710d4b60-71f8-480e-adfa-b6e2a1c36fe9',  'C187465',  'Hóa học',                                 'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHTN"}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', '710d4b60-71f8-480e-adfa-b6e2a1c36fe9',  'B976584',  'Sinh học',                                'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHTN"}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'd1d7e2cf-e0f8-4bda-a214-bebc90440592',    'G865493',  'Địa lý',                                  'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHXH"}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'd1d7e2cf-e0f8-4bda-a214-bebc90440592',    'EL754382', 'Giáo dục Kinh tế và Pháp luật',            'SCORE',   FALSE, '{"periods_per_year": 70, "group": "KHXH"}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'ecf6a9a8-cd10-4b32-9287-cd6f394c1571',   'CS643291', 'Tin học',                                 'SCORE',   FALSE, '{"periods_per_year": 70, "group": "TECH"}'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'fffc5c55-3003-4df0-b28b-fe746414fd31',    'TC532180', 'Công nghệ',                               'SCORE',   FALSE, '{"periods_per_year": 70, "group": "TECH"}')
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  evaluation_type = EXCLUDED.evaluation_type,
  is_compulsory = EXCLUDED.is_compulsory;

-- ---------------------------------------------------------------------
-- 9. MASTER: Rooms & School Spaces (academic.rooms)
-- Codes: RM_A101_839201, RM_A102_748292...
-- ---------------------------------------------------------------------
INSERT INTO academic.rooms (school_id, code, name, room_type, capacity, building, floor, status) VALUES
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_A101_839201',   'Phòng học 101 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_A102_748292',   'Phòng học 102 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_A103_659183',   'Phòng học 103 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_A104_568294',   'Phòng học 104 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_B201_479105',   'Phòng học 201 - Dãy B', 'CLASSROOM',     45, 'Dãy B', 2, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_B202_389216',   'Phòng học 202 - Dãy B', 'CLASSROOM',     45, 'Dãy B', 2, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_A301_298307',   'Phòng học 301 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 3, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_A302_187498',   'Phòng học 302 - Dãy A', 'CLASSROOM',     45, 'Dãy A', 3, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_LAB_P_976589',  'Phòng Thí nghiệm Vật lý', 'LAB',          40, 'Dãy C', 2, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_LAB_C_865490',  'Phòng Thí nghiệm Hóa học','LAB',         40, 'Dãy C', 2, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_LAB_B_754381',  'Phòng Thực hành Sinh học','LAB',         40, 'Dãy C', 3, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_LAB_IT_643272', 'Phòng Máy tính 01 (45 máy)','COMPUTER_ROOM',45,'Dãy C', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_LIB_532163',    'Thư viện & Phòng tự học','LIBRARY',       80, 'Dãy D', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_AUD_421054',    'Hội trường lớn 500 chỗ','AUDITORIUM',  500,'Nhà E', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_MED_310945',    'Phòng Y tế Học đường',    'HEALTH_ROOM',   10, 'Dãy D', 1, 'AVAILABLE'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 'RM_GYM_209836',    'Nhà thi đấu thể thao đa năng','GYM',  300,'Sân tập',1, 'AVAILABLE')
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  room_type = EXCLUDED.room_type,
  capacity = EXCLUDED.capacity;

-- ---------------------------------------------------------------------
-- 10. MASTER: Bell Schedule & Period Slots (academic.periods)
-- ---------------------------------------------------------------------
INSERT INTO academic.periods (school_id, period_no, shift, start_time, end_time) VALUES
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 1, 'MORNING',   '07:00:00', '07:45:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 2, 'MORNING',   '07:50:00', '08:35:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 3, 'MORNING',   '08:55:00', '09:40:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 4, 'MORNING',   '09:45:00', '10:30:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 5, 'MORNING',   '10:35:00', '11:20:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 6, 'AFTERNOON', '12:45:00', '13:30:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 7, 'AFTERNOON', '13:35:00', '14:20:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 8, 'AFTERNOON', '14:40:00', '15:25:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 9, 'AFTERNOON', '15:30:00', '16:15:00'),
  ('b5ebbdb9-a332-4fef-a64a-149c474159e6', 10,'AFTERNOON', '16:20:00', '17:05:00')
ON CONFLICT (school_id, period_no, shift) DO NOTHING;

-- ---------------------------------------------------------------------
-- 11. MASTER: Assessment Score Types (academic.score_types - TT22)
-- Codes: ST_TXM_839201, ST_TX15_748292, ST_GK_659183, ST_CK_568294
-- ---------------------------------------------------------------------
INSERT INTO academic.score_types (code, name, coefficient, min_evaluations, is_active) VALUES
  ('ST_TXM_839201',  'Đánh giá thường xuyên (Kiểm tra miệng)',  1, 1, TRUE),
  ('ST_TX15_748292', 'Đánh giá thường xuyên (Kiểm tra 15 phút)', 1, 2, TRUE),
  ('ST_GK_659183',   'Đánh giá giữa kỳ (Hệ số 2)',               2, 1, TRUE),
  ('ST_CK_568294',   'Đánh giá cuối kỳ (Hệ số 3)',               3, 1, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  coefficient = EXCLUDED.coefficient;

-- ---------------------------------------------------------------------
-- 12. CORE: Security Roles (core.roles)
-- Codes: R_ADMIN_839201, R_PRIN_748292, R_TCH_659183, R_STU_568294...
-- ---------------------------------------------------------------------
INSERT INTO core.roles (id, code, name, description, badge_color, icon, is_system, is_active) VALUES
  ('d96c271e-0b8d-4727-b2e9-a4f164a7c8d5',      'R_ADMIN_839201', 'Quản trị viên hệ thống', 'Toàn quyền cấu hình, vận hành và quản trị kỹ thuật', '#1E293B', 'shield-check', TRUE, TRUE),
  ('a513d262-a312-4a53-b6dd-124e536cd7da',  'R_PRIN_748292',  'Hiệu trưởng / Ban Giám hiệu', 'Ban giám hiệu chỉ đạo toàn diện hoạt động dạy và học', '#4F46E5', 'crown',        TRUE, TRUE),
  ('296ecfb4-1435-41bd-a674-8e068465dc8a',    'R_TCH_659183',   'Giáo viên',              'Giáo viên bộ môn, chủ nhiệm và tổ chuyên môn',         '#2563EB', 'chalkboard',   TRUE, TRUE),
  ('9e12103a-09f5-4d61-9c8d-88b6309ed3cb',    'R_STU_568294',   'Học sinh',               'Học sinh trường THPT truy cập thời khóa biểu, điểm số', '#059669', 'user-graduate',TRUE, TRUE),
  ('4f6537a5-9455-4cf9-9039-8ab1422ca9e1', 'R_SUP_479105',   'Giám thị học đường',     'Ban giám thị theo dõi nề nếp thi đua và kỷ luật',      '#D97706', 'clipboard-check', TRUE, TRUE),
  ('dabbd3aa-ae20-4012-b4b9-74dfff207784',      'R_STF_389216',   'Cán bộ nhân viên',       'Y tế, Thư viện, Kế toán - Tài vụ, Thiết bị CSVC',      '#0D9488', 'briefcase',    TRUE, TRUE),
  ('946ad4b2-3677-4cab-9e5e-3942bac9265c',     'R_PAR_298307',   'Phụ huynh học sinh',     'Cha mẹ hoặc người giám hộ theo dõi tiến độ học tập',   '#EA580C', 'heart-handshake', FALSE, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  badge_color = EXCLUDED.badge_color,
  description = EXCLUDED.description;

-- ---------------------------------------------------------------------
-- 13. CORE: Permissions Directory (core.permissions)
-- NOTE: Kept intact per instruction: "chỉ có riêng bảng permission thì không cần"
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 14. CORE: Role - Permission Mappings (core.role_permissions)
-- ---------------------------------------------------------------------
-- Admin: All
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 'd96c271e-0b8d-4727-b2e9-a4f164a7c8d5', id FROM core.permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Principal
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 'a513d262-a312-4a53-b6dd-124e536cd7da', id FROM core.permissions
WHERE code IN (
  'CORE_USER_VIEW', 'CORE_CLASS_VIEW',
  'ACADEMIC_TIMETABLE_VIEW', 'ACADEMIC_GRADE_VIEW', 'ACADEMIC_EXAM_VIEW', 'ACADEMIC_ATTENDANCE_VIEW',
  'EMULATION_RECORD_VIEW', 'EMULATION_RANKING_VIEW', 'EMULATION_APPEAL_MANAGE',
  'EVALUATION_REPORT_VIEW', 'NOTIFICATION_VIEW', 'NOTIFICATION_SEND',
  'CONTACT_BOOK_VIEW', 'SYSTEM_SETTINGS_VIEW', 'AUDIT_LOG_VIEW'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Teacher
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT '296ecfb4-1435-41bd-a674-8e068465dc8a', id FROM core.permissions
WHERE code IN (
  'CORE_CLASS_VIEW', 'ACADEMIC_TIMETABLE_VIEW', 'ACADEMIC_GRADE_VIEW', 'ACADEMIC_GRADE_ENTRY',
  'ACADEMIC_EXAM_VIEW', 'ACADEMIC_ATTENDANCE_VIEW', 'ACADEMIC_ATTENDANCE_MARK',
  'EMULATION_RECORD_VIEW', 'EVALUATION_FACILITY_REPORT',
  'NOTIFICATION_VIEW', 'NOTIFICATION_SEND', 'CONTACT_BOOK_VIEW', 'CONTACT_BOOK_SIGN'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Supervisor
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT '4f6537a5-9455-4cf9-9039-8ab1422ca9e1', id FROM core.permissions
WHERE code IN (
  'CORE_CLASS_VIEW', 'ACADEMIC_ATTENDANCE_VIEW',
  'EMULATION_RECORD_VIEW', 'EMULATION_RECORD_CREATE', 'EMULATION_RANKING_VIEW', 'EMULATION_APPEAL_MANAGE',
  'EVALUATION_FACILITY_REPORT', 'NOTIFICATION_VIEW', 'NOTIFICATION_SEND'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Student
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT '9e12103a-09f5-4d61-9c8d-88b6309ed3cb', id FROM core.permissions
WHERE code IN (
  'ACADEMIC_TIMETABLE_VIEW', 'ACADEMIC_GRADE_VIEW', 'ACADEMIC_EXAM_VIEW',
  'EMULATION_RECORD_VIEW', 'EVALUATION_TEACHER_SUBMIT', 'EVALUATION_FACILITY_REPORT',
  'NOTIFICATION_VIEW', 'CONTACT_BOOK_VIEW'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Parent
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT '946ad4b2-3677-4cab-9e5e-3942bac9265c', id FROM core.permissions
WHERE code IN (
  'ACADEMIC_GRADE_VIEW', 'ACADEMIC_ATTENDANCE_VIEW',
  'EMULATION_RECORD_VIEW', 'NOTIFICATION_VIEW', 'CONTACT_BOOK_VIEW', 'CONTACT_BOOK_SIGN'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Staff
INSERT INTO core.role_permissions (role_id, permission_id)
SELECT 'dabbd3aa-ae20-4012-b4b9-74dfff207784', id FROM core.permissions
WHERE code IN (
  'NOTIFICATION_VIEW', 'EVALUATION_FACILITY_REPORT'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 15. MASTER: Positions Directory (core.positions)
-- Codes: POS_HRT_839201, POS_SUB_748292, POS_MON_659183...
-- ---------------------------------------------------------------------
INSERT INTO core.positions (code, name, scope_type, max_holders, is_leadership, description) VALUES
  ('POS_HRT_839201', 'Giáo viên chủ nhiệm',       'CLASS',      1,    TRUE,  'Chủ nhiệm toàn diện một lớp học'),
  ('POS_SUB_748292', 'Giáo viên bộ môn',          'CLASS',      NULL, FALSE, 'Giảng dạy một môn học cụ thể cho lớp'),
  ('POS_MON_659183', 'Lớp trưởng',                'CLASS',      1,    TRUE,  'Đại diện học sinh phụ trách chung lớp học'),
  ('POS_VST_568294', 'Lớp phó học tập',           'CLASS',      1,    TRUE,  'Phụ trách học bài, kiểm tra bài tập và học tập của lớp'),
  ('POS_VLA_479105', 'Lớp phó lao động',          'CLASS',      1,    TRUE,  'Phụ trách trực nhật, vệ sinh, lao động và cơ sở vật chất'),
  ('POS_VDI_389216', 'Lớp phó trật tự (Nề nếp)',  'CLASS',      1,    TRUE,  'Phụ trách điểm danh, chấm thi đua nội bộ lớp'),
  ('POS_VAC_298307', 'Lớp phó phong trào',        'CLASS',      1,    TRUE,  'Phụ trách văn nghệ, thể dục thể thao, báo tường'),
  ('POS_TRE_187498', 'Thủ quỹ lớp',               'CLASS',      1,    FALSE, 'Phụ trách thu chi quỹ lớp dưới sự đồng ý của GVCN'),
  ('POS_SEC_976589', 'Bí thư chi đoàn',           'CLASS',      1,    TRUE,  'Phụ trách công tác Đoàn thanh niên chi đoàn lớp'),
  ('POS_GL_865490',  'Tổ trưởng',                 'GROUP',      1,    TRUE,  'Điều hành và theo dõi thi đua trong tổ học tập'),
  ('POS_GVL_754381', 'Tổ phó',                    'GROUP',      1,    FALSE, 'Hỗ trợ tổ trưởng'),
  ('POS_RFM_643272', 'Đội cờ đỏ (Sao đỏ)',        'GRADE',      NULL, FALSE, 'Chấm điểm thi đua nề nếp các lớp khác'),
  ('POS_DH_532163',  'Tổ trưởng chuyên môn',      'DEPARTMENT', 1,    TRUE,  'Tổ trưởng phụ trách nhóm môn (VD: Tổ Toán)'),
  ('POS_DVH_421054', 'Tổ phó chuyên môn',         'DEPARTMENT', 1,    FALSE, 'Tổ phó phụ trách nhóm môn'),
  ('POS_GS_310945',  'Giám thị phụ trách khối',   'GRADE',      NULL, TRUE,  'Giám thị chịu trách nhiệm nề nếp khối 10/11/12'),
  ('POS_PAR_209836', 'Trưởng ban đại diện CMHS',  'CLASS',      1,    TRUE,  'Trưởng ban đại diện phụ huynh học sinh của lớp')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  scope_type = EXCLUDED.scope_type,
  is_leadership = EXCLUDED.is_leadership;

-- ---------------------------------------------------------------------
-- 16. MASTER: High School Classes (core.classes)
-- Codes: CLS_10A1_839201, CLS_10A2_748292...
-- ---------------------------------------------------------------------
INSERT INTO core.classes (id, academic_year_id, grade_id, code, name, room_name, class_stream_code, max_students) VALUES
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '6294ceb2-291c-4e72-b839-2a72f0950b21', 'CLS_10A1_839201', 'Lớp 10A1 (KHTN - Chuyên Toán)', 'Phòng A101', 'KHTN', 45),
  ('29065f1d-6b76-4ff5-8900-a2e4235fec22', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '6294ceb2-291c-4e72-b839-2a72f0950b21', 'CLS_10A2_748292', 'Lớp 10A2 (KHTN)',                 'Phòng A102', 'KHTN', 45),
  ('95801ca0-9a30-460c-ba4c-16679637823d', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '6294ceb2-291c-4e72-b839-2a72f0950b21', 'CLS_10D1_659183', 'Lớp 10D1 (KHXH - Chuyên Anh)',  'Phòng A103', 'KHXH', 45),
  ('1a083e2d-5200-46fc-8671-89eed59141c0', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '6294ceb2-291c-4e72-b839-2a72f0950b21', 'CLS_10D2_568294', 'Lớp 10D2 (KHXH)',                 'Phòng A104', 'KHXH', 45),
  ('ae9452df-897a-4de7-b7eb-b1e82f4e5a65', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '099deb6d-dfca-42d8-b098-1e6691de3f49', 'CLS_11A1_479105', 'Lớp 11A1 (KHTN)',                 'Phòng B201', 'KHTN', 45),
  ('8e77ba0a-b782-48c2-b314-bf09785f5d38', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '099deb6d-dfca-42d8-b098-1e6691de3f49', 'CLS_11D1_389216', 'Lớp 11D1 (KHXH)',                 'Phòng B202', 'KHXH', 45),
  ('e907b7d1-3c4f-4b80-b984-6d3994713f4f', 'd6e893be-2b6f-413c-90f3-01747b60c01d', 'd5b78093-a0ab-455a-a53e-f1febc1cce2f', 'CLS_12A1_298307', 'Lớp 12A1 (KHTN - Luyện thi ĐH)', 'Phòng A301', 'KHTN', 45),
  ('6d662e30-0759-447e-ad0e-3c38183ac1b0', 'd6e893be-2b6f-413c-90f3-01747b60c01d', 'd5b78093-a0ab-455a-a53e-f1febc1cce2f', 'CLS_12D1_187498', 'Lớp 12D1 (KHXH - Luyện thi ĐH)', 'Phòng A302', 'KHXH', 45)
ON CONFLICT (academic_year_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  room_name = EXCLUDED.room_name;

-- ---------------------------------------------------------------------
-- 17. MASTER: Class Study Squads (core.class_groups)
-- Codes: GRP_TO1_839201, GRP_TO2_748292...
-- ---------------------------------------------------------------------
INSERT INTO core.class_groups (class_id, code, name, order_no) VALUES
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', 'GRP_TO1_839201', 'Tổ 1 (Lớp 10A1)', 1),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', 'GRP_TO2_748292', 'Tổ 2 (Lớp 10A1)', 2),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', 'GRP_TO3_659183', 'Tổ 3 (Lớp 10A1)', 3),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', 'GRP_TO4_568294', 'Tổ 4 (Lớp 10A1)', 4),
  ('95801ca0-9a30-460c-ba4c-16679637823d', 'GRP_TO1_839201', 'Tổ 1 (Lớp 10D1)', 1),
  ('95801ca0-9a30-460c-ba4c-16679637823d', 'GRP_TO2_748292', 'Tổ 2 (Lớp 10D1)', 2),
  ('95801ca0-9a30-460c-ba4c-16679637823d', 'GRP_TO3_659183', 'Tổ 3 (Lớp 10D1)', 3),
  ('95801ca0-9a30-460c-ba4c-16679637823d', 'GRP_TO4_568294', 'Tổ 4 (Lớp 10D1)', 4)
ON CONFLICT (class_id, code) DO NOTHING;

-- ---------------------------------------------------------------------
-- 18. CORE: Custom Field Definitions (core.custom_field_definitions)
-- Codes: CF_VNEID_839201, CF_BCERT_748292...
-- ---------------------------------------------------------------------
INSERT INTO core.custom_field_definitions (
  entity_type, field_code, field_label, data_type, options, is_required, default_value, display_order, is_active
) VALUES
  ('STUDENT', 'CF_VNEID_839201', 'Mã định danh cá nhân VNeID mức 2', 'STRING', NULL,                       FALSE, NULL, 1, TRUE),
  ('STUDENT', 'CF_BCERT_748292', 'Số giấy khai sinh',                'STRING', NULL,                       FALSE, NULL, 2, TRUE),
  ('STUDENT', 'CF_LCK_659183',   'Số tủ đồ cá nhân',                 'STRING', NULL,                       FALSE, NULL, 3, TRUE),
  ('STUDENT', 'CF_RFID_568294',  'Mã thẻ từ học sinh RFID',          'STRING', NULL,                       FALSE, NULL, 4, TRUE),
  ('STUDENT', 'CF_BRH_479105',   'Nhóm máu hệ Rh',                   'SELECT', '["Rh+", "Rh-"]'::jsonb,    FALSE, 'Rh+', 5, TRUE),
  ('TEACHER', 'CF_BANK_389216',  'Số tài khoản ngân hàng',           'STRING', NULL,                       FALSE, NULL, 1, TRUE),
  ('TEACHER', 'CF_BNAME_298307', 'Ngân hàng thụ hưởng',              'SELECT', '["Vietcombank", "BIDV", "VietinBank", "Agribank", "MBBank"]'::jsonb, FALSE, 'Vietcombank', 2, TRUE),
  ('TEACHER', 'CF_TAX_187498',   'Mã số thuế thu nhập cá nhân',      'STRING', NULL,                       FALSE, NULL, 3, TRUE),
  ('CLASS',   'CF_SB_976589',    'Mã thiết bị Màn hình tương tác',   'STRING', NULL,                       FALSE, NULL, 1, TRUE),
  ('CLASS',   'CF_AC_865490',    'Số lượng máy lạnh phòng',          'NUMBER', NULL,                       FALSE, '2', 2, TRUE)
ON CONFLICT (entity_type, field_code) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  data_type = EXCLUDED.data_type,
  options = EXCLUDED.options;

-- ---------------------------------------------------------------------
-- 19. CORE: Users Directory (core.users)
-- Real RFC 4122 v4 UUIDs for all users!
-- Default Password: SchoolPro@2026 (bcrypt encrypted)
-- ---------------------------------------------------------------------
INSERT INTO core.users (
  id, school_id, username, email, phone, password_hash,
  full_name, date_of_birth, gender_code, national_id, address, status_code
) VALUES
  -- 1. System Administrator
  ('a31148cb-1471-4c5e-aa66-0848fae24853', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'admin', 'admin@schoolpro.edu.vn', '0901234567',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Quản trị viên Hệ thống', '1985-05-15', 'MALE', '079085001234', '110 Nguyễn Thị Minh Khai, Q3, TP.HCM', 'ACTIVE'),

  -- 2. Principal & School Board
  ('847fe8ff-3129-4bb8-8313-fc2631e6a0ed', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'bgh_hieutruong', 'hieutruong@schoolpro.edu.vn', '0902345678',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'NGUYỄN VĂN AN', '1974-08-19', 'MALE', '079074005678', '12 Lê Duẩn, Q1, TP.HCM', 'ACTIVE'),

  ('473a6d2b-0c20-428c-9f96-9d0eafe246ff', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'bgh_hieupho', 'hieupho@schoolpro.edu.vn', '0903456789',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'TRẦN THỊ NGỌC LAN', '1978-03-12', 'FEMALE', '079178009876', '45 Hai Bà Trưng, Q3, TP.HCM', 'ACTIVE'),

  -- 3. Teachers
  ('6b369de1-c41d-43f7-a362-86e9733f768a', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_toan_minh', 'nguyenvanminh@schoolpro.edu.vn', '0912345678',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'ThS. Nguyễn Văn Minh', '1982-11-20', 'MALE', '079082001111', '88 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 'ACTIVE'),

  ('842d88d4-6eaa-4ac8-9d79-dd15462b25b3', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_toan_huong', 'lethuhuong@schoolpro.edu.vn', '0913456789',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Lê Thu Hương', '1988-06-14', 'FEMALE', '079188002222', '15 Trần Quốc Thảo, Q3, TP.HCM', 'ACTIVE'),

  ('d0da993e-63e8-4b8f-80c5-4aff6f252b46', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_tin_khoa', 'phamdangkhoa@schoolpro.edu.vn', '0914567890',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Phạm Đăng Khoa', '1990-09-05', 'MALE', '079090003333', '230 Điện Biên Phủ, Bình Thạnh, TP.HCM', 'ACTIVE'),

  ('3340abda-49a2-4ac2-837f-f9e0a11537c4', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_van_lan', 'hoangmailan@schoolpro.edu.vn', '0915678901',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Hoàng Mai Lan', '1984-04-22', 'FEMALE', '079184004444', '67 Pasteur, Q1, TP.HCM', 'ACTIVE'),

  ('e3d6b0e0-fc5c-4dd9-b452-37cc56d8f5a4', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_anh_mai', 'dangtuyetmai@schoolpro.edu.vn', '0916789012',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Đặng Tuyết Mai', '1986-12-08', 'FEMALE', '079186005555', '99 Nguyễn Đình Chiểu, Q3, TP.HCM', 'ACTIVE'),

  ('da85bf7e-ccdf-4e2a-afbb-e2622893fb05', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_ly_hung', 'vuquochung@schoolpro.edu.vn', '0917890123',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Vũ Quốc Hùng', '1983-02-17', 'MALE', '079083006666', '54 Cách Mạng Tháng 8, Q10, TP.HCM', 'ACTIVE'),

  ('ff3d6039-2b2d-41c9-af25-9c2099c85760', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_hoa_thao', 'buiphuongthao@schoolpro.edu.vn', '0918901234',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Bùi Phương Thảo', '1987-10-30', 'FEMALE', '079187007777', '180 Võ Thị Sáu, Q3, TP.HCM', 'ACTIVE'),

  ('6cab1a49-cdb1-4f52-bd16-df5806405b96', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_su_dung', 'dotiendung@schoolpro.edu.vn', '0919012345',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Đỗ Tiến Dũng', '1981-07-25', 'MALE', '079081008888', '33 Bà Huyện Thanh Quan, Q3, TP.HCM', 'ACTIVE'),

  ('98a52706-3b6a-4d86-8ac6-9b3f2e4d94fa', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gv_tduc_quang', 'luonghongquang@schoolpro.edu.vn', '0920123456',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Lương Hồng Quang', '1985-01-11', 'MALE', '079085009999', '14 Kỳ Đồng, Q3, TP.HCM', 'ACTIVE'),

  -- 4. Supervisor & Administrative Staff
  ('b6cbf0a5-a304-4846-b66e-0b638a500e0e', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'gt_nguyentrong', 'nguyentrongtin@schoolpro.edu.vn', '0921234567',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Nguyễn Trọng Tín', '1979-05-18', 'MALE', '079079001010', '105 Trương Định, Q3, TP.HCM', 'ACTIVE'),

  ('029b2f64-686c-4d82-b894-770bcb4a0cd0', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'yt_tranhoa', 'tranquynhhoa@schoolpro.edu.vn', '0922345678',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Trần Quỳnh Hoa', '1992-08-04', 'FEMALE', '079192002020', '42 Rạch Bùng Binh, Q3, TP.HCM', 'ACTIVE'),

  ('51fd9b7c-856c-472a-b7a0-dff3a8b2cfb2', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'kt_phuongthao', 'nguyenphuongthao@schoolpro.edu.vn', '0923456789',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Nguyễn Phương Thảo', '1989-12-19', 'FEMALE', '079189003030', '76 Hoàng Sa, Q1, TP.HCM', 'ACTIVE'),

  -- 5. Students
  ('6c95bfb8-1039-4052-8133-cb540bd04d7e', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'hs_le_hoang_nam', 'lehoangnam@schoolpro.edu.vn', '0987654321',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Lê Hoàng Nam', '2010-03-25', 'MALE', '079210001234', '15 Tú Xương, Võ Thị Sáu, Q3, TP.HCM', 'ACTIVE'),

  ('71f4dcd2-40ed-4c4b-9778-aa7ae8f0640f', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'hs_tran_thi_mai', 'tranthimai@schoolpro.edu.vn', '0987654322',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Trần Thị Mai', '2010-07-15', 'FEMALE', '079310001235', '22 Trương Định, Q3, TP.HCM', 'ACTIVE'),

  ('2c73c494-690e-46ef-845a-00abffb11623', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'hs_nguyen_duc_anh', 'nguyenducanh@schoolpro.edu.vn', '0987654323',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Nguyễn Đức Anh', '2010-11-02', 'MALE', '079210001236', '124 Ngô Thời Nhiệm, Q3, TP.HCM', 'ACTIVE'),

  ('1224af4f-e0e7-478e-878f-d315112d58c5', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'hs_pham_minh_khoi', 'phamminhkhoi@schoolpro.edu.vn', '0987654324',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Phạm Minh Khôi', '2010-01-20', 'MALE', '079210001237', '58 Hồ Xuân Hương, Q3, TP.HCM', 'ACTIVE'),

  ('fa72dd99-adda-450d-89e0-21b3209d0789', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'hs_hoang_thu_trang', 'hoangthutrang@schoolpro.edu.vn', '0987654325',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Hoàng Thu Trang', '2010-09-18', 'FEMALE', '079310001238', '118 Lê Thánh Tôn, Q1, TP.HCM', 'ACTIVE'),

  ('cdf2316d-299d-4843-8e8f-de8b23ca3491', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'hs_vu_hoang_long', 'vuhoanglong@schoolpro.edu.vn', '0987654326',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Vũ Hoàng Long', '2010-05-30', 'MALE', '079210001239', '75 Nguyễn Thị Diệu, Q3, TP.HCM', 'ACTIVE'),

  -- 6. Parents
  ('db353bf1-800e-4a21-b9f8-0c0dec22b90c', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'ph_le_dinh_quang', 'ledinhquang@gmail.com', '0918123456',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Lê Đình Quang', '1980-04-12', 'MALE', '079080007890', '15 Tú Xương, Võ Thị Sáu, Q3, TP.HCM', 'ACTIVE'),

  ('166e0bd1-107f-4d7d-bc57-72fadf26c511', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'ph_nguyen_thi_ha', 'nguyenthiha@gmail.com', '0918123457',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Nguyễn Thị Hà', '1983-09-28', 'FEMALE', '079183007891', '15 Tú Xương, Võ Thị Sáu, Q3, TP.HCM', 'ACTIVE'),

  ('ebe3aa7e-8461-4360-9da7-3a2a0b771291', 'b5ebbdb9-a332-4fef-a64a-149c474159e6',
   'ph_tran_van_thanh', 'tranvanthanh@gmail.com', '0918234567',
   crypt('SchoolPro@2026', gen_salt('bf', 8)),
   'Trần Văn Thành', '1979-11-05', 'MALE', '079079008901', '22 Trương Định, Q3, TP.HCM', 'ACTIVE')
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  status_code = EXCLUDED.status_code;

-- ---------------------------------------------------------------------
-- 20. CORE: Custom Field Values (core.custom_field_values)
-- ---------------------------------------------------------------------
INSERT INTO core.custom_field_values (field_id, entity_id, field_value, json_value)
SELECT d.id, u.id, v.val, NULL::jsonb
FROM (VALUES
  ('STUDENT', 'CF_VNEID_839201', 'hs_le_hoang_nam', '079210001234'),
  ('STUDENT', 'CF_BCERT_748292', 'hs_le_hoang_nam', 'KS-2010-0982'),
  ('STUDENT', 'CF_LCK_659183',   'hs_le_hoang_nam', 'LOCKER-A1-01'),
  ('STUDENT', 'CF_RFID_568294',  'hs_le_hoang_nam', 'E28068940000501234AB'),
  ('TEACHER', 'CF_BANK_389216',  'gv_toan_minh',    '0071001234567'),
  ('TEACHER', 'CF_TAX_187498',   'gv_toan_minh',    '8012345678')
) AS v(entity_type, field_code, username, val)
JOIN core.custom_field_definitions d ON d.entity_type = v.entity_type AND d.field_code = v.field_code
JOIN core.users u ON u.username = v.username
ON CONFLICT (field_id, entity_id) DO UPDATE SET
  field_value = EXCLUDED.field_value;

INSERT INTO core.custom_field_values (field_id, entity_id, field_value, json_value)
SELECT d.id, c.id, 'VIEWSONIC-IFP7550-2026', NULL::jsonb
FROM core.custom_field_definitions d, core.classes c
WHERE d.entity_type = 'CLASS' AND d.field_code = 'CF_SB_976589' AND c.code = 'CLS_10A1_839201'
ON CONFLICT (field_id, entity_id) DO UPDATE SET
  field_value = EXCLUDED.field_value;

-- ---------------------------------------------------------------------
-- 21. CORE: User Role Memberships (core.user_roles)
-- ---------------------------------------------------------------------
INSERT INTO core.user_roles (user_id, role_id, is_primary, effective_from, status)
SELECT u.id, r.id, TRUE, '2026-09-01'::date, 'ACTIVE'
FROM (VALUES
  ('admin',              'R_ADMIN_839201'),
  ('bgh_hieutruong',     'R_PRIN_748292'),
  ('bgh_hieupho',        'R_PRIN_748292'),
  ('gv_toan_minh',       'R_TCH_659183'),
  ('gv_toan_huong',      'R_TCH_659183'),
  ('gv_tin_khoa',        'R_TCH_659183'),
  ('gv_van_lan',         'R_TCH_659183'),
  ('gv_anh_mai',         'R_TCH_659183'),
  ('gv_ly_hung',         'R_TCH_659183'),
  ('gv_hoa_thao',        'R_TCH_659183'),
  ('gv_su_dung',         'R_TCH_659183'),
  ('gv_tduc_quang',      'R_TCH_659183'),
  ('gt_nguyentrong',     'R_SUP_479105'),
  ('yt_tranhoa',         'R_STF_389216'),
  ('kt_phuongthao',      'R_STF_389216'),
  ('hs_le_hoang_nam',    'R_STU_568294'),
  ('hs_tran_thi_mai',    'R_STU_568294'),
  ('hs_nguyen_duc_anh',  'R_STU_568294'),
  ('hs_pham_minh_khoi',  'R_STU_568294'),
  ('hs_hoang_thu_trang', 'R_STU_568294'),
  ('hs_vu_hoang_long',   'R_STU_568294'),
  ('ph_le_dinh_quang',   'R_PAR_298307'),
  ('ph_nguyen_thi_ha',   'R_PAR_298307'),
  ('ph_tran_van_thanh',  'R_PAR_298307')
) AS mapping(username, role_code)
JOIN core.users u ON u.username = mapping.username
JOIN core.roles r ON r.code = mapping.role_code
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- 22. CORE: Faculty & Teaching Staff Profiles (core.teachers)
-- Teacher Codes: T839201, T748292, T659183... (T + 6 digits)
-- ---------------------------------------------------------------------
INSERT INTO core.teachers (
  id, user_id, teacher_code, department_id, qualification, subject_major, hire_date, status
) VALUES
  ('470885c3-4ba9-4445-9806-117147fb348f',  '6b369de1-c41d-43f7-a362-86e9733f768a',  'T839201', 'ecf6a9a8-cd10-4b32-9287-cd6f394c1571', 'Thạc sĩ Toán giải tích', 'Toán học', '2010-09-01', 'ACTIVE'),
  ('f81af94c-06d6-4b52-897d-86edc3543727', '842d88d4-6eaa-4ac8-9d79-dd15462b25b3', 'T748292', 'ecf6a9a8-cd10-4b32-9287-cd6f394c1571', 'Cử nhân Sư phạm Toán', 'Toán học', '2015-09-01', 'ACTIVE'),
  ('234cbf0b-be13-4233-a02c-fce474658390',  'd0da993e-63e8-4b8f-80c5-4aff6f252b46',   'T659183', 'ecf6a9a8-cd10-4b32-9287-cd6f394c1571', 'Thạc sĩ Khoa học Máy tính', 'Tin học', '2018-09-01', 'ACTIVE'),
  ('6c37a7fc-05c2-4331-9eff-6adc2a62802d',   '3340abda-49a2-4ac2-837f-f9e0a11537c4',    'T568294', 'e95ff85f-ecbe-4286-ab55-95ffeed75e07',  'Thạc sĩ Văn học Việt Nam', 'Ngữ văn', '2011-09-01', 'ACTIVE'),
  ('b15ec797-4c5c-440b-80ac-c2cd80acde45',   'e3d6b0e0-fc5c-4dd9-b452-37cc56d8f5a4',    'T479105', '8d0001fd-3eed-40b3-a861-e3b48ea2be0b', 'Thạc sĩ Giảng dạy Tiếng Anh (TESOL)', 'Tiếng Anh', '2013-09-01', 'ACTIVE'),
  ('5b68a943-43b2-4099-b1f1-b758f7309bf2',  'da85bf7e-ccdf-4e2a-afbb-e2622893fb05',    'T389216', 'fffc5c55-3003-4df0-b28b-fe746414fd31',   'Thạc sĩ Vật lý Ứng dụng', 'Vật lý', '2012-09-01', 'ACTIVE'),
  ('a694e801-b76a-4e71-9871-96e7b4275db2',  'ff3d6039-2b2d-41c9-af25-9c2099c85760',   'T298307', '710d4b60-71f8-480e-adfa-b6e2a1c36fe9', 'Thạc sĩ Hóa hữu cơ', 'Hóa học', '2016-09-01', 'ACTIVE'),
  ('7f310b6e-bc2a-4542-8a24-2f3e82dbd11a',  '6cab1a49-cdb1-4f52-bd16-df5806405b96',    'T187498', 'd1d7e2cf-e0f8-4bda-a214-bebc90440592',   'Cử nhân Sư phạm Lịch sử', 'Lịch sử', '2014-09-01', 'ACTIVE'),
  ('fdd5b49c-dbb1-4fb9-a0da-4a3d813a2a44', '98a52706-3b6a-4d86-8ac6-9b3f2e4d94fa', 'T976589', 'fcaa669a-a251-4db9-a86e-be04c3013fdd',  'Cử nhân Giáo dục Thể chất', 'Giáo dục thể chất', '2017-09-01', 'ACTIVE')
ON CONFLICT (teacher_code) DO UPDATE SET
  qualification = EXCLUDED.qualification,
  subject_major = EXCLUDED.subject_major;

-- ---------------------------------------------------------------------
-- 23. CORE: Administrative & Operational Staff (core.staff)
-- Staff Codes: SF83921, SF74822, SF65913 (SF + 5 digits)
-- ---------------------------------------------------------------------
INSERT INTO core.staff (
  id, user_id, staff_code, department_id, job_title, hire_date, status
) VALUES
  ('7cde424e-2e7d-47dc-a0de-607f206e9190',  'b6cbf0a5-a304-4846-b66e-0b638a500e0e', 'SF83921', '5401faa0-f169-4225-a637-e2d419b3d18e', 'Trưởng Ban Giám thị & Nề nếp', '2011-03-15', 'ACTIVE'),
  ('560d32d7-98f9-49a6-86dd-f589ac815c53',  '029b2f64-686c-4d82-b894-770bcb4a0cd0',     'SF74822', 'f6f9361e-bc85-42eb-8bc5-2b5c8a8faddc',     'Cán bộ Y tế Học đường', '2019-08-01', 'ACTIVE'),
  ('16a7a4ca-bd38-4a26-bd87-0fd42c6bf4b6', '51fd9b7c-856c-472a-b7a0-dff3a8b2cfb2',  'SF65913', '7d35eb57-e173-4fde-8df3-d72f8488b658',   'Kế toán trưởng & Quản lý Học phí', '2015-11-01', 'ACTIVE')
ON CONFLICT (staff_code) DO UPDATE SET
  job_title = EXCLUDED.job_title;

-- ---------------------------------------------------------------------
-- 24. CORE: Student Dossiers & Enrolled Profiles (core.students)
-- Student Codes: S849201, S738192, S627083... (S + 6 digits)
-- ---------------------------------------------------------------------
INSERT INTO core.students (
  id, user_id, student_code, admission_date, ethnicity, religion, status
) VALUES
  ('190adaa6-7ceb-41d8-81b6-86cac98b004f',    '6c95bfb8-1039-4052-8133-cb540bd04d7e',   'S849201', '2026-09-01', 'Kinh', 'Không', 'STUDYING'),
  ('3b88eac1-4928-4a42-9d3c-f84a123179a6',    '71f4dcd2-40ed-4c4b-9778-aa7ae8f0640f',   'S738192', '2026-09-01', 'Kinh', 'Không', 'STUDYING'),
  ('7d38e8bb-2f28-4a22-98bc-1bdc7807ca2b', '2c73c494-690e-46ef-845a-00abffb11623', 'S627083', '2026-09-01', 'Kinh', 'Không', 'STUDYING'),
  ('73d4a204-6f20-48e4-95e3-a13da68ca22a',   '1224af4f-e0e7-478e-878f-d315112d58c5', 'S516974', '2026-09-01', 'Kinh', 'Không', 'STUDYING'),
  ('5ef27225-43a9-44bb-8391-c7af1ef355fb',  'fa72dd99-adda-450d-89e0-21b3209d0789','S405865', '2026-09-01', 'Kinh', 'Không', 'STUDYING'),
  ('951f84e1-daff-42c6-9c44-75442273618a',   'cdf2316d-299d-4843-8e8f-de8b23ca3491',  'S394756', '2026-09-01', 'Kinh', 'Không', 'STUDYING')
ON CONFLICT (student_code) DO UPDATE SET
  status = EXCLUDED.status;

-- ---------------------------------------------------------------------
-- 25. CORE: Student Clinic & Health Records (core.student_health_records)
-- ---------------------------------------------------------------------
INSERT INTO core.student_health_records (
  student_id, height_cm, weight_kg, blood_type, allergies, chronic_illness,
  vision_left, vision_right, insurance_code, last_checkup_at, notes
) VALUES
  ('190adaa6-7ceb-41d8-81b6-86cac98b004f',    172.5, 62.0, 'O',  'Không có', NULL, '10/10', '10/10', 'GD4790123456789', '2026-09-10', 'Thể trạng tốt, đủ điều kiện thi đấu thể thao'),
  ('3b88eac1-4928-4a42-9d3c-f84a123179a6',    162.0, 49.5, 'A',  'Dị ứng hải sản vỏ cứng', NULL, '9/10',  '9/10',  'GD4790123456790', '2026-09-10', 'Cần chú ý thực đơn khi tham gia dã ngoại'),
  ('7d38e8bb-2f28-4a22-98bc-1bdc7807ca2b', 175.0, 68.0, 'B',  'Không có', NULL, '8/10',  '8/10',  'GD4790123456791', '2026-09-10', 'Vận động viên đội bóng rổ'),
  ('73d4a204-6f20-48e4-95e3-a13da68ca22a',   168.0, 58.0, 'AB', 'Không có', NULL, '10/10', '10/10', 'GD4790123456792', '2026-09-10', 'Sức khỏe bình thường'),
  ('5ef27225-43a9-44bb-8391-c7af1ef355fb',  165.0, 52.0, 'O',  'Không có', NULL, '10/10', '10/10', 'GD4790123456793', '2026-09-10', 'Sức khỏe tốt'),
  ('951f84e1-daff-42c6-9c44-75442273618a',   170.0, 60.0, 'A',  'Không có', NULL, '10/10', '9/10',  'GD4790123456794', '2026-09-10', 'Sức khỏe tốt')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- 26. CORE: Parents & Legal Guardians (core.guardians)
-- ---------------------------------------------------------------------
INSERT INTO core.guardians (
  student_id, user_id, full_name, relationship, phone, email, job, is_primary_contact, is_parent_committee
) VALUES
  ('190adaa6-7ceb-41d8-81b6-86cac98b004f', 'db353bf1-800e-4a21-b9f8-0c0dec22b90c', 'Lê Đình Quang', 'Cha', '0918123456', 'ledinhquang@gmail.com', 'Kỹ sư phần mềm', TRUE, TRUE),
  ('190adaa6-7ceb-41d8-81b6-86cac98b004f', '166e0bd1-107f-4d7d-bc57-72fadf26c511', 'Nguyễn Thị Hà', 'Mẹ', '0918123457', 'nguyenthiha@gmail.com', 'Bác sĩ Đa khoa', FALSE, FALSE),
  ('3b88eac1-4928-4a42-9d3c-f84a123179a6', 'ebe3aa7e-8461-4360-9da7-3a2a0b771291', 'Trần Văn Thành', 'Cha', '0918234567', 'tranvanthanh@gmail.com', 'Giảng viên Đại học', TRUE, FALSE),
  ('7d38e8bb-2f28-4a22-98bc-1bdc7807ca2b', NULL, 'Phạm Hương Giang', 'Mẹ', '0918345678', 'giangpham@gmail.com', 'Doanh nhân', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- 27. CORE: Student Class Enrollments (core.student_class_enrollments)
-- ---------------------------------------------------------------------
INSERT INTO core.student_class_enrollments (student_id, class_id, class_group_id, status)
SELECT s.id, c.id, cg.id, 'ACTIVE'
FROM (VALUES
  ('S849201', 'CLS_10A1_839201', 'GRP_TO1_839201'),
  ('S738192', 'CLS_10A1_839201', 'GRP_TO1_839201'),
  ('S627083', 'CLS_10A1_839201', 'GRP_TO2_748292'),
  ('S516974', 'CLS_10A1_839201', 'GRP_TO3_659183'),
  ('S405865', 'CLS_10D1_659183', 'GRP_TO1_839201'),
  ('S394756', 'CLS_10D1_659183', 'GRP_TO2_748292')
) AS e(student_code, class_code, group_code)
JOIN core.students s ON s.student_code = e.student_code
JOIN core.classes c ON c.code = e.class_code
JOIN core.academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE
LEFT JOIN core.class_groups cg ON cg.class_id = c.id AND cg.code = e.group_code
ON CONFLICT (student_id, class_id) DO UPDATE SET
  status = EXCLUDED.status,
  class_group_id = EXCLUDED.class_group_id;

-- ---------------------------------------------------------------------
-- 28. CORE: Position Assignments (core.position_assignments)
-- ---------------------------------------------------------------------
-- Homeroom Teachers (GVCN)
INSERT INTO core.position_assignments (
  user_id, position_id, academic_year_id, scope_type, class_id, is_current, note
)
SELECT u.id, p.id, ay.id, 'CLASS'::core.scope_type_enum, c.id, TRUE, 'Giáo viên chủ nhiệm lớp 10A1'
FROM core.users u
JOIN core.positions p ON p.code = 'POS_HRT_839201'
JOIN core.classes c ON c.code = 'CLS_10A1_839201'
JOIN core.academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE
WHERE u.username = 'gv_toan_minh'
UNION ALL
SELECT u.id, p.id, ay.id, 'CLASS'::core.scope_type_enum, c.id, TRUE, 'Giáo viên chủ nhiệm lớp 10D1'
FROM core.users u
JOIN core.positions p ON p.code = 'POS_HRT_839201'
JOIN core.classes c ON c.code = 'CLS_10D1_659183'
JOIN core.academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE
WHERE u.username = 'gv_van_lan';

-- Class Cadre
INSERT INTO core.position_assignments (
  user_id, position_id, academic_year_id, scope_type, class_id, is_current, note
)
SELECT u.id, p.id, ay.id, 'CLASS'::core.scope_type_enum, c.id, TRUE, mapping.note
FROM (VALUES
  ('hs_le_hoang_nam',   'POS_MON_659183', 'CLS_10A1_839201', 'Lớp trưởng 10A1 phụ trách chung'),
  ('hs_tran_thi_mai',   'POS_VST_568294', 'CLS_10A1_839201', 'Lớp phó học tập 10A1'),
  ('hs_nguyen_duc_anh', 'POS_VLA_479105', 'CLS_10A1_839201', 'Lớp phó lao động & cơ sở vật chất 10A1'),
  ('hs_hoang_thu_trang','POS_MON_659183', 'CLS_10D1_659183', 'Lớp trưởng 10D1'),
  ('ph_le_dinh_quang',  'POS_PAR_209836', 'CLS_10A1_839201', 'Trưởng ban đại diện Cha mẹ học sinh lớp 10A1')
) AS mapping(username, position_code, class_code, note)
JOIN core.users u ON u.username = mapping.username
JOIN core.positions p ON p.code = mapping.position_code
JOIN core.classes c ON c.code = mapping.class_code
JOIN core.academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE;

-- Study Squad Leaders
INSERT INTO core.position_assignments (
  user_id, position_id, academic_year_id, scope_type, class_group_id, is_current, note
)
SELECT u.id, p.id, ay.id, 'GROUP'::core.scope_type_enum, cg.id, TRUE, mapping.note
FROM (VALUES
  ('hs_tran_thi_mai',   'POS_GL_865490', 'CLS_10A1_839201', 'GRP_TO1_839201', 'Tổ trưởng Tổ 1 lớp 10A1'),
  ('hs_nguyen_duc_anh', 'POS_GL_865490', 'CLS_10A1_839201', 'GRP_TO2_748292', 'Tổ trưởng Tổ 2 lớp 10A1'),
  ('hs_pham_minh_khoi', 'POS_GL_865490', 'CLS_10A1_839201', 'GRP_TO3_659183', 'Tổ trưởng Tổ 3 lớp 10A1')
) AS mapping(username, position_code, class_code, group_code, note)
JOIN core.users u ON u.username = mapping.username
JOIN core.positions p ON p.code = mapping.position_code
JOIN core.classes c ON c.code = mapping.class_code
JOIN core.academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE
JOIN core.class_groups cg ON cg.class_id = c.id AND cg.code = mapping.group_code;

-- Grade Supervisors
INSERT INTO core.position_assignments (
  user_id, position_id, academic_year_id, scope_type, grade_id, is_current, note
)
SELECT u.id, p.id, ay.id, 'GRADE'::core.scope_type_enum, g.id, TRUE, 'Giám thị trưởng phụ trách nề nếp Khối 10'
FROM core.users u
JOIN core.positions p ON p.code = 'POS_GS_310945'
JOIN core.schools s ON s.code = 'SCH839201'
JOIN core.grades g ON g.school_id = s.id AND g.code = 'G10_8392'
JOIN core.academic_years ay ON ay.school_id = s.id AND ay.is_current = TRUE
WHERE u.username = 'gt_nguyentrong';

-- Department Heads
INSERT INTO core.position_assignments (
  user_id, position_id, academic_year_id, scope_type, department_id, is_current, note
)
SELECT u.id, p.id, ay.id, 'DEPARTMENT'::core.scope_type_enum, d.id, TRUE, mapping.note
FROM (VALUES
  ('gv_toan_minh', 'DEP_M839201', 'Tổ trưởng chuyên môn Toán - Tin học'),
  ('gv_van_lan',   'DEP_L928374', 'Tổ trưởng chuyên môn Ngữ văn'),
  ('gv_anh_mai',   'DEP_E837465', 'Tổ trưởng chuyên môn Ngoại ngữ'),
  ('gv_ly_hung',   'DEP_P298374', 'Tổ trưởng chuyên môn Vật lý'),
  ('gv_hoa_thao',  'DEP_C187465', 'Tổ trưởng chuyên môn Hóa - Sinh')
) AS mapping(username, dept_code, note)
JOIN core.users u ON u.username = mapping.username
JOIN core.positions p ON p.code = 'POS_DH_532163'
JOIN core.departments d ON d.code = mapping.dept_code
JOIN core.schools s ON s.id = d.school_id
JOIN core.academic_years ay ON ay.school_id = s.id AND ay.is_current = TRUE;

-- ---------------------------------------------------------------------
-- 29. UPDATE: Department Leaders & Grade Supervisors
-- ---------------------------------------------------------------------
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gv_toan_minh') WHERE code = 'DEP_M839201';
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gv_van_lan') WHERE code = 'DEP_L928374';
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gv_anh_mai') WHERE code = 'DEP_E837465';
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gv_ly_hung') WHERE code = 'DEP_P298374';
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gv_hoa_thao') WHERE code = 'DEP_C187465';
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gv_su_dung') WHERE code = 'DEP_H746582';
UPDATE core.departments SET leader_teacher_id = (SELECT id FROM core.users WHERE username = 'gt_nguyentrong') WHERE code = 'DEP_SUP839210';

UPDATE core.grades SET supervisor_id = (SELECT id FROM core.users WHERE username = 'gt_nguyentrong') WHERE code = 'G10_8392';

-- ---------------------------------------------------------------------
-- 30. CORE: Teaching Assignments (core.class_subject_teachers)
-- ---------------------------------------------------------------------
INSERT INTO core.class_subject_teachers (
  class_id, subject_id, teacher_id, semester_id, periods_per_week, notes
) VALUES
  -- 10A1
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'M839201'),  '470885c3-4ba9-4445-9806-117147fb348f',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 4, 'Giảng dạy Toán chuyên đề KHTN'),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'L928374'),  '6c37a7fc-05c2-4331-9eff-6adc2a62802d',   '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 3, 'Giảng dạy Ngữ văn THPT'),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'E837465'),  'b15ec797-4c5c-440b-80ac-c2cd80acde45',   '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 3, 'Giảng dạy Tiếng Anh Global Success'),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'P298374'),  '5b68a943-43b2-4099-b1f1-b758f7309bf2',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Giảng dạy Vật lý nâng cao'),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'C187465'),  'a694e801-b76a-4e71-9871-96e7b4275db2',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Giảng dạy Hóa học KHTN'),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'CS643291'), '234cbf0b-be13-4233-a02c-fce474658390',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Thực hành Tin học văn phòng & Lập trình Python'),
  ('a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'PE657483'), 'fdd5b49c-dbb1-4fb9-a0da-4a3d813a2a44', '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Bóng rổ & Điền kinh'),
  -- 10D1
  ('95801ca0-9a30-460c-ba4c-16679637823d', (SELECT id FROM core.subjects WHERE code = 'M839201'),  'f81af94c-06d6-4b52-897d-86edc3543727', '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 3, 'Giảng dạy Toán cơ bản KHXH'),
  ('95801ca0-9a30-460c-ba4c-16679637823d', (SELECT id FROM core.subjects WHERE code = 'L928374'),  '6c37a7fc-05c2-4331-9eff-6adc2a62802d',   '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 4, 'Giảng dạy Ngữ văn chuyên sâu'),
  ('95801ca0-9a30-460c-ba4c-16679637823d', (SELECT id FROM core.subjects WHERE code = 'E837465'),  'b15ec797-4c5c-440b-80ac-c2cd80acde45',   '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 4, 'Giảng dạy Tiếng Anh chuyên ban D'),
  ('95801ca0-9a30-460c-ba4c-16679637823d', (SELECT id FROM core.subjects WHERE code = 'H746582'),  '7f310b6e-bc2a-4542-8a24-2f3e82dbd11a',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Lịch sử thế giới & Việt Nam')
ON CONFLICT (class_id, subject_id, semester_id) DO UPDATE SET
  teacher_id = EXCLUDED.teacher_id,
  periods_per_week = EXCLUDED.periods_per_week;

-- ---------------------------------------------------------------------
-- 31. CORE: Student Clubs & Extracurricular Societies (core.clubs)
-- Codes: CLB_ROB_839201, CLB_BSK_748292...
-- ---------------------------------------------------------------------
INSERT INTO core.clubs (
  id, school_id, code, name, category, advisor_teacher_id, president_student_id, description, is_active
) VALUES
  ('7fda4936-6d07-4f4f-9d79-862d6f8045fe', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'CLB_ROB_839201', 'CLB Sáng tạo Robotics & STEM', 'ACADEMIC',
   '234cbf0b-be13-4233-a02c-fce474658390', '190adaa6-7ceb-41d8-81b6-86cac98b004f', 'Nghiên cứu lập trình nhúng, thiết kế robot thi đấu VEX và AI học đường', TRUE),

  ('073dc2d5-dc5e-4061-91b5-5c865ca621e7', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'CLB_BSK_748292', 'CLB Bóng rổ THPT Lê Quý Đôn', 'SPORTS',
   'fdd5b49c-dbb1-4fb9-a0da-4a3d813a2a44', '7d38e8bb-2f28-4a22-98bc-1bdc7807ca2b', 'Tập luyện và thi đấu giải bóng rổ học sinh thành phố', TRUE),

  ('b93fc5d3-14cc-4b85-8577-50acbb785a80', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'CLB_ENG_659183', 'CLB Tiếng Anh & Hùng biện Quốc tế (LQD Debate)', 'ACADEMIC',
   'b15ec797-4c5c-440b-80ac-c2cd80acde45', '5ef27225-43a9-44bb-8391-c7af1ef355fb', 'Rèn luyện kỹ năng thuyết trình, tranh biện tiếng Anh và giao lưu quốc tế', TRUE),

  ('0361271b-b0be-4e75-be18-0a997587c80d', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'CLB_VOL_568294', 'Đội Tình nguyện Hoa Phượng Đỏ', 'COMMUNITY',
   '7f310b6e-bc2a-4542-8a24-2f3e82dbd11a', '3b88eac1-4928-4a42-9d3c-f84a123179a6', 'Hoạt động thiện nguyện, bảo vệ môi trường và gây quỹ học bổng bạn nghèo', TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  advisor_teacher_id = EXCLUDED.advisor_teacher_id,
  president_student_id = EXCLUDED.president_student_id;

-- ---------------------------------------------------------------------
-- 32. CORE: Club Memberships (core.club_members)
-- ---------------------------------------------------------------------
INSERT INTO core.club_members (club_id, student_id, role_title, status, contribution_notes) VALUES
  ('7fda4936-6d07-4f4f-9d79-862d6f8045fe',   '190adaa6-7ceb-41d8-81b6-86cac98b004f',    'PRESIDENT',          'ACTIVE', 'Chủ nhiệm CLB, phụ trách trưởng nhóm lập trình'),
  ('7fda4936-6d07-4f4f-9d79-862d6f8045fe',   '73d4a204-6f20-48e4-95e3-a13da68ca22a',   'MEMBER',             'ACTIVE', 'Thành viên ban thiết kế cơ khí robot'),
  ('073dc2d5-dc5e-4061-91b5-5c865ca621e7', '7d38e8bb-2f28-4a22-98bc-1bdc7807ca2b', 'PRESIDENT',          'ACTIVE', 'Đội trưởng đội bóng rổ nam'),
  ('073dc2d5-dc5e-4061-91b5-5c865ca621e7', '190adaa6-7ceb-41d8-81b6-86cac98b004f',    'MEMBER',             'ACTIVE', 'Hậu vệ ghi điểm'),
  ('073dc2d5-dc5e-4061-91b5-5c865ca621e7', '951f84e1-daff-42c6-9c44-75442273618a',   'MEMBER',             'ACTIVE', 'Tiền đạo cánh'),
  ('b93fc5d3-14cc-4b85-8577-50acbb785a80',    '5ef27225-43a9-44bb-8391-c7af1ef355fb',  'PRESIDENT',          'ACTIVE', 'Chủ nhiệm CLB Tranh biện tiếng Anh'),
  ('b93fc5d3-14cc-4b85-8577-50acbb785a80',    '3b88eac1-4928-4a42-9d3c-f84a123179a6',    'HEAD_OF_COMMITTEE', 'ACTIVE', 'Trưởng ban truyền thông sự kiện'),
  ('0361271b-b0be-4e75-be18-0a997587c80d',  '3b88eac1-4928-4a42-9d3c-f84a123179a6',    'PRESIDENT',          'ACTIVE', 'Đội trưởng Đội Tình nguyện Hoa Phượng Đỏ')
ON CONFLICT (club_id, student_id) DO UPDATE SET
  role_title = EXCLUDED.role_title;

-- ---------------------------------------------------------------------
-- 33. MASTER: Dynamic System Settings (sys.settings_definitions)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 34. SYS: School Default System Settings (sys.system_settings)
-- ---------------------------------------------------------------------
INSERT INTO sys.system_settings (school_id, setting_id, value, updated_by)
SELECT 'b5ebbdb9-a332-4fef-a64a-149c474159e6', s.id, s.default_value, 'a31148cb-1471-4c5e-aa66-0848fae24853'
FROM sys.settings_definitions s
ON CONFLICT (school_id, setting_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 35. SYS: User Personalized Settings (sys.user_settings)
-- ---------------------------------------------------------------------
INSERT INTO sys.user_settings (user_id, setting_id, value)
SELECT 'a31148cb-1471-4c5e-aa66-0848fae24853'::uuid, s.id, 'dark'
FROM sys.settings_definitions s WHERE s.code = 'theme'
UNION ALL
SELECT 'a31148cb-1471-4c5e-aa66-0848fae24853'::uuid, s.id, '#7C3AED'
FROM sys.settings_definitions s WHERE s.code = 'primary_color'
UNION ALL
SELECT '6c95bfb8-1039-4052-8133-cb540bd04d7e'::uuid, s.id, 'light'
FROM sys.settings_definitions s WHERE s.code = 'theme'
UNION ALL
SELECT '6c95bfb8-1039-4052-8133-cb540bd04d7e'::uuid, s.id, '#2563EB'
FROM sys.settings_definitions s WHERE s.code = 'primary_color'
ON CONFLICT (user_id, setting_id) DO UPDATE SET
  value = EXCLUDED.value;

-- ---------------------------------------------------------------------
-- 36. MASTER: Dynamic Modules / Dashboard Cards (sys.modules)
-- Codes: MOD_STT_839201, MOD_SMA_748292...
-- ---------------------------------------------------------------------
INSERT INTO sys.modules (code, name, short_name, description, icon, route, module_type, category, default_color, default_badge) VALUES
  ('MOD_STT_839201', 'Thời khóa biểu',            'TKB',        'Tra cứu lịch học tuần, ca sáng/chiều, phòng học và giảng viên', 'calendar',   '/student/timetable',    'CARD', 'ACADEMIC',      '#10B981', 'Hôm nay'),
  ('MOD_SMA_748292', 'Tài liệu môn học',          'Tài liệu',   'Giáo trình điện tử, slide bài giảng, đề cương ôn tập tải về',   'download',   '/student/materials',    'CARD', 'ACADEMIC',      '#9333EA', '18'),
  ('MOD_SAS_659183', 'Bài tập & Đồ án',           'Bài tập',    'Danh sách bài tập về nhà, nộp bài trực tuyến và nhận xét GV',    'edit',       '/student/assignments',  'CARD', 'ACADEMIC',      '#E11D48', '3'),
  ('MOD_SEX_568294', 'Bài kiểm tra & Phòng thi',  'Kiểm tra',   'Lịch thi định kỳ, trắc nghiệm trực tuyến, số báo danh',         'file',       '/student/exams',        'CARD', 'ACADEMIC',      '#DB2777', 'Sắp tới'),
  ('MOD_SRC_479105', 'Bảng điểm & Học bạ',        'Bảng điểm',  'Xem điểm thường xuyên, giữa kỳ, cuối kỳ và xếp loại học lực',   'chart',      '/student/gradebook',    'CARD', 'ACADEMIC',      '#7C3AED', 'GPA'),
  ('MOD_SRM_389216', 'Nhắc nhở học tập',          'Nhắc nhở',   'Hạn nộp bài, lịch trực nhật, lịch họp chi đoàn',                'clock',      '/student/reminders',    'CARD', 'COMMUNICATION', '#CA8A04', '4'),
  ('MOD_SAN_298307', 'Thông báo nhà trường',      'Thông báo',  'Tin tức chính thức từ BGH, Đoàn trường và Giáo viên chủ nhiệm', 'info',        '/student/notices',      'CARD', 'COMMUNICATION', '#3B82F6', '10'),
  ('MOD_TEV_187498', 'Khảo sát & Đánh giá',       'Đánh giá',   'Khảo sát chất lượng giờ dạy cuối kỳ và đánh giá CSVC',          'edit',       '/student/evaluations',  'CARD', 'EVALUATION',    '#EA580C', 'Khảo sát'),
  ('MOD_FEV_976589', 'Đánh giá & Báo hỏng CSVC',  'Báo hỏng',   'Phản ánh tình trạng máy chiếu, quạt, bàn ghế phòng học',         'tool',       '/student/evaluations/facility','CARD', 'EVALUATION', '#64748B', 'Sửa chữa'),
  ('MOD_EMU_865490', 'Thi đua cá nhân & Tổ lớp',  'Thi đua',    'Điểm nề nếp, điểm cộng học tập, xếp hạng thi đua trong lớp',    'user',       '/student/emulation',    'CARD', 'EMULATION',     '#D97706', 'Hạng'),
  ('MOD_SCB_754381', 'Sổ liên lạc điện tử',       'Sổ liên lạc','Xem phiếu nhận xét định kỳ từ GVCN và ký xác nhận',          'book',       '/student/contact-book', 'CARD', 'COMMUNICATION', '#0284C7', 'Mới'),
  ('MOD_SCL_643272', 'Câu lạc bộ & Ngoại khóa',   'CLB Đoàn',   'Đăng ký tham gia CLB, hoạt động tình nguyện, ngày hội STEM', 'users',      '/student/clubs',        'CARD', 'EMULATION',     '#8B5CF6', 'Hoạt động'),
  ('MOD_SFE_532163', 'Học phí & Khoản thu',       'Học phí',    'Tra cứu hóa đơn học phí, bảo hiểm y tế và thanh toán online', 'settings',   '/student/fees',         'CARD', 'MANAGEMENT',    '#0D9488', 'Học phí'),
  ('MOD_SAT_482910', 'Điểm danh chuyên cần',      'Điểm danh',  'Theo dõi tình trạng chuyên cần, vắng có phép, vắng không phép', 'check',      '/student/attendance',   'CARD', 'ACADEMIC',      '#06B6D4', 'Điểm danh'),
  ('MOD_STR_421054', 'Tổ hợp môn GDPT & THPT',    'Tổ hợp môn', 'Thông tin ban học tập, cụm chuyên đề lựa chọn',               'layers',     '/student/track',        'CARD', 'ACADEMIC',      '#6366F1', 'Tổ hợp'),
  ('MOD_SOT_310945', 'Khảo thí Trắc nghiệm',      'Thi online', 'Làm bài kiểm tra trực tuyến, trắc nghiệm tính giờ',           'check-circle','/student/online-test', 'CARD', 'ACADEMIC',      '#F43F5E', 'Online'),
  ('MOD_TJR_209836', 'Sổ đầu bài điện tử',        'Sổ đầu bài', 'Ghi nhận bài học, sĩ số, nhận xét và xếp loại tiết học A/B/C/D','book',       '/teacher/journal',      'CARD', 'ACADEMIC',      '#10B981', 'Ký sổ'),
  ('MOD_TGE_198725', 'Sổ điểm điện tử',           'Nhập điểm',  'Nhập điểm thường xuyên, giữa kỳ, cuối kỳ theo chuẩn TT22',      'edit',       '/teacher/grades',       'CARD', 'ACADEMIC',      '#3B82F6', 'Sổ điểm'),
  ('MOD_TAT_087614', 'Điểm danh lớp học',         'Điểm danh',  'Điểm danh chuyên cần theo tiết hoặc theo buổi học',             'check',      '/teacher/attendance',   'CARD', 'ACADEMIC',      '#059669', 'Điểm danh'),
  ('MOD_THM_976503', 'Quản lý Lớp chủ nhiệm',     'Lớp CN',     'Theo dõi học lực, hạnh kiểm, ban cán sự lớp và liên hệ CMHS',   'user',       '/teacher/homeroom',     'CARD', 'MANAGEMENT',    '#7C3AED', 'Chủ nhiệm'),
  ('MOD_SDU_865492', 'Chấm nề nếp & Cờ đỏ',       'Trực ban',   'Sổ trực ban giám thị, ghi nhận vi phạm trang phục, trễ giờ',    'clipboard',  '/supervisor/duty',      'CARD', 'EMULATION',     '#D97706', 'Trực ban'),
  ('MOD_SDI_754381', 'Quản lý Kỷ luật trường',    'Kỷ luật',    'Lập biên bản vi phạm, gửi thông báo đến PH, mời họp hội đồng',  'alert-triangle','/supervisor/discipline','CARD', 'EMULATION',  '#DC2626', 'Xử lý'),
  ('MOD_PAN_643270', 'Báo cáo Toàn diện',         'Analytics',  'Thống kê tổng thể chất lượng dạy & học, tỷ lệ đỗ, nề nếp toàn trường', 'chart', '/principal/analytics', 'CARD', 'MANAGEMENT', '#1E293B', 'Báo cáo'),
  ('MOD_PAD_532159', 'Chứng chỉ & Thành tích',    'Chứng chỉ',  'Tổng hợp chứng chỉ và thành tích của bạn, lớp, trường trong suốt quá trình học tập', 'certificate', '/general/certificate', 'CARD', 'MANAGEMENT', '#0F172A', 'Chứng chỉ')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  route = EXCLUDED.route,
  category = EXCLUDED.category;

-- ---------------------------------------------------------------------
-- 37. SYS: Role - Module Mappings (sys.role_modules)
-- ---------------------------------------------------------------------
-- Student Role
INSERT INTO sys.role_modules (role_id, module_id, is_visible, is_pinned_default, order_no, grid_col_span, custom_badge, config)
SELECT
  r.id,
  m.id,
  f.is_visible,
  f.is_pinned,
  f.order_no,
  1,
  f.custom_badge,
  f.config
FROM (
  VALUES
    ('MOD_SAN_298307', 1::smallint,  TRUE, TRUE,  '10', '{"id": "feat-notices", "translationKey": "announcements", "iconName": "info", "iconBgColor": "bg-blue-50 border border-blue-200", "iconColor": "text-blue-600", "badgeCount": 10, "badgeColor": "blue", "route": "/student/notices"}'::jsonb),
    ('MOD_STT_839201', 2::smallint,  TRUE, TRUE,  NULL, '{"id": "feat-timetable", "translationKey": "timetable", "iconName": "calendar", "iconBgColor": "bg-emerald-50 border border-emerald-200", "iconColor": "text-emerald-600", "badgeColor": "green", "route": "/student/timetable"}'::jsonb),
    ('MOD_SAS_659183', 3::smallint,  TRUE, TRUE,  '3',  '{"id": "feat-assignments", "translationKey": "assignments", "iconName": "edit", "iconBgColor": "bg-rose-50 border border-rose-200", "iconColor": "text-rose-600", "badgeCount": 3, "badgeColor": "red", "route": "/student/assignments"}'::jsonb),
    ('MOD_SEX_568294', 4::smallint,  TRUE, TRUE,  NULL, '{"id": "feat-exams", "translationKey": "exams", "iconName": "file", "iconBgColor": "bg-pink-50 border border-pink-200", "iconColor": "text-pink-600", "badgeColor": "red", "route": "/student/exams"}'::jsonb),
    ('MOD_SRC_479105', 5::smallint,  TRUE, TRUE,  NULL, '{"id": "feat-gradebook", "translationKey": "gradebook", "iconName": "chart", "iconBgColor": "bg-violet-50 border border-violet-200", "iconColor": "text-violet-600", "badgeColor": "purple", "route": "/student/gradebook"}'::jsonb),
    ('MOD_SMA_748292', 6::smallint,  TRUE, TRUE,  '18', '{"id": "feat-materials", "translationKey": "materials", "iconName": "download", "iconBgColor": "bg-purple-50 border border-purple-200", "iconColor": "text-purple-600", "badgeCount": 18, "badgeColor": "purple", "route": "/student/materials"}'::jsonb),
    ('MOD_SAT_482910', 7::smallint,  TRUE, FALSE, NULL, '{"id": "feat-attendance", "translationKey": "attendance", "iconName": "check", "iconBgColor": "bg-cyan-50 border border-cyan-200", "iconColor": "text-cyan-600", "badgeColor": "cyan", "route": "/student/attendance"}'::jsonb),
    ('MOD_SCB_754381', 8::smallint,  TRUE, FALSE, NULL, '{"id": "feat-contact-book", "translationKey": "contactBook", "iconName": "book", "iconBgColor": "bg-sky-50 border border-sky-200", "iconColor": "text-sky-600", "badgeColor": "blue", "route": "/student/contact-book"}'::jsonb),
    ('MOD_EMU_865490', 9::smallint,  TRUE, FALSE, NULL, '{"id": "feat-emulation", "translationKey": "emulation", "iconName": "user", "iconBgColor": "bg-amber-50 border border-amber-200", "iconColor": "text-amber-600", "badgeColor": "gold", "route": "/student/emulation"}'::jsonb),
    ('MOD_SFE_532163', 10::smallint, TRUE, FALSE, NULL, '{"id": "feat-fees", "translationKey": "fees", "iconName": "settings", "iconBgColor": "bg-teal-50 border border-teal-200", "iconColor": "text-teal-600", "badgeColor": "green", "route": "/student/fees"}'::jsonb),
    ('MOD_SRM_389216', 11::smallint, TRUE, FALSE, '4',  '{"id": "feat-reminders", "translationKey": "reminders", "iconName": "clock", "iconBgColor": "bg-yellow-50 border border-yellow-200", "iconColor": "text-yellow-600", "badgeCount": 4, "badgeColor": "gold", "route": "/student/reminders"}'::jsonb),
    ('MOD_TEV_187498', 12::smallint, TRUE, FALSE, NULL, '{"id": "feat-evaluations", "translationKey": "evaluations", "iconName": "edit", "iconBgColor": "bg-orange-50 border border-orange-200", "iconColor": "text-orange-600", "badgeColor": "cyan", "route": "/student/evaluations"}'::jsonb),
    ('MOD_SCL_643272', 13::smallint, TRUE, FALSE, NULL, '{"id": "feat-clubs", "translationKey": "clubs", "iconName": "users", "route": "/student/clubs"}'::jsonb),
    ('MOD_STR_421054', 14::smallint, TRUE, FALSE, NULL, '{"id": "feat-track", "translationKey": "track", "iconName": "layers", "route": "/student/track"}'::jsonb),
    ('MOD_SOT_310945', 15::smallint, TRUE, FALSE, NULL, '{"id": "feat-online-test", "translationKey": "onlineTest", "iconName": "check-circle", "route": "/student/online-test"}'::jsonb)
) AS f(code, order_no, is_visible, is_pinned, custom_badge, config)
JOIN sys.modules m ON m.code = f.code
CROSS JOIN core.roles r
WHERE r.code = 'R_STU_568294' OR r.code = 'STUDENT'
ON CONFLICT (role_id, module_id) DO UPDATE SET
  is_visible        = EXCLUDED.is_visible,
  is_pinned_default = EXCLUDED.is_pinned_default,
  order_no          = EXCLUDED.order_no,
  custom_badge      = EXCLUDED.custom_badge,
  config            = EXCLUDED.config;

-- Teacher, Supervisor, Principal Roles
INSERT INTO sys.role_modules (role_id, module_id, is_visible, is_pinned_default, order_no)
-- Teacher Role
SELECT r.id, m.id, TRUE, TRUE, 1 FROM core.roles r, sys.modules m WHERE r.code = 'R_TCH_659183' AND m.code = 'MOD_TJR_209836'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 2 FROM core.roles r, sys.modules m WHERE r.code = 'R_TCH_659183' AND m.code = 'MOD_TGE_198725'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 3 FROM core.roles r, sys.modules m WHERE r.code = 'R_TCH_659183' AND m.code = 'MOD_TAT_087614'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 4 FROM core.roles r, sys.modules m WHERE r.code = 'R_TCH_659183' AND m.code = 'MOD_THM_976503'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 5 FROM core.roles r, sys.modules m WHERE r.code = 'R_TCH_659183' AND m.code = 'MOD_STT_839201'
UNION ALL SELECT r.id, m.id, TRUE, FALSE, 6 FROM core.roles r, sys.modules m WHERE r.code = 'R_TCH_659183' AND m.code = 'MOD_SMA_748292'
-- Supervisor Role
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 1 FROM core.roles r, sys.modules m WHERE r.code = 'R_SUP_479105' AND m.code = 'MOD_SDU_865492'
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 2 FROM core.roles r, sys.modules m WHERE r.code = 'R_SUP_479105' AND m.code = 'MOD_SDI_754381'
-- Principal Role
UNION ALL SELECT r.id, m.id, TRUE, TRUE, 1 FROM core.roles r, sys.modules m WHERE r.code = 'R_PRIN_748292' AND m.code = 'MOD_PAN_643270'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 38. MASTER: Emulation Point Criteria (emulation.criteria)
-- Codes: EMU_ONT_839201, EMU_LT_748292...
-- ---------------------------------------------------------------------
INSERT INTO emulation.criteria (code, name, category, scope_type, points, is_violation, description) VALUES
  ('EMU_ONT_839201', 'Đi học đúng giờ, xếp hàng nghiêm túc', 'DISCIPLINE', 'CLASS',       2.0, FALSE, 'Không có học sinh nào đi trễ trong buổi học'),
  ('EMU_LT_748292',  'Đi học trễ (sau hiệu lệnh trống)',     'DISCIPLINE', 'INDIVIDUAL', -2.0, TRUE,  'Học sinh đến trường muộn không có lý do chính đáng'),
  ('EMU_WUF_659183', 'Mặc sai quy định đồng phục / phù hiệu','DISCIPLINE', 'INDIVIDUAL', -2.0, TRUE,  'Không đeo phù hiệu, mặc áo khác quy định'),
  ('EMU_GDL_568294', 'Tiết học đạt điểm Tốt (Điểm A)',       'ACADEMIC',   'CLASS',       5.0, FALSE, 'Được giáo viên bộ môn phê tiết học tốt vào sổ đầu bài'),
  ('EMU_BDL_479105', 'Tiết học không đạt (Điểm C hoặc D)',   'ACADEMIC',   'CLASS',      -5.0, TRUE,  'Tiết học mất trật tự hoặc nhiều bạn chưa thuộc bài'),
  ('EMU_TP10_389216','Học sinh đạt điểm 9 hoặc 10 bài cũ',   'ACADEMIC',   'INDIVIDUAL',  2.0, FALSE, 'Được ghi nhận điểm tốt miệng hoặc 15 phút'),
  ('EMU_CLC_298307', 'Trực nhật lớp sạch sẽ, bàn ghế ngay ngắn','HYGIENE', 'CLASS',       3.0, FALSE, 'Được cờ đỏ / giám thị chấm đạt điểm tối đa'),
  ('EMU_DTC_187498', 'Lớp học có rác sau giờ tan học',       'HYGIENE',    'CLASS',      -3.0, TRUE,  'Để rác trong hộc bàn hoặc sàn lớp'),
  ('EMU_PHO_976589', 'Sử dụng điện thoại trong giờ không xin phép','DISCIPLINE','INDIVIDUAL',-5.0,TRUE, 'Dùng điện thoại chơi game / lướt mạng trong giờ học'),
  ('EMU_ACT_865490', 'Tham gia biểu diễn văn nghệ / thể thao Cấp Trường','ACTIVITY','CLASS',10.0,FALSE,'Đóng góp tích cực cho phong trào thi đua của trường')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  points = EXCLUDED.points,
  is_violation = EXCLUDED.is_violation;

-- ---------------------------------------------------------------------
-- 39. PRESERVED SAMPLE DOMAIN SEEDS
-- ---------------------------------------------------------------------
-- Curriculum Tracks
INSERT INTO academic.curriculum_tracks (id, school_id, grade_id, code, name, career_orientation, description) VALUES
  ('6c30f421-ba2d-446c-b98c-fb02d07f8cbb', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', '6294ceb2-291c-4e72-b839-2a72f0950b21', 'TRK_A00_839201', 'Ban Tự nhiên A00 (Toán - Vật lý - Hóa học - Tin học)', 'Kỹ thuật, Công nghệ thông tin, Bách khoa', 'Tổ hợp môn định hướng khối ngành khoa học kỹ thuật'),
  ('7f89dc24-2a99-484a-8dd8-e83e8eac41df', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', '6294ceb2-291c-4e72-b839-2a72f0950b21', 'TRK_D01_748292', 'Ban Xã hội D01 (Ngữ văn - Lịch sử - Địa lý - GDKT&PL)', 'Kinh tế, Luật, Báo chí truyền thông, Ngoại giao', 'Tổ hợp môn định hướng khối ngành khoa học xã hội')
ON CONFLICT (school_id, grade_id, code) DO NOTHING;

-- Student Track Enrollment for Nam
INSERT INTO academic.student_track_enrollments (student_id, track_id, academic_year_id, status)
VALUES ('190adaa6-7ceb-41d8-81b6-86cac98b004f', '6c30f421-ba2d-446c-b98c-fb02d07f8cbb', 'd6e893be-2b6f-413c-90f3-01747b60c01d', 'ACTIVE')
ON CONFLICT (student_id, academic_year_id) DO NOTHING;

-- Question Bank Sample
INSERT INTO academic.question_bank (id, subject_id, grade_id, chapter_name, difficulty_level, question_type, content, options, correct_answers, solution_explanation, default_score) VALUES
  ('44dda071-6a90-4e0b-9d2a-cbb424f37bff', (SELECT id FROM core.subjects WHERE code = 'M839201' LIMIT 1), '6294ceb2-291c-4e72-b839-2a72f0950b21', 'Mệnh đề & Tập hợp', 'RECOGNITION', 'SINGLE_CHOICE',
   'Cho tập hợp $A = \{x \in \mathbb{R} \mid x^2 - 4 = 0\}$. Số phần tử của tập hợp $A$ là:',
   '[{"key":"A","text":"0"},{"key":"B","text":"1"},{"key":"C","text":"2"},{"key":"D","text":"4"}]'::jsonb,
   '["C"]'::jsonb,
   'Phương trình $x^2 - 4 = 0 \Leftrightarrow x = \pm 2$. Cả hai nghiệm đều là số thực, vậy $A = \{-2; 2\}$ có 2 phần tử.', 0.25)
ON CONFLICT DO NOTHING;

-- Tuition & Health Insurance Fees
INSERT INTO academic.fee_items (id, school_id, academic_year_id, semester_id, code, name, category, amount, is_mandatory, due_date) VALUES
  ('fa00f8d3-50ad-47dd-aa6e-f0924008c934',   'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 'FEE_BHYT_839201', 'Bảo hiểm y tế học sinh năm học 2026-2027', 'HEALTH_INSURANCE', 680400.00, TRUE, '2026-10-31'),
  ('623cc110-5920-49c1-9b5e-c7e02ea41aa3', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'd6e893be-2b6f-413c-90f3-01747b60c01d', '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 'FEE_TUI_748292',  'Học phí Học kỳ 1 (Quy định Nhà nước)', 'TUITION', 300000.00, TRUE, '2026-11-15')
ON CONFLICT (school_id, academic_year_id, code) DO NOTHING;

-- Student Fee Bill for Nam
INSERT INTO academic.student_fee_bills (student_id, fee_item_id, bill_code, original_amount, final_amount, paid_amount, payment_status, payment_method, paid_at)
VALUES ('190adaa6-7ceb-41d8-81b6-86cac98b004f', 'fa00f8d3-50ad-47dd-aa6e-f0924008c934', 'BILL_2026_839201', 680400.00, 680400.00, 680400.00, 'PAID', 'BANK_TRANSFER', now())
ON CONFLICT (student_id, fee_item_id) DO NOTHING;

-- Emulation Awards
INSERT INTO emulation.awards (student_id, academic_year_id, award_category, level, prize, title, decision_number, bonus_points, signed_by)
VALUES ('190adaa6-7ceb-41d8-81b6-86cac98b004f', 'd6e893be-2b6f-413c-90f3-01747b60c01d', 'STEM_INNOVATION', 'PROVINCIAL', 'FIRST_PRIZE', 'Giải Nhất Hội thi Sáng tạo Robot Cấp Thành phố', 'QD142_839201', 20, 'Giám đốc Sở GD&ĐT')
ON CONFLICT DO NOTHING;

-- Electronic Contact Book Note for Nam
INSERT INTO notification.contact_book_notes (student_id, class_id, semester_id, period_type, period_label, academic_digest, attendance_digest, emulation_digest, teacher_remarks, parent_acknowledged, created_by)
VALUES (
  '190adaa6-7ceb-41d8-81b6-86cac98b004f', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 'WEEKLY', 'Tuần 4 (22/09 - 27/09)',
  '{"toan": 9.5, "ngu_van": 8.0, "tieng_anh": 9.0}'::jsonb,
  '{"present": 5, "absent": 0, "late": 0}'::jsonb,
  '{"bonus_points": 15, "violations": 0}'::jsonb,
  'Em Nam gương mẫu, hoàn thành xuất sắc nhiệm vụ điều hành sinh hoạt 15 phút đầu giờ của lớp.',
  TRUE,
  '6b369de1-c41d-43f7-a362-86e9733f768a'
) ON CONFLICT (student_id, semester_id, period_type, period_label) DO NOTHING;

-- =====================================================================
-- SEED DATA: notification.announcements
-- Realistic high school announcements for SchoolPro system
-- =====================================================================

INSERT INTO notification.announcements (
  id, school_id, title, summary, content, category, target_type,
  target_grade_id, target_class_id, target_role_id, target_user_id,
  priority, is_pinned, views_count, department, attachments,
  published_by, published_at, expires_at
) VALUES
(
  'e1000001-0000-0000-0000-000000000001',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Thông báo lịch thi Giữa học kỳ 1 năm học 2026 - 2027',
  'Lịch thi chi tiết các môn tập trung từ ngày 20/10/2026 đến 25/10/2026 dành cho toàn thể học sinh các khối.',
  '<p>Kính gửi quý thầy cô giáo, quý phụ huynh và các em học sinh toàn trường,</p><p>Ban Giám hiệu nhà trường xin thông báo lịch kiểm tra đánh giá giữa học kỳ 1 năm học 2026 - 2027 như sau:</p><ul><li><strong>Thời gian thi:</strong> Từ thứ Hai ngày 20/10/2026 đến hết thứ Bảy ngày 25/10/2026.</li><li><strong>Hình thức:</strong> Kết hợp trắc nghiệm khách quan trên máy tính và tự luận trên giấy thi.</li><li><strong>Địa điểm:</strong> Các phòng thi tập trung tại Dãy nhà A và B.</li></ul><p>Học sinh có mặt trước giờ làm bài 15 phút, trang phục nghiêm túc theo nội quy nhà trường và mang đầy đủ thẻ học sinh.</p>',
  'EXAM',
  'SCHOOL',
  NULL, NULL, NULL, NULL,
  'URGENT',
  TRUE,
  342,
  'Ban Giám Hiệu',
  '[{"id": "att-1", "name": "Lich_Thi_Giu_Ky_1_2026_2027.pdf", "url": "/attachments/lich_thi_gk1.pdf", "size": "1.8 MB", "fileType": "pdf"}]'::jsonb,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '30 days'
),
(
  'e1000001-0000-0000-0000-000000000002',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Kế hoạch ôn tập và phụ đạo học kỳ 1 các bộ môn Toán, Lý, Hóa',
  'Tổ chức lớp ôn tập bổ trợ kiến thức ngoài giờ học chính khóa dành cho học sinh có nguyện vọng.',
  '<p>Thực hiện kế hoạch nâng cao chất lượng dạy và học của nhà trường trong học kỳ 1, Phòng Đào tạo phối hợp cùng các tổ bộ môn Khoa học Tự nhiên tổ chức các buổi ôn tập chuyên đề:</p><ol><li>Toán học: Đại số nâng cao và Hình học không gian (Thứ 3 và Thứ 5 hàng tuần).</li><li>Vật lý: Động lực học chất điểm và Định luật bảo toàn (Chiều Thứ 4).</li><li>Hóa học: Cấu tạo nguyên tử và Liên kết hóa học (Sáng Thứ 7).</li></ol><p>Học sinh đăng ký trực tiếp với Giáo viên bộ môn trước ngày 10/10/2026.</p>',
  'ACADEMIC',
  'SCHOOL',
  NULL, NULL, NULL, NULL,
  'HIGH',
  TRUE,
  189,
  'Phòng Đào Tạo',
  '[{"id": "att-2", "name": "Ke_Hoach_On_Tap_HK1.docx", "url": "/attachments/ke_hoach_on_tap.docx", "size": "450 KB", "fileType": "docx"}]'::jsonb,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '45 days'
),
(
  'e1000001-0000-0000-0000-000000000003',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Phát động phong trào thi đua chào mừng ngày Nhà giáo Việt Nam 20/11',
  'Đoàn trường phát động chuỗi hoạt động thi đua Hoa điểm 10, Hội thi văn nghệ và Làm báo tường.',
  '<p>Hướng tới kỷ niệm 44 năm Ngày Nhà giáo Việt Nam (20/11/1982 - 20/11/2026), Ban Thường vụ Đoàn trường phát động phong trào thi đua sôi nổi trong toàn thể đoàn viên, thanh niên và học sinh:</p><ul><li>Phong trào <em>Hoa điểm mười dâng tặng thầy cô</em> từ 15/10 đến 15/11.</li><li>Hội thi văn nghệ học sinh cấp trường với chủ đề <em>Người gieo mầm ước mơ</em>.</li><li>Thiết kế báo tường và video tri ân thầy cô giáo.</li></ul>',
  'EMULATION',
  'ROLE',
  NULL, NULL, '9e12103a-09f5-4d61-9c8d-88b6309ed3cb', NULL,
  'NORMAL',
  FALSE,
  128,
  'Đoàn Thanh Niên',
  NULL,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '4 days',
  NOW() + INTERVAL '50 days'
),
(
  'e1000001-0000-0000-0000-000000000004',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Thông báo nộp phí Bảo hiểm Y tế học sinh năm học 2026 - 2027',
  'Hướng dẫn mức đóng và thời hạn hoàn tất đóng bảo hiểm y tế bắt buộc theo quy định của Nhà nước.',
  '<p>Căn cứ Luật Bảo hiểm Y tế và hướng dẫn của Bảo hiểm Xã hội TP.HCM, Phòng Tài vụ thông báo đến phụ huynh và học sinh về việc thu BHYT năm học 2026 - 2027:</p><p>Mức thu: 680.400 VNĐ/học sinh/12 tháng. Phụ huynh có thể nộp trực tiếp qua Cổng thanh toán trực tuyến hoặc nộp cho Giáo viên chủ nhiệm trước ngày 25/10/2026.</p>',
  'FEES',
  'SCHOOL',
  NULL, NULL, NULL, NULL,
  'NORMAL',
  FALSE,
  95,
  'Phòng Tài Vụ',
  '[{"id": "att-3", "name": "Huong_Dan_Dong_BHYT_2026.pdf", "url": "/attachments/bhyt.pdf", "size": "320 KB", "fileType": "pdf"}]'::jsonb,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '20 days'
),
(
  'e1000001-0000-0000-0000-000000000005',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Kế hoạch tổ chức Hội thao học sinh và Ngày hội Sức khỏe học đường',
  'Giải đấu bóng đá nam, bóng rổ nữ và chạy tiếp sức diễn ra vào sáng Chủ Nhật tuần 6.',
  '<p>Nhằm rèn luyện thể chất và nâng cao tinh thần đoàn kết, nhà trường tổ chức Hội thao học sinh lần thứ XIV với các môn thi đấu: Bóng đá mini (Nam), Bóng rổ (Nữ), Cầu lông đơn nam/nữ và Cờ vua.</p><p>Các lớp gửi danh sách vận động viên về Văn phòng Đoàn trước ngày 12/10/2026.</p>',
  'EVENTS',
  'SCHOOL',
  NULL, NULL, NULL, NULL,
  'NORMAL',
  FALSE,
  210,
  'Tổ Thể Dục - Giáo Dục Quốc Phòng',
  NULL,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '6 days',
  NOW() + INTERVAL '25 days'
),
(
  'e1000001-0000-0000-0000-000000000006',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Quy định về đồng phục và nền nếp kỷ cương học đường năm học mới',
  'Nhắc nhở học sinh tuân thủ nội quy trang phục, tác phong và việc sử dụng điện thoại thông minh trong giờ học.',
  '<p>Để xây dựng môi trường sư phạm văn minh, Ban Giám thị trường THPT Lê Quý Đôn lưu ý toàn thể học sinh các quy định sau:</p><ul><li>Đeo phù hiệu trường và thẻ học sinh đầy đủ khi đến trường.</li><li>Nam mặc quần tây xanh đen/đen, nữ mặc váy đồng phục theo quy định.</li><li>Tuyệt đối không sử dụng điện thoại trong giờ học trừ khi có sự cho phép của giáo viên bộ môn nhằm phục vụ học tập.</li></ul>',
  'GENERAL',
  'SCHOOL',
  NULL, NULL, NULL, NULL,
  'HIGH',
  FALSE,
  450,
  'Ban Giám Thị',
  NULL,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '120 days'
),
(
  'e1000001-0000-0000-0000-000000000007',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Chuyên đề kỹ năng mềm và phương pháp học tập THPT dành cho Khối 10',
  'Buổi sinh hoạt chuyên đề do chuyên gia tâm lý giáo dục hướng dẫn tại Hội trường A.',
  '<p>Chào đón các tân học sinh Khối 10, nhà trường tổ chức buổi workshop <strong>Bứt phá thời THPT - Phương pháp tự học và quản lý thời gian hiệu quả</strong> vào tiết sinh hoạt dưới cờ ngày Thứ Hai tới.</p><p>Yêu cầu 100% học sinh Khối 10 tham gia đúng giờ và mang theo sổ tay ghi chép.</p>',
  'EVENTS',
  'GRADE',
  '6294ceb2-291c-4e72-b839-2a72f0950b21', NULL, NULL, NULL,
  'NORMAL',
  FALSE,
  165,
  'Phòng Công Tác Học Sinh',
  NULL,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '14 days'
),
(
  'e1000001-0000-0000-0000-000000000008',
  'b5ebbdb9-a332-4fef-a64a-149c474159e6',
  'Phân công nhiệm vụ Trực ban và chăm sóc vườn cây chi đoàn 10A1',
  'Chi tiết nhiệm vụ trực tuần từ ngày 06/10 đến ngày 11/10/2026 của tập thể Lớp 10A1.',
  '<p>Ban Giám thị phân công Lớp 10A1 đảm nhiệm công tác trực ban trường trong Tuần 6:</p><ul><li>Đội cờ đỏ: Kiểm tra nền nếp, sĩ số các lớp tại cổng trường từ 6h45 đến 7h15.</li><li>Đội bảo quản vệ sinh: Vệ sinh khu vực sân cờ và chăm sóc vườn hoa thanh niên Dãy A.</li><li>Phụ trách nghi thức chào cờ sáng thứ Hai.</li></ul>',
  'ACADEMIC',
  'CLASS',
  NULL, 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', NULL, NULL,
  'NORMAL',
  FALSE,
  82,
  'Ban Giám Thị',
  NULL,
  'a31148cb-1471-4c5e-aa66-0848fae24853',
  NOW() - INTERVAL '12 hours',
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  priority = EXCLUDED.priority,
  is_pinned = EXCLUDED.is_pinned,
  department = EXCLUDED.department,
  attachments = EXCLUDED.attachments;


-- =====================================================================
-- 40. MASTER & ACADEMIC: Rooms, Periods & Timetable Schedule Seeds
-- =====================================================================

-- 40.1 Rooms
INSERT INTO academic.rooms (id, school_id, code, name, room_type, capacity, building, floor, status)
VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'P301', 'Phòng học 301', 'CLASSROOM', 45, 'Dãy nhà B', 3, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000002', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'P302', 'Phòng học 302', 'CLASSROOM', 45, 'Dãy nhà B', 3, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000003', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'LAB_HOA', 'Phòng Thí nghiệm Hóa học', 'LAB', 40, 'Dãy nhà C (Khu Thí nghiệm)', 2, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000004', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'LAB_LY', 'Phòng Thí nghiệm Vật lý', 'LAB', 40, 'Dãy nhà C (Khu Thí nghiệm)', 2, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000005', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'LAB_TIN', 'Phòng Máy tính 1', 'COMPUTER_ROOM', 45, 'Dãy nhà A (Khu Công nghệ)', 1, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000006', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'SAN_TD', 'Sân Thể thao đa năng', 'GYM', 100, 'Nhà thi đấu trường', 1, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000007', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'SAN_QS', 'Sân tập Quân sự', 'CLASSROOM', 100, 'Khuôn viên trường', 1, 'AVAILABLE'),
  ('c1000001-0000-0000-0000-000000000008', 'b5ebbdb9-a332-4fef-a64a-149c474159e6', 'ONLINE', 'Lớp học trực tuyến THPT', 'CLASSROOM', 100, 'Hệ thống E-Learning', 1, 'AVAILABLE')
ON CONFLICT (school_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  building = EXCLUDED.building;

-- 40.2 Ensure all subject teachers exist for 10A1
INSERT INTO core.class_subject_teachers (
  id, class_id, subject_id, teacher_id, semester_id, periods_per_week, notes
) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'H746582'),  '7f310b6e-bc2a-4542-8a24-2f3e82dbd11a',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Giảng dạy Lịch sử lớp 10A1'),
  ('d1000001-0000-0000-0000-000000000002', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'B976584'),  'a694e801-b76a-4e71-9871-96e7b4275db2',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Giảng dạy Sinh học lớp 10A1'),
  ('d1000001-0000-0000-0000-000000000003', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', (SELECT id FROM core.subjects WHERE code = 'EA479281'), 'a694e801-b76a-4e71-9871-96e7b4275db2',  '53a5dc39-38dc-41bb-a7db-04745fa7d73a', 2, 'Hoạt động trải nghiệm & Sinh hoạt lớp 10A1')
ON CONFLICT (class_id, subject_id, semester_id) DO NOTHING;

-- 40.3 Timetables for Class 10A1
INSERT INTO academic.timetables (
  id, class_id, semester_id, day_of_week, period_id,
  class_subject_teacher_id, room_id, class_type, is_online,
  online_url, lesson_topic, notes, color_theme, effective_from, effective_to
) VALUES
  -- Thứ 2 Sáng (Day 2, Morning, Tiết 1): Toán học
  ('e1000001-0000-0000-0000-000000000001', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   2, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 1 AND shift = 'MORNING' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'M839201') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Chương 1: Mệnh đề toán học và Tập hợp số thực', 'Làm bài tập trang 32 SGK, mang máy tính bỏ túi Casio và compa',
   'blue', '2026-09-01', '2027-01-15'),

  -- Thứ 2 Chiều (Day 2, Afternoon, Tiết 1 / Tiết 6 cả ngày): Giáo dục Thể chất
  ('e1000001-0000-0000-0000-000000000002', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   2, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 6 AND shift = 'AFTERNOON' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'PE657483') LIMIT 1),
   'c1000001-0000-0000-0000-000000000006', 'PRACTICE', FALSE, NULL,
   'Kỹ thuật dẫn bóng hai bước lên rổ và phối hợp tấn công nhanh', 'Bắt buộc mặc đồng phục thể dục của trường, mang giày thể thao',
   'emerald', '2026-09-01', '2027-01-15'),

  -- Thứ 3 Sáng (Day 3, Morning, Tiết 1): Ngữ văn
  ('e1000001-0000-0000-0000-000000000003', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   3, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 1 AND shift = 'MORNING' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'L928374') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Chiến thắng Mtao Mxây (Sử thi Đăm Săn) - Vẻ đẹp người anh hùng', 'Soạn bài câu 1-4 trong SGK, chuẩn bị kiểm tra 15 phút đầu giờ',
   'violet', '2026-09-01', '2027-01-15'),

  -- Thứ 3 Chiều (Day 3, Afternoon, Tiết 1 / Tiết 6 cả ngày): Tin học (Thực hành Python)
  ('e1000001-0000-0000-0000-000000000004', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   3, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 6 AND shift = 'AFTERNOON' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'CS643291') LIMIT 1),
   'c1000001-0000-0000-0000-000000000005', 'PRACTICE', FALSE, NULL,
   'Thực hành cấu trúc dữ liệu danh sách (List) và giải thuật sắp xếp', 'Hoàn thiện bài tập thực hành trên máy và nộp trước 17:00',
   'indigo', '2026-09-01', '2027-01-15'),

  -- Thứ 4 Sáng (Day 4, Morning, Tiết 1): Tiếng Anh (Trực tuyến)
  ('e1000001-0000-0000-0000-000000000005', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   4, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 1 AND shift = 'MORNING' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'E837465') LIMIT 1),
   'c1000001-0000-0000-0000-000000000008', 'THEORY', TRUE,
   'https://meet.google.com/sch-thpt-10a1', 'Unit 3: Music & Arts - Ngữ pháp: Compound Sentences & To-infinitive',
   'Tiết học trực tuyến qua Google Meet để ôn tập chuyên đề trắc nghiệm',
   'amber', '2026-09-01', '2027-01-15'),

  -- Thứ 4 Chiều (Day 4, Afternoon, Tiết 1 / Tiết 6 cả ngày): Lịch sử
  ('e1000001-0000-0000-0000-000000000006', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   4, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 6 AND shift = 'AFTERNOON' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'H746582') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Hiện thực lịch sử và nhận thức lịch sử - Khái niệm & vai trò', 'Đọc trước tư liệu lịch sử và chuẩn bị bài thuyết trình nhóm',
   'amber', '2026-09-01', '2027-01-15'),

  -- Thứ 5 Sáng (Day 5, Morning, Tiết 1): Vật lý
  ('e1000001-0000-0000-0000-000000000007', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   5, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 1 AND shift = 'MORNING' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'P298374') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Độ dịch chuyển và Quãng đường đi được - Vận tốc & Tốc độ', 'Ôn lại các công thức chuyển động thẳng biến đổi đều',
   'cyan', '2026-09-01', '2027-01-15'),

  -- Thứ 5 Chiều (Day 5, Afternoon, Tiết 1 / Tiết 6 cả ngày): Hóa học (Thực hành thí nghiệm)
  ('e1000001-0000-0000-0000-000000000008', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   5, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 6 AND shift = 'AFTERNOON' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'C187465') LIMIT 1),
   'c1000001-0000-0000-0000-000000000003', 'PRACTICE', FALSE, NULL,
   'Thí nghiệm khảo sát tính dẫn điện của dung dịch và phản ứng trao đổi ion', 'Bắt buộc mặc áo blouse trắng và tuân thủ nội quy an toàn phòng thí nghiệm',
   'rose', '2026-09-01', '2027-01-15'),

  -- Thứ 6 Sáng (Day 6, Morning, Tiết 1): Hóa học (Lý thuyết)
  ('e1000001-0000-0000-0000-000000000009', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   6, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 1 AND shift = 'MORNING' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'C187465') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Cấu tạo nguyên tử - Hạt nhân nguyên tử và Lớp vỏ electron', 'Làm bài tập viết cấu hình electron nguyên tử từ Z=1 đến Z=20',
   'rose', '2026-09-01', '2027-01-15'),

  -- Thứ 6 Chiều (Day 6, Afternoon, Tiết 1 / Tiết 6 cả ngày): Sinh học
  ('e1000001-0000-0000-0000-000000000010', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   6, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 6 AND shift = 'AFTERNOON' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'B976584') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Các cấp độ tổ chức của thế giới sống - Tế bào và cơ thể sinh vật', 'Quan sát mô hình cấu tạo tế bào nhân sơ và nhân thực',
   'emerald', '2026-09-01', '2027-01-15'),

  -- Thứ 7 Sáng (Day 7, Morning, Tiết 1): Sinh hoạt lớp & Hoạt động Hướng nghiệp
  ('e1000001-0000-0000-0000-000000000011', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   7, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 1 AND shift = 'MORNING' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'EA479281') LIMIT 1),
   'c1000001-0000-0000-0000-000000000001', 'THEORY', FALSE, NULL,
   'Sơ kết thi đua tuần, định hướng kỹ năng tự học và xây dựng kế hoạch cá nhân', 'Ban cán sự lớp chuẩn bị sổ theo dõi nề nếp và phương hướng tuần tiếp theo',
   'rose', '2026-09-01', '2027-01-15'),

  -- Thứ 7 Chiều (Day 7, Afternoon, Tiết 1 / Tiết 6 cả ngày): Vật lý (Thực hành thí nghiệm)
  ('e1000001-0000-0000-0000-000000000012', 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea', '53a5dc39-38dc-41bb-a7db-04745fa7d73a',
   7, (SELECT id FROM academic.periods WHERE school_id = 'b5ebbdb9-a332-4fef-a64a-149c474159e6' AND period_no = 6 AND shift = 'AFTERNOON' LIMIT 1),
   (SELECT id FROM core.class_subject_teachers WHERE class_id = 'a6a5db50-e0a6-42d3-90ac-8adbd8806fea' AND subject_id = (SELECT id FROM core.subjects WHERE code = 'P298374') LIMIT 1),
   'c1000001-0000-0000-0000-000000000004', 'PRACTICE', FALSE, NULL,
   'Thực hành đo gia tốc rơi tự do và sai số trong phép đo vật lý', 'Nộp bài thu hoạch thực hành nhóm ngay cuối buổi thí nghiệm',
   'cyan', '2026-09-01', '2027-01-15')
ON CONFLICT (class_id, semester_id, day_of_week, period_id, effective_from) DO UPDATE SET
  class_type = EXCLUDED.class_type,
  is_online = EXCLUDED.is_online,
  online_url = EXCLUDED.online_url,
  lesson_topic = EXCLUDED.lesson_topic,
  notes = EXCLUDED.notes,
  color_theme = EXCLUDED.color_theme;

-- ---------------------------------------------------------------------
-- 23. ACADEMIC: Assignments & Submissions
-- ---------------------------------------------------------------------
INSERT INTO academic.assignments (
  id, class_subject_teacher_id, title, description, assignment_type,
  assigned_date, due_date, max_score, attachments, is_published, created_by
) VALUES
  ('f1000001-0000-0000-0000-000000000001',
   '39c81595-9615-4032-a2ae-a6c3eec6adf8',
   'Chuyên đề: Phương trình và Bất phương trình chứa căn bậc hai',
   'Học sinh giải chi tiết các bài tập từ 1 đến 15 trong phiếu học tập đính kèm. Trình bày rõ ràng các bước đặt điều kiện xác định, biến đổi tương đương hoặc nâng lũy thừa, kiểm tra nghiệm ngoại lai.',
   'HOMEWORK',
   '2026-10-01',
   '2026-10-15 23:59:00+07',
   10.00,
   '[{"name": "De_bai_Phuong_trinh_chua_can.pdf", "size": "1.2 MB", "url": "/files/assignments/toan_de_bai.pdf"}]'::jsonb,
   TRUE,
   '6b369de1-c41d-43f7-a362-86e9733f768a'),

  ('f1000001-0000-0000-0000-000000000002',
   '3f59dc2f-e34c-4fa6-9301-63b7e781849f',
   'Xây dựng ứng dụng quản lý học sinh bằng Python OOP',
   'Thiết kế các class Person, Student, Classroom. Viết các method thêm, sửa, xóa, tìm kiếm theo tên và sắp xếp theo điểm trung bình. Đóng gói mã nguồn dưới dạng file .zip hoặc đường dẫn GitHub repository.',
   'PROJECT',
   '2026-09-28',
   '2026-10-18 23:59:00+07',
   10.00,
   '[{"name": "Huong_dan_do_an_Python_OOP.pdf", "size": "850 KB", "url": "/files/assignments/tin_do_an.pdf"}]'::jsonb,
   TRUE,
   'd0da993e-63e8-4b8f-80c5-4aff6f252b46'),

  ('f1000001-0000-0000-0000-000000000003',
   '809c3846-a8da-40c1-b049-68ec86306bad',
   'Viết bài văn nghị luận xã hội: Tinh thần tự học trong kỷ nguyên số',
   'Viết bài văn nghị luận khoảng 600 - 800 từ bày tỏ suy nghĩ của em về ý kiến: "Tự học là chìa khóa mở cánh cửa tri thức thời đại số". Nêu dẫn chứng cụ thể từ thực tiễn và liên hệ bản thân.',
   'ESSAY',
   '2026-09-15',
   '2026-09-25 23:59:00+07',
   10.00,
   '[{"name": "Dan_y_nghi_luan_tu_hoc.docx", "size": "420 KB", "url": "/files/assignments/van_dan_y.docx"}]'::jsonb,
   TRUE,
   '3340abda-49a2-4ac2-837f-f9e0a11537c4'),

  ('f1000001-0000-0000-0000-000000000004',
   '58cec06d-a66e-44a2-8423-5c2b1ec680de',
   'Online Quiz: Unit 3 Music & Arts Vocabulary & Grammar Revision',
   'Complete the revision quiz covering compound sentences, relative clauses, and music & performance art terminology. Total 40 multiple choice questions.',
   'REVISION',
   '2026-09-18',
   '2026-09-28 23:59:00+07',
   10.00,
   NULL,
   TRUE,
   'e3d6b0e0-fc5c-4dd9-b452-37cc56d8f5a4'),

  ('f1000001-0000-0000-0000-000000000005',
   '37c63b3e-7b72-435e-b24b-21fdae85e396',
   'Báo cáo thực hành: Đo gia tốc rơi tự do và xử lý sai số',
   'Hoàn thành bảng số liệu đo gia tốc rơi tự do bằng đồng hồ đo thời gian hiện số và cổng quang điện. Vẽ đồ thị s(t^2), tính gia tốc trọng trường g và sai số tương đối.',
   'HOMEWORK',
   '2026-09-22',
   '2026-10-02 23:59:00+07',
   10.00,
   '[{"name": "Mau_bao_cao_thuc_hanh_Vat_ly.xlsx", "size": "610 KB", "url": "/files/assignments/ly_bao_cao.xlsx"}]'::jsonb,
   TRUE,
   'da85bf7e-ccdf-4e2a-afbb-e2622893fb05'),

  ('f1000001-0000-0000-0000-000000000006',
   '24a758f6-f0dd-4c78-9e22-845a249e11f4',
   'Bài tập trắc nghiệm & tự luận: Cấu tạo nguyên tử và Bảng tuần hoàn',
   'Làm 30 câu hỏi trắc nghiệm khách quan và 3 bài toán xác định nguyên tố hóa học dựa vào tổng số hạt cơ bản (p, n, e) và cấu hình electron.',
   'HOMEWORK',
   '2026-10-02',
   '2026-10-12 23:59:00+07',
   10.00,
   '[{"name": "De_kiem_tra_Nguyen_tu.pdf", "size": "950 KB", "url": "/files/assignments/hoa_de.pdf"}]'::jsonb,
   TRUE,
   'ff3d6039-2b2d-41c9-af25-9c2099c85760'),

  ('f1000001-0000-0000-0000-000000000007',
   'd1000001-0000-0000-0000-000000000001',
   'Tìm hiểu vai trò của hiện thực lịch sử đối với sự phát triển của xã hội',
   'Đọc tài liệu chuyên đề chương 1, tóm tắt các luận điểm then chốt về sự khác biệt giữa hiện thực lịch sử và lịch sử được con người nhận thức.',
   'ESSAY',
   '2026-09-20',
   '2026-09-30 23:59:00+07',
   10.00,
   NULL,
   TRUE,
   '6cab1a49-cdb1-4f52-bd16-df5806405b96'),

  ('f1000001-0000-0000-0000-000000000008',
   '39c81595-9615-4032-a2ae-a6c3eec6adf8',
   'Bài tập hình học: Hệ thức lượng trong tam giác và giải tam giác',
   'Áp dụng định lý cosin, định lý sin và các công thức tính diện tích tam giác (Heron, bán kính r, R) để giải các bài toán thực tế đo chiều cao ngọn tháp và khoảng cách hai điểm không tới được.',
   'HOMEWORK',
   '2026-10-05',
   '2026-10-22 23:59:00+07',
   10.00,
   '[{"name": "He_thuc_luong_hinh_hoc.pdf", "size": "1.1 MB", "url": "/files/assignments/toan_hinh.pdf"}]'::jsonb,
   TRUE,
   '6b369de1-c41d-43f7-a362-86e9733f768a'),

  ('f1000001-0000-0000-0000-000000000009',
   '58cec06d-a66e-44a2-8423-5c2b1ec680de',
   'Essay: The role of Artificial Intelligence in modern education',
   'Write a short essay (250 - 350 words) debating the pros and cons of AI chatbots in personalized language learning and academic integrity.',
   'ESSAY',
   '2026-10-04',
   '2026-10-25 23:59:00+07',
   10.00,
   NULL,
   TRUE,
   'e3d6b0e0-fc5c-4dd9-b452-37cc56d8f5a4'),

  ('f1000001-0000-0000-0000-000000000010',
   '3f59dc2f-e34c-4fa6-9301-63b7e781849f',
   'Bài tập thuật toán sắp xếp: Merge Sort & Quick Sort minh họa',
   'Viết chương trình Python mô phỏng từng bước chia để trị của Merge Sort và phân hoạch của Quick Sort. So sánh số phép so sánh và thời gian chạy thực nghiệm.',
   'HOMEWORK',
   '2026-10-03',
   '2026-10-16 23:59:00+07',
   10.00,
   '[{"name": "De_bai_Sorting_Algorithms.pdf", "size": "680 KB", "url": "/files/assignments/sorting.pdf"}]'::jsonb,
   TRUE,
   'd0da993e-63e8-4b8f-80c5-4aff6f252b46')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  assignment_type = EXCLUDED.assignment_type,
  due_date = EXCLUDED.due_date,
  max_score = EXCLUDED.max_score,
  attachments = EXCLUDED.attachments;

-- Submissions for student Lê Hoàng Nam (id: 190adaa6-7ceb-41d8-81b6-86cac98b004f)
INSERT INTO academic.assignment_submissions (
  id, assignment_id, student_id, submitted_at, content_text,
  attachments, score, feedback, status, graded_by, graded_at
) VALUES
  -- 1. Project Python OOP: Submitted, waiting for grading
  ('a1000001-0000-0000-0000-000000000001',
   'f1000001-0000-0000-0000-000000000002',
   '190adaa6-7ceb-41d8-81b6-86cac98b004f',
   '2026-10-04 14:30:00+07',
   'Em đã hoàn thiện bài tập lớn quản lý học sinh bằng Python OOP. Em có bổ sung thêm tính năng xuất báo cáo ra file CSV và giao diện dòng lệnh màu sắc.',
   '[{"id": "sub-f1", "name": "Student_Management_Project_LeHoangNam.zip", "size": "2.4 MB", "type": "archive", "url": "/uploads/submissions/nam_python_oop.zip", "uploadedAt": "2026-10-04 14:28"}]'::jsonb,
   NULL,
   NULL,
   'SUBMITTED',
   NULL,
   NULL),

  -- 2. Ngữ văn Essay: Graded (9.0)
  ('a1000001-0000-0000-0000-000000000002',
   'f1000001-0000-0000-0000-000000000003',
   '190adaa6-7ceb-41d8-81b6-86cac98b004f',
   '2026-09-24 20:15:00+07',
   'Kính gửi cô bài văn nghị luận xã hội về tinh thần tự học. Em đã hiệu đính kỹ lưỡng các luận điểm và dẫn chứng.',
   '[{"id": "sub-f2", "name": "Bai_nghi_luan_LeHoangNam.docx", "size": "450 KB", "type": "word", "url": "/uploads/submissions/nam_nghi_luan.docx", "uploadedAt": "2026-09-24 20:12"}]'::jsonb,
   9.00,
   'Lập luận sắc bén, dẫn chứng phong phú mang tính thời sự cao. Bố cục rõ ràng, câu chữ mạch lạc và giàu cảm xúc. Cố gắng phát huy phong độ này trong bài thi giữa kỳ nhé!',
   'GRADED',
   '3340abda-49a2-4ac2-837f-f9e0a11537c4',
   '2026-09-27 10:00:00+07'),

  -- 3. Tiếng Anh Quiz: Graded (9.5)
  ('a1000001-0000-0000-0000-000000000003',
   'f1000001-0000-0000-0000-000000000004',
   '190adaa6-7ceb-41d8-81b6-86cac98b004f',
   '2026-09-27 19:40:00+07',
   'Completed all 40 revision questions on the SchoolPro e-learning module.',
   NULL,
   9.50,
   'Excellent performance! You mastered complex grammatical structures and musical idioms with high precision.',
   'GRADED',
   'e3d6b0e0-fc5c-4dd9-b452-37cc56d8f5a4',
   '2026-09-29 08:30:00+07'),

  -- 4. Lịch sử Essay: Graded (8.5)
  ('a1000001-0000-0000-0000-000000000004',
   'f1000001-0000-0000-0000-000000000007',
   '190adaa6-7ceb-41d8-81b6-86cac98b004f',
   '2026-09-29 16:20:00+07',
   'Em xin nộp bài phân tích các sự kiện lịch sử theo quan điểm biện chứng.',
   '[{"id": "sub-f4", "name": "Bao_cao_Lich_su_LeHoangNam.pdf", "size": "820 KB", "type": "pdf", "url": "/uploads/submissions/nam_su.pdf", "uploadedAt": "2026-09-29 16:18"}]'::jsonb,
   8.50,
   'Bài làm tốt, có phân biệt rành mạch giữa hiện thực khách quan và nhận thức chủ quan. Cần bổ sung thêm ví dụ lịch sử Việt Nam thế kỷ 20.',
   'GRADED',
   '6cab1a49-cdb1-4f52-bd16-df5806405b96',
   '2026-10-01 11:20:00+07')
ON CONFLICT (assignment_id, student_id) DO UPDATE SET
  submitted_at = EXCLUDED.submitted_at,
  content_text = EXCLUDED.content_text,
  attachments = EXCLUDED.attachments,
  score = EXCLUDED.score,
  feedback = EXCLUDED.feedback,
  status = EXCLUDED.status,
  graded_by = EXCLUDED.graded_by,
  graded_at = EXCLUDED.graded_at;


-- ===========================================================================
-- STEP 12: SKIPPING MASTER DATA & SEED RECORDS (SKIP_SEED=TRUE)
-- Description: 12. Master & Seed Data (INSERT Statements)
-- ===========================================================================

