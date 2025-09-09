# 🌊 정서샤워 (Emotional Shower)

> 매일 하는 정서 위생, 나와 타인에게 친절한 일상

## 📱 프로젝트 소개

정서샤워는 **정서 위생(Emotional Hygiene)**을 일상 루틴처럼 실천하게 돕는 AI 기반 정서 셀프케어 모바일 웹 애플리케이션입니다. Headspace의 디자인 철학을 차용하여 부드럽고 친근한 UI/UX로 감정 관리를 재미있고 지속가능하게 만듭니다.

### ✨ 주요 특징

- **🎈 감정 체크인**: 하루 동안의 감정을 3가지 버튼으로 간단히 기록
- **💬 AI 5분톡**: 하루를 정리하는 짧고 의미있는 AI 대화
- **👥 공동 샤워방**: 익명으로 감정을 나누는 커뮤니티
- **📊 감정 히스토리**: 나의 감정 패턴 분석 및 시각화
- **🎮 게임화 요소**: 풍선 애니메이션으로 재미있는 감정 기록

## 🛠 기술 스택

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Headspace Design System
- **UI Components**: shadcn/ui (Radix UI)
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/emotional-shower.git
cd emotional-shower

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5175 접속
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📂 프로젝트 구조

```
src/
├── components/
│   ├── ui/           # shadcn/ui 컴포넌트
│   └── common/       # 공통 컴포넌트
│       └── BottomNav.tsx
├── pages/
│   ├── Home.tsx      # 홈 화면 (감정 체크인)
│   ├── Chat.tsx      # AI 5분톡
│   ├── Community.tsx # 커뮤니티
│   ├── History.tsx   # 감정 히스토리
│   └── Profile.tsx   # 프로필
├── store/
│   └── emotionStore.ts # Zustand 상태 관리
├── styles/
│   └── index.css     # 글로벌 스타일
└── App.tsx           # 라우팅 설정
```

## 🎨 디자인 시스템

### Headspace 컬러 팔레트

- **Primary Blue**: `#0061EF`
- **Warm Yellow**: `#FFCE00`
- **Soft Pink**: `#FFA1CC`
- **Background Beige**: `#F9F4F2`
- **Dark Gray**: `#2D2C2B`

### 감정 카테고리

1. **행복해요** 😊 - 긍정적인 감정들
2. **평온해요** 💙 - 차분하고 안정된 감정들
3. **도움이 필요해요** 💗 - 지원이 필요한 감정들

## 📱 주요 기능

### 1. 홈 화면
- 하단에 위치한 3개의 감정 버튼
- 기록된 감정이 풍선으로 상단에 누적
- 자연스러운 물리 애니메이션
- 5분톡 시작 버튼

### 2. AI 5분톡 (구현 완료)
- 5분 타이머 기능
- 실시간 대화 인터페이스
- 대화 종료 후 음악 추천

### 3. 커뮤니티 (개발 예정)
- 5개 테마방 (축하/감사/불안·걱정/시들시들/분노)
- 익명 게시글 작성
- AI 추천 글귀

### 4. 감정 히스토리 (개발 예정)
- 월간 감정 캘린더
- 감정 통계 차트
- 주간 리포트

## 🚧 개발 현황

### ✅ 완료된 기능
- [x] 프로젝트 초기 설정
- [x] Headspace 디자인 시스템 구현
- [x] 홈 화면 (감정 체크인)
- [x] 풍선 애니메이션 시스템
- [x] AI 5분톡 인터페이스
- [x] 하단 네비게이션

### 🔄 진행 중
- [ ] 커뮤니티 페이지
- [ ] 감정 히스토리
- [ ] 프로필 페이지

### 📋 예정 기능
- [ ] 온보딩 플로우
- [ ] PWA 설정
- [ ] 다크 모드
- [ ] 실제 AI API 연동

## 🤝 기여하기

이 프로젝트는 정서 건강 증진을 위한 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍💻 개발자

- **박병규** - 프로젝트 기획 및 개발

## 🙏 감사의 말

- Headspace의 아름다운 디자인 철학에서 영감을 받았습니다
- shadcn/ui의 훌륭한 컴포넌트 시스템을 활용했습니다

---

**"매일 감정을 샤워하듯 씻어내고, 나와 타인에게 친절한 하루를 만들어가세요"** 🌊