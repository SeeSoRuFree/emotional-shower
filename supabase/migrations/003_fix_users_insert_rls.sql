-- ==========================================
-- Fix users table INSERT RLS policy
-- ==========================================
--
-- Problem: Users cannot create their own profile during signup
-- Error: "new row violates row-level security policy for table users"
--
-- Solution: Add INSERT policy allowing users to create their own profile
-- ==========================================

-- Allow users to insert their own profile (where id = auth.uid())
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: Existing SELECT and UPDATE policies remain unchanged
-- This only adds the missing INSERT permission
