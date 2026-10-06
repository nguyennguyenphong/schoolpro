-- =====================================================================
-- TABLE: academic.curriculum_track_subjects
-- Mapping of elective subjects and study modules to curriculum tracks
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_track_subjects (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id                UUID NOT NULL REFERENCES academic.curriculum_tracks(id) ON DELETE CASCADE,
  subject_id              UUID NOT NULL REFERENCES core.subjects(id) ON DELETE CASCADE,
  is_track_core           BOOLEAN NOT NULL DEFAULT TRUE,     -- TRUE = core elective of track, FALSE = optional module
  is_compulsory           BOOLEAN NOT NULL DEFAULT TRUE,     -- Compulsory vs elective within the track
  credit_periods_per_year SMALLINT NOT NULL DEFAULT 70,       -- Typical MOET periods per school year
  cluster_period_count    SMALLINT DEFAULT 35,               -- Periods dedicated to deep study topic (Chuyên đề 35 tiết)
  study_cluster_topic     VARCHAR(150),                       -- Special study topic (Chuyên đề học tập lựa chọn)
  syllabus_description    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (track_id, subject_id)
);

CREATE INDEX IF NOT EXISTS ix_track_subjects_track ON academic.curriculum_track_subjects(track_id);

COMMENT ON TABLE academic.curriculum_track_subjects IS 'Subject composition and specialized learning clusters per academic track';
COMMENT ON COLUMN academic.curriculum_track_subjects.cluster_period_count IS 'Standard 35-period elective study cluster under GDPT 2018';
