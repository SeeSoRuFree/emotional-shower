# 🌊 정서샤워 실제 제품 개발 계획

> 프로토타입에서 실제 제품으로 전환하는 단계별 개발 계획

**작성일:** 2025-11-28
**예상 소요 시간:** 7-10일
**진행 방식:** Phase별 순차 진행

---

## 📋 전체 개발 단계

- [x] **Phase 0:** 현재 변경사항 커밋 ✅
- [ ] **Phase 1:** 로컬스토리지 기반 완성 (2-3일)
- [ ] **Phase 2:** Supabase 백엔드 설계 (1-2일)
- [ ] **Phase 3:** API 연동 - 단계별 마이그레이션 (3-4일)
- [ ] **Phase 4:** 최종 테스트 및 배포 준비 (1일)

---

## ✅ Phase 0: 현재 변경사항 커밋

**목표:** 프로토타입 현재 상태를 깃헙에 안전하게 백업

### 완료 내역
- [x] 모든 untracked 파일 추가 (Admin.tsx, Apply.tsx, Login.tsx, Signup.tsx 등)
- [x] 변경된 파일들 커밋
- [x] 원격 저장소에 push

**커밋 메시지:**
```
Add authentication, admin, and application flow

- Add complete authentication system with authStore
- Add admin dashboard for cohort and user management
- Add application flow (Apply, CodeVerify, Signup, Login)
- Add cohort management with multi-cohort support
- Add applicationStore for managing challenge applications
```

---

## 🔨 Phase 1: 로컬스토리지 기반 완성

**목표:** Supabase 연동 전에 로컬스토리지 기반으로 모든 기능 완성

**예상 소요 시간:** 2-3일

---

### 1.1 어드민 페이지 보강

**현재 상태:**
- ✅ 기수 관리 (생성/수정/삭제/상태변경)
- ✅ 챌린지 승인 관리 (대기/승인/거절)
- ✅ 기본 통계 (기수 수, 대기/승인/거절 카운트)

**추가 구현 사항:**

#### 1.1.1 사용자 관리 탭
```typescript
// src/pages/Admin.tsx에 추가

<Tab value="users">
  <UserManagement>
    - 전체 사용자 목록 테이블
    - 기수별 필터링
    - 사용자별 챌린지 진행 상황 (DAY, 스탬프 수)
    - 사용자 상태 변경 (활성/비활성)
    - 검색 기능 (이름, 이메일)
  </UserManagement>
</Tab>
```

**구현 체크리스트:**
- [ ] 사용자 목록 테이블 UI
- [ ] authStore에서 모든 사용자 불러오기
- [ ] 기수별 필터 드롭다운
- [ ] 각 사용자의 챌린지 진행률 표시
- [ ] 사용자 검색 기능
- [ ] 사용자 상세 정보 모달

#### 1.1.2 통계/리포트 탭
```typescript
// src/pages/Admin.tsx에 추가

<Tab value="stats">
  <Statistics>
    - 기수별 완료율 차트 (Recharts)
    - 일일 참여율 라인 차트
    - 최다 완료 사용자 TOP 10
    - 커뮤니티 활동 통계 (게시글/댓글 수)
    - 평균 스탬프 수
    - 완벽 완주자 (30일 모두 완료) 수
  </Statistics>
</Tab>
```

**구현 체크리스트:**
- [ ] Recharts 설치 및 설정
- [ ] 기수별 완료율 바 차트
- [ ] 일일 참여율 라인 차트
- [ ] TOP 10 사용자 랭킹 카드
- [ ] 커뮤니티 통계 집계 함수
- [ ] 통계 데이터 계산 유틸 함수

---

### 1.2 프로필/설정 화면 강화

**현재 상태:**
- ✅ 기본 프로필 화면 존재 (Profile.tsx)
- ⚠️ 내용이 미완성 상태

**구현 목표:**

#### 1.2.1 계정 정보 섹션
```typescript
// src/pages/Profile.tsx 업데이트

<AccountSection>
  - 프로필 이미지 (아바타)
  - 이름, 이메일 표시
  - 참여 중인 기수 정보
  - 현재 DAY 및 진행률 프로그레스 바
  - 획득한 스탬프 수 / 30
</AccountSection>
```

**구현 체크리스트:**
- [ ] authStore에서 currentUser 정보 가져오기
- [ ] challengeStore에서 현재 챌린지 상태 가져오기
- [ ] 프로그레스 바 컴포넌트 재사용
- [ ] 스탬프 수 표시

#### 1.2.2 챌린지 히스토리 섹션
```typescript
<ChallengeHistory>
  - 과거 참여한 기수 목록 (카드 형태)
  - 각 기수별:
    - 기수명 + 기간
    - 완료 여부 (completed/failed)
    - 획득한 스탬프 수
    - 완료율 (%)
    - 뱃지 표시 (완주 시)
</ChallengeHistory>
```

