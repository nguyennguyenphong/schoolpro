-- =====================================================================
-- TABLE: academic.timetable_changes
-- Ad-hoc schedule adjustments (substitute teachers, room relocations, make-ups)
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.timetable_changes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id         UUID NOT NULL REFERENCES academic.timetables(id) ON DELETE CASCADE,
  change_date          DATE NOT NULL,
  change_type          VARCHAR(20) NOT NULL
                         CHECK (change_type IN ('SUBSTITUTE_TEACHER', 'ROOM_CHANGE', 'CANCELLED', 'MAKE_UP_CLASS', 'PERIOD_SWAP')),
  new_teacher_id       UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  new_room_id          UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  new_period_id        UUID REFERENCES academic.periods(id) ON DELETE SET NULL,
  reason               TEXT,
  requested_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  requested_at         TIMESTAMPTZ DEFAULT now(),
  approved_by          UUID REFERENCES core.users(id) ON DELETE SET NULL,
  approved_at          TIMESTAMPTZ,
  rejection_reason     TEXT,
  status               VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
                         CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  is_notified_to_class BOOLEAN NOT NULL DEFAULT FALSE,
  notes                TEXT,
  metadata             JSONB DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (timetable_id, change_date)
);

CREATE INDEX IF NOT EXISTS ix_tt_change_date ON academic.timetable_changes(change_date);
CREATE INDEX IF NOT EXISTS ix_tt_change_status ON academic.timetable_changes(status);
CREATE INDEX IF NOT EXISTS ix_tt_change_new_teacher ON academic.timetable_changes(new_teacher_id);

COMMENT ON TABLE academic.timetable_changes IS 'Daily operational substitutions, period moves, and room change logs';
COMMENT ON COLUMN academic.timetable_changes.new_period_id IS 'Target period slot for make-up class or period swap';
COMMENT ON COLUMN academic.timetable_changes.is_notified_to_class IS 'Flag indicating whether a push notification was dispatched to students and homeroom teacher';
