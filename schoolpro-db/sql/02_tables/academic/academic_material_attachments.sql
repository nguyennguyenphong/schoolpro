-- =====================================================================
-- TABLE: academic.material_attachments
-- Physical files and download trackers associated with curriculum materials
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.material_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES academic.curriculum_materials(id) ON DELETE CASCADE,
  file_name       VARCHAR(255) NOT NULL,
  file_url        TEXT NOT NULL,
  storage_path    VARCHAR(500),                       -- Object storage key (S3/MinIO)
  file_type       VARCHAR(50),                        -- File extension (pdf, docx, mp4, etc.)
  mime_type       VARCHAR(100),                       -- Standard MIME type (application/pdf, etc.)
  file_size_bytes BIGINT,
  checksum        VARCHAR(64),                        -- SHA256 checksum for file integrity
  is_previewable  BOOLEAN NOT NULL DEFAULT TRUE,      -- Can render in browser viewer
  download_count  INT NOT NULL DEFAULT 0,
  view_count      INT NOT NULL DEFAULT 0,
  version         SMALLINT NOT NULL DEFAULT 1,
  description     TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_mat_att_material ON academic.material_attachments(material_id);

COMMENT ON TABLE academic.material_attachments IS 'Binary attachment references (PDF, DOCX, MP4) for learning materials';
COMMENT ON COLUMN academic.material_attachments.checksum IS 'Cryptographic hash to ensure uncorrupted file delivery';