**구현 체크리스트:**
- [ ] 히스토리 카드 컴포넌트
- [ ] authStore의 cohortHistory 활용
- [ ] challengeStore의 challenges 배열 활용
- [ ] 완료/실패 뱃지 디자인
- [ ] 스크롤 가능한 히스토리 리스트

#### 1.2.3 설정 섹션
```typescript
<SettingsSection>
  - 계정 설정
    - 이름 변경 (선택)
    - 이메일 변경 불가 (표시만)
  - 로그아웃 버튼
  - 계정 삭제 (선택, 경고 모달)
  - 버전 정보
</SettingsSection>
```

**구현 체크리스트:**
- [ ] 로그아웃 버튼 및 기능
- [ ] 계정 삭제 확인 모달
- [ ] 계정 삭제 시 모든 데이터 삭제 처리
- [ ] 버전 정보 표시

---

### 1.3 에러/안내 화면 구현

**목표:** 사용자 경험 개선을 위한 다양한 안내 화면

#### 1.3.1 404 Not Found 페이지
```typescript
// src/pages/NotFound.tsx

export default function NotFound() {
  return (
    <SkyBackground>
      <div className="text-center">
        <h1>404</h1>
        <p>페이지를 찾을 수 없습니다</p>
        <Button onClick={() => navigate('/home')}>
          홈으로 돌아가기
        </Button>
      </div>
    </SkyBackground>
  );
}
```

**구현 체크리스트:**
- [ ] NotFound.tsx 생성
- [ ] 404 일러스트 또는 이모지
- [ ] 홈으로 돌아가기 버튼
- [ ] App.tsx에 catch-all 라우트 추가

#### 1.3.2 403 Unauthorized 페이지
```typescript
// src/pages/Unauthorized.tsx

export default function Unauthorized() {
  return (
    <SkyBackground>
      <div className="text-center">
        <h1>접근 권한이 없습니다</h1>
        <p>로그인이 필요한 페이지입니다</p>
        <Button onClick={() => navigate('/login')}>
          로그인하기
        </Button>
      </div>
    </SkyBackground>
  );
}
```

**구현 체크리스트:**
- [ ] Unauthorized.tsx 생성
- [ ] 권한 없음 안내 메시지
- [ ] 로그인 버튼

#### 1.3.3 챌린지 대기 중 페이지
```typescript
// src/pages/Waiting.tsx

export default function Waiting() {
  const { currentUser } = useAuthStore();
  const application = useApplicationStore().applications.find(
    app => app.email === currentUser?.email && app.status === 'pending'
  );

  return (
    <SkyBackground>
      <div className="text-center">
        <h1>신청서 검토 중입니다</h1>
        <p>승인까지 1-2일 소요됩니다</p>
        <p>이메일: {application?.email}</p>
        <p>신청일: {formatDate(application?.appliedAt)}</p>
      </div>
    </SkyBackground>
  );
}
```

**구현 체크리스트:**
- [ ] Waiting.tsx 생성
- [ ] 대기 중 안내 메시지
- [ ] 신청 정보 표시
- [ ] 예상 소요 시간 안내

#### 1.3.4 에러 바운더리 컴포넌트
```typescript
// src/components/common/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**구현 체크리스트:**
- [ ] ErrorBoundary 클래스 컴포넌트
- [ ] ErrorFallback UI
- [ ] App.tsx에 ErrorBoundary 래핑

---

### 1.4 온보딩 플로우 연결

**목표:** 전체 사용자 여정 완성

**플로우 맵:**
```
1. 첫 방문
   └─> /intro (Intro.tsx)
       - 서비스 소개
       - "신청하기" → /apply
       - "로그인하기" → /login

2. 신청 플로우
   └─> /apply (Apply.tsx)
       - 신청서 작성 (이름, 이메일, 동기)
       - 제출 완료
       - "회원가입하기" → /signup
       └─> 대기 상태 (admin 승인 필요)

3. 승인 후
   └─> Admin이 승인 + 기수 할당 + 코드 발급
       └─> 사용자 이메일로 코드 전달 (시뮬레이션)

4. 회원가입
   └─> /signup (Signup.tsx)
       - 이름, 이메일, 비밀번호 입력
       - 인증 코드 입력
       - 기수 자동 할당
       └─> 자동 로그인 + /home 이동

5. 로그인
   └─> /login (Login.tsx)
       - 이메일, 비밀번호 입력
       - 로그인 성공 → /home

6. 홈 화면
   └─> /home (Home.tsx)
       - 사전 설문 완료 여부 체크
       - 미완료 시 → /pre-survey
       - 완료 시 → /daily-record 가능
