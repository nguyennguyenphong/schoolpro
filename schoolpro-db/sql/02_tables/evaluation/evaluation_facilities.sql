-- =====================================================================
-- TABLE: evaluation.facilities
-- School physical equipment, lab apparatus, projectors, and air conditioning
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.facilities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  room_id         UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  code            VARCHAR(40) NOT NULL UNIQUE,     -- E.g. 'MAY_CHIEU_A101', 'QUAT_TRAN_B1'
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,           -- References lookup 'FACILITY_CATEGORY'
  status          VARCHAR(20) NOT NULL DEFAULT 'GOOD'
                    CHECK (status IN ('GOOD', 'NEEDS_REPAIR', 'BROKEN', 'UNDER_MAINTENANCE')),
  location        VARCHAR(150),
  installed_date  DATE,
  last_maintenance_date DATE
);

COMMENT ON TABLE evaluation.facilities IS 'Tracked campus assets, classroom projectors, fans, and laboratory kits';
