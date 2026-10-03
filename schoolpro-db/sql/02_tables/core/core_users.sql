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