```

**구현 체크리스트:**
- [ ] Intro.tsx에서 신청/로그인 버튼 동작 확인
- [ ] Apply.tsx에서 신청 완료 후 안내
- [ ] Signup.tsx에서 코드 검증 로직
- [ ] Login.tsx 로그인 후 리다이렉트
- [ ] Home.tsx에서 조건부 라우팅
- [ ] 각 단계별 localStorage 상태 체크

---

### 1.5 전체 플로우 테스트

**테스트 시나리오:**

#### 시나리오 1: 신규 사용자 (신청 → 가입 → 챌린지)
```
1. /intro 접속
2. "신청하기" 클릭 → /apply
3. 신청서 작성 및 제출
4. Admin 페이지에서 승인 + 코드 발급
5. /signup에서 코드 입력 후 가입
6. 자동 로그인 후 /home
7. 사전 설문 완료 → /pre-survey
8. 일일 기록 작성 → /daily-record
9. 커뮤니티 참여 → /community
10. 30일 완료 후 사후 설문 → /post-survey
11. 리포트 확인 → /report
```

**체크리스트:**
- [ ] 신규 사용자 전체 플로우 테스트
- [ ] 각 단계별 리다이렉트 확인
- [ ] 에러 상황 처리 확인
- [ ] 로컬스토리지 데이터 확인

#### 시나리오 2: 기존 사용자 (로그인 → 계속하기)
```
1. /intro 접속
2. "로그인하기" 클릭 → /login
3. 로그인
4. /home 자동 이동
5. 일일 기록 이어서 하기
```

**체크리스트:**
- [ ] 로그인 플로우 테스트
- [ ] 이전 진행 상황 복원 확인
- [ ] DAY 계산 정확성 확인

#### 시나리오 3: 어드민 (관리 기능)
```
1. /admin 직접 접속
2. 기수 생성
3. 신청자 승인/거절
4. 사용자 관리
5. 통계 확인
```

**체크리스트:**
- [ ] 어드민 모든 기능 테스트
- [ ] 데이터 일관성 확인
- [ ] UI 반응성 확인

---

## 🗄️ Phase 2: Supabase 백엔드 설계

**목표:** 로컬스토리지를 대체할 Supabase 데이터베이스 설계

**예상 소요 시간:** 1-2일

---

### 2.1 Supabase 프로젝트 설정

#### 2.1.1 Supabase 프로젝트 생성
```bash
# 1. https://supabase.com 접속
# 2. 새 프로젝트 생성
#    - 프로젝트명: emotional-shower-prod
#    - 리전: Northeast Asia (Seoul)
#    - 데이터베이스 비밀번호 설정

# 3. API Keys 확인
#    - anon public key
#    - service role key (서버 전용)
```

**체크리스트:**
- [ ] Supabase 프로젝트 생성
- [ ] API Keys 복사
- [ ] 프로젝트 URL 확인

#### 2.1.2 환경변수 설정
```bash
# .env.local 생성 (gitignore에 추가)

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**체크리스트:**
- [ ] .env.local 파일 생성
- [ ] .gitignore에 .env.local 추가
- [ ] .env.example 템플릿 생성

#### 2.1.3 Supabase 클라이언트 설정
```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**체크리스트:**
- [ ] @supabase/supabase-js 설치
- [ ] supabase.ts 생성
- [ ] 타입 정의 파일 준비

---

### 2.2 데이터베이스 스키마 설계

#### 2.2.1 테이블 구조 다이어그램

```
┌─────────────┐
│   users     │ ◄─────┐
└─────────────┘       │
       │              │
       │              │
       ▼              │
┌─────────────┐       │
│   cohorts   │       │
└─────────────┘       │
       │              │
       ▼              │
┌──────────────┐      │
│ user_cohorts │──────┘
└──────────────┘
       │
       ▼
┌─────────────┐
│ challenges  │
└─────────────┘
       │
       ▼
┌──────────────┐
│daily_records │
└──────────────┘

┌──────────────┐
│   surveys    │
└──────────────┘

┌─────────────────┐
│community_posts  │
└─────────────────┘
       │
       ▼
┌──────────────────┐
│community_comments│
└──────────────────┘

┌──────────────┐
│applications  │
└──────────────┘
```

#### 2.2.2 SQL 스키마 정의

**파일 위치:** `supabase/migrations/001_initial_schema.sql`

```sql
-- ==========================================
-- 1. users 테이블 (Supabase Auth 확장)
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  current_cohort_id UUID REFERENCES cohorts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_current_cohort ON users(current_cohort_id);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- 2. cohorts 테이블 (기수)
-- ==========================================
CREATE TYPE cohort_status AS ENUM ('recruiting', 'active', 'completed');

CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  status cohort_status DEFAULT 'recruiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_cohorts_status ON cohorts(status);
CREATE INDEX idx_cohorts_start_date ON cohorts(start_date);

