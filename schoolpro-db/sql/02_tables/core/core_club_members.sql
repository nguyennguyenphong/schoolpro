-- =====================================================================
-- TABLE: core.club_members
-- Student club enrollments, executive boards, and activity rosters
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.club_members (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id            UUID NOT NULL REFERENCES core.clubs(id) ON DELETE CASCADE,
  student_id         UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  role_title         VARCHAR(50) NOT NULL DEFAULT 'MEMBER'
                       CHECK (role_title IN ('PRESIDENT', 'VICE_PRESIDENT', 'TREASURER', 'HEAD_OF_COMMITTEE', 'MEMBER')),
  joined_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  left_date          DATE,
  status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                       CHECK (status IN ('ACTIVE', 'INACTIVE', 'ALUMNI', 'EXPELLED')),
  leave_reason       TEXT,
  attendance_rate    NUMERIC(5,2) DEFAULT 100.00,       -- Chuyên cần sinh hoạt Câu lạc bộ (%)
  merit_points       SMALLINT NOT NULL DEFAULT 0,       -- Điểm thưởng đóng góp Câu lạc bộ
  certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,    -- Đã cấp chứng nhận thành viên
  contribution_notes TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_club_members_club ON core.club_members(club_id);
CREATE INDEX IF NOT EXISTS ix_club_members_student ON core.club_members(student_id);
CREATE INDEX IF NOT EXISTS ix_club_members_status ON core.club_members(status);

COMMENT ON TABLE core.club_members IS 'Roster of student club participants, leaders, and executive positions';
COMMENT ON COLUMN core.club_members.attendance_rate IS 'Percentage of club gatherings attended by student';
