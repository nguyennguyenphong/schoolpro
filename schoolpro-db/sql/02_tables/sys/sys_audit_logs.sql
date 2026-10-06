-- =====================================================================
-- TABLE: sys.audit_logs
-- Immutable security audit trail recording critical changes, data diffs,
-- user actions, system security events, and compliance forensics
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.audit_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor & Impersonation Context
  user_id             UUID REFERENCES core.users(id) ON DELETE SET NULL,
  username_snapshot   VARCHAR(100),                          -- Username/email snapshot at the time of log
  role_code_snapshot  VARCHAR(50),                           -- Role at event time (E.g. 'ADMIN', 'TEACHER', 'PRINCIPAL')
  impersonated_by     UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Admin who impersonated this user (if applicable)
  
  -- Event Scope & Target Information
  module              VARCHAR(50) NOT NULL,                  -- ACADEMIC, CORE, AUTH, EMULATION, FINANCE, NOTIFICATION, SYS, EVALUATION
  subsystem           VARCHAR(50),                           -- E.g. 'ASSIGNMENT', 'GRADEBOOK', 'ATTENDANCE', 'SETTINGS', 'USER_MANAGEMENT'
  action              VARCHAR(50) NOT NULL,                  -- 'INSERT', 'UPDATE', 'DELETE', 'BULK_IMPORT', 'EXPORT', 'APPROVE', 'REJECT', 'SCORE_CHANGE', 'OVERRIDE'
  severity            VARCHAR(20) NOT NULL DEFAULT 'INFO'
                      CHECK (severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'SECURITY_ALERT')),
  table_name          VARCHAR(150),                          -- Target table affected (NULL if system/application action)
  record_id           UUID,                                  -- Target primary key
  target_summary      VARCHAR(255),                          -- Human readable summary (E.g. 'Student Nguyen Van A - Math Midterm Grade')
  
  -- Detailed Data Changes & Differences
  old_data            JSONB,                                 -- Complete old record snapshot or affected fields
  new_data            JSONB,                                 -- Complete new record snapshot
  diff_data           JSONB,                                 -- Calculated field-level delta/differences: {"score": {"old": 7.5, "new": 9.0}}
  changed_fields      TEXT[] DEFAULT '{}',                   -- Array of field names modified for fast array querying: ['status', 'score']
  
  -- Request & Network Context
  ip_address          INET,
  ip_country          VARCHAR(100),                          -- Geolocation country (if resolved)
  user_agent          TEXT,
  client_type         VARCHAR(30) DEFAULT 'WEB'
                      CHECK (client_type IN ('WEB', 'MOBILE_APP', 'DESKTOP_APP', 'API_CLIENT', 'JOB_WORKER', 'SYSTEM')),
  session_id          VARCHAR(128),                          -- Associated user session identifier
  device_id           VARCHAR(128),                          -- Hardware/Client device UUID
  
  -- Distributed Tracing & API Execution
  request_id          VARCHAR(64),                           -- Correlation ID for distributed tracing (X-Request-ID)
  trace_id            VARCHAR(128),                          -- OpenTelemetry / APM trace ID
  span_id             VARCHAR(64),                           -- OpenTelemetry span ID
  method              VARCHAR(10),                           -- HTTP method (GET, POST, PUT, PATCH, DELETE)
  url                 VARCHAR(500),                          -- Full API endpoint path
  query_params        JSONB DEFAULT '{}'::jsonb,             -- Query parameters passed to endpoint
  status_code         INT,                                   -- HTTP response code (200, 400, 403, 500)
  duration_ms         INT,                                   -- Server execution latency in milliseconds
  
  -- Error & Security Details
  is_security_event   BOOLEAN NOT NULL DEFAULT FALSE,        -- True for privilege escalations, unauthorized attempts, bypasses
  error_message       TEXT,                                  -- Error or exception trace if failed
  stack_trace         TEXT,                                  -- Stack trace (sanitized for sensitive data)
  
  -- Reason & Approval Note
  reason              TEXT,                                  -- Mandatory rationale for critical actions (e.g., grade alteration reason)
  approved_by         UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Approver if action required two-man rule
  
  -- Extensibility & Creation Timestamp
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,    -- Flexible metadata (tags, batch_id, external_ref)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimized Indexes
CREATE INDEX IF NOT EXISTS ix_audit_table_record ON sys.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS ix_audit_user ON sys.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_module ON sys.audit_logs(module, action);
CREATE INDEX IF NOT EXISTS ix_audit_created_at ON sys.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_audit_request_id ON sys.audit_logs(request_id);
CREATE INDEX IF NOT EXISTS ix_audit_trace_id ON sys.audit_logs(trace_id);
CREATE INDEX IF NOT EXISTS ix_audit_severity ON sys.audit_logs(severity);
CREATE INDEX IF NOT EXISTS ix_audit_is_security ON sys.audit_logs(is_security_event) WHERE is_security_event = TRUE;
CREATE INDEX IF NOT EXISTS ix_audit_changed_fields_gin ON sys.audit_logs USING gin (changed_fields);
CREATE INDEX IF NOT EXISTS ix_audit_diff_data_gin ON sys.audit_logs USING gin (diff_data);
CREATE INDEX IF NOT EXISTS ix_audit_metadata_gin ON sys.audit_logs USING gin (metadata);

-- Documentation Comments
COMMENT ON TABLE sys.audit_logs IS 'System audit trail tracking transactional changes, API requests, data mutations, compliance forensics, and security events';
COMMENT ON COLUMN sys.audit_logs.impersonated_by IS 'Administrator who assumed the user identity during the transaction';
COMMENT ON COLUMN sys.audit_logs.diff_data IS 'JSONB object showing specific field-by-field changes (before vs after)';
COMMENT ON COLUMN sys.audit_logs.changed_fields IS 'Array of column/field names modified for high-performance indexing';
COMMENT ON COLUMN sys.audit_logs.request_id IS 'Unique correlation identifier linking multiple logs to single HTTP request';
COMMENT ON COLUMN sys.audit_logs.trace_id IS 'Distributed tracing identifier (OpenTelemetry / Jaeger / W3C TraceContext)';
COMMENT ON COLUMN sys.audit_logs.duration_ms IS 'Server-side execution time in milliseconds';
COMMENT ON COLUMN sys.audit_logs.reason IS 'User-provided justification for sensitive data changes (e.g. changing approved exam grades)';
COMMENT ON COLUMN sys.audit_logs.is_security_event IS 'Flag for high-risk operations requiring immediate security oversight';
