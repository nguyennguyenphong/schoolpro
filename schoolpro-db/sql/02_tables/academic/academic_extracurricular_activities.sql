-- =====================================================================
-- TABLE: academic.extracurricular_activities
-- School-wide events, volunteer campaigns, and STEM workshops
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.extracurricular_activities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  semester_id           UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  activity_type         VARCHAR(30) NOT NULL DEFAULT 'COMMUNITY_SERVICE'
                          CHECK (activity_type IN ('COMMUNITY_SERVICE', 'CAREER_ORIENTATION', 'STEM_FAIR', 'SPORTS_FESTIVAL', 'YOUTH_UNION_EVENT', 'ARTS_FESTIVAL')),
  organizer_unit        VARCHAR(150) NOT NULL,            -- E.g. 'Đoàn trường', 'Tổ Ngoại ngữ'
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ NOT NULL,
  location              VARCHAR(255),
  description           TEXT,
  emulation_bonus_points SMALLINT NOT NULL DEFAULT 5,
  max_participants      INTEGER,
  is_published          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_activities_school ON academic.extracurricular_activities(school_id);
CREATE INDEX IF NOT EXISTS ix_activities_semester ON academic.extracurricular_activities(semester_id);

COMMENT ON TABLE academic.extracurricular_activities IS 'Experiential and vocational orientation activities under GDPT 2018';
