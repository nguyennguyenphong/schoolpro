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
