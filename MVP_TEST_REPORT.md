# MVP 출시 전 테스트 리포트

**테스트 날짜**: 2025-12-02
**테스트 환경**: http://localhost:5173/
**테스트 도구**: Playwright MCP, Chrome DevTools MCP

---

## 📋 테스트 개요

MVP 출시를 위한 실제 기능 테스트를 진행했으며, 다음 항목들을 테스트 계획에 포함:

1. ✅ 신청 페이지 (/apply) - 폼 제출 및 Supabase 저장
2. ⚠️ 어드민 페이지 - 신청 승인 및 코드 생성
3. ✅ 코드 인증 페이지 (/code-verify)
4. ❌ 온보딩 플로우 (6단계)
5. ❌ 사전 설문 (/pre-survey)
6. ⏸️ 일일 기록 (/daily-record) - 미테스트
7. ⏸️ 커뮤니티 (/community) - 미테스트
8. ⏸️ 프로필 (/profile) - 미테스트

---

## 🐛 발견된 크리티컬 버그

### 🔴 버그 #1: App.tsx useEffect 무한 루프 (수정 완료)

**심각도**: CRITICAL
**영향**: 모든 보호된 라우트 접근 불가
**상태**: ✅ 수정 완료

**문제 설명**:
- `App.tsx` 80번, 108번 줄의 useEffect 의존성 배열에 `checkAuth`, `checkAdminAuth` 함수 포함
- 이로 인해 컴포넌트가 무한 재렌더링
- 모든 페이지가 "로딩 중..." 상태에서 벗어나지 못함

**재현 방법**:
1. 회원가입 후 로그인
2. `/home`, `/onboarding`, `/pre-survey` 등 보호된 라우트 접근
3. 페이지가 "로딩 중..."에서 멈춤

**근본 원인**:
```typescript
// 문제 코드
useEffect(() => {
  initAuth();
}, [checkAuth, checkAdminAuth]); // ❌ 함수가 매번 새로 생성되어 무한 루프
```

**해결 방법**:
```typescript
// 수정 코드
useEffect(() => {
  initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ 마운트 시 한 번만 실행
```

**커밋**: `e3234eb` - "Fix App.tsx infinite loop in useEffect dependencies"

**후속 조치 필요**:
- 서버 재시작 후에도 로딩 문제가 지속되는지 확인 필요
- 브라우저 캐시 클리어 후 재테스트

---

### 🔴 버그 #2: Applications 테이블 RLS 정책 문제

**심각도**: HIGH
**영향**: 어드민이 신청서 목록 조회 불가
**상태**: ⚠️ 수정 대기 (수동 작업 필요)

**문제 설명**:
- RLS 정책이 Supabase Auth 사용자(`auth.uid()`)만 applications 조회 허용
- 현재 어드민 인증은 localStorage 기반이라 Supabase Auth 사용자가 아님
- 어드민 대시보드에서 "대기 중인 신청이 없습니다" 표시

**재현 방법**:
1. `/apply`에서 신청서 제출 (성공)
2. 어드민으로 로그인
3. `/admin/applications` 접속
4. 신청 목록이 비어있음 (실제로는 DB에 저장되어 있음)

**근본 원인**:
```sql
-- supabase/migrations/005_add_applications_rls_and_code_used_at.sql
CREATE POLICY "Only admins can view applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()  -- ❌ 어드민은 users 테이블에 없음
      AND users.email = 'admin@emotional-shower.com'
    )
  );
```

**임시 해결 방법** (테스트용):
마이그레이션 파일 생성 완료: `supabase/migrations/006_temp_fix_applications_rls.sql`

```sql
-- Temporary: Allow anyone to view/update applications (FOR TESTING ONLY)
DROP POLICY IF EXISTS "Only admins can view applications" ON applications;
CREATE POLICY "Anyone can view applications (TEMP)"
  ON applications FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can update applications" ON applications;
CREATE POLICY "Anyone can update applications (TEMP)"
  ON applications FOR UPDATE
  TO anon, authenticated
  USING (true);
```

**적용 방법**:
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택 (rkymwqoiqqszpvblwtsx)
3. SQL Editor 메뉴
4. `supabase/migrations/006_temp_fix_applications_rls.sql` 내용 복사 & 실행

**프로덕션 해결 방법** (권장):
1. **옵션 A**: 어드민도 Supabase Auth 사용하도록 변경
2. **옵션 B**: Service Role Key를 사용해서 어드민 작업 수행
3. **옵션 C**: Custom claims 또는 별도 admin 테이블 생성

**우선순위**: MVP 출시 전 반드시 해결 필요

---

### 🟡 버그 #3: 신청 데이터 Supabase 저장 미확인

