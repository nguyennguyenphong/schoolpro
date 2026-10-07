-- =====================================================================
-- TABLE: academic.leave_requests
-- Formal student leave / absence applications submitted by parents or students
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.leave_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  class_id            UUID NOT NULL REFERENCES core.classes(id) ON DELETE CASCADE,
  guardian_id         UUID REFERENCES core.guardians(id) ON DELETE SET NULL,
  requested_by        UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  reason              TEXT NOT NULL,
  leave_type          VARCHAR(30) NOT NULL DEFAULT 'SICK'
                        CHECK (leave_type IN ('SICK', 'FAMILY_AFFAIR', 'BEREAVEMENT', 'OFFICIAL_COMPETITION', 'OTHER')),
  status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  supporting_document_url TEXT,
  teacher_note        TEXT,
  reviewed_by         UUID REFERENCES core.users(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_leave_req_student ON academic.leave_requests(student_id);
CREATE INDEX IF NOT EXISTS ix_leave_req_class ON academic.leave_requests(class_id);
CREATE INDEX IF NOT EXISTS ix_leave_req_dates ON academic.leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS ix_leave_req_status ON academic.leave_requests(status);

COMMENT ON TABLE academic.leave_requests IS 'Student leave and excused absence requests with multi-day support and teacher approvals';
COMMENT ON COLUMN academic.leave_requests.status IS 'Approval workflow status: PENDING, APPROVED, REJECTED, CANCELLED';
