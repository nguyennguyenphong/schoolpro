-- =====================================================================
-- TABLE: evaluation.facility_incident_reports
-- Broken equipment and facility repair tickets submitted by students/teachers
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.facility_incident_reports (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            UUID REFERENCES core.schools(id) ON DELETE CASCADE,
  ticket_code          VARCHAR(50) UNIQUE,                                -- E.g. 'TICK-2026-0042'
  facility_id          UUID REFERENCES evaluation.facilities(id) ON DELETE SET NULL,
  room_id              UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  title                VARCHAR(255) NOT NULL,
  incident_category    VARCHAR(50) NOT NULL DEFAULT 'ELECTRICAL'
                         CHECK (incident_category IN ('ELECTRICAL', 'PLUMBING', 'FURNITURE', 'PROJECTOR_IT', 'CIVIL_SAFETY', 'CLEANLINESS', 'OTHER')),
  description          TEXT,
  image_urls           JSONB,                                             -- Bằng chứng ảnh chụp hỏng hóc
  priority             VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                         CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status               VARCHAR(20) NOT NULL DEFAULT 'REPORTED'
                         CHECK (status IN ('REPORTED', 'RECEIVED', 'REPAIRING', 'RESOLVED', 'REJECTED')),
  reported_by          UUID NOT NULL REFERENCES core.users(id),
  handled_by           UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Nhân viên kỹ thuật / quản trị Cơ sở vật chất
  contractor_name      VARCHAR(150),                                      -- Thợ / đơn vị bảo hành ngoài
  estimated_cost       NUMERIC(12,2) DEFAULT 0.00,
  actual_cost          NUMERIC(12,2) DEFAULT 0.00,
  repair_deadline      TIMESTAMPTZ,
  resolution_note      TEXT,
  repaired_at          TIMESTAMPTZ,
  verified_by          UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Người nghiệm thu hoàn thành
  rating_satisfaction  SMALLINT CHECK (rating_satisfaction BETWEEN 1 AND 5), -- Đánh giá độ hài lòng sau sửa
  reported_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at          TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_incidents_school ON evaluation.facility_incident_reports(school_id);
CREATE INDEX IF NOT EXISTS ix_incidents_facility ON evaluation.facility_incident_reports(facility_id);
CREATE INDEX IF NOT EXISTS ix_incidents_room ON evaluation.facility_incident_reports(room_id);
CREATE INDEX IF NOT EXISTS ix_incidents_status ON evaluation.facility_incident_reports(status);
CREATE INDEX IF NOT EXISTS ix_incidents_ticket ON evaluation.facility_incident_reports(ticket_code);

COMMENT ON TABLE evaluation.facility_incident_reports IS 'Maintenance trouble tickets for repairing lighting, desks, projectors, or school infrastructure';
COMMENT ON COLUMN evaluation.facility_incident_reports.ticket_code IS 'Human-friendly unique ticket identifier for facility maintenance dispatch';
