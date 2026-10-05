-- =====================================================================
-- TABLE: sys.export_templates
-- Storage and management for document export and print templates (HTML/PDF/Excel/Word)
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys.export_templates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 VARCHAR(100) NOT NULL,
  name                 VARCHAR(255) NOT NULL,
  description          TEXT,
  template_type        VARCHAR(50) NOT NULL DEFAULT 'ANNOUNCEMENT'
                         CHECK (template_type IN ('ANNOUNCEMENT', 'ACADEMIC', 'STUDENT_PROFILE', 'ATTENDANCE', 'EMULATION', 'FEE_RECEIPT', 'GENERAL')),
  file_format          VARCHAR(30) NOT NULL DEFAULT 'HTML_PRINT'
                         CHECK (file_format IN ('HTML_PRINT', 'PDF', 'EXCEL', 'WORD')),
  content              TEXT NOT NULL DEFAULT '',
  header_content       TEXT NOT NULL DEFAULT '',
  footer_content       TEXT NOT NULL DEFAULT '',
  style_content        TEXT NOT NULL DEFAULT '',
  page_size            VARCHAR(20) NOT NULL DEFAULT 'A4',
  page_orientation     VARCHAR(20) NOT NULL DEFAULT 'PORTRAIT',
  margins              JSONB NOT NULL DEFAULT '{"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "20mm"}'::jsonb,
  placeholders_schema  JSONB NOT NULL DEFAULT '[]'::jsonb,
  sample_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default           BOOLEAN NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  school_id            UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  department_id        UUID REFERENCES core.departments(id) ON DELETE SET NULL,
  created_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  updated_by           UUID REFERENCES core.users(id) ON DELETE SET NULL,
  is_deleted           BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_export_templates_code_school ON sys.export_templates(code, school_id);
CREATE INDEX IF NOT EXISTS ix_export_templates_type_active ON sys.export_templates(template_type, is_active);
CREATE INDEX IF NOT EXISTS ix_export_templates_school ON sys.export_templates(school_id);
CREATE INDEX IF NOT EXISTS ix_export_templates_department ON sys.export_templates(department_id);

COMMENT ON TABLE sys.export_templates IS 'Export and print document templates configurable per school/department';
