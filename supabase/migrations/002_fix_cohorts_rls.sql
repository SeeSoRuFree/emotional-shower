-- ==========================================
-- Fix Cohorts RLS Policy
-- ==========================================
--
-- Problem: anon users cannot SELECT from cohorts table
-- This is needed for signup flow to verify cohort exists
--
-- Solution: Allow both anon and authenticated users to SELECT
-- Keep INSERT/UPDATE/DELETE restricted to admins only
-- ==========================================

-- Drop the existing SELECT policy (only allowed authenticated)
DROP POLICY IF EXISTS "Anyone can view cohorts" ON cohorts;

-- Create new SELECT policy for both anon and authenticated users
CREATE POLICY "Anyone can view cohorts"
  ON cohorts FOR SELECT
  USING (true);

-- Note: The admin-only policy for modifications is already in place:
-- "Only admins can modify cohorts" handles INSERT/UPDATE/DELETE
