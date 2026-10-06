-- =====================================================================
-- TABLE: academic.student_term_summaries
-- Comprehensive term transcript & promotion status per Circular 22
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_term_summaries (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id             UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id               UUID REFERENCES core.classes(id) ON DELETE CASCADE,
  semester_id            UUID REFERENCES core.semesters(id) ON DELETE CASCADE,
  academic_year_id       UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  term_type              VARCHAR(20) NOT NULL DEFAULT 'SEMESTER'
                           CHECK (term_type IN ('SEMESTER', 'FULL_YEAR')),
  gpa_score              NUMERIC(4,2),                         -- Grade Point Average (ĐTB các môn)
  academic_rating        VARCHAR(20) NOT NULL
                           CHECK (academic_rating IN ('OUTSTANDING', 'GOOD', 'FAIR', 'PASS', 'FAIL')),
  conduct_rating         VARCHAR(20) NOT NULL
                           CHECK (conduct_rating IN ('EXCELLENT', 'GOOD', 'PASS', 'FAIL')),
  honor_title            VARCHAR(50),                          -- E.g. 'Học sinh Xuất sắc', 'Học sinh Giỏi'
  rank_in_class          SMALLINT,
  rank_in_grade          SMALLINT,
  excused_absences       SMALLINT NOT NULL DEFAULT 0,
  unexcused_absences     SMALLINT NOT NULL DEFAULT 0,
  is_promoted            BOOLEAN NOT NULL DEFAULT TRUE,        -- Promotion to next grade level
  requires_summer_retest BOOLEAN NOT NULL DEFAULT FALSE,      -- Required re-evaluation or summer conduct training
  summer_retest_subjects JSONB,                                -- List of subjects requiring re-examination in summer
  post_summer_gpa        NUMERIC(4,2),                         -- Re-evaluated GPA after summer make-up test
  post_summer_academic_rating VARCHAR(20),                     -- Final rating after summer
  post_summer_promoted   BOOLEAN,                              -- Promoted after summer test
  rewards_record         TEXT,                                 -- Khen thưởng học sinh
  homeroom_remarks       TEXT,
  digital_certificate_url TEXT,                                -- URL of signed PDF transcript
  is_locked              BOOLEAN NOT NULL DEFAULT FALSE,
  certified_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  certified_at           TIMESTAMPTZ,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id, term_type, semester_id)
);

CREATE INDEX IF NOT EXISTS ix_term_sum_student ON academic.student_term_summaries(student_id);
CREATE INDEX IF NOT EXISTS ix_term_sum_year ON academic.student_term_summaries(academic_year_id);
CREATE INDEX IF NOT EXISTS ix_term_sum_class ON academic.student_term_summaries(class_id);

COMMENT ON TABLE academic.student_term_summaries IS 'Comprehensive official student transcript and honor roll summaries per term and school year';
COMMENT ON COLUMN academic.student_term_summaries.summer_retest_subjects IS 'Subjects requiring summer make-up tests per Circular 22 regulations';
