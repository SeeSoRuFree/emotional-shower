# Product Requirements Document (PRD)
# 정서샤워 (Emotional Shower)

**Version:** 1.0
**Last Updated:** 2025-12-18
**Author:** Product Team

---

## 1. Executive Summary

### 1.1 Product Overview
**정서샤워 (Emotional Shower)**는 30일 친절 챌린지를 통해 사용자의 정서적 위생과 웰빙을 증진시키는 모바일 우선 웹 애플리케이션입니다.

**핵심 가치:**
- 일일 자기돌봄과 타인에 대한 친절 행동 기록
- 기수(Cohort) 기반 커뮤니티 지원
- 사전/사후 설문을 통한 성장 측정
- 게이미피케이션을 통한 동기 부여

### 1.2 Target Users
- **Primary:** 정서적 웰빙 향상에 관심 있는 20-40대 성인
- **Secondary:** 친절 습관 형성을 원하는 자기계발 관심층

### 1.3 Key Metrics
- 일일 기록 완료율
- 챌린지 완주율 (22일 이상)
- 커뮤니티 활성도 (게시글/댓글)
- 설문 점수 변화율

---

## 2. Technical Stack

### 2.1 Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Zustand | State Management |
| Framer Motion | Animations |
| Recharts | Data Visualization |
| Lucide React | Icons |
| React Router DOM | Routing |

### 2.2 Backend
| Technology | Purpose |
|------------|---------|
| Supabase | BaaS (Backend as a Service) |
| PostgreSQL | Database |
| Row Level Security | Data Protection |
| Supabase Auth | Authentication |
| Supabase Storage | File Storage |

### 2.3 Infrastructure
| Technology | Purpose |
|------------|---------|
| Vercel | Hosting & Deployment |
| GitHub | Version Control |

---

## 3. User Features

### 3.1 Application Flow (신청 프로세스)

#### 3.1.1 Application Form (`/apply`)
**Purpose:** 챌린지 참여 신청

**Steps:**
1. **프로그램 소개**
   - 30일 일일 기록
   - 스탬프 수집 (게이미피케이션)
   - 22일 이상 완료 시 성장 보고서
   - 기수 기반 커뮤니티

2. **신청 폼 작성**
   | Field | Type | Validation |
   |-------|------|------------|
   | 이름 | Text | Required |
   | 이메일 | Email | Valid format |
   | 휴대폰 | Text | 010-XXXX-XXXX |
   | 참여 동기 | Textarea | Min 10자 |

3. **연구 참여 동의**
   - 데이터 수집 목적 설명
   - 개인정보 보호 정책
   - 자발적 참여 확인

**Data Storage:**
- `applications` 테이블에 저장
- Status: `pending` (관리자 승인 대기)
- **중요:** 이 단계에서는 Supabase Auth 계정이 생성되지 않음

#### 3.1.2 Signup Flow (`/signup`)
**Purpose:** 승인된 사용자의 계정 생성

**Prerequisites:**
- 관리자로부터 6자리 승인 코드 수신

**Steps:**
1. **승인 코드 입력**
   - 6자리 영숫자 코드 검증
   - `application_codes` 테이블에서 확인
   - 관련 기수 ID 및 전화번호 자동 연결

2. **계정 정보 입력**
   | Field | Type | Validation |
   |-------|------|------------|
   | 이름 | Text | Required |
   | 이메일 | Email | Unique |
   | 비밀번호 | Password | Min 6자 |
   | 비밀번호 확인 | Password | Match |
   | 전화번호 | Text | 010-XXXX-XXXX |

3. **계정 생성**
   - Supabase Auth 사용자 생성
   - `users` 테이블에 프로필 저장
   - `user_cohorts` 관계 생성
   - `challenges` 테이블에 챌린지 생성 (status: `approved`)

---

### 3.2 Onboarding (`/onboarding`)

**Purpose:** 신규 사용자 안내 및 연구 동의

**Steps:**
| Step | Content |
|------|---------|
| 1. Welcome | 30일 친절 챌린지 소개, 환영 메시지 |
| 2. Introduction | 기수명 표시, 4가지 핵심 기능 설명 |
| 3. Consent | 연구 참여 동의, 데이터 보호 설명 |

