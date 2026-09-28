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
