-- =====================================================================
-- TABLE: academic.timetable_changes
-- Ad-hoc schedule adjustments (substitute teachers, room relocations)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.timetable_changes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id    UUID NOT NULL REFERENCES academic.timetables(id) ON DELETE CASCADE,
  change_date     DATE NOT NULL,
  change_type     VARCHAR(20) NOT NULL
                    CHECK (change_type IN ('SUBSTITUTE_TEACHER', 'ROOM_CHANGE', 'CANCELLED', 'MAKE_UP_CLASS')),
  new_teacher_id  UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  new_room_id     UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  reason          TEXT,
  approved_by     UUID REFERENCES core.users(id) ON DELETE SET NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (timetable_id, change_date)
);

COMMENT ON TABLE academic.timetable_changes IS 'Daily operational substitutions and room change logs';
