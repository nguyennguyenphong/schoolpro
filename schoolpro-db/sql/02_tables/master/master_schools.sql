-- =====================================================================
-- TABLE: core.schools (Master Data)
-- School institutions and campus headquarters
-- =====================================================================

CREATE TABLE IF NOT EXISTS core.schools (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               VARCHAR(30) NOT NULL UNIQUE,       -- E.g. 'THPT_LEQUYDON'
  name               VARCHAR(255) NOT NULL,             -- E.g. 'Trường THPT Lê Quý Đôn'
  educational_stage  VARCHAR(30) NOT NULL DEFAULT 'HIGH_SCHOOL', -- High school (Cấp 3)
  established_year   SMALLINT,
  address            TEXT,
  province_code      VARCHAR(20),
  district_code      VARCHAR(20),
  phone              VARCHAR(20),
  email              VARCHAR(255),
  website            VARCHAR(255),
  logo_url           TEXT,
  principal_name     VARCHAR(255),
  metadata           JSONB DEFAULT '{}'::jsonb,         -- Accreditation info, stamp, digital signatures
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.schools IS 'Master high school campus profile, administrative metadata, and contacts';
