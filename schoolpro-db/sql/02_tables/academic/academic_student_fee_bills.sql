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
                          CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'EXEMPTED')),
  payment_method        VARCHAR(30)                        -- E.g. 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'CASH'
                          CHECK (payment_method IN ('BANK_TRANSFER', 'VNPAY', 'MOMO', 'CASH', 'POS')),
  transaction_ref       VARCHAR(100),                      -- Gateway reference code
  paid_at               TIMESTAMPTZ,
  cashier_user_id       UUID REFERENCES core.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, fee_item_id)
);

CREATE INDEX IF NOT EXISTS ix_student_bills_student ON academic.student_fee_bills(student_id);
CREATE INDEX IF NOT EXISTS ix_student_bills_status ON academic.student_fee_bills(payment_status);

COMMENT ON TABLE academic.student_fee_bills IS 'Student fee accounts, payment reconciliation records, and social welfare subsidies';
