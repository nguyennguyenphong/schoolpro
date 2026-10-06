-- =====================================================================
-- TABLE: academic.rooms (Master Data)
-- School physical rooms, science labs, libraries, and sports halls
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.rooms (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code                  VARCHAR(30) NOT NULL,              -- E.g. 'P_A101', 'LAB_LY', 'TIN_01'
  name                  VARCHAR(100) NOT NULL,             -- E.g. 'Phòng học 101 - Dãy A'
  room_type             VARCHAR(30) NOT NULL DEFAULT 'CLASSROOM'
                          CHECK (room_type IN ('CLASSROOM', 'LAB', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_ROOM', 'CANTEEN', 'HEALTH_ROOM', 'FACULTY_ROOM', 'EXAM_ROOM')),
  capacity              SMALLINT DEFAULT 45,
  area_sqm              NUMERIC(6,2),                      -- Diện tích phòng (m2)
  building              VARCHAR(100),
  floor                 SMALLINT,
  has_projector         BOOLEAN NOT NULL DEFAULT TRUE,     -- Trang bị máy chiếu
  has_air_conditioner   BOOLEAN NOT NULL DEFAULT FALSE,    -- Điều hòa nhiệt độ
  has_camera            BOOLEAN NOT NULL DEFAULT FALSE,    -- Camera giám sát an ninh / thi cử
  has_audio_system      BOOLEAN NOT NULL DEFAULT FALSE,    -- Loa trợ giảng
  qr_checkin_code       VARCHAR(100),                      -- Mã QR dán cửa phòng
  status                VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                          CHECK (status IN ('AVAILABLE', 'UNDER_MAINTENANCE', 'UNAVAILABLE')),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS ix_rooms_school ON academic.rooms(school_id);
CREATE INDEX IF NOT EXISTS ix_rooms_type ON academic.rooms(room_type);

COMMENT ON TABLE academic.rooms IS 'Master physical spaces, classrooms, laboratories, and specialized facilities';
COMMENT ON COLUMN academic.rooms.has_camera IS 'Security / examination invigilation camera equipment availability';