**Completion:**
- `has_completed_onboarding = true` 설정
- DAY 1 설문으로 이동

---

### 3.3 30-Day Challenge System

#### 3.3.1 Challenge Status Flow
```
waiting → approved → active → completed/failed
```

| Status | Description | Trigger |
|--------|-------------|---------|
| `waiting` | 신청 대기 중 | 신청 제출 |
| `approved` | 승인됨 | 가입 완료 |
| `active` | 진행 중 | DAY 1 설문 완료 |
| `completed` | 완료 (성공) | DAY 30 + 22스탬프 이상 |
| `failed` | 완료 (미달) | DAY 30 + 22스탬프 미만 |

#### 3.3.2 Day Calculation (핵심 로직)
```javascript
currentDay = completedDays.length + 1
```
- **스탬프 기반 진행:** 캘린더 날짜가 아닌 완료된 일수 기준
- **유연한 페이싱:** 사용자 자신의 속도로 진행 가능

#### 3.3.3 Home Dashboard (`/home`)
**Components:**
- **Progress Bar:** 22스탬프 목표까지의 진행률
- **Stamp Board:** 30일 시각적 달력 (완료된 날에 스탬프 표시)
- **Today's Status:** 오늘 기록 완료 여부
- **Quick Links:** 일일 기록, 커뮤니티, 보고서

---

### 3.4 Surveys

#### 3.4.1 Pre-Survey (DAY 1) - `/pre-survey`
**Purpose:** 기초선 측정

**Structure:** 34개 문항, 5점 리커트 척도

| Section | Questions | Focus |
|---------|-----------|-------|
| Flourishing Scale | 8 | 삶의 목적, 사회적 지지, 참여도 |
| Life Satisfaction | 5 | 전반적 삶 만족도 |
| Self-Compassion | 12 | 자기 친절, 마음챙김, 공통 인간성 |
| Kindness Scale | 9 | 친절 행동 빈도 |

**Completion:**
- 챌린지 상태 → `active`
- `startedAt` 기록
- DAY 1 완료 처리

#### 3.4.2 Post-Survey (DAY 30) - `/post-survey`
**Purpose:** 변화 측정

- 동일한 34개 문항
- 사전 설문과 비교하여 성장 측정
- 완료 시 챌린지 상태 결정 (`completed` or `failed`)

---

### 3.5 Daily Record (`/daily-record`)

**Purpose:** DAY 2-29 일일 친절 행동 기록

#### 3.5.1 Record Types (기수별 설정)
| Type | Steps |
|------|-------|
| `both` | 자기돌봄 → 친절 → 명언 |
| `self_care_only` | 자기돌봄 → 명언 |
| `kindness_only` | 친절 → 명언 |

#### 3.5.2 Self-Care Actions (자기돌봄)
**Preset Examples:**
- 식사하기, 운동하기, 명상하기
- 충분히 자기, 취미 활동
- 산책하기, 친구와 대화

**Custom Input:**
- 직접 입력 가능
- 선택적 메모 추가
- 이미지 첨부 지원

#### 3.5.3 Kindness Actions (타인에 대한 친절)
**Preset Examples:**
- 도움주기, 칭찬하기, 경청하기
- 나누기, 위로하기
- 문잡아주기, 양보하기

#### 3.5.4 Completion Flow
1. 자기돌봄 행동 1개 이상 입력
2. 친절 행동 1개 이상 입력
3. AI 추천 명언 표시
4. 스탬프 획득 축하
5. 홈으로 자동 이동

---

### 3.6 Growth Report (`/report`)

**Access Requirements:**
- 챌린지 상태: `completed` 또는 `failed`
- 최소 22 스탬프 (73% 완료)
- DAY 30 설문 완료

#### 3.6.1 Report Sections

| Section | Content |
|---------|---------|
| Hero Card | 완료 축하, 기수명, 완료 일수 |
| Achievement Summary | 완료 일수/30, 자기돌봄 횟수, 친절 횟수, 완료율 |
| Score Comparison | 4개 척도별 사전/사후 점수 및 변화율 |
| Favorite Actions | 가장 많이 한 자기돌봄/친절 행동 TOP 3 |
| Closing Message | 축하 및 격려 메시지 |

