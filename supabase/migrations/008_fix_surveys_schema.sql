-- ==========================================
-- surveys 테이블 스키마 수정
-- 1. type → survey_type 컬럼명 변경
-- 2. scores JSONB 컬럼 추가
-- ==========================================

-- 1. type 컬럼을 survey_type으로 이름 변경
ALTER TABLE surveys RENAME COLUMN type TO survey_type;

-- 2. scores 컬럼 추가 (점수 저장용)
ALTER TABLE surveys ADD COLUMN scores JSONB;

-- 3. 인덱스 재생성 (컬럼명 변경에 따라)
DROP INDEX IF EXISTS idx_surveys_type;
CREATE INDEX idx_surveys_type ON surveys(survey_type);

-- 4. Admin이 surveys 조회할 수 있도록 RLS 정책 추가
CREATE POLICY "Admins can view all surveys"
  ON surveys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 5. Admin이 daily_records 조회할 수 있도록 RLS 정책 추가
CREATE POLICY "Admins can view all daily_records"
  ON daily_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
