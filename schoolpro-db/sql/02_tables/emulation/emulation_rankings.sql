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
  previous_rank   SMALLINT,                        -- Hạng tuần/kỳ trước để tính xu hướng tăng/giảm
  rank_change     SMALLINT NOT NULL DEFAULT 0,     -- Delta (+2, -1, 0)
  awarded_flag    VARCHAR(50),                     -- E.g. 'FLAG_EXCELLENT', 'FLAG_FIRST_PLACE'
  reward_title    VARCHAR(100),                    -- E.g. 'Chi đội Xuất sắc', 'Lớp Tiên tiến'
  reward_cash     NUMERIC(10,2) DEFAULT 0.00,      -- Tiền thưởng thi đua (nếu có)
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,  -- Trạng thái công bố toàn trường
  published_at    TIMESTAMPTZ,
  notes           TEXT,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period_id, scope_type, student_id, class_group_id, class_id, grade_id)
);

CREATE INDEX IF NOT EXISTS ix_emu_rankings_period ON emulation.rankings(period_id, scope_type);
CREATE INDEX IF NOT EXISTS ix_emu_rankings_rank ON emulation.rankings(period_id, rank_position);

COMMENT ON TABLE emulation.rankings IS 'Periodic leaderboard standings and award flag determinations';
COMMENT ON COLUMN emulation.rankings.rank_change IS 'Relative rank difference compared to preceding period (+/- integer)';