-- RLS
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cohorts"
  ON cohorts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify cohorts"
  ON cohorts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email = 'admin@emotional-shower.com'
    )
  );

-- ==========================================
-- 3. user_cohorts 테이블 (사용자-기수 다대다)
-- ==========================================
CREATE TYPE participation_status AS ENUM ('active', 'completed', 'failed');

CREATE TABLE user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status participation_status DEFAULT 'active',

  UNIQUE(user_id, cohort_id)
);

-- Index
CREATE INDEX idx_user_cohorts_user ON user_cohorts(user_id);
CREATE INDEX idx_user_cohorts_cohort ON user_cohorts(cohort_id);
CREATE INDEX idx_user_cohorts_status ON user_cohorts(status);

-- RLS
ALTER TABLE user_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cohort participation"
  ON user_cohorts FOR SELECT
  USING (auth.uid() = user_id);

-- ==========================================
-- 4. challenges 테이블 (챌린지 상태)
-- ==========================================
CREATE TYPE challenge_status AS ENUM ('waiting', 'approved', 'active', 'completed', 'failed');

CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  completed_days INTEGER[] DEFAULT '{}',
  status challenge_status DEFAULT 'waiting',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, cohort_id)
);

-- Index
CREATE INDEX idx_challenges_user ON challenges(user_id);
CREATE INDEX idx_challenges_cohort ON challenges(cohort_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 5. daily_records 테이블 (일일 기록)
-- ==========================================
CREATE TABLE daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 30),
  actions_self JSONB DEFAULT '[]',
  actions_others JSONB DEFAULT '[]',
  actions_environment JSONB DEFAULT '[]',
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, cohort_id, day)
);

-- Index
CREATE INDEX idx_daily_records_user ON daily_records(user_id);
CREATE INDEX idx_daily_records_cohort ON daily_records(cohort_id);
CREATE INDEX idx_daily_records_day ON daily_records(day);

-- RLS
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
  ON daily_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON daily_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON daily_records FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 6. surveys 테이블 (설문)
-- ==========================================
CREATE TYPE survey_type AS ENUM ('pre', 'post');

CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  type survey_type NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, cohort_id, type)
);

-- Index
CREATE INDEX idx_surveys_user ON surveys(user_id);
CREATE INDEX idx_surveys_cohort ON surveys(cohort_id);
CREATE INDEX idx_surveys_type ON surveys(type);

-- RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own surveys"
  ON surveys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own surveys"
  ON surveys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 7. community_posts 테이블 (커뮤니티 게시글)
-- ==========================================
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  content TEXT NOT NULL,
  recommended_quote TEXT,
  likes INTEGER DEFAULT 0,
  anonymous_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_community_posts_cohort ON community_posts(cohort_id);
