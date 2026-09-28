-- =====================================================================
-- TABLE: emulation.awards
-- Student honors, academic Olympiad prizes, and sports commendations
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.awards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  award_category      VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC'
                        CHECK (award_category IN ('ACADEMIC', 'SPORTS', 'ARTS_CULTURE', 'STEM_INNOVATION', 'COMMUNITY_MODEL')),
  level               VARCHAR(20) NOT NULL DEFAULT 'SCHOOL'
                        CHECK (level IN ('SCHOOL', 'DISTRICT', 'PROVINCIAL', 'NATIONAL', 'INTERNATIONAL')),
  prize               VARCHAR(30) NOT NULL DEFAULT 'FIRST_PRIZE'
                        CHECK (prize IN ('SPECIAL_PRIZE', 'FIRST_PRIZE', 'SECOND_PRIZE', 'THIRD_PRIZE', 'CONSOLATION', 'CERTIFICATE_OF_MERIT')),
  title               VARCHAR(255) NOT NULL,              -- E.g. 'Giải Nhất Học sinh Giỏi Toán Cấp Tỉnh'
  decision_number     VARCHAR(100),                       -- Official certificate or decision number
  decision_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_amount       NUMERIC(10,2) DEFAULT 0.00,
  bonus_points        SMALLINT NOT NULL DEFAULT 10,       -- Emulation bonus points added to class/student
  signed_by           VARCHAR(150),                       -- Signer title/name: E.g. 'Giám đốc Sở GD&ĐT'
  certificate_url     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_awards_student ON emulation.awards(student_id);
CREATE INDEX IF NOT EXISTS ix_awards_year ON emulation.awards(academic_year_id);

COMMENT ON TABLE emulation.awards IS 'Golden book of student accolades, Olympiad laureates, and state honors';
