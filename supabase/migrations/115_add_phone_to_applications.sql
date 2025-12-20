-- Migration 115: Add phone_number to applications table
-- This enables SMS notifications for applicants

-- Add phone_number column
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_applications_phone_number
  ON applications(phone_number);

-- Add comment for documentation
COMMENT ON COLUMN applications.phone_number IS '신청자 휴대폰 번호 (SMS 알림용)';
