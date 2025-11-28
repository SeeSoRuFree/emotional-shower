# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**정서샤워 (Emotional Shower)** is a mobile-first web application focused on emotional hygiene and kindness challenge. It combines emotional check-ins, AI conversations, community features, and a 30-day kindness challenge with cohort-based participation tracking.

## Development Commands

```bash
# Development
npm run dev           # Start dev server at http://localhost:5175

# Building
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint on entire codebase
```

## Architecture Overview

### State Management (Zustand)

The app uses Zustand for all state management with localStorage persistence. Key stores:

- **authStore.ts**: User authentication and cohort participation tracking. Users can participate in multiple cohorts over time. Each user has `currentCohortId` and `cohortHistory` tracking all participations.

- **challengeStore.ts**: Challenge progress tracking per cohort. Manages challenge lifecycle: `waiting` → `approved` → `active` → `completed`/`failed`. Tracks completed days (stamps) and calculates current day based on stamp count, not calendar dates.

- **dailyRecordStore.ts**: Daily kindness action records with three action types (self, others, environment) and reflection notes.

- **cohortStore.ts**: Cohort information and management. Each cohort has start/end dates and participant lists.

- **communityStorage.ts**: Community posts and comments with cohort-based filtering. Posts include recommended quotes from the quote recommendation system.

All stores follow the pattern of loading from localStorage on init and saving on every update. Date fields are serialized/deserialized properly.

### Authentication & Cohort System

- Users sign up for a specific cohort during registration
- Existing users can join new cohorts via `joinCohort()` in authStore
- Only one active cohort per user at a time
- Cohort participation history is preserved for all users
- Test account: `test@test.com` / `test123` (pre-configured with cohort-1)

### Challenge Flow (30-Day Kindness Challenge)

1. **Application**: User applies via `/apply` → status: `waiting`
2. **Approval**: Admin approves via code verification → status: `approved`
3. **Pre-Survey**: User completes `/pre-survey` → status: `active`, `startedAt` recorded
4. **Daily Records**: User records daily kindness actions at `/daily-record`
   - Current day calculated as: `completedDays.length + 1`
   - Each completed day adds a stamp to `completedDays` array
   - Day numbers are 1-indexed (DAY 1-30)
5. **Post-Survey**: Available when DAY 30 is completed
6. **Report**: Accessible only when completed with ≥22 stamps

**Important**: The challenge uses stamp-based progression, not calendar dates. Users progress at their own pace.

### Routing Structure

App.tsx defines the routing hierarchy:

- **Public routes**: `/intro`, `/signup`, `/login`, `/apply`, `/admin`
- **Protected routes** (require `isLoggedIn`): `/home`, `/daily-record`, `/community`, `/profile`, etc.
- First-time visitors always start at `/intro`
- All protected routes redirect to `/login` if not authenticated

### Community System

- **Cohort-based feed**: Community page shows unified feed from all rooms for the user's cohort
- **Room-based storage**: Posts stored separately per room (`community_posts_{roomId}`)
- **Quote recommendations**: When posting, users get AI-recommended quotes that appear as first comment
- **Statistics dashboard**: Real-time cohort stats (total users, completion rates, perfect streaks, top rankings)
- **Anonymous posting**: All posts/comments use generated anonymous usernames

### Component Organization

```
src/components/
├── ui/              # shadcn/ui components (Button, Card, Dialog, etc.)
├── common/          # Shared components (BottomNav, DesktopHeader, ResponsiveNav)
├── challenge/       # Challenge-specific (StampBoard, ProgressBar)
├── daily/           # Daily record components (ActionListInput, MemoModal, QuoteCard)
├── emotion/         # Emotion tracking (EmotionButtons, EmotionSelector, EmotionTimeline)
├── cloud/           # Cloud animations (SkyBackground, CloudEffect, CloudEmotion)
├── chat/            # Chat features (VoiceRecorder, VoiceCallInterface)
├── community/       # Community features (PostDetail)
└── onboarding/      # Onboarding steps (Step0-6)
```

### Design System

**Cloud-Based Theme**: The app uses a clean, sky-inspired color palette defined in tailwind.config.js:

- Primary colors: `cloud.blue` (#4A90E2), `cloud.sunshine` (#FFD93D), `cloud.rose` (#F2A6B8)
- Sky backgrounds: `cloud.sky.light` through `cloud.sky.deep`
- Soft pastels: `cloud.soft.*` for gentle UI elements
- Emotion colors: Comprehensive palette in `emotion.*` namespace

Use Tailwind utility classes with the cloud/emotion color system. All UI components from shadcn/ui are pre-configured with the theme.

### Path Aliases

TypeScript path alias configured in vite.config.ts and tsconfig.json:
- `@/*` maps to `./src/*`
- Always use `@/` imports for cleaner imports: `import { Button } from '@/components/ui/button'`

### Build Optimization

Vite config includes manual chunk splitting for optimal loading:
- `react-vendor`: React core libraries
- `ui-vendor`: All Radix UI components
- `animation-vendor`: Framer Motion
- `chart-vendor`: Recharts
- `utils-vendor`: Utility libraries (Zustand, lucide-react, etc.)

## Important Patterns

### Working with Stores

```typescript
// Always get latest state inside actions using get()
const store = create((set, get) => ({
  action: () => {
    const { currentValue } = get(); // Get fresh state
    // Use currentValue for logic
  }
}));
```

### Date Handling

All stores serialize/deserialize dates properly. When loading from localStorage:
```typescript
const stored = JSON.parse(localStorage.getItem(key));
return stored.map(item => ({
  ...item,
  dateField: item.dateField ? new Date(item.dateField) : null
}));
```

### Challenge Day Calculation

Current day is **always** `completedDays.length + 1`, never based on calendar dates. This allows flexible pacing.

### Community Posts

- Use `loadAllPosts()` for unified cohort feed (combines all rooms)
- Use `loadPosts(roomId)` for specific room view
- Filter by `cohortId` to show only relevant posts for user's cohort
- Time formatting is handled automatically by `formatTimeAgo()`

## Testing Accounts & Data

- Default test user created on first run: `test@test.com` / `test123` in cohort-1
- Test cohort-1 created with active challenge
- LocalStorage keys: `kindness-users`, `kindness-auth`, `kindness-daily-records`, `kindness-surveys`, `community_posts_*`

## Common Tasks

**Adding a new page**:
1. Create in `src/pages/`
2. Add route in `App.tsx` (protected or public)
3. Add navigation in `BottomNav.tsx` or `DesktopHeader.tsx` if needed

**Adding a new store**:
1. Create in `src/store/` with Zustand
2. Include localStorage persistence pattern
3. Handle date serialization if using dates
4. Export store hook and types

**Modifying challenge logic**:
- Challenge progression logic is in `challengeStore.ts`
- Stamp display is in `StampBoard.tsx`
- Daily record submission is in `DailyRecord.tsx` and `dailyRecordStore.ts`

**Working with cohorts**:
- Cohort data in `cohortStore.ts`
- User-cohort relationship in `authStore.ts`
- Always filter community content by user's `currentCohortId`