#### 3.6.2 Score Calculation
```javascript
flourishingChange = ((postScore - preScore) / preScore) * 100
```
- 4개 척도 모두 백분율 변화 계산
- 시각적 진행률 바 표시

---

### 3.7 Community (`/community`)

**Purpose:** 기수 내 익명 커뮤니티

#### 3.7.1 Feed Structure
- **Unified Feed:** 모든 테마 룸의 통합 피드
- **Cohort Filtering:** RLS로 자동 필터링

#### 3.7.2 Room Themes
| Room | Theme | Color |
|------|-------|-------|
| 축하 | Celebration | Yellow |
| 감사 | Gratitude | Green |
| 불안 | Anxiety | Blue |
| 피로 | Tiredness | Purple |
| 분노 | Anger | Red |

#### 3.7.3 Post Features
| Feature | Description |
|---------|-------------|
| Anonymous Username | 자동 생성 (예: "따뜻한마음123") |
| AI Quote | 게시글 내용 기반 자동 추천 명언 |
| Image Attachment | 선택적 이미지 첨부 |
| Likes | 원자적 좋아요 증가 (RPC) |
| Comments | 댓글 기능 |
| DAY Badge | 게시자의 현재 DAY 표시 |

#### 3.7.4 Statistics Dashboard
| Metric | Description |
|--------|-------------|
| 오늘의 완료율 | 기수 내 오늘 기록 완료 비율 |
| 연속 완료자 | 연속 기록 유지 중인 사용자 수 |
| 평균 스탬프 | 기수 평균 스탬프 수 |
| TOP 5 | 상위 5명 리더보드 |

---

### 3.8 Profile (`/profile`)

#### 3.8.1 Profile Dashboard
| Section | Content |
|---------|---------|
| User Info | 이름, 이메일, 아바타 |
| Current Cohort | 현재 기수 선택 (복수 기수 시) |
| Challenge Progress | 현재 DAY, 완료율, 스탬프 수 |
| Statistics | 연속 기록, 총 기록, 자기돌봄/친절 횟수 |
| History | 참여한 모든 기수 이력 |

#### 3.8.2 Account Settings
| Setting | Action |
|---------|--------|
| 로그아웃 | 세션 종료 |
| 계정 삭제 | 모든 데이터 삭제 (확인 필요) |
| 앱 정보 | 버전 표시 |

---

## 4. Admin Features

### 4.1 Admin Authentication

**Route:** `/admin/login`

**Authentication Flow:**
1. 이메일/비밀번호 입력
2. Supabase Auth 인증
3. `users.is_admin = true` 확인
4. 관리자 세션 생성

---

### 4.2 Admin Dashboard (`/admin/dashboard`)

**Purpose:** 전체 현황 개요

#### 4.2.1 KPI Cards
| Metric | Description |
|--------|-------------|
| 총 사용자 수 | 전체 등록 사용자 |
| 활성 챌린지 | 진행 중인 챌린지 수 |
| 완료율 | 챌린지 완료 비율 |
| 총 게시글 | 커뮤니티 게시글 수 |
| 총 댓글 | 커뮤니티 댓글 수 |

#### 4.2.2 Visualizations
| Chart | Data |
|-------|------|
| 기수별 완료율 Bar Chart | 완료 vs 진행 중 |
| 최근 활동 | 최신 5개 게시글 |
| 기수 요약 테이블 | 이름, 상태, 참여자 수, 기간 |

---

### 4.3 User Management (`/admin/users`)

**Purpose:** 사용자 조회 및 관리

#### 4.3.1 Features
| Feature | Description |
|---------|-------------|
| 검색 | 이름/이메일 검색 |
| 필터 | 기수별 필터링 |
| 정렬 | 이름, 이메일, 가입일 정렬 |
| 상세 보기 | 기수 참여 이력 조회 |

#### 4.3.2 User Data Fields
| Field | Source |
|-------|--------|
| 이름 | `users.name` |
| 이메일 | `users.email` |
| 현재 기수 | `cohorts.name` |
| 가입일 | `users.created_at` |
| 기수 이력 | `user_cohorts` 테이블 |

---

