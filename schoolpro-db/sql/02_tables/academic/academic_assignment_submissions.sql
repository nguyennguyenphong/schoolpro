-- =====================================================================
-- TABLE: academic.assignment_submissions
-- Student homework turn-ins, attachments, scores, and teacher comments
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignment_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id         UUID NOT NULL REFERENCES academic.assignments(id) ON DELETE CASCADE,
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  attempt_number        INT NOT NULL DEFAULT 1,
  submission_status     VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED'
                          CHECK (submission_status IN ('DRAFT', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED', 'RESUBMITTED')),
  submitted_at          TIMESTAMPTZ,
  content_text          TEXT,
  attachments           JSONB,

  -- Quản lý nộp trễ và khấu trừ điểm
  is_late               BOOLEAN NOT NULL DEFAULT FALSE,
  late_minutes          INT DEFAULT 0,
  penalty_deduction     NUMERIC(4,2) DEFAULT 0.00,

  -- Điểm số và Rubric
  raw_score             NUMERIC(4,2) CHECK (raw_score >= 0 AND raw_score <= 10),
  score                 NUMERIC(4,2) CHECK (score >= 0 AND score <= 10),
  final_score           NUMERIC(4,2) CHECK (final_score >= 0 AND final_score <= 10),
  rubric_scores         JSONB,

  feedback              TEXT,
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'RETURNED')),
  graded_by             UUID REFERENCES core.users(id) ON DELETE SET NULL,
  graded_at             TIMESTAMPTZ,

  -- Quy trình yêu cầu mở lại cổng nộp bù (Reopen Request Workflow)
  reopen_status         VARCHAR(30) NOT NULL DEFAULT 'NONE'
                          CHECK (reopen_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED')),
  reopen_request_reason TEXT,
  reopen_requested_at   TIMESTAMPTZ,
  reopen_approved_by    UUID REFERENCES core.users(id) ON DELETE SET NULL,
  reopen_approved_at    TIMESTAMPTZ,
  metadata              JSONB DEFAULT '{}'::jsonb,

  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS ix_submissions_student ON academic.assignment_submissions(student_id);

COMMENT ON TABLE academic.assignment_submissions IS 'Student homework answers, uploaded files, and graded feedback';
COMMENT ON COLUMN academic.assignment_submissions.attempt_number IS 'Số thứ tự lần nộp bài của học sinh (1, 2, 3...)';
COMMENT ON COLUMN academic.assignment_submissions.is_late IS 'Cờ đánh dấu bài nộp sau hạn chót quy định';
COMMENT ON COLUMN academic.assignment_submissions.penalty_deduction IS 'Số điểm bị trừ do nộp muộn';
COMMENT ON COLUMN academic.assignment_submissions.final_score IS 'Điểm tổng kết cuối cùng sau khi đã tính trừ điểm';
COMMENT ON COLUMN academic.assignment_submissions.reopen_status IS 'Trạng thái đề xuất mở lại cổng: NONE, PENDING, APPROVED, REJECTED';