**심각도**: MEDIUM
**영향**: 신청 데이터가 실제로 저장되었는지 확인 불가
**상태**: 🔍 추가 조사 필요

**문제 설명**:
- `/apply`에서 신청 제출 시 "신청 완료!" 메시지 표시
- 하지만 어드민 페이지에서 신청 목록 확인 불가 (버그 #2 때문)
- 실제 Supabase DB에 데이터가 저장되었는지 확인 필요

**확인 방법**:
1. 버그 #2 해결 후 어드민 페이지에서 재확인
2. 또는 Supabase Dashboard → Table Editor → applications 테이블 직접 확인

---

## ✅ 정상 동작 확인

### 1. 신청 페이지 (/apply)
- ✅ 폼 입력 및 유효성 검사 정상
- ✅ 2단계 플로우 (정보 입력 → 동의) 정상
- ✅ TEST01 코드 표시 정상
- ⚠️ Supabase 저장 여부는 버그 #2 해결 후 재확인 필요

**테스트 데이터**:
- 이름: 테스트유저
- 이메일: test@example.com
- 동기: "친절함을 통해 나와 타인 모두를 성장시키고 싶습니다..."

### 2. 회원가입 (/signup)
- ✅ TEST01 코드 인증 정상
- ✅ Supabase Auth 계정 생성 정상
- ✅ 회원가입 후 `/home`으로 리디렉션
- ⚠️ 홈 페이지가 로딩 상태에서 멈춤 (버그 #1)

**테스트 계정**:
- 이름: 테스트사용자
- 이메일: testuser@example.com
- 비밀번호: test1234
- 코드: TEST01

### 3. 어드민 로그인
- ✅ 로그인 정상
- ✅ 대시보드 접근 정상
- ⚠️ 신청 관리 페이지 데이터 조회 불가 (버그 #2)

---

## 🚫 테스트 중단된 항목

버그 #1로 인해 다음 항목들은 테스트를 진행하지 못했습니다:

1. ❌ 온보딩 플로우 (6단계)
2. ❌ 사전 설문 (/pre-survey)
3. ❌ 일일 기록 (/daily-record)
4. ❌ 커뮤니티 (/community)
5. ❌ 프로필 (/profile)

---

## 🔧 즉시 조치 필요 사항

### Priority 1 (블로커)
1. **버그 #1 수정사항 검증**
   - 서버 재시작 후 로딩 문제 해결 확인
   - 브라우저 캐시 클리어 후 재테스트
   - 모든 보호된 라우트 접근 가능 확인

2. **버그 #2 해결 (RLS 정책)**
   - Supabase Dashboard에서 마이그레이션 006 실행
   - 어드민 페이지에서 신청 목록 조회 확인
   - 신청 승인 플로우 테스트

### Priority 2 (중요)
3. **나머지 기능 테스트 완료**
   - 온보딩 → 사전설문 → 일일기록 플로우
   - 커뮤니티 기능 (포스트, 댓글, 좋아요)
   - 프로필 페이지

4. **Supabase 데이터 확인**
   - applications 테이블에 테스트 데이터 존재 확인
   - users, challenges, daily_records 등 테이블 데이터 확인

---

## 📝 기술 부채

### 코드 품질
- **TODO**: App.tsx의 useEffect 의존성 배열 ESLint 경고 (의도적으로 무시)
- **TODO**: RLS 정책을 프로덕션 레벨로 강화 (현재는 테스트용 임시 정책)

### 보안
- **WARNING**: 마이그레이션 006은 **테스트 전용**입니다
- **WARNING**: 프로덕션 배포 전 반드시 제거하고 proper 어드민 인증 구현 필요

---

## 🎯 다음 단계

1. ✅ 커밋 완료: `e3234eb` - App.tsx 무한 루프 수정
2. ⏳ **수동 작업**: Supabase Dashboard에서 RLS 정책 수정 SQL 실행
3. ⏳ 서버 재시작 및 전체 플로우 재테스트
4. ⏳ 나머지 기능 테스트 완료
5. ⏳ 최종 MVP 출시 승인

---

## 📌 참고사항

### 테스트 계정 정보
```
일반 사용자:
- Email: testuser@example.com
- Password: test1234

어드민:
- Email: admin@emotional-shower.com
- Password: admin1234

테스트 코드: TEST01
```

### 환경 정보
```
Development Server: http://localhost:5173/
Supabase Project ID: rkymwqoiqqszpvblwtsx
Supabase Dashboard: https://supabase.com/dashboard/project/rkymwqoiqqszpvblwtsx
```

---

**작성자**: Claude Code
**리포트 생성 시각**: 2025-12-02
