-- =====================================================================
-- TABLE: academic.fee_items
-- Catalog of tuition fees, health insurance, and academic surcharges
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.fee_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id               UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  academic_year_id        UUID NOT NULL REFERENCES core.academic_years(id) ON DELETE CASCADE,
  semester_id             UUID REFERENCES core.semesters(id) ON DELETE SET NULL,
  grade_id                UUID REFERENCES core.grades(id) ON DELETE SET NULL,
  code                    VARCHAR(50) NOT NULL,               -- E.g. 'FEE_TUITION_HK1', 'FEE_BHYT_2026'
  name                    VARCHAR(255) NOT NULL,
  category                VARCHAR(30) NOT NULL DEFAULT 'TUITION'
                            CHECK (category IN ('TUITION', 'HEALTH_INSURANCE', 'FACILITY_ENHANCEMENT', 'STUDY_SESSION_2', 'BOARDING', 'STUDENT_ORGANIZATION', 'UNIFORM', 'TRANSPORT')),
  amount                  NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  is_mandatory            BOOLEAN NOT NULL DEFAULT TRUE,
  allow_installment       BOOLEAN NOT NULL DEFAULT FALSE,     -- Cho phép đóng nhiều đợt
  max_installments        SMALLINT NOT NULL DEFAULT 1,
  early_discount_percent  NUMERIC(5,2) DEFAULT 0.00,          -- Ưu đãi đóng sớm %
  early_discount_deadline DATE,
  late_fee_percent        NUMERIC(5,2) DEFAULT 0.00,          -- Phạt trễ hạn %
  due_date                DATE,
  target_classes          UUID[],                             -- Danh sách lớp cụ thể áp dụng khoản thu
  bank_account_info       JSONB,                              -- Số TK, Ngân hàng, Cú pháp chuyển khoản Napas VietQR
  description             TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS ix_fee_items_school_year ON academic.fee_items(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS ix_fee_items_category ON academic.fee_items(category);

COMMENT ON TABLE academic.fee_items IS 'Master fee schedule for tuition and statutory student fees';
COMMENT ON COLUMN academic.fee_items.bank_account_info IS 'School receiving bank account details and QR code payment template';