CREATE INDEX idx_community_posts_room ON community_posts(room_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view posts in their cohort"
  ON community_posts FOR SELECT
  USING (
    cohort_id IN (
      SELECT cohort_id FROM user_cohorts
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 8. community_comments 테이블 (댓글)
-- ==========================================
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_system_quote BOOLEAN DEFAULT FALSE,
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_community_comments_post ON community_comments(post_id);
CREATE INDEX idx_community_comments_created ON community_comments(created_at);

-- RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible posts"
  ON community_comments FOR SELECT
  USING (
    post_id IN (
      SELECT id FROM community_posts
      WHERE cohort_id IN (
        SELECT cohort_id FROM user_cohorts
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 9. applications 테이블 (신청서)
-- ==========================================
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  motivation TEXT NOT NULL,
  status application_status DEFAULT 'pending',
  code TEXT,
  cohort_id UUID REFERENCES cohorts(id),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_code ON applications(code);

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- ==========================================
-- 10. Functions & Triggers
-- ==========================================

-- Auto update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON daily_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**체크리스트:**
- [ ] SQL 파일 작성
- [ ] Supabase SQL Editor에서 실행
- [ ] 테이블 생성 확인
- [ ] RLS 정책 테스트

---

### 2.3 TypeScript 타입 정의

```typescript
// src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          current_cohort_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          current_cohort_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          current_cohort_id?: string | null
          updated_at?: string
        }
      }
      cohorts: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          description: string | null
          status: 'recruiting' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          description?: string | null
          status?: 'recruiting' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          description?: string | null
          status?: 'recruiting' | 'active' | 'completed'
          updated_at?: string
        }
      }
      // ... 나머지 테이블들도 동일한 패턴으로 정의
    }
    Views: {}
    Functions: {}
    Enums: {
      cohort_status: 'recruiting' | 'active' | 'completed'
      participation_status: 'active' | 'completed' | 'failed'
      challenge_status: 'waiting' | 'approved' | 'active' | 'completed' | 'failed'
      survey_type: 'pre' | 'post'
      application_status: 'pending' | 'approved' | 'rejected'
    }
  }
}
```

**체크리스트:**
- [ ] Supabase CLI로 타입 자동 생성 (선택)
- [ ] 수동으로 database.types.ts 작성
- [ ] 모든 테이블 타입 정의
- [ ] Enum 타입 정의

---

## 🔌 Phase 3: API 연동 - 단계별 마이그레이션

**목표:** 로컬스토리지를 Supabase API로 단계적으로 교체

**예상 소요 시간:** 3-4일

**전략:** 한 번에 하나씩 마이그레이션하여 안전하게 전환

---

### 3.1 Auth 연동 (Day 1)

#### 3.1.1 authStore.ts 마이그레이션

**Before (LocalStorage):**
```typescript
// src/store/authStore.ts (기존)

export const useAuthStore = create<AuthStore>((set, get) => ({
  signup: (data) => {
    const users = loadUsers(); // localStorage
    const newUser = { id: Date.now().toString(), ...data };
    users.push(newUser);
    saveUsers(users); // localStorage
  },
  login: (email, password) => {
    const users = loadUsers(); // localStorage
    const user = users.find(u => u.email === email && u.password === password);
    // ...
  }
}));
```

**After (Supabase):**
```typescript
// src/store/authStore.ts (새로운)

import { supabase } from '@/lib/supabase';

export const useAuthStore = create<AuthStore>((set, get) => ({
  signup: async (data) => {
    // 1. Supabase Auth에 가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    // 2. users 테이블에 프로필 저장
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        name: data.name,
        email: data.email,
        current_cohort_id: data.cohortId
      });

    if (profileError) throw profileError;

    // 3. user_cohorts에 참여 기록
    await supabase
      .from('user_cohorts')
      .insert({
        user_id: authData.user!.id,
        cohort_id: data.cohortId,
        status: 'active'
      });

    set({ currentUser: {...}, isLoggedIn: true });
  },

  login: async (email, password) => {
    // Supabase Auth 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // users 테이블에서 프로필 가져오기
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user!.id)
      .single();

    set({ currentUser: profile, isLoggedIn: true });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, isLoggedIn: false });
  },

  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({ currentUser: profile, isLoggedIn: true });
    } else {
      set({ currentUser: null, isLoggedIn: false });
    }
  }
}));
```

**구현 체크리스트:**
- [ ] authStore.ts 백업
- [ ] Supabase Auth 함수로 교체
- [ ] users 테이블 CRUD 추가
- [ ] user_cohorts 참여 기록 추가
- [ ] 에러 핸들링 추가
- [ ] Signup.tsx 업데이트
- [ ] Login.tsx 업데이트
- [ ] 테스트 (회원가입, 로그인, 로그아웃)

---

### 3.2 Cohort 연동 (Day 1)

#### 3.2.1 cohortStore.ts 마이그레이션

```typescript
// src/store/cohortStore.ts (새로운)

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Cohort = Database['public']['Tables']['cohorts']['Row'];

export const useCohortStore = create<CohortStore>((set, get) => ({
  cohorts: [],
  loading: false,
  error: null,

  loadCohorts: async () => {
    set({ loading: true });

    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({ cohorts: data, loading: false });
  },

  createCohort: async (cohortData) => {
    const { data, error } = await supabase
      .from('cohorts')
      .insert(cohortData)
      .select()
      .single();

    if (error) throw error;

    set({ cohorts: [...get().cohorts, data] });
  },

  updateCohortStatus: async (id, status) => {
    const { error } = await supabase
      .from('cohorts')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    set({
      cohorts: get().cohorts.map(c =>
        c.id === id ? { ...c, status } : c
      )
    });
  },

  deleteCohort: async (id) => {
    const { error } = await supabase
      .from('cohorts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set({
      cohorts: get().cohorts.filter(c => c.id !== id)
    });
  }
}));
```

**구현 체크리스트:**
- [ ] cohortStore.ts 백업
- [ ] Supabase 쿼리로 교체
- [ ] loading/error 상태 추가
- [ ] Admin.tsx 업데이트
- [ ] 테스트 (기수 CRUD)

---

### 3.3 Challenge 연동 (Day 2)

#### 3.3.1 challengeStore.ts 마이그레이션

```typescript
// src/store/challengeStore.ts (새로운)

import { supabase } from '@/lib/supabase';

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  loading: false,

  loadChallenges: async (userId: string) => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    set({ challenges: data });
  },

  applyChallenge: async (cohortId: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        user_id: userId!,
        cohort_id: cohortId,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) throw error;
    set({ challenges: [...get().challenges, data] });
  },

  approveChallenge: async (cohortId: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('challenges')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('user_id', userId!)
      .eq('cohort_id', cohortId);

    if (error) throw error;
    await get().loadChallenges(userId!);
  },

  startChallenge: async (cohortId: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('challenges')
      .update({
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('user_id', userId!)
      .eq('cohort_id', cohortId);

    if (error) throw error;
    await get().loadChallenges(userId!);
  },

  completeDay: async (cohortId: string, day: number) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    // 1. 현재 챌린지 가져오기
    const { data: challenge } = await supabase
      .from('challenges')
      .select('completed_days')
      .eq('user_id', userId!)
      .eq('cohort_id', cohortId)
      .single();

    if (!challenge) return;

    // 2. completed_days 배열에 day 추가
    const completedDays = [...(challenge.completed_days || []), day].sort((a, b) => a - b);

    // 3. 업데이트
    const { error } = await supabase
      .from('challenges')
      .update({ completed_days: completedDays })
      .eq('user_id', userId!)
      .eq('cohort_id', cohortId);

    if (error) throw error;
    await get().loadChallenges(userId!);
  }
}));
```

**구현 체크리스트:**
- [ ] challengeStore.ts 백업
- [ ] Supabase 쿼리로 교체
- [ ] 배열 업데이트 로직 (completed_days)
- [ ] DailyRecord.tsx 업데이트
- [ ] 테스트 (챌린지 진행)

---

### 3.4 Daily Records 연동 (Day 2)

```typescript
// src/store/dailyRecordStore.ts (새로운)

export const useDailyRecordStore = create<DailyRecordStore>((set, get) => ({
  records: [],

  loadRecords: async (userId: string, cohortId: string) => {
    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId)
      .eq('cohort_id', cohortId)
      .order('day', { ascending: true });

    if (error) throw error;
    set({ records: data });
  },

  addRecord: async (recordData) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('daily_records')
      .insert({
        user_id: userId!,
        ...recordData
      })
      .select()
      .single();

    if (error) throw error;
    set({ records: [...get().records, data] });
  },

  updateRecord: async (recordId: string, updates) => {
    const { error } = await supabase
      .from('daily_records')
      .update(updates)
      .eq('id', recordId);

    if (error) throw error;
    await get().loadRecords(userId!, cohortId!);
  }
}));
```

**구현 체크리스트:**
- [ ] dailyRecordStore.ts 백업
- [ ] Supabase 쿼리로 교체
- [ ] DailyRecord.tsx 업데이트
- [ ] 테스트 (일일 기록 CRUD)

---

### 3.5 Community 연동 (Day 3)

```typescript
// src/utils/communityStorage.ts → src/store/communityStore.ts

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: [],
  loading: false,

  loadPosts: async (cohortId: string, roomId?: string) => {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        comments:community_comments(*)
      `)
      .eq('cohort_id', cohortId)
      .order('created_at', { ascending: false });

    if (roomId) {
      query = query.eq('room_id', roomId);
    }

    const { data, error } = await query;

    if (error) throw error;
    set({ posts: data });
  },

  addPost: async (postData) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId!,
        ...postData
      })
      .select()
      .single();

    if (error) throw error;

    // 추천 명언 자동 댓글 추가
    if (postData.recommended_quote) {
      await supabase
        .from('community_comments')
        .insert({
          post_id: data.id,
          user_id: userId!,
          content: postData.recommended_quote,
          is_system_quote: true,
          anonymous_name: '마음의 명언'
        });
    }

    await get().loadPosts(postData.cohort_id, postData.room_id);
  },

  addComment: async (postId: string, content: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: userId!,
        content,
        anonymous_name: generateAnonymousName()
      });

    if (error) throw error;
    // 리로드
  },

  toggleLike: async (postId: string) => {
    // likes 증가
    const { error } = await supabase.rpc('increment_post_likes', {
      post_id: postId
    });

    if (error) throw error;
  }
}));
```

**RPC 함수 (Supabase):**
```sql
-- likes 증가 함수
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts
  SET likes = likes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

