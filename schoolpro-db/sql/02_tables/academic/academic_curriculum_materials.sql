-- =====================================================================
-- TABLE: academic.curriculum_materials
-- Syllabus documents, slide decks, reference books, and lecture videos
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.curriculum_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  subject_id      UUID NOT NULL REFERENCES core.subjects(id),
  title           VARCHAR(255) NOT NULL,
  chapter_name    VARCHAR(150),
  description     TEXT,
  material_type   VARCHAR(20) NOT NULL DEFAULT 'DOCUMENT'
                    CHECK (material_type IN ('DOCUMENT', 'VIDEO', 'LINK', 'SLIDE', 'EXAM_PREP', 'SAMPLE_EXERCISE')),
  target_grade_id UUID REFERENCES core.grades(id) ON DELETE SET NULL,
  is_shared_all_classes BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID NOT NULL REFERENCES core.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.curriculum_materials IS 'Online learning resources, slides, and syllabus documents';
