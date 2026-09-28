-- =====================================================================
-- TABLE: academic.rooms (Master Data)
-- School physical rooms, science labs, libraries, and sports halls
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  code          VARCHAR(30) NOT NULL,              -- E.g. 'P_A101', 'LAB_LY', 'TIN_01'
  name          VARCHAR(100) NOT NULL,             -- E.g. 'Phòng học 101 - Dãy A'
  room_type     VARCHAR(30) NOT NULL DEFAULT 'CLASSROOM'
                  CHECK (room_type IN ('CLASSROOM', 'LAB', 'LIBRARY', 'GYM', 'AUDITORIUM', 'COMPUTER_ROOM', 'CANTEEN', 'HEALTH_ROOM')),
  capacity      SMALLINT DEFAULT 45,
  building      VARCHAR(100),
  floor         SMALLINT,
  status        VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                  CHECK (status IN ('AVAILABLE', 'UNDER_MAINTENANCE', 'UNAVAILABLE')),
  UNIQUE (school_id, code)
);

COMMENT ON TABLE academic.rooms IS 'Master physical spaces, classrooms, laboratories, and specialized facilities';
