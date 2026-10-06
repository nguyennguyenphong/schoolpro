-- =====================================================================
-- TABLE: sys.event_outbox
-- Transactional Outbox Pattern for reliable asynchronous event publication
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.event_outbox (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      VARCHAR(100) NOT NULL,           -- E.g. 'GRADE_SUBMITTED', 'STUDENT_ABSENT', 'EMULATION_RANKED'
  aggregate_type  VARCHAR(80) NOT NULL,            -- E.g. 'STUDENT', 'EXAM', 'CLASS'
  aggregate_id    UUID NOT NULL,
  topic           VARCHAR(100),                    -- Target broker topic / exchange
  correlation_id  VARCHAR(64),                     -- Distributed tracing identifier
  headers         JSONB DEFAULT '{}'::jsonb,       -- Event metadata headers
  payload         JSONB NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'DEAD_LETTER')),
  retry_count     SMALLINT NOT NULL DEFAULT 0,
  max_retries     SMALLINT NOT NULL DEFAULT 5,
  next_retry_at   TIMESTAMPTZ,                     -- Exponential backoff timestamp
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_outbox_pending ON sys.event_outbox(status, created_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS ix_outbox_retry ON sys.event_outbox(status, next_retry_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS ix_outbox_correlation ON sys.event_outbox(correlation_id);

COMMENT ON TABLE sys.event_outbox IS 'Reliable outbox queue for event-driven message brokers (Kafka/RabbitMQ) and webhook deliveries';
COMMENT ON COLUMN sys.event_outbox.next_retry_at IS 'Timestamp determining next retry attempt according to exponential backoff schedule';
