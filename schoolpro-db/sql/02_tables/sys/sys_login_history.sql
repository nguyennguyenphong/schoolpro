-- =====================================================================
-- TABLE: sys.login_history
-- Detailed user login history, device fingerprinting, session auditing,
-- geolocation, and security tracking
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.login_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES core.users(id) ON DELETE CASCADE,
  username_attempt    VARCHAR(100),                          -- Username/email entered at login (useful if user_id is null or lookup failed)
  login_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  login_status        VARCHAR(30) NOT NULL DEFAULT 'SUCCESS'
                      CHECK (login_status IN ('SUCCESS', 'FAILED', 'BLOCKED', '2FA_CHALLENGE', 'SUSPICIOUS', 'LOCKED_OUT', 'EXPIRED')),
  failure_reason      VARCHAR(255),                          -- INVALID_CREDENTIALS, ACCOUNT_DISABLED, INVALID_2FA, IP_BLACKLISTED, RATE_LIMITED
  
  -- Device & Client Information
  device_name         VARCHAR(150),                          -- E.g. 'iPhone 15 Pro', 'MacBook Pro M2', 'Dell XPS 15', 'Samsung Galaxy S24'
  device_id           VARCHAR(128),                          -- Unique hardware device ID / persistent fingerprint / client UUID
  device_type         VARCHAR(30) NOT NULL DEFAULT 'DESKTOP'
                      CHECK (device_type IN ('DESKTOP', 'LAPTOP', 'MOBILE', 'TABLET', 'SMART_TV', 'BOT', 'OTHER')),
  browser_name        VARCHAR(100),                          -- Chrome, Safari, Firefox, Edge, Opera, Samsung Internet
  browser_version     VARCHAR(50),                           -- E.g. '128.0.0.0', '17.4'
  os_name             VARCHAR(100),                          -- macOS, iOS, Windows, Android, Linux, Ubuntu, iPadOS
  os_version          VARCHAR(50),                           -- E.g. '15.0', '18.2', '11 Pro', '14.0'
  client_type         VARCHAR(30) NOT NULL DEFAULT 'WEB'
                      CHECK (client_type IN ('WEB', 'MOBILE_APP', 'DESKTOP_APP', 'PORTAL', 'API_CLIENT', 'POSTMAN', 'OTHER')),
  app_version         VARCHAR(50),                           -- Mobile app build or client application version (e.g. '1.0.4+42')
  
  -- Authentication & Network Details
  auth_method         VARCHAR(50) NOT NULL DEFAULT 'PASSWORD'
                      CHECK (auth_method IN ('PASSWORD', '2FA_OTP', 'GOOGLE_SSO', 'MICROSOFT_SSO', 'VNEID_SSO', 'FACE_ID', 'BIOMETRIC', 'REFRESH_TOKEN', 'API_KEY')),
  ip_address          INET,
  user_agent          TEXT,
  request_id          VARCHAR(64),                           -- Correlation ID for distributed tracing with API Gateway/sys_audit_logs
  
  -- Geolocation & Network Provider
  location_country    VARCHAR(100),                          -- E.g. 'Vietnam', 'United States'
  location_country_code VARCHAR(10),                         -- ISO alpha-2/alpha-3: 'VN', 'US'
  location_city       VARCHAR(100),                          -- E.g. 'Ho Chi Minh City', 'Hanoi', 'Da Nang'
  location_region     VARCHAR(100),                          -- Province/State
  isp_provider        VARCHAR(150),                          -- Internet Service Provider (VNPT, Viettel, FPT Telecom)
  
  -- Security & Anomaly Detection
  is_suspicious       BOOLEAN NOT NULL DEFAULT FALSE,        -- Flagged by risk engine (new location, impossible speed, abnormal hours)
  risk_score          NUMERIC(5, 2) DEFAULT 0.00,            -- Risk score computed at login (0 to 100)
  risk_reasons        TEXT[] DEFAULT '{}',                   -- ['NEW_DEVICE', 'FOREIGN_IP', 'MULTIPLE_FAILED_ATTEMPTS']
  
  -- Session Lifecycle & Logout Tracking
  session_id          VARCHAR(128),                          -- Active session token or JWT JTI identifier
  is_active_session   BOOLEAN NOT NULL DEFAULT TRUE,         -- Whether this session is currently active or terminated
  logout_at           TIMESTAMPTZ,
  logout_type         VARCHAR(50)
                      CHECK (logout_type IN ('USER_INITIATED', 'SESSION_TIMEOUT', 'FORCE_LOGOUT_ADMIN', 'DEVICE_REVOKED', 'PASSWORD_CHANGED', 'CONCURRENT_LOGIN_KICK')),
  
  -- Extensibility
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Optimized Indexes
CREATE INDEX IF NOT EXISTS ix_login_history_user_id ON sys.login_history(user_id);
CREATE INDEX IF NOT EXISTS ix_login_history_login_at ON sys.login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS ix_login_history_device_id ON sys.login_history(device_id);
CREATE INDEX IF NOT EXISTS ix_login_history_ip_address ON sys.login_history(ip_address);
CREATE INDEX IF NOT EXISTS ix_login_history_status ON sys.login_history(login_status);
CREATE INDEX IF NOT EXISTS ix_login_history_session_id ON sys.login_history(session_id);
CREATE INDEX IF NOT EXISTS ix_login_history_user_active ON sys.login_history(user_id, is_active_session) WHERE is_active_session = TRUE;
CREATE INDEX IF NOT EXISTS ix_login_history_metadata_gin ON sys.login_history USING gin (metadata);

-- Documentation Comments
COMMENT ON TABLE sys.login_history IS 'Detailed login auditing and device session history tracking for security, compliance, device management, and threat detection';
COMMENT ON COLUMN sys.login_history.device_name IS 'Human-readable device model/name, e.g. iPhone 15 Pro, Dell XPS';
COMMENT ON COLUMN sys.login_history.device_id IS 'Hardware UUID, unique device fingerprint, or installation identifier';
COMMENT ON COLUMN sys.login_history.browser_name IS 'Browser name detected from user-agent, e.g. Chrome, Safari, Edge';
COMMENT ON COLUMN sys.login_history.browser_version IS 'Browser version string';
COMMENT ON COLUMN sys.login_history.os_name IS 'Operating system family name, e.g. macOS, Windows, Android, iOS';
COMMENT ON COLUMN sys.login_history.os_version IS 'Operating system version';
COMMENT ON COLUMN sys.login_history.client_type IS 'Access channel: WEB, MOBILE_APP, DESKTOP_APP, PORTAL, API_CLIENT';
COMMENT ON COLUMN sys.login_history.auth_method IS 'Authentication protocol used: PASSWORD, 2FA_OTP, SSO, BIOMETRIC, etc.';
COMMENT ON COLUMN sys.login_history.is_suspicious IS 'Security flag indicating anomalous login attempt';
COMMENT ON COLUMN sys.login_history.session_id IS 'Associated JWT jti or session token identifier';
COMMENT ON COLUMN sys.login_history.logout_type IS 'Reason session ended: user action, timeout, admin termination, etc.';
