-- ==========================================
-- Add admin role support to users table
-- ==========================================

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Update RLS policies for applications table
DROP POLICY IF EXISTS "Anyone can view applications (TEMP)" ON applications;
DROP POLICY IF EXISTS "Anyone can update applications (TEMP)" ON applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON applications;
DROP POLICY IF EXISTS "Only admins can view applications" ON applications;
DROP POLICY IF EXISTS "Anyone can verify approved code" ON applications;
DROP POLICY IF EXISTS "Only admins can update applications" ON applications;

-- Policy: Anyone can insert applications (신청서 제출)
CREATE POLICY "Anyone can insert applications"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only admins can view all applications (어드민 전용)
CREATE POLICY "Only admins can view applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Anyone can verify approved code (코드 검증용)
CREATE POLICY "Anyone can verify approved code"
  ON applications FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy: Only admins can update applications
CREATE POLICY "Only admins can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- IMPORTANT: Manually set admin user after migration
-- Run this SQL in Supabase Dashboard to make a user admin:
-- UPDATE users SET is_admin = true WHERE email = 'admin@emotional-shower.com';
