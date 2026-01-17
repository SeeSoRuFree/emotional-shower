-- ==========================================
-- 기수 통계를 위한 RLS 정책 추가
-- 같은 기수 참여자들의 데이터를 조회할 수 있도록 허용
-- ==========================================

-- 1. user_cohorts: 같은 기수 참여자 목록 조회 허용
DROP POLICY IF EXISTS "Users can view cohort participants" ON user_cohorts;
CREATE POLICY "Users can view cohort participants"
  ON user_cohorts FOR SELECT
  USING (
    cohort_id IN (
      SELECT cohort_id FROM user_cohorts
      WHERE user_id = auth.uid()
    )
  );

-- 2. challenges: 같은 기수 참여자들의 챌린지 진행 상황 조회 허용
DROP POLICY IF EXISTS "Users can view cohort challenges" ON challenges;
CREATE POLICY "Users can view cohort challenges"
  ON challenges FOR SELECT
  USING (
    cohort_id IN (
      SELECT cohort_id FROM user_cohorts
      WHERE user_id = auth.uid()
    )
  );

-- 3. daily_records: 같은 기수 참여자들의 일일 기록 조회 허용 (통계용)
DROP POLICY IF EXISTS "Users can view cohort daily records" ON daily_records;
CREATE POLICY "Users can view cohort daily records"
  ON daily_records FOR SELECT
  USING (
    cohort_id IN (
      SELECT cohort_id FROM user_cohorts
      WHERE user_id = auth.uid()
    )
  );

-- 4. users: 같은 기수 참여자들의 이름 조회 허용 (TOP 5용)
DROP POLICY IF EXISTS "Users can view cohort members" ON users;
CREATE POLICY "Users can view cohort members"
  ON users FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM user_cohorts
      WHERE cohort_id IN (
        SELECT cohort_id FROM user_cohorts
        WHERE user_id = auth.uid()
      )
    )
  );
