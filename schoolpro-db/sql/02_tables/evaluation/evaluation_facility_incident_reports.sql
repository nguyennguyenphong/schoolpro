-- =====================================================================
-- TABLE: evaluation.facility_incident_reports
-- Broken equipment and facility repair tickets submitted by students/teachers
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.facility_incident_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id     UUID REFERENCES evaluation.facilities(id) ON DELETE SET NULL,
  room_id         UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  image_urls      JSONB,
  priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status          VARCHAR(20) NOT NULL DEFAULT 'REPORTED'
                    CHECK (status IN ('REPORTED', 'RECEIVED', 'REPAIRING', 'RESOLVED', 'REJECTED')),
  reported_by     UUID NOT NULL REFERENCES core.users(id),
  handled_by      UUID REFERENCES core.users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  reported_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

COMMENT ON TABLE evaluation.facility_incident_reports IS 'Maintenance trouble tickets for repairing lighting, desks, or electronics';
