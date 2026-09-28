-- =====================================================================
-- TABLE: emulation.periods
-- Emulation evaluation cycles (weekly sprints, monthly campaigns, semesters)
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.periods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  code            VARCHAR(30) NOT NULL,            -- E.g. 'TUAN_01', 'THANG_10'
  name            VARCHAR(150) NOT NULL,           -- E.g. 'Tuần thi đua 01', 'Tháng 10 cao điểm'
  period_type     VARCHAR(20) NOT NULL
                    CHECK (period_type IN ('WEEK', 'MONTH', 'SEMESTER', 'YEAR', 'CAMPAIGN')),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_closed       BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (academic_year_id, code)
);

COMMENT ON TABLE emulation.periods IS 'Configured tracking intervals for point accumulation and leaderboard calculation';
