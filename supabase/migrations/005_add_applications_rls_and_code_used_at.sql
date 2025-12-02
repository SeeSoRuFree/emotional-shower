-- ==========================================
-- Add RLS policies and code_used_at column to applications table
-- ==========================================

-- Add code_used_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications'
        AND column_name = 'code_used_at'
    ) THEN
        ALTER TABLE applications ADD COLUMN code_used_at TIMESTAMPTZ;
        CREATE INDEX idx_applications_code_used ON applications(code_used_at);
        COMMENT ON COLUMN applications.code_used_at IS 'Timestamp when the verification code was used during signup';
    END IF;
END $$;

-- Enable RLS on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can insert applications" ON applications;
DROP POLICY IF EXISTS "Only admins can view applications" ON applications;
DROP POLICY IF EXISTS "Only admins can update applications" ON applications;

-- Policy: Allow anyone (anon and authenticated) to insert applications
CREATE POLICY "Anyone can insert applications"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only admins can view applications
CREATE POLICY "Only admins can view applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email = 'admin@emotional-shower.com'
    )
  );

-- Policy: Only admins can update applications
CREATE POLICY "Only admins can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email = 'admin@emotional-shower.com'
    )
  );
