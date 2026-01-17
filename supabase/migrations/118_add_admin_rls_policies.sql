-- ==========================================
-- 관리자용 RLS 정책 추가
-- 관리자가 모든 데이터를 조회할 수 있도록 허용
-- ==========================================

-- 1. users 테이블: 관리자는 모든 사용자 조회 가능
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 2. surveys 테이블: 관리자는 모든 설문 조회 가능
DROP POLICY IF EXISTS "Admins can view all surveys" ON surveys;
CREATE POLICY "Admins can view all surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 3. challenges 테이블: 관리자는 모든 챌린지 조회 가능
DROP POLICY IF EXISTS "Admins can view all challenges" ON challenges;
CREATE POLICY "Admins can view all challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 4. daily_records 테이블: 관리자는 모든 기록 조회 가능
DROP POLICY IF EXISTS "Admins can view all daily records" ON daily_records;
CREATE POLICY "Admins can view all daily records"
  ON daily_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 5. user_cohorts 테이블: 관리자는 모든 참여 정보 조회 가능
DROP POLICY IF EXISTS "Admins can view all user cohorts" ON user_cohorts;
CREATE POLICY "Admins can view all user cohorts"
  ON user_cohorts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 6. cohorts 테이블: 관리자는 모든 기수 수정/삭제 가능
DROP POLICY IF EXISTS "Admins can manage cohorts" ON cohorts;
CREATE POLICY "Admins can manage cohorts"
  ON cohorts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
