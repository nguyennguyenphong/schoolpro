-- =====================================================================
-- TABLE: core.class_groups
-- Internal study and labor groups within a class (e.g. Group 1, 2, 3, 4)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.class_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  code          VARCHAR(20) NOT NULL,             -- E.g. 'TO_1', 'TO_2'
  name          VARCHAR(100) NOT NULL,            -- E.g. 'Tổ 1', 'Tổ 2'
  order_no      SMALLINT DEFAULT 1,
  UNIQUE (class_id, code)
);

COMMENT ON TABLE core.class_groups IS 'Class internal squads/teams (Tổ học tập & trực nhật) for granular emulation';