### 4.4 Cohort Management (`/admin/cohorts`)

**Purpose:** 기수 생성 및 관리

#### 4.4.1 CRUD Operations
| Operation | Description |
|-----------|-------------|
| Create | 새 기수 생성 |
| Read | 기수 목록 조회 |
| Update | 기수 정보 수정 |
| Delete | 기수 삭제 (확인 필요) |

#### 4.4.2 Cohort Fields
| Field | Type | Description |
|-------|------|-------------|
| 이름 | Text | 기수 이름 (예: "1기", "테스트 기수") |
| 시작일 | Date | 기수 시작 날짜 |
| 종료일 | Date | 자동 계산 (시작일 + 30일) |
| 상태 | Enum | recruiting / active / completed |
| 최대 인원 | Number | 선택적 제한 |
| 설명 | Textarea | 기수 설명 |
| 기록 유형 | Enum | both / self_care_only / kindness_only |

#### 4.4.3 Record Type Options
| Type | Description |
|------|-------------|
| `both` | 자기돌봄 + 친절 모두 기록 |
| `self_care_only` | 자기돌봄만 기록 |
| `kindness_only` | 친절만 기록 |

---

### 4.5 Application Management (`/admin/applications`)

**Purpose:** 신청 승인/거절 워크플로우

#### 4.5.1 Status Tabs
| Tab | Description |
|-----|-------------|
| 대기 중 | 검토 필요한 신청 |
| 승인됨 | 승인 완료, 코드 발급됨 |
| 거절됨 | 거절된 신청 |

#### 4.5.2 Application Data
| Field | Source |
|-------|--------|
| 이름 | `applications.name` |
| 이메일 | `applications.email` |
| 전화번호 | `applications.phone` |
| 참여 동기 | `applications.motivation` |
| 신청일 | `applications.created_at` |
| 상태 | `applications.status` |

#### 4.5.3 Approval Workflow
1. **기수 선택:** 모집 중/활성 기수 드롭다운
2. **코드 생성:** 6자리 영숫자 자동 생성
3. **승인 처리:**
   - `applications.status = 'approved'`
   - `application_codes` 테이블에 코드 저장
   - 이메일 발송 (외부 연동)
4. **거절 처리:** `applications.status = 'rejected'`

#### 4.5.4 Code Format
```
[A-Z0-9]{6}
예: "ABC123", "XY7K9M"
```

---

### 4.6 Survey Management (`/admin/surveys`)

**Purpose:** 설문 데이터 조회 및 내보내기

#### 4.6.1 Features
| Feature | Description |
|---------|-------------|
| 검색 | 사용자명/이메일 검색 |
| 필터 | 기수별, 설문 유형별 |
| 상세 보기 | 개별 응답 모달 |
| CSV 내보내기 | 전체 데이터 다운로드 |

#### 4.6.2 Survey Display
| Column | Data |
|--------|------|
| 사용자 | 이름, 이메일 |
| 기수 | 기수 이름 |
| 유형 | 사전/사후 |
| 완료일 | 설문 완료 시간 |
| 상세 | 개별 문항 응답 |

#### 4.6.3 CSV Export Format
```csv
사용자명,이메일,기수,유형,완료일,Q1,Q2,...,Q34
홍길동,user@email.com,1기,pre,2024-01-15,4,3,5,...
```

---

### 4.7 Daily Record Management (`/admin/records`)

**Purpose:** 일일 기록 데이터 조회

#### 4.7.1 Features
| Feature | Description |
|---------|-------------|
| 검색 | 사용자명/이메일 검색 |
| 필터 | 기수별, DAY별, 완료 상태별 |
| 통계 | 총 기록 수, 완료 수, 총 행동 수 |
| 상세 보기 | 개별 행동 및 메모 |

#### 4.7.2 Record Detail View
| Section | Content |
|---------|---------|
| 자기돌봄 | 행동 목록, 커스텀 여부, 메모 |
| 친절 | 행동 목록, 커스텀 여부, 메모 |
| 명언 | AI 추천 명언 |
| 메타데이터 | 기록 시간 |

---

### 4.8 Community Management (`/admin/community`)

**Purpose:** 커뮤니티 콘텐츠 모니터링

