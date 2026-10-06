-- =====================================================================
-- TABLE: core.departments (Master Data)
-- Subject departments, school board, youth union, and administrative offices
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.departments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id          UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code               VARCHAR(30) NOT NULL,         -- E.g. 'TO_TOAN_TIN', 'BAN_GIAM_THI', 'DOAN_TRUONG'
  name               VARCHAR(150) NOT NULL,        -- E.g. 'Tổ Toán - Tin học', 'Tổ Ngữ văn'
  department_type    VARCHAR(30) NOT NULL DEFAULT 'SUBJECT'
                       CHECK (department_type IN ('SUBJECT', 'ADMINISTRATION', 'UNION', 'BOARD')),
  leader_teacher_id  UUID REFERENCES core.users(id) ON DELETE SET NULL,
  vice_leader_id     UUID REFERENCES core.users(id) ON DELETE SET NULL,
  office_room_id     UUID REFERENCES academic.rooms(id) ON DELETE SET NULL, -- Văn phòng làm việc của tổ
  phone              VARCHAR(20),
  email              VARCHAR(255),
  order_no           SMALLINT NOT NULL DEFAULT 0,
  description        TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS ix_departments_school ON core.departments(school_id);

COMMENT ON TABLE core.departments IS 'Master educational subject departments and administrative divisions';
COMMENT ON COLUMN core.departments.office_room_id IS 'Assigned faculty departmental headquarters office';
