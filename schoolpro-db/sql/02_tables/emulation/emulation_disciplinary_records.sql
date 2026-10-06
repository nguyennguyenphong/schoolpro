-- =====================================================================
-- TABLE: emulation.disciplinary_records
-- Formal disciplinary council notices, suspension orders, and commendations
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.disciplinary_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  academic_year_id      UUID REFERENCES core.academic_years(id) ON DELETE CASCADE,
  semester_id           UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  record_type           VARCHAR(20) NOT NULL
                          CHECK (record_type IN ('COMMENDATION', 'DISCIPLINE')),
  level                 VARCHAR(50) NOT NULL,            -- E.g. 'WARNING', 'REPRIMAND', 'SUSPENSION', 'EXPULSION'
  title                 VARCHAR(255) NOT NULL,
  decision_no           VARCHAR(100),
  decision_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  incident_date         DATE,                            -- Ngày xảy ra sự việc vi phạm
  council_meeting_date  DATE,                            -- Ngày họp Hội đồng kỷ luật trường
  suspension_days       SMALLINT DEFAULT 0,              -- Số ngày tạm đình chỉ học tập (nếu có)
  effective_from        DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to          DATE,
  rehabilitation_status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                          CHECK (rehabilitation_status IN ('NOT_APPLICABLE', 'IN_PROGRESS', 'REHABILITATED', 'REPEATED')),
  rehabilitation_note   TEXT,                            -- Nhận xét tiến bộ rèn luyện sau kỷ luật
  parent_notified       BOOLEAN NOT NULL DEFAULT FALSE,  -- Đã gửi thông báo đến phụ huynh
  parent_acknowledged_at TIMESTAMPTZ,                    -- Phụ huynh ký nhận quyết định
  conduct_impact        VARCHAR(50),                     -- Ảnh hưởng đến xếp loại hạnh kiểm
  description           TEXT,
  signed_by             UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Hiệu trưởng / Chủ tịch Hội đồng
  attachment_url        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_disc_rec_student ON emulation.disciplinary_records(student_id);
CREATE INDEX IF NOT EXISTS ix_disc_rec_type ON emulation.disciplinary_records(record_type);
CREATE INDEX IF NOT EXISTS ix_disc_rec_year ON emulation.disciplinary_records(academic_year_id);

COMMENT ON TABLE emulation.disciplinary_records IS 'Formal disciplinary decisions, suspension tracking, and honorary citations';
COMMENT ON COLUMN emulation.disciplinary_records.rehabilitation_status IS 'Progress tracking of student reform during probationary interval';
