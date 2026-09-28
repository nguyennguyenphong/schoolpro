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
