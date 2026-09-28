-- =====================================================================
-- TABLE: academic.material_attachments
-- Physical files and download trackers associated with curriculum materials
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.material_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES academic.curriculum_materials(id) ON DELETE CASCADE,
  file_name       VARCHAR(255) NOT NULL,
  file_url        TEXT NOT NULL,
  file_type       VARCHAR(50),
  file_size_bytes BIGINT,
  download_count  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.material_attachments IS 'Binary attachment references (PDF, DOCX, MP4) for materials';
