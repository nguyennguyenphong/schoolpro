-- =====================================================================
-- TABLE: emulation.periods
-- Emulation evaluation cycles (weekly sprints, monthly campaigns, semesters)
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.periods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  code             VARCHAR(30) NOT NULL,            -- E.g. 'TUAN_01', 'THANG_10'
  name             VARCHAR(150) NOT NULL,           -- E.g. 'Tuần thi đua 01', 'Tháng 10 cao điểm'
  week_number      SMALLINT,                        -- Weekly school cycle index (Tuần 1, Tuần 2, ...)
  theme_title      VARCHAR(255),                    -- Chủ điểm thi đua: 'Chào mừng 20/11', 'Mừng Đảng Mừng Xuân'
  period_type      VARCHAR(20) NOT NULL
                     CHECK (period_type IN ('WEEK', 'MONTH', 'SEMESTER', 'YEAR', 'CAMPAIGN')),
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  is_closed        BOOLEAN NOT NULL DEFAULT FALSE,  -- Locked after weekly flag presentation
  closed_at        TIMESTAMPTZ,
  closed_by        UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Bí thư Đoàn / Tổng phụ trách
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_emu_periods_school ON emulation.periods(school_id);
CREATE INDEX IF NOT EXISTS ix_emu_periods_year ON emulation.periods(academic_year_id);
CREATE INDEX IF NOT EXISTS ix_emu_periods_dates ON emulation.periods(start_date, end_date);

COMMENT ON TABLE emulation.periods IS 'Configured tracking intervals for point accumulation and leaderboard calculation';
COMMENT ON COLUMN emulation.periods.theme_title IS 'Thematic campaign banner motto for the emulation window';