#### 4.8.1 Features
| Feature | Description |
|---------|-------------|
| 검색 | 내용/작성자 검색 |
| 필터 | 기수별, 테마별 |
| 통계 | 총 게시글, 댓글, 좋아요 수 |
| 상세 보기 | 전체 내용, 댓글, 추천 명언 |

#### 4.8.2 Post Detail View
| Section | Content |
|---------|---------|
| 게시글 | 익명명, 내용, 이미지, 시간 |
| 추천 명언 | AI 생성 명언 |
| 댓글 | 작성자, 내용, 좋아요, 시간 |

---

### 4.9 Statistics (`/admin/statistics`)

**Purpose:** 고급 분석 대시보드

#### 4.9.1 KPI Summary
| Metric | Description |
|--------|-------------|
| 총 사용자 | 전체 등록 수 |
| 완료된 챌린지 | 성공적으로 완료된 수 |
| 커뮤니티 게시글 | 전체 게시글 수 |
| 평균 댓글 | 게시글당 평균 댓글 수 |

#### 4.9.2 Visualizations
| Chart | Type | Data |
|-------|------|------|
| 사용자 성장 | Line | 7일간 누적 가입자 |
| 기수 분포 | Pie | 기수별 사용자 비율 |
| 챌린지 진행 | Bar | 기수별 완료/진행/실패 |
| 일일 활동 | Bar | 7일간 게시글 수 |
| TOP 5 기여자 | List | 게시글 수 기준 순위 |
| 커뮤니티 참여 | Summary | 게시글, 댓글, 참여율 |

---

### 4.10 Admin Layout & Navigation

**Sidebar Navigation:**
| Menu Item | Route | Icon |
|-----------|-------|------|
| 대시보드 | `/admin/dashboard` | LayoutDashboard |
| 사용자 관리 | `/admin/users` | Users |
| 기수 관리 | `/admin/cohorts` | Calendar |
| 신청 관리 | `/admin/applications` | FileText |
| 설문 관리 | `/admin/surveys` | ClipboardList |
| 기록 관리 | `/admin/records` | BookOpen |
| 커뮤니티 | `/admin/community` | MessageSquare |
| 통계 | `/admin/statistics` | BarChart2 |

---

## 5. Data Model

### 5.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │────<│ user_cohorts│>────│   cohorts   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       │
       ▼                                       ▼
┌─────────────┐                         ┌─────────────┐
│ challenges  │                         │applications │
└─────────────┘                         └─────────────┘
       │                                       │
       │                                       │
       ▼                                       ▼
┌─────────────┐                         ┌─────────────────┐
│daily_records│                         │application_codes│
└─────────────┘                         └─────────────────┘

┌─────────────┐     ┌──────────────────┐
│   surveys   │     │ community_posts  │
└─────────────┘     └──────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │community_comments│
                    └──────────────────┘
```

### 5.2 Table Schemas

#### 5.2.1 users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  current_cohort_id UUID REFERENCES cohorts(id),
  is_admin BOOLEAN DEFAULT false,
  has_completed_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5.2.2 cohorts
```sql
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'recruiting', -- recruiting, active, completed
  record_type TEXT DEFAULT 'both', -- both, self_care_only, kindness_only
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5.2.3 user_cohorts
```sql
CREATE TABLE user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- active, completed, failed
  UNIQUE(user_id, cohort_id)
);
```

#### 5.2.4 challenges
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  completed_days INTEGER[] DEFAULT '{}',
  status TEXT DEFAULT 'waiting', -- waiting, approved, active, completed, failed
  applied_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, cohort_id)
);
```

#### 5.2.5 daily_records
```sql
CREATE TABLE daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 30),
  self_care_actions JSONB DEFAULT '[]',
  kindness_actions JSONB DEFAULT '[]',
  quote TEXT,
  image_url TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cohort_id, day)
);
```

#### 5.2.6 surveys
```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  survey_type TEXT NOT NULL, -- pre, post
  responses JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cohort_id, survey_type)
);
```

#### 5.2.7 applications
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  motivation TEXT,
  cohort_id UUID REFERENCES cohorts(id),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  code TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  code_used_at TIMESTAMPTZ
);
```

