-- =====================================================================
-- TABLE: emulation.rankings
-- Computed leaderboard rankings and award flags per period
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.rankings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id       UUID NOT NULL REFERENCES emulation.periods(id) ON DELETE CASCADE,
  scope_type      core.scope_type_enum NOT NULL,
  student_id      UUID REFERENCES core.students(id) ON DELETE CASCADE,
  class_group_id  UUID REFERENCES core.class_groups(id) ON DELETE CASCADE,
  class_id        UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  grade_id        UUID REFERENCES core.grades(id) ON DELETE CASCADE,
  base_score      NUMERIC(8,2) NOT NULL DEFAULT 100.0,
  bonus_score     NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  penalty_score   NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  final_score     NUMERIC(8,2) NOT NULL,
  rank_position   SMALLINT,
  awarded_flag    VARCHAR(50),                     -- E.g. 'FLAG_EXCELLENT', 'FLAG_FIRST_PLACE'
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period_id, scope_type, student_id, class_group_id, class_id, grade_id)
);

CREATE INDEX IF NOT EXISTS ix_emu_rankings_period ON emulation.rankings(period_id, scope_type);

COMMENT ON TABLE emulation.rankings IS 'Periodic leaderboard standings and award flag determinations';