**구현 체크리스트:**
- [ ] communityStorage.ts를 communityStore.ts로 변환
- [ ] Supabase 쿼리로 교체
- [ ] RPC 함수 생성 (likes)
- [ ] Community.tsx 업데이트
- [ ] PostDetail.tsx 업데이트
- [ ] 테스트 (게시글/댓글 CRUD, 좋아요)

---

### 3.6 Survey 연동 (Day 3)

```typescript
// src/store/surveyStore.ts (새로운)

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  surveys: [],

  loadSurveys: async (userId: string, cohortId: string) => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('user_id', userId)
      .eq('cohort_id', cohortId);

    if (error) throw error;
    set({ surveys: data });
  },

  savePreSurvey: async (cohortId: string, responses: any) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('surveys')
      .insert({
        user_id: userId!,
        cohort_id: cohortId,
        type: 'pre',
        responses
      });

    if (error) throw error;
    await get().loadSurveys(userId!, cohortId);
  },

  savePostSurvey: async (cohortId: string, responses: any) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('surveys')
      .insert({
        user_id: userId!,
        cohort_id: cohortId,
        type: 'post',
        responses
      });

    if (error) throw error;
    await get().loadSurveys(userId!, cohortId);
  }
}));
```

**구현 체크리스트:**
- [ ] surveyStore.ts 백업
- [ ] Supabase 쿼리로 교체
- [ ] PreSurvey.tsx 업데이트
- [ ] PostSurvey.tsx 업데이트
- [ ] 테스트 (설문 저장/조회)