#### 5.2.8 application_codes
```sql
CREATE TABLE application_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ
);
```

#### 5.2.9 community_posts
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  room_id TEXT DEFAULT 'unified',
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  avatar TEXT,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  recommended_quote TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5.2.10 community_comments
```sql
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_system_quote BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5.3 Row Level Security (RLS) Policies

#### 5.3.1 Users Table
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### 5.3.2 Challenges Table
```sql
-- Users can only access their own challenges
CREATE POLICY "Users can access own challenges" ON challenges
  FOR ALL USING (auth.uid() = user_id);
```

#### 5.3.3 Community Posts
```sql
-- Users can read posts from their cohort
CREATE POLICY "Users can read cohort posts" ON community_posts
  FOR SELECT USING (
    cohort_id IN (
      SELECT cohort_id FROM user_cohorts
      WHERE user_id = auth.uid()
    )
  );

-- Admins can read all posts
CREATE POLICY "Admins can read all posts" ON community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### 5.3.4 Applications (Admin Only)
```sql
-- Only admins can view applications
CREATE POLICY "Only admins can view applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Anyone can submit applications
CREATE POLICY "Anyone can insert applications" ON applications
  FOR INSERT WITH CHECK (true);
```

---

## 6. API & Authentication

### 6.1 Authentication Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User Input  │────>│ Supabase Auth   │────>│ Session Token│
└──────────────┘     └─────────────────┘     └──────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ RLS Policies    │
                     │ Applied         │
                     └─────────────────┘
```

### 6.2 Auth Methods

| Method | Description |
|--------|-------------|
| `signUp()` | 이메일/비밀번호로 계정 생성 |
| `signInWithPassword()` | 이메일/비밀번호 로그인 |
| `signOut()` | 로그아웃 |
| `getUser()` | 현재 세션 사용자 조회 |
| `onAuthStateChange()` | 인증 상태 변경 리스너 |

### 6.3 RPC Functions

```sql
-- Atomic like increment for posts
CREATE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET likes = likes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. UI/UX Design System

### 7.1 Design Theme: Cloud-Based

**Concept:** 하늘과 구름에서 영감받은 부드럽고 평화로운 디자인

### 7.2 Color Palette

#### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| cloud.blue | #4A90E2 | Primary actions, links |
| cloud.sunshine | #FFD93D | Highlights, achievements |
| cloud.rose | #F2A6B8 | Accents, warmth |

#### Sky Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| cloud.sky.light | #E8F4FD | Light backgrounds |
| cloud.sky.main | #87CEEB | Main backgrounds |
| cloud.sky.deep | #5B9BD5 | Deep sky gradients |

#### Soft Pastels
| Name | Hex | Usage |
|------|-----|-------|
| cloud.soft.blue | #D4E6F7 | Card backgrounds |
| cloud.soft.mint | #C8E6E6 | Success states |
| cloud.soft.lavender | #E6D4F7 | Calm states |
| cloud.soft.rose | #F7D4E6 | Kindness actions |
| cloud.soft.cream | #FFF8E7 | Warm notifications |

#### Emotion Colors
| Emotion | Hex |
|---------|-----|
| happy | #FFD93D |
| calm | #87CEEB |
| anxious | #A8C8E8 |
| tired | #D8B4E2 |
| angry | #F4A8A8 |
| sad | #A8D8F0 |

### 7.3 Typography

| Level | Size | Weight |
|-------|------|--------|
| h1 | 2rem | 700 |
| h2 | 1.5rem | 600 |
| h3 | 1.25rem | 600 |
| body | 1rem | 400 |
| small | 0.875rem | 400 |
| caption | 0.75rem | 400 |

### 7.4 Components (shadcn/ui)

| Component | Usage |
|-----------|-------|
| Button | Primary CTAs, secondary actions |
| Card | Content containers |
| Dialog | Modals, confirmations |
| Input/Textarea | Form fields |
| Tabs | Navigation within pages |
| Progress | Progress bars |
| Avatar | User representations |
| Badge | Status indicators |
| Toast | Notifications |
| Select | Dropdowns |

### 7.5 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 768px | Primary target |
| Tablet | 768px - 1024px | Adaptive layout |
| Desktop | > 1024px | Full layout |

