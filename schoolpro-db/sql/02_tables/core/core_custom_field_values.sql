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
