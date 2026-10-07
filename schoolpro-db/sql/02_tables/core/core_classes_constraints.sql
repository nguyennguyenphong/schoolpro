-- =====================================================================
-- TABLE CONSTRAINTS: core.classes
-- Deferred Foreign Key links to break circular creation dependencies
-- =====================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_homeroom_teacher'
  ) THEN
    ALTER TABLE core.classes
      ADD CONSTRAINT fk_classes_homeroom_teacher
      FOREIGN KEY (homeroom_teacher_id) REFERENCES core.teachers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_assistant_teacher'
  ) THEN
    ALTER TABLE core.classes
      ADD CONSTRAINT fk_classes_assistant_teacher
      FOREIGN KEY (assistant_homeroom_teacher_id) REFERENCES core.teachers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_monitor_student'
  ) THEN
    ALTER TABLE core.classes
      ADD CONSTRAINT fk_classes_monitor_student
      FOREIGN KEY (monitor_student_id) REFERENCES core.students(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_vice_monitor_student'
  ) THEN
    ALTER TABLE core.classes
      ADD CONSTRAINT fk_classes_vice_monitor_student
      FOREIGN KEY (vice_monitor_student_id) REFERENCES core.students(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_curriculum_track'
  ) THEN
    ALTER TABLE core.classes
      ADD CONSTRAINT fk_classes_curriculum_track
      FOREIGN KEY (curriculum_track_id) REFERENCES academic.curriculum_tracks(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_room'
  ) THEN
    ALTER TABLE core.classes
      ADD CONSTRAINT fk_classes_room
      FOREIGN KEY (room_id) REFERENCES academic.rooms(id) ON DELETE SET NULL;
  END IF;
END $$;
