-- DB 초기화 스크립트 (관리자 계정 제외)
-- 실행 순서: 외래키 제약 때문에 하위 테이블부터 삭제

-- 1. Community 관련 데이터 삭제
DELETE FROM community_comments;
DELETE FROM community_posts;

-- 2. Daily Records 삭제
DELETE FROM daily_records;

-- 3. Surveys 삭제
DELETE FROM surveys;

-- 4. Challenges 삭제
DELETE FROM challenges;

-- 5. Applications 삭제
DELETE FROM applications;

-- 6. User Cohorts 삭제 (관리자 제외)
DELETE FROM user_cohorts
WHERE user_id IN (
  SELECT id FROM users WHERE is_admin = false OR is_admin IS NULL
);

-- 7. Users 삭제 (관리자 제외)
DELETE FROM users
WHERE is_admin = false OR is_admin IS NULL;

-- 8. 결과 확인
SELECT 'Admin users remaining:' as info, COUNT(*) as count FROM users WHERE is_admin = true
UNION ALL
SELECT 'Regular users remaining:', COUNT(*) FROM users WHERE is_admin = false OR is_admin IS NULL
UNION ALL
SELECT 'Challenges remaining:', COUNT(*) FROM challenges
UNION ALL
SELECT 'Applications remaining:', COUNT(*) FROM applications
UNION ALL
SELECT 'Surveys remaining:', COUNT(*) FROM surveys
UNION ALL
SELECT 'Daily records remaining:', COUNT(*) FROM daily_records
UNION ALL
SELECT 'Community posts remaining:', COUNT(*) FROM community_posts
UNION ALL
SELECT 'Community comments remaining:', COUNT(*) FROM community_comments;
