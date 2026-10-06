-- =====================================================================
-- TABLE: emulation.awards
-- Student honors, academic Olympiad prizes, and sports commendations
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.awards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  academic_year_id    UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  semester_id         UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  award_category      VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC'
                        CHECK (award_category IN ('ACADEMIC', 'SPORTS', 'ARTS_CULTURE', 'STEM_INNOVATION', 'COMMUNITY_MODEL', 'SKILLS')),
  level               VARCHAR(20) NOT NULL DEFAULT 'SCHOOL'
                        CHECK (level IN ('SCHOOL', 'DISTRICT', 'PROVINCIAL', 'NATIONAL', 'INTERNATIONAL')),
  prize               VARCHAR(30) NOT NULL DEFAULT 'FIRST_PRIZE'
                        CHECK (prize IN ('SPECIAL_PRIZE', 'FIRST_PRIZE', 'SECOND_PRIZE', 'THIRD_PRIZE', 'CONSOLATION', 'CERTIFICATE_OF_MERIT', 'MEDAL')),
  contest_name        VARCHAR(255),                       -- Tên cuộc thi (Kỳ thi HSG Tỉnh, Hội khỏe Phù Đổng,...)
  organizer_name      VARCHAR(200),                       -- Đơn vị tổ chức (Bộ GD&ĐT, Sở GD&ĐT, Tỉnh Đoàn,...)
  coach_teacher_id    UUID REFERENCES core.teachers(id) ON DELETE SET NULL, -- Giáo viên bồi dưỡng / HLV
  title               VARCHAR(255) NOT NULL,              -- E.g. 'Giải Nhất Học sinh Giỏi Toán Cấp Tỉnh'
  decision_number     VARCHAR(100),                       -- Official certificate or decision number
  decision_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_code    VARCHAR(100),                       -- Số hiệu bằng khen / huân huy chương
  reward_amount       NUMERIC(10,2) DEFAULT 0.00,
  bonus_points        SMALLINT NOT NULL DEFAULT 10,       -- Emulation bonus points added to class/student
  signed_by           VARCHAR(150),                       -- Signer title/name: E.g. 'Giám đốc Sở GD&ĐT'
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,     -- Hiển thị vinh danh trên bảng vàng trang chủ
  certificate_url     TEXT,
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_awards_student ON emulation.awards(student_id);
CREATE INDEX IF NOT EXISTS ix_awards_year ON emulation.awards(academic_year_id);
CREATE INDEX IF NOT EXISTS ix_awards_featured ON emulation.awards(is_featured) WHERE is_featured = TRUE;

COMMENT ON TABLE emulation.awards IS 'Golden book of student accolades, Olympiad laureates, and state honors';
COMMENT ON COLUMN emulation.awards.coach_teacher_id IS 'Assigned faculty coach / teacher mentor who trained the laureate';
