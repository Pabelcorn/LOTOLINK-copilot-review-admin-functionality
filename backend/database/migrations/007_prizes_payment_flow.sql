-- ============================================================
-- PRIZES TABLE UPDATE - Add payment flow fields
-- PostgreSQL 14+
-- ============================================================

-- Add new columns to prizes table for complete payment flow
ALTER TABLE prizes 
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS bank_account JSONB,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status enum to include new statuses (PostgreSQL doesn't have enum constraints by default in this table)
-- The status column is VARCHAR(20), so no ALTER TYPE needed

-- Add comments for documentation
COMMENT ON COLUMN prizes.claimed_at IS 'When the user claimed the prize';
COMMENT ON COLUMN prizes.payment_method IS 'Payment method: bank_transfer, cash, or wallet';
COMMENT ON COLUMN prizes.bank_account IS 'Bank account information for transfers (JSON)';
COMMENT ON COLUMN prizes.approved_by IS 'Admin user ID who approved the prize';
COMMENT ON COLUMN prizes.approved_at IS 'When the prize was approved';
COMMENT ON COLUMN prizes.transaction_id IS 'Transaction ID for payment tracking';
COMMENT ON COLUMN prizes.receipt_number IS 'Receipt number for the payment';
COMMENT ON COLUMN prizes.notes IS 'Additional notes about the prize payment';

-- Create index on payment_method for faster queries
CREATE INDEX IF NOT EXISTS idx_prizes_payment_method ON prizes(payment_method);
CREATE INDEX IF NOT EXISTS idx_prizes_claimed_at ON prizes(claimed_at);
CREATE INDEX IF NOT EXISTS idx_prizes_approved_at ON prizes(approved_at);
