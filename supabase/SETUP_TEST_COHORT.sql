-- ==========================================
-- 테스트 환경 설정: Cohort 생성 + RLS 수정
-- ==========================================
--
-- 이 SQL을 Supabase SQL Editor에서 실행하세요.
-- 한 번만 실행하면 됩니다.
--
-- 실행 방법:
-- 1. Supabase Dashboard 접속
-- 2. 좌측 메뉴 → SQL Editor
-- 3. "New query" 클릭
-- 4. 아래 전체 코드 복사 → 붙여넣기
-- 5. "Run" 버튼 클릭
-- ==========================================

-- Step 1: RLS 정책 수정 (anon 사용자도 cohorts 읽을 수 있게)
-- ==========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view cohorts" ON cohorts;

-- 새 정책: anon과 authenticated 모두 SELECT 가능
CREATE POLICY "Anyone can view cohorts"
  ON cohorts FOR SELECT
  USING (true);

-- Step 2: 테스트용 Cohort 생성
-- ==========================================

-- 이미 있으면 스킵, 없으면 생성
INSERT INTO cohorts (name, start_date, end_date, status, description, record_type)
SELECT
  '1기 (테스트)',
  '2026-01-01',
  '2026-01-30',
  'recruiting',
  '테스트용 기수입니다',
  'both'
WHERE NOT EXISTS (
  SELECT 1 FROM cohorts
  WHERE name = '1기 (테스트)'
);

-- 확인: 생성된 cohort 조회
SELECT id, name, start_date, end_date, status
FROM cohorts
WHERE name = '1기 (테스트)';

-- ==========================================
-- 완료!
-- ==========================================
--
-- 위 SELECT 결과에 '1기 (테스트)' cohort가 보이면 성공입니다.
-- id (UUID)가 자동으로 생성되었습니다.
--
-- 이제 회원가입을 테스트해보세요:
-- - 브라우저에서 /signup 페이지로 이동
-- - TEST01 코드로 가입 시도
-- - 성공! ✅
-- ==========================================