---

### 3.7 Application 연동 (Day 4)

```typescript
// src/store/applicationStore.ts (새로운)

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],

  loadApplications: async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (error) throw error;
    set({ applications: data });
  },

  submitApplication: async (applicationData) => {
    const { error } = await supabase
      .from('applications')
      .insert({
        ...applicationData,
        status: 'pending'
      });

    if (error) throw error;
  },

  approveApplication: async (applicationId: string, cohortId: string) => {
    // 1. 코드 생성
    const code = generateCode();

    // 2. 신청서 업데이트
    const { error } = await supabase
      .from('applications')
      .update({
        status: 'approved',
        code,
        cohort_id: cohortId,
        processed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (error) throw error;

    await get().loadApplications();
    return code;
  },

  rejectApplication: async (applicationId: string) => {
    const { error } = await supabase
      .from('applications')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (error) throw error;
    await get().loadApplications();
  }
}));
```

**구현 체크리스트:**
- [ ] applicationStore.ts 백업
- [ ] Supabase 쿼리로 교체
- [ ] Apply.tsx 업데이트
- [ ] Admin.tsx 업데이트
- [ ] 테스트 (신청/승인/거절)

---

### 3.8 로컬스토리지 제거 및 정리

**제거할 항목:**
```typescript
// 삭제할 함수들
- loadFromStorage()
- saveToStorage()
- localStorage.getItem()
- localStorage.setItem()
- localStorage.removeItem()
```

**체크리스트:**
- [ ] 모든 store에서 localStorage 호출 제거
- [ ] 더 이상 사용하지 않는 유틸 함수 삭제
- [ ] 주석 정리
- [ ] 코드 포맷팅

---

## 🚀 Phase 4: 최종 테스트 및 배포 준비

**목표:** 안정적인 배포를 위한 최종 검증

**예상 소요 시간:** 1일

---

### 4.1 전체 플로우 테스트

#### 테스트 시나리오 1: 신규 사용자 (End-to-End)
```
1. 브라우저 시크릿 모드 실행
2. /intro 접속
3. "신청하기" → /apply
4. 신청서 작성 및 제출
5. 다른 브라우저에서 /admin 접속
6. 신청 승인 + 코드 발급
7. 다시 첫 번째 브라우저로 돌아와서
8. "회원가입하기" → /signup
9. 코드 입력 및 가입
10. 자동 로그인 확인
11. /home → /pre-survey
12. 사전 설문 완료
13. /daily-record (DAY 1)
14. 일일 기록 작성 (3가지 행동 + 메모)
15. 스탬프 획득 확인
16. /community 게시글 작성
17. 댓글 작성
18. 좋아요 기능
19. DAY 2-30 반복 (샘플 데이터로 빠르게)
20. /post-survey
21. 사후 설문 완료
22. /report 확인
```

**체크리스트:**
- [ ] 전체 플로우 에러 없이 완료
- [ ] 모든 데이터 Supabase에 저장 확인
- [ ] UI 렌더링 정상
- [ ] 리다이렉트 정상 동작

#### 테스트 시나리오 2: 기존 사용자 (로그인)
```
1. /login
2. 로그인
3. /home 자동 이동
4. 진행 상황 복원 확인
5. 일일 기록 이어서 하기
```

**체크리스트:**
- [ ] 로그인 정상 동작
- [ ] 세션 유지 확인
- [ ] 이전 데이터 복원 확인

#### 테스트 시나리오 3: 어드민
```
1. /admin
2. 기수 생성
3. 신청자 승인/거절
4. 사용자 관리
5. 통계 확인
```

**체크리스트:**
- [ ] 어드민 모든 기능 동작
- [ ] 실시간 데이터 반영 확인

---

### 4.2 에러 핸들링 강화

#### 4.2.1 API 에러 처리
```typescript
// src/lib/errorHandler.ts

export const handleSupabaseError = (error: any) => {
  if (error.code === 'PGRST116') {
    return '데이터를 찾을 수 없습니다.';
  }
  if (error.code === '23505') {
    return '이미 존재하는 데이터입니다.';
  }
  if (error.message.includes('JWT')) {
    return '로그인이 필요합니다.';
  }
  return '오류가 발생했습니다. 다시 시도해주세요.';
};
```

