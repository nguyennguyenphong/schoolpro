-- =====================================================================
-- TABLE: evaluation.facilities
-- School physical equipment, lab apparatus, projectors, and air conditioning
-- =====================================================================

CREATE TABLE IF NOT EXISTS evaluation.facilities (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  room_id                  UUID REFERENCES academic.rooms(id) ON DELETE SET NULL,
  code                     VARCHAR(40) NOT NULL UNIQUE,     -- E.g. 'MAY_CHIEU_A101', 'QUAT_TRAN_B1'
  name                     VARCHAR(255) NOT NULL,
  category                 VARCHAR(100) NOT NULL,           -- References lookup 'FACILITY_CATEGORY'
  brand_model              VARCHAR(150),                    -- Hãng sản xuất & Model (Sony VPL-EX570, v.v.)
  serial_number            VARCHAR(100),                    -- Số Serial / Mã vạch nhà sản xuất
  qr_code_tag              VARCHAR(100),                    -- Mã QR dán trên thiết bị để quét báo hỏng
  status                   VARCHAR(20) NOT NULL DEFAULT 'GOOD'
                             CHECK (status IN ('GOOD', 'NEEDS_REPAIR', 'BROKEN', 'UNDER_MAINTENANCE', 'DECOMMISSIONED')),
  location                 VARCHAR(150),                    -- Chi tiết vị trí trong phòng
  responsible_user_id      UUID REFERENCES core.users(id) ON DELETE SET NULL, -- Giáo viên / nhân viên phụ trách
  purchase_date            DATE,
  original_price           NUMERIC(14,2) DEFAULT 0.00,      -- Nguyên giá tài sản
  warranty_expiry_date     DATE,
  supplier_name            VARCHAR(255),
  supplier_phone           VARCHAR(50),
  maintenance_interval_days SMALLINT DEFAULT 90,            -- Chu kỳ bảo trì định kỳ (ngày)
  installed_date           DATE,
  last_maintenance_date    DATE,
  next_maintenance_date    DATE,
  specifications           JSONB DEFAULT '{}'::jsonb,       -- Thông số kỹ thuật chi tiết
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_facilities_school ON evaluation.facilities(school_id);
CREATE INDEX IF NOT EXISTS ix_facilities_room ON evaluation.facilities(room_id);
CREATE INDEX IF NOT EXISTS ix_facilities_status ON evaluation.facilities(status);
CREATE INDEX IF NOT EXISTS ix_facilities_code ON evaluation.facilities(code);

COMMENT ON TABLE evaluation.facilities IS 'Tracked campus assets, classroom projectors, fans, and laboratory kits';
COMMENT ON COLUMN evaluation.facilities.qr_code_tag IS 'Quick response barcode scanned by mobile app to trigger maintenance tickets';
