-- =====================================================================
-- TABLE: emulation.supervisor_duty_logs
-- Daily school gate / classroom inspection rounds conducted by supervisors
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.supervisor_duty_logs (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id                   UUID REFERENCES emulation.periods(id) ON DELETE CASCADE,
  duty_date                   DATE NOT NULL DEFAULT CURRENT_DATE,
  shift                       VARCHAR(10) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON')),
  supervisor_id               UUID NOT NULL REFERENCES core.users(id),       -- Giám thị / Thầy phụ trách
  red_flag_student_id         UUID REFERENCES core.students(id) ON DELETE SET NULL, -- Học sinh cờ đỏ chấm chéo
  class_id                    UUID NOT NULL REFERENCES core.classes(id),
  cleanliness_score           NUMERIC(4,2) DEFAULT 10.0,                     -- Vệ sinh lớp học
  orderliness_score           NUMERIC(4,2) DEFAULT 10.0,                     -- Nề nếp / trật tự
  uniform_score               NUMERIC(4,2) DEFAULT 10.0,                     -- Tác phong / đồng phục
  line_up_score               NUMERIC(4,2) DEFAULT 10.0,                     -- Xếp hàng / thể dục giữa giờ
  attendance_score            NUMERIC(4,2) DEFAULT 10.0,                     -- Sĩ số / đúng giờ
  total_score                 NUMERIC(5,2) DEFAULT 50.0,                     -- Tổng điểm ca trực
  evidence_urls               JSONB,                                         -- Ảnh chụp minh chứng vi phạm
  class_representative_signature VARCHAR(100),                               -- Đại diện lớp ký xác nhận
  disputed                    BOOLEAN NOT NULL DEFAULT FALSE,                -- Khiếu nại biên bản chấm
  dispute_reason              TEXT,
  general_feedback            TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_sup_duty_date ON emulation.supervisor_duty_logs(duty_date, shift);
CREATE INDEX IF NOT EXISTS ix_sup_duty_class ON emulation.supervisor_duty_logs(class_id);
CREATE INDEX IF NOT EXISTS ix_sup_duty_period ON emulation.supervisor_duty_logs(period_id);

COMMENT ON TABLE emulation.supervisor_duty_logs IS 'Daily supervisor and red-flag brigade inspection evaluation checklists';
COMMENT ON COLUMN emulation.supervisor_duty_logs.red_flag_student_id IS 'Student monitor assigned to cross-inspect this class';
