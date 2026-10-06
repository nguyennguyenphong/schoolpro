-- =====================================================================
-- TABLE: core.class_groups
-- Internal study and labor groups within a class (e.g. Group 1, 2, 3, 4)
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.class_groups (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id                 UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  code                     VARCHAR(20) NOT NULL,             -- E.g. 'TO_1', 'TO_2'
  name                     VARCHAR(100) NOT NULL,            -- E.g. 'Tổ 1', 'Tổ 2'
  leader_student_id        UUID REFERENCES core.students(id) ON DELETE SET NULL,   -- Tổ trưởng
  deputy_leader_student_id UUID REFERENCES core.students(id) ON DELETE SET NULL,   -- Tổ phó
  order_no                 SMALLINT DEFAULT 1,
  color_tag                VARCHAR(30) DEFAULT 'blue',
  description              TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, code)
);

CREATE INDEX IF NOT EXISTS ix_class_groups_class ON core.class_groups(class_id);

COMMENT ON TABLE core.class_groups IS 'Class internal squads/teams (Tổ học tập & trực nhật) for granular emulation and group study';
COMMENT ON COLUMN core.class_groups.leader_student_id IS 'Student appointed as group team leader';
