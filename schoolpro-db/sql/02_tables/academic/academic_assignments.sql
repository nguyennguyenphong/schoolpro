-- =====================================================================
-- TABLE: academic.assignments
-- Homework tasks, projects, essays, and exam revision exercises
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.assignments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_teacher_id UUID NOT NULL REFERENCES core.class_subject_teachers(id) ON DELETE CASCADE,
  title                   VARCHAR(255) NOT NULL,
  description             TEXT,
  assignment_type         VARCHAR(20) NOT NULL DEFAULT 'HOMEWORK'
                            CHECK (assignment_type IN ('HOMEWORK', 'PROJECT', 'ESSAY', 'REVISION')),
  format                  VARCHAR(30) NOT NULL DEFAULT 'HOMEWORK'
                            CHECK (format IN ('HOMEWORK', 'ESSAY', 'QUIZ', 'PROJECT', 'HYBRID', 'PRACTICAL')),
  assigned_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date                TIMESTAMPTZ NOT NULL,
  max_score               NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  pass_score              NUMERIC(4,2) DEFAULT 5.00,
  weight_percent          NUMERIC(5,2) DEFAULT 10.00,
  attachments             JSONB,
  is_published            BOOLEAN NOT NULL DEFAULT TRUE,

  -- Quy chuẩn tệp bài làm do giáo viên thiết lập động
  allowed_file_types      JSONB DEFAULT '["pdf", "docx", "xlsx", "pptx", "jpg", "png", "zip", "mp4", "mp3"]'::jsonb,
  max_file_size_mb        INT DEFAULT 25,
  max_files_count         INT DEFAULT 5,
  file_naming_rule        VARCHAR(255) DEFAULT '{class}_{student_name}_{assignment_title}',
  file_naming_regex       VARCHAR(255),

  -- Quy chế nộp bài, nộp trễ và nộp lại
  allow_late_submission   BOOLEAN NOT NULL DEFAULT TRUE,
  late_penalty_percent    NUMERIC(5,2) DEFAULT 0.00,
  allow_resubmission      BOOLEAN NOT NULL DEFAULT TRUE,
  max_resubmission_count  INT DEFAULT 3,

  -- Quản lý gia hạn thời gian nộp bài động (Lần 1, 2, 3)
  extended_due_date_1     TIMESTAMPTZ,
  extension_reason_1      TEXT,
  extended_due_date_2     TIMESTAMPTZ,
  extension_reason_2      TEXT,
  extended_due_date_3     TIMESTAMPTZ,
  extension_reason_3      TEXT,

  -- Rubric chấm điểm và đáp án mẫu
  rubric                  JSONB,
  solution_attachments    JSONB,
  solution_published_at   TIMESTAMPTZ,
  settings                JSONB DEFAULT '{}'::jsonb,

  created_by              UUID NOT NULL REFERENCES core.users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE academic.assignments IS 'Homework tasks and group projects assigned by subject teachers with dynamic submission rules and extensions';
COMMENT ON COLUMN academic.assignments.format IS 'Hình thức bài tập: HOMEWORK, ESSAY (Tự luận), QUIZ (Trắc nghiệm), PROJECT (Dự án/Báo cáo), HYBRID (Kết hợp), PRACTICAL (Thực hành)';
COMMENT ON COLUMN academic.assignments.allowed_file_types IS 'Danh sách đuôi file cho phép nộp do giáo viên đề ra (JSON array: ["pdf", "docx", ...])';
COMMENT ON COLUMN academic.assignments.max_file_size_mb IS 'Dung lượng tối đa của mỗi tệp bài làm (MB)';
COMMENT ON COLUMN academic.assignments.max_files_count IS 'Số lượng tệp đính kèm tối đa học sinh được nộp trong một bài';
COMMENT ON COLUMN academic.assignments.file_naming_rule IS 'Quy chuẩn đặt tên tệp giáo viên yêu cầu (ví dụ: {lop}_{hoten}_{mabaiviet})';
COMMENT ON COLUMN academic.assignments.allow_late_submission IS 'Cho phép học sinh nộp bài sau hạn chót (được tính là nộp muộn)';
COMMENT ON COLUMN academic.assignments.late_penalty_percent IS 'Phần trăm điểm bị trừ khi nộp muộn (ví dụ: 10.00 tương ứng trừ 10% điểm)';
COMMENT ON COLUMN academic.assignments.allow_resubmission IS 'Cho phép học sinh nộp lại/chỉnh sửa bài làm trước thời điểm hết hạn';
COMMENT ON COLUMN academic.assignments.extended_due_date_1 IS 'Thời hạn gia hạn nộp bài lần 1';
COMMENT ON COLUMN academic.assignments.extension_reason_1 IS 'Lý do giáo viên gia hạn nộp bài lần 1';
COMMENT ON COLUMN academic.assignments.extended_due_date_2 IS 'Thời hạn gia hạn nộp bài lần 2';
COMMENT ON COLUMN academic.assignments.extension_reason_2 IS 'Lý do giáo viên gia hạn nộp bài lần 2';
COMMENT ON COLUMN academic.assignments.extended_due_date_3 IS 'Thời hạn gia hạn nộp bài lần 3';
COMMENT ON COLUMN academic.assignments.extension_reason_3 IS 'Lý do giáo viên gia hạn nộp bài lần 3';
COMMENT ON COLUMN academic.assignments.rubric IS 'Tiêu chí chấm điểm chi tiết (Rubric scoring matrix dạng JSON)';
COMMENT ON COLUMN academic.assignments.solution_attachments IS 'Đáp án mẫu, barem điểm hoặc hướng dẫn giải do giáo viên đính kèm';
