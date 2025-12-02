-- ==========================================
-- Temporary fix: Allow anon users to view all applications for testing
-- TODO: In production, use service role key for admin operations
-- ==========================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Only admins can view applications" ON applications;

-- Temporary policy: Allow anyone to view applications (FOR TESTING ONLY)
CREATE POLICY "Anyone can view applications (TEMP)"
  ON applications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Only admins can update applications" ON applications;

-- Temporary policy: Allow anyone to update applications (FOR TESTING ONLY)
CREATE POLICY "Anyone can update applications (TEMP)"
  ON applications FOR UPDATE
  TO anon, authenticated
  USING (true);
