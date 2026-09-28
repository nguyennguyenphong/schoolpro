-- =====================================================================
-- TABLE: academic.timetables
-- Master weekly schedule matrix mapping classes, periods, and rooms
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.timetables (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  semester_id       UUID NOT NULL REFERENCES core.semesters(id) ON DELETE CASCADE,
  day_of_week       SMALLINT NOT NULL CHECK (day_of_week BETWEEN 2 AND 8), -- 2 = Monday, ..., 8 = Sunday
  period_id         UUID NOT NULL REFERENCES academic.periods(id),
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  room_id           UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  effective_from    DATE NOT NULL,
  effective_to      DATE,
  UNIQUE (class_id, semester_id, day_of_week, period_id, effective_from)
);

CREATE INDEX IF NOT EXISTS ix_tkb_class ON academic.timetables(class_id);
CREATE INDEX IF NOT EXISTS ix_tkb_cst ON academic.timetables(class_subject_teacher_id);

COMMENT ON TABLE academic.timetables IS 'Weekly recurring timetable schedule slots by class, day of week, period, and venue';
