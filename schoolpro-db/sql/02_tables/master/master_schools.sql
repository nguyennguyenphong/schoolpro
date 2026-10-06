-- =====================================================================
-- TABLE: core.schools (Master Data)
-- School institutions and campus headquarters
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.schools (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                   VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'THPT_LEQUYDON'
  name                   VARCHAR(255) NOT NULL,             -- E.g. 'Trường THPT Lê Quý Đôn'
  moet_code              VARCHAR(50),                       -- Mã trường chuẩn của Bộ GD&ĐT
  educational_stage      VARCHAR(30) NOT NULL DEFAULT 'HIGH_SCHOOL', -- High school (Cấp 3)
  school_type            VARCHAR(30) NOT NULL DEFAULT 'PUBLIC'
                           CHECK (school_type IN ('PUBLIC', 'PRIVATE', 'INTERNATIONAL', 'SPECIALIZED')),
  established_year       SMALLINT,
  address                TEXT,
  province_code          VARCHAR(20),
  district_code          VARCHAR(20),
  ward_code              VARCHAR(20),
  phone                  VARCHAR(20),
  fax                    VARCHAR(30),
  email                  VARCHAR(255),
  website                VARCHAR(255),
  tax_id                 VARCHAR(30),                       -- Mã số thuế đơn vị trường học
  bank_name              VARCHAR(150),
  bank_account_number    VARCHAR(50),
  bank_account_holder    VARCHAR(150),
  logo_url               TEXT,
  banner_url             TEXT,
  stamp_image_url        TEXT,                              -- Con dấu tròn số hóa của trường
  slogan                 VARCHAR(255),
  principal_name         VARCHAR(255),
  digital_certificate_info JSONB,                           -- Thông tin chứng thư số CA phục vụ ký học bạ
  metadata               JSONB DEFAULT '{}'::jsonb,         -- Accreditation info, stamp, digital signatures
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_schools_code ON core.schools(code);
CREATE INDEX IF NOT EXISTS ix_schools_moet ON core.schools(moet_code);

COMMENT ON TABLE core.schools IS 'Master high school campus profile, administrative metadata, and contacts';
COMMENT ON COLUMN core.schools.moet_code IS 'Official institutional identification number assigned by Vietnam MOET';
COMMENT ON COLUMN core.schools.stamp_image_url IS 'Digitized official institutional seal for rendering verified certificates';
