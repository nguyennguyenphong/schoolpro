-- =====================================================================
-- TABLE: sys.audit_logs
-- Immutable security audit trail recording critical changes and user actions
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  module          VARCHAR(50),                     -- ACADEMIC, CORE, AUTH, EMULATION, FINANCE, NOTIFICATION
  action          VARCHAR(50) NOT NULL,            -- E.g. 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SCORE_CHANGE'
  table_name      VARCHAR(150) NOT NULL,
  record_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  request_id      VARCHAR(64),                     -- Correlation ID for distributed tracing
  method          VARCHAR(10),                     -- HTTP method (POST, PUT, DELETE, etc.)
  url             VARCHAR(500),                    -- API endpoint URI
  status_code     INT,                             -- HTTP response code (200, 400, 403, 500)
  duration_ms     INT,                             -- Execution duration in milliseconds
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_audit_table_record ON sys.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS ix_audit_user ON sys.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_module ON sys.audit_logs(module);
CREATE INDEX IF NOT EXISTS ix_audit_created_at ON sys.audit_logs(created_at);

COMMENT ON TABLE sys.audit_logs IS 'System audit trail tracking transactional changes, API requests, and user events for security compliance';
COMMENT ON COLUMN sys.audit_logs.request_id IS 'Unique correlation identifier linking multiple logs to single HTTP request';
COMMENT ON COLUMN sys.audit_logs.duration_ms IS 'Server-side execution time in milliseconds';