### 7.6 Navigation Patterns

#### Mobile (Bottom Nav)
| Icon | Label | Route |
|------|-------|-------|
| Home | 홈 | /home |
| Calendar | 기록 | /daily-record |
| Users | 커뮤니티 | /community |
| User | 프로필 | /profile |

#### Desktop (Header)
- 로고 + 네비게이션 메뉴
- 프로필 드롭다운

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 |
| Bundle Size | < 500KB (gzipped) |

### 8.2 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Supabase Auth with JWT |
| Authorization | Row Level Security |
| Data Encryption | SSL/TLS in transit |
| Password Policy | Min 6 characters |
| Session Management | Auto-refresh tokens |

### 8.3 Scalability

| Aspect | Approach |
|--------|----------|
| Database | PostgreSQL with indexes |
| CDN | Vercel Edge Network |
| Images | Supabase Storage with CDN |
| Code Splitting | Vite manual chunks |

### 8.4 Accessibility

| Standard | Requirement |
|----------|-------------|
| WCAG | 2.1 Level AA |
| Keyboard Navigation | Full support |
| Screen Reader | ARIA labels |
| Color Contrast | 4.5:1 minimum |

### 8.5 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 |
| Safari | Latest 2 |
| Firefox | Latest 2 |
| Edge | Latest 2 |
| Mobile Safari | iOS 14+ |
| Chrome Android | Latest |

---

## 9. Build & Deployment

### 9.1 Build Configuration

**Vite Chunk Splitting:**
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router': ['react-router-dom'],
  'ui-vendor': ['@radix-ui/*'],
  'animation-vendor': ['framer-motion'],
  'chart-vendor': ['recharts'],
  'utils-vendor': ['zustand', 'lucide-react', 'clsx']
}
```

### 9.2 Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase 프로젝트 URL |
| VITE_SUPABASE_ANON_KEY | Supabase 익명 키 |

### 9.3 Deployment

| Platform | Configuration |
|----------|---------------|
| Vercel | `vercel.json` |
| Build Command | `npm run build` |
| Output Directory | `dist/` |

---

## 10. Appendix

### 10.1 Survey Questions Detail

#### Flourishing Scale (8 Questions)
1. 나는 목적 있고 의미 있는 삶을 살고 있다
2. 내 사회적 관계는 지지적이고 보람 있다
3. 나는 일상 활동에 참여하고 관심을 갖는다
4. 나는 다른 사람들의 행복과 안녕에 적극적으로 기여한다
5. 나는 내게 중요한 활동에서 유능하고 능력 있다
6. 나는 좋은 사람이며 좋은 삶을 살고 있다
7. 나는 미래에 대해 낙관적이다
8. 사람들은 나를 존중한다

#### Life Satisfaction (5 Questions)
1. 대부분의 면에서 나의 삶은 이상적이다
2. 내 삶의 조건은 훌륭하다
3. 나는 내 삶에 만족한다
4. 지금까지 나는 삶에서 원하는 중요한 것들을 얻었다
5. 다시 살 수 있다면 거의 아무것도 바꾸지 않을 것이다

#### Self-Compassion (12 Questions)
- 자기 비판, 정서적 반추, 공통 인간성, 마음챙김, 자기 친절, 고립감 등 측정

#### Kindness Scale (9 Questions)
- 도움 주기, 기부, 길 안내, 자리 양보, 문 잡아주기 등 친절 행동 빈도 측정

### 10.2 Action Presets

#### Self-Care Presets (Korean)
```
식사하기, 산책하기, 명상하기, 운동하기,
충분히 자기, 취미 활동, 친구와 대화,
책 읽기, 음악 듣기, 휴식하기
```

#### Kindness Presets (Korean)
```
도움주기, 칭찬하기, 경청하기, 나누기,
위로하기, 문잡아주기, 양보하기,
감사 표현, 격려하기, 미소 짓기
```

### 10.3 Anonymous Name Generator

**Format:** `[형용사][명사][숫자]`

**Examples:**
- 따뜻한마음123
- 친절한별456
- 밝은햇살789

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-18 | Product Team | Initial PRD |

---

*End of Document*
