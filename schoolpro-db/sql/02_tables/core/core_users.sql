-- =====================================================================
-- TABLE: core.users
-- Central identity directory for students, teachers, supervisors, and staff
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                UUID REFERENCES core.schools(id) ON DELETE SET NULL,
  username                 VARCHAR(100) NOT NULL UNIQUE,
  email                    VARCHAR(255) UNIQUE,
  phone                    VARCHAR(20),
  password_hash            TEXT NOT NULL,
  full_name                VARCHAR(255) NOT NULL,
  first_name               VARCHAR(100),                 -- Tên (dùng để sắp xếp danh sách chuẩn tiếng Việt A-Z)
  last_name                VARCHAR(100),                 -- Họ và tên đệm
  preferred_name           VARCHAR(100),                 -- Biệt danh / tên thường gọi
  date_of_birth            DATE,
  gender_code              VARCHAR(20) DEFAULT 'MALE',   -- References core.lookup_values ('GENDER')
  national_id              VARCHAR(30),                  -- Citizen identification number / VNeID
  avatar_url               TEXT,
  address                  TEXT,
  locale                   VARCHAR(10) DEFAULT 'vi-VN',  -- Ngôn ngữ hiển thị (vi-VN, en-US)
  timezone                 VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  status_code              VARCHAR(20) DEFAULT 'ACTIVE', -- References core.lookup_values ('ACCOUNT_STATUS')
  must_change_password     BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_attempts    INTEGER NOT NULL DEFAULT 0,
  locked_at                TIMESTAMPTZ,
  locked_until             TIMESTAMPTZ,
  lock_reason              VARCHAR(255),
  password_changed_at      TIMESTAMPTZ,
  email_verified_at        TIMESTAMPTZ,
  phone_verified_at        TIMESTAMPTZ,
  is_verified              BOOLEAN NOT NULL DEFAULT FALSE,
  is_2fa_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret        VARCHAR(255),
  last_login_at            TIMESTAMPTZ,
  last_login_ip            VARCHAR(45),
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  bio                      TEXT,
  metadata                 JSONB DEFAULT '{}'::jsonb,    -- Flexible JSON payload without DDL locks
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_full_name_trgm ON core.users USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_users_first_name ON core.users(first_name);
CREATE INDEX IF NOT EXISTS ix_users_school ON core.users(school_id);
CREATE INDEX IF NOT EXISTS ix_users_status ON core.users(status_code);

COMMENT ON TABLE core.users IS 'Unified identity authentication and personal profile table';
COMMENT ON COLUMN core.users.first_name IS 'First name for Vietnamese alphabetical roster sorting';
COMMENT ON COLUMN core.users.notification_preferences IS 'Per-user dynamic communication channel subscription preferences';
