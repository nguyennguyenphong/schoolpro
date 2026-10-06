-- =====================================================================
-- TABLE: academic.class_journal_entries
-- Electronic class register / lesson diary (Sổ đầu bài điện tử)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.class_journal_entries (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id                 UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  timetable_id             UUID REFERENCES academic.timetables(id) ON DELETE SET NULL,
  period_id                UUID REFERENCES academic.periods(id) ON DELETE SET NULL,
  session_date             DATE NOT NULL,
  period_no                SMALLINT NOT NULL,
  lesson_curriculum_number SMALLINT,                               -- Tiết phân phối chương trình (PPCT)
  lesson_title             VARCHAR(255) NOT NULL,
  present_count            SMALLINT NOT NULL,
  absent_count             SMALLINT NOT NULL DEFAULT 0,
  absent_names             TEXT,
  lesson_rating            VARCHAR(5) NOT NULL DEFAULT 'A'
                             CHECK (lesson_rating IN ('A', 'B', 'C', 'D')), -- Grade A (Good), B, C, D
  emulation_score          SMALLINT NOT NULL DEFAULT 100,          -- Điểm thi đua tiết học (0 - 100)
  homework_assigned        TEXT,                                   -- Nhiệm vụ học tập / bài tập về nhà
  commended_students       TEXT,                                   -- Tuyên dương học sinh tích cực
  disciplined_students     TEXT,                                   -- Nhắc nhở học sinh vi phạm
  teacher_feedback         TEXT,
  is_substitute            BOOLEAN NOT NULL DEFAULT FALSE,         -- Tiết dạy thay
  substitute_teacher_id    UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  teacher_signature_time   TIMESTAMPTZ,
  student_monitor_signature VARCHAR(100),                          -- Cán sự lớp / cờ đỏ ký xác nhận
  status                   VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED'
                             CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'LOCKED')),
  verified_by              UUID REFERENCES core.users(id) ON DELETE SET NULL, -- BGH / Tổ trưởng duyệt
  verified_at              TIMESTAMPTZ,
  metadata                 JSONB DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_journal_class_date ON academic.class_journal_entries(class_id, session_date);
CREATE INDEX IF NOT EXISTS ix_journal_cst ON academic.class_journal_entries(class_subject_teacher_id);
CREATE INDEX IF NOT EXISTS ix_journal_status ON academic.class_journal_entries(status);

COMMENT ON TABLE academic.class_journal_entries IS 'Official electronic class journal recording syllabus progress, attendance, and period rating';
COMMENT ON COLUMN academic.class_journal_entries.lesson_curriculum_number IS 'MOET distribution curriculum slot index (Tiết PPCT)';
COMMENT ON COLUMN academic.class_journal_entries.emulation_score IS 'Period emulation score contributed to class weekly ranking';
