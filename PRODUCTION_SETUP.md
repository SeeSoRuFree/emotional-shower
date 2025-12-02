# 🚀 프로덕션 배포 가이드

**정서샤워 (Emotional Shower) - 30일 친절함 챌린지**

---

## 📋 배포 전 체크리스트

### 1. Supabase 마이그레이션 적용

#### Step 1: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `rkymwqoiqqszpvblwtsx`
3. 왼쪽 메뉴 → **SQL Editor** 클릭

#### Step 2: 마이그레이션 007 실행
**파일 위치**: `supabase/migrations/007_add_admin_role.sql`

SQL Editor에서 다음 SQL을 복사해서 실행:

```sql
-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Update RLS policies for applications table
DROP POLICY IF EXISTS "Anyone can view applications (TEMP)" ON applications;
DROP POLICY IF EXISTS "Anyone can update applications (TEMP)" ON applications;
DROP POLICY IF EXISTS "Only admins can view applications" ON applications;
DROP POLICY IF EXISTS "Only admins can update applications" ON applications;

-- Policy: Only admins can view applications
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
```

**Run** 버튼 클릭하여 실행

---

### 2. 어드민 계정 생성

#### Step 1: 어드민 계정 회원가입
1. 앱 접속: https://your-domain.com/signup
2. 다음 정보로 회원가입:
   ```
   이름: 관리자
   이메일: admin@emotional-shower.com
   비밀번호: [안전한 비밀번호 설정]
   인증코드: TEST01 (또는 생성된 코드)
   ```

#### Step 2: 어드민 권한 부여
Supabase Dashboard → SQL Editor에서 실행:

```sql
UPDATE users SET is_admin = true WHERE email = 'admin@emotional-shower.com';
```

#### Step 3: 어드민 로그인 확인
1. `/admin/login` 접속
2. `admin@emotional-shower.com` 계정으로 로그인
3. 어드민 대시보드 접근 확인

---

### 3. 환경 변수 설정

#### Vercel 환경 변수
Vercel Dashboard → Settings → Environment Variables에서 설정:

```bash
VITE_SUPABASE_URL=https://rkymwqoiqqszpvblwtsx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

### 4. 테스트 데이터 정리

프로덕션 배포 전 테스트 데이터 삭제:

```sql
-- 테스트 사용자 삭제
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%@example.com';

-- 테스트 신청서 삭제
DELETE FROM applications WHERE email LIKE '%test%' OR email LIKE '%@example.com';

-- TEST01 코드는 유지 (초기 사용자를 위해)
```

---

## 🔧 주요 기능 설정

### 기수(Cohort) 생성

어드민 대시보드 → 기수 관리에서:

1. **기수 이름**: 예) "2025년 1월 1기"
2. **시작일**: 챌린지 시작 날짜
3. **종료일**: 시작일 + 30일
4. **최대 참여자**: 예) 100명
5. **상태**: `recruiting` (모집 중)

### 신청서 승인 프로세스

1. 어드민 대시보드 → 신청 관리
2. 대기 중인 신청서 확인
3. 기수 선택 후 승인
4. 자동으로 6자리 코드 생성
5. (선택) 이메일 발송 시스템 연동 시 자동 발송

---

## 🛡️ 보안 체크리스트

### ✅ 완료된 보안 조치
- [x] Supabase RLS (Row Level Security) 활성화
- [x] 어드민 권한 is_admin 플래그로 관리
- [x] Supabase Auth 기반 인증
- [x] 비밀번호 해싱 (Supabase Auth 자동 처리)
- [x] CORS 설정 (Supabase 자동 관리)

### ⚠️ 추가 권장 사항
- [ ] 어드민 계정 2FA (Two-Factor Authentication) 활성화
- [ ] Supabase Auth 이메일 확인 활성화
- [ ] 비밀번호 복잡도 정책 설정
- [ ] Rate limiting 설정 (Supabase 대시보드)
- [ ] 정기적인 백업 설정

---

## 📊 모니터링

### Supabase Dashboard
- Database → Tables: 데이터 확인
- Authentication → Users: 사용자 관리
- Logs: 에러 로그 확인
- API: API 사용량 모니터링

### Vercel Dashboard
- Analytics: 페이지 방문 통계
- Logs: 서버 로그
- Deployments: 배포 이력

---

## 🚨 트러블슈팅

### 어드민 로그인 안 됨
1. `users` 테이블에서 `is_admin` 확인:
   ```sql
   SELECT email, is_admin FROM users WHERE email = 'admin@emotional-shower.com';
   ```
2. `is_admin`이 `false`면 다시 설정:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'admin@emotional-shower.com';
   ```

### 신청서가 보이지 않음
1. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'applications';
   ```
2. 마이그레이션 007이 제대로 적용되었는지 확인

### 페이지 로딩 무한 대기
1. 브라우저 캐시 클리어 (Cmd+Shift+R / Ctrl+Shift+R)
2. 개발 서버 재시작
3. Supabase Auth 세션 확인

---

## 📝 배포 후 체크리스트

### 기능 테스트
- [ ] 신청 페이지 → 신청서 제출
- [ ] 어드민 로그인 → 신청 승인
- [ ] 회원가입 → 코드 인증
- [ ] 온보딩 완료
- [ ] 사전 설문 제출
- [ ] 일일 기록 작성
- [ ] 커뮤니티 포스트 작성
- [ ] 30일 완료 후 리포트 확인

### 성능 테스트
- [ ] 페이지 로딩 속도 (Lighthouse)
- [ ] 모바일 반응형 확인
- [ ] 이미지 최적화 확인
- [ ] API 응답 속도

---

## 🔄 지속적인 유지보수

### 주간 체크
- 신청서 검토 및 승인
- 사용자 피드백 확인
- 에러 로그 확인

### 월간 체크
- 데이터베이스 백업
- 성능 모니터링
- 보안 업데이트

---

## 📞 문의

기술적 문제 발생 시:
- GitHub Issues: https://github.com/your-repo/issues
- Email: admin@emotional-shower.com

---

**작성일**: 2025-12-02
**작성자**: Claude Code
**버전**: 1.0.0
