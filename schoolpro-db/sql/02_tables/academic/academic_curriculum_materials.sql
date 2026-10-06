-- =====================================================================
-- TABLE: academic.curriculum_materials
-- Syllabus documents, slide decks, reference books, and lecture videos
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_materials (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  subject_id            UUID NOT NULL REFERENCES core.subjects(id),
  title                 VARCHAR(255) NOT NULL,
  chapter_name          VARCHAR(150),
  description           TEXT,
  material_type         VARCHAR(20) NOT NULL DEFAULT 'DOCUMENT'
                          CHECK (material_type IN ('DOCUMENT', 'VIDEO', 'LINK', 'SLIDE', 'EXAM_PREP', 'SAMPLE_EXERCISE')),
  visibility            VARCHAR(20) NOT NULL DEFAULT 'CLASS_ONLY'
                          CHECK (visibility IN ('PUBLIC', 'SCHOOL_WIDE', 'GRADE_WIDE', 'CLASS_ONLY', 'TEACHERS_ONLY')),
  file_url              VARCHAR(1000),
  file_size_bytes       BIGINT,
  mime_type             VARCHAR(100),
  download_count        INT NOT NULL DEFAULT 0,
  view_count            INT NOT NULL DEFAULT 0,
  tags                  TEXT[] DEFAULT '{}'::text[],
  target_grade_id       UUID REFERENCES core.grades(id) ON DELETE SET NULL,
  is_shared_all_classes BOOLEAN NOT NULL DEFAULT FALSE,
  is_published          BOOLEAN NOT NULL DEFAULT TRUE,
  published_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata              JSONB DEFAULT '{}'::jsonb,
  created_by            UUID NOT NULL REFERENCES core.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_curriculum_subject ON academic.curriculum_materials(subject_id);
CREATE INDEX IF NOT EXISTS ix_curriculum_cst ON academic.curriculum_materials(class_subject_teacher_id);
CREATE INDEX IF NOT EXISTS ix_curriculum_type ON academic.curriculum_materials(material_type);

COMMENT ON TABLE academic.curriculum_materials IS 'Online learning resources, slides, videos, and syllabus documents';
COMMENT ON COLUMN academic.curriculum_materials.visibility IS 'Scope: PUBLIC, SCHOOL_WIDE, GRADE_WIDE, CLASS_ONLY, TEACHERS_ONLY';
COMMENT ON COLUMN academic.curriculum_materials.download_count IS 'Aggregate metric of student downloads';
