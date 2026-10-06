-- =====================================================================
-- TABLE: academic.student_fee_bills
-- Individual student tuition invoices, policy waivers, and settlements
-- =====================================================================

CREATE TABLE IF NOT EXISTS academic.student_fee_bills (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  fee_item_id           UUID NOT NULL REFERENCES academic.fee_items(id) ON DELETE CASCADE,
  bill_code             VARCHAR(60) NOT NULL UNIQUE,       -- E.g. 'INV2026-10A1-001'
  original_amount       NUMERIC(12,2) NOT NULL,
  waiver_percentage     NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- Welfare waiver policy (0% to 100%)
  waiver_amount         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  waiver_reason         VARCHAR(255),                      -- E.g. 'Con thương binh, liệt sĩ', 'Hộ nghèo'
  final_amount          NUMERIC(12,2) NOT NULL,            -- original_amount - waiver_amount
  paid_amount           NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_status        VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
                          CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'EXEMPTED', 'REFUNDED')),
  payment_method        VARCHAR(30)                        -- E.g. 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'CASH'
                          CHECK (payment_method IN ('BANK_TRANSFER', 'VNPAY', 'MOMO', 'CASH', 'POS', 'VIETQR')),
  payment_gateway       VARCHAR(50),                       -- Gateway / partner provider
  transaction_ref       VARCHAR(100),                      -- Gateway reference code
  qr_payment_url        TEXT,                              -- Dynamic Napas 247 VietQR URL with encoded bill sum
  invoice_number        VARCHAR(100),                      -- E-invoice number (Hóa đơn điện tử VAT)
  invoice_url           TEXT,                              -- Link to official e-invoice PDF
  installment_order     SMALLINT NOT NULL DEFAULT 1,       -- Installment phase number
  payer_name            VARCHAR(150),                      -- Name of person executing payment
  payer_phone           VARCHAR(20),                       -- Phone of payer
  billing_notes         TEXT,
  metadata              JSONB DEFAULT '{}'::jsonb,         -- Gateway webhook response payload
  paid_at               TIMESTAMPTZ,
  cashier_user_id       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, fee_item_id, installment_order)
);

CREATE INDEX IF NOT EXISTS ix_student_bills_student ON academic.student_fee_bills(student_id);
CREATE INDEX IF NOT EXISTS ix_student_bills_status ON academic.student_fee_bills(payment_status);
CREATE INDEX IF NOT EXISTS ix_student_bills_code ON academic.student_fee_bills(bill_code);

COMMENT ON TABLE academic.student_fee_bills IS 'Student fee accounts, payment reconciliation records, and social welfare subsidies';
COMMENT ON COLUMN academic.student_fee_bills.qr_payment_url IS 'Dynamic VietQR deep-link generated for fast mobile banking remittance';
COMMENT ON COLUMN academic.student_fee_bills.invoice_url IS 'Official VAT electronic invoice link per General Department of Taxation';