**체크리스트:**
- [ ] 에러 핸들러 유틸 함수 작성
- [ ] 모든 API 호출에 try-catch 추가
- [ ] 사용자 친화적인 에러 메시지
- [ ] Toast 알림으로 에러 표시

#### 4.2.2 네트워크 오프라인 처리
```typescript
// src/hooks/useOnline.ts

export const useOnline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

**체크리스트:**
- [ ] useOnline 훅 작성
- [ ] 오프라인 시 경고 표시
- [ ] 재연결 시 데이터 동기화

#### 4.2.3 로딩 상태 UI 개선
```typescript
// src/components/common/LoadingSpinner.tsx

export const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="w-8 h-8 border-4 border-headspace-blue border-t-transparent rounded-full"
  />
);
```

**체크리스트:**
- [ ] LoadingSpinner 컴포넌트
- [ ] 모든 API 호출에 loading 상태
- [ ] Skeleton UI (선택)

---

### 4.3 성능 최적화

#### 4.3.1 이미지 최적화
```bash
# public/images/ 폴더 정리
# 사용하지 않는 이미지 삭제
# WebP 포맷 사용 (선택)
```

**체크리스트:**
- [ ] 불필요한 이미지 삭제
- [ ] 이미지 압축
- [ ] lazy loading 적용

#### 4.3.2 코드 스플리팅 확인
```bash
npm run build
# dist/ 폴더 확인
# 각 chunk 사이즈 확인
```

**체크리스트:**
- [ ] 빌드 결과 확인
- [ ] 각 chunk 크기 적절한지 확인
- [ ] vite.config.ts manualChunks 조정

#### 4.3.3 번들 사이즈 체크
```bash
npm run build
npx vite-bundle-visualizer
```

**체크리스트:**
- [ ] 번들 사이즈 1MB 이하 확인
- [ ] 불필요한 라이브러리 제거

---

### 4.4 배포 설정

#### 4.4.1 Vercel 배포
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. Vercel 프로젝트 연결
vercel link

# 3. 환경변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 4. 배포
vercel --prod
```

**체크리스트:**
- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 배포 성공
- [ ] 배포된 사이트 동작 확인

#### 4.4.2 도메인 연결 (선택)
```bash
vercel domains add emotional-shower.com
```

**체크리스트:**
- [ ] 도메인 구입 (선택)
- [ ] DNS 설정
- [ ] HTTPS 확인

---

## 📊 진행 상황 트래킹

### Phase별 완료 체크
- [x] **Phase 0:** 커밋 완료 ✅
- [ ] **Phase 1:** 로컬스토리지 완성
  - [ ] 1.1 어드민 보강
  - [ ] 1.2 프로필 강화
  - [ ] 1.3 에러 화면
  - [ ] 1.4 온보딩 연결
  - [ ] 1.5 전체 테스트
- [ ] **Phase 2:** Supabase 설계
  - [ ] 2.1 프로젝트 설정
  - [ ] 2.2 스키마 작성
  - [ ] 2.3 타입 정의
- [ ] **Phase 3:** API 연동
  - [ ] 3.1 Auth
  - [ ] 3.2 Cohort
  - [ ] 3.3 Challenge
  - [ ] 3.4 Daily Records
  - [ ] 3.5 Community
  - [ ] 3.6 Survey
  - [ ] 3.7 Application
  - [ ] 3.8 로컬스토리지 제거
- [ ] **Phase 4:** 배포
  - [ ] 4.1 전체 테스트
  - [ ] 4.2 에러 핸들링
  - [ ] 4.3 성능 최적화
  - [ ] 4.4 배포

---

## 🔗 유용한 링크

- **Supabase 문서:** https://supabase.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **RLS 가이드:** https://supabase.com/docs/guides/auth/row-level-security
- **Vercel 배포:** https://vercel.com/docs
- **React Query (선택):** https://tanstack.com/query/latest

---

## 💡 팁 및 주의사항

### 개발 팁
1. **단계별 테스트:** 각 Phase 완료 후 반드시 테스트
2. **백업:** 주요 변경 전 git commit
3. **타입 안전성:** TypeScript 타입 활용
4. **에러 로깅:** console.error로 디버깅

### 주의사항
1. **RLS 정책:** Supabase RLS 정책 반드시 설정
2. **환경변수:** .env.local을 gitignore에 추가
3. **API Key:** 절대로 public key만 프론트엔드에 노출
4. **비밀번호:** 프로덕션에서는 비밀번호 해싱 필수 (Supabase Auth 사용)

---

**작성자:** Claude Code
**마지막 업데이트:** 2025-11-28
**버전:** 1.0.0
