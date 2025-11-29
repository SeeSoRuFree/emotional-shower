-- ==========================================
-- Add code_used_at to applications table
-- ==========================================
--
-- Purpose: Track when verification codes are used during signup
-- This helps with:
-- - Analytics on signup conversion rates
-- - Debugging code usage issues
-- - Preventing code reuse
-- ==========================================

-- Add code_used_at column to track when a code is used
ALTER TABLE applications
ADD COLUMN code_used_at TIMESTAMPTZ;

-- Create index for faster queries on code usage
CREATE INDEX idx_applications_code_used ON applications(code_used_at);

-- Add comment for documentation
COMMENT ON COLUMN applications.code_used_at IS 'Timestamp when the verification code was used during signup';
