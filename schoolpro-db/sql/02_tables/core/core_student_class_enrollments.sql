-- =====================================================================
-- TABLE: core.student_class_enrollments
-- Class roster enrollments linking students to classes and study groups
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.student_class_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  class_group_id  UUID REFERENCES core.class_groups(id) ON DELETE SET NULL, -- Assigned study squad (Tổ học tập)
  seat_number     SMALLINT,                                                 -- STT trong danh sách điểm danh lớp (1..50)
  desk_row        SMALLINT,                                                 -- Hàng bàn học
  desk_column     SMALLINT,                                                 -- Dãy bàn học
  enroll_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  leave_date      DATE,
  leave_reason    TEXT,                                                     -- Lý do chuyển lớp / chuyển trường
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'COMPLETED')),
  enrolled_by     UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, class_id)
);

CREATE INDEX IF NOT EXISTS ix_enroll_class ON core.student_class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS ix_enroll_group ON core.student_class_enrollments(class_group_id);
CREATE INDEX IF NOT EXISTS ix_enroll_seat ON core.student_class_enrollments(class_id, seat_number);
CREATE UNIQUE INDEX IF NOT EXISTS ux_enroll_active_per_student
  ON core.student_class_enrollments(student_id) WHERE status = 'ACTIVE';

COMMENT ON TABLE core.student_class_enrollments IS 'Annual official class roster memberships and internal squad placements';
COMMENT ON COLUMN core.student_class_enrollments.seat_number IS 'Student roster sequence index for roll-call sheets (Số thứ tự danh sách lớp)';
