# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**정서샤워 (Emotional Shower)** is a mobile-first web application focused on emotional hygiene and a 30-day kindness challenge. It combines emotional check-ins, AI conversations, community features, and cohort-based participation tracking with full Supabase backend integration.

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

### Backend: Supabase

The app uses Supabase as the backend for authentication, database, and real-time features:

- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Environment variables**: Configured in `.env.local`
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

**Database Schema** (defined in `supabase/migrations/`):
- `users`: User profiles with name, email, current_cohort_id
- `cohorts`: Cohort information (start/end dates, capacity)
- `user_cohorts`: Many-to-many relationship tracking user participation in cohorts
- `challenges`: Per-user, per-cohort challenge progress
- `daily_records`: Daily kindness action records with JSONB arrays
- `surveys`: Pre/post survey responses
- `applications`: Challenge application requests
- `application_codes`: Admin-generated codes for application approval
- `community_posts`: Community posts with cohort/room filtering
- `community_comments`: Comments on community posts

### State Management (Zustand + Supabase)

The app uses Zustand for client-side state management, synchronized with Supabase:

- **authStore.ts**: User authentication and cohort participation. Calls Supabase Auth methods (`signUp`, `signInWithPassword`, `signOut`). Loads user profile and cohort history from `users` and `user_cohorts` tables.

- **challengeStore.ts**: Challenge progress per cohort. Manages challenge lifecycle: `waiting` → `approved` → `active` → `completed`/`failed`. Stores completed days (stamps) in `challenges` table. Current day calculated as: `completedDays.length + 1` (stamp-based, not calendar-based).

- **dailyRecordStore.ts**: Daily kindness actions with two types (self-care, kindness to others). Actions stored as JSONB arrays in `daily_records` table. Each record has `isCompleted` flag and optional `quote`.

- **cohortStore.ts**: Cohort metadata loaded from `cohorts` table. Admin functions for creating/managing cohorts.

- **communityStore.ts**: Community posts and comments. Loads from `community_posts` and `community_comments` tables with cohort filtering. Uses RPC functions for atomic like increments.

- **surveyStore.ts**: Pre/post survey responses stored in `surveys` table.

- **applicationStore.ts**: Challenge applications and admin code verification. Uses `applications` and `application_codes` tables.

- **adminAuthStore.ts**: Admin authentication state. Checks `is_admin` flag in `users` table.

- **onboardingStore.ts**: Tracks onboarding completion state.

**Key Pattern**: All stores call `supabase.auth.getUser()` to get current user, then perform authenticated queries with RLS automatically applied.

### Authentication & Cohort System

- Users sign up via Supabase Auth during registration (`authStore.signup()`)
- User profile created in `users` table with selected `current_cohort_id`
- Participation recorded in `user_cohorts` junction table
- Existing users can join new cohorts via `joinCohort()` in authStore
- Only one active cohort per user at a time (`currentCohortId`)
- Session managed by Supabase with auto-refresh tokens
- Auth state changes listened in `App.tsx` via `supabase.auth.onAuthStateChange()`

### Challenge Flow (30-Day Kindness Challenge)

#### Application → Signup Flow

**IMPORTANT**: Application and signup are completely separate processes:

1. **Application** (`/apply`):
   - User submits application form with name, email, phone, motivation
   - Data stored in `applications` table ONLY
   - **NO Supabase Auth user created at this stage**
   - Email can be reused later for signup without conflict
   - Status: `pending`

2. **Admin Approval** (`/admin/applications`):
   - Admin reviews application
   - Generates 6-character approval code
   - Email sent with code to applicant
   - Application status: `approved`

3. **Signup** (`/signup`):
   - User enters approval code
   - **Supabase Auth user created HERE** via `supabase.auth.signUp()`
   - User profile saved to `users` table with `phone_number`
   - User-cohort relationship saved to `user_cohorts` table
   - Phone number auto-filled from application (can be modified)
   - Challenge automatically created with status: `approved`

**Key Point**: Application email does NOT block later signup. Auth users are only created during signup, not application.

#### Challenge Progression

4. **Pre-Survey** (`/pre-survey`):
   - User completes DAY 1 설문 (34 questions)
   - Challenge status: `active`, `startedAt` recorded in `challenges` table
   - DAY 1 marked as completed in `completedDays` array

5. **Daily Records** (`/daily-record`):
   - User records daily kindness actions (DAY 2-30)
   - Current day = `completedDays.length + 1`
   - Each completion adds day number to `completedDays` array and updates `daily_records` table
   - Day numbers are 1-indexed (DAY 1-30)

6. **Post-Survey** (`/post-survey`):
   - Available only when DAY 30 reached
   - User completes final survey (same 34 questions)
   - Challenge status automatically set to `completed` or `failed` based on `completedDays.length >= 22`

7. **Report** (`/report`):
   - Accessible only when completed with ≥22 stamps
   - Shows before/after comparison and growth metrics

**Critical**: The challenge uses stamp-based progression, not calendar dates. Users progress at their own pace.

### Routing Structure

`App.tsx` defines the routing hierarchy:

- **Public routes**: `/intro`, `/signup`, `/login`, `/apply`
- **Protected routes** (require `isLoggedIn`): `/home`, `/onboarding`, `/daily-record`, `/pre-survey`, `/post-survey`, `/report`, `/community`, `/profile`
- **Admin routes**: `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/cohorts`, `/admin/applications`, `/admin/surveys`, `/admin/records`, `/admin/community`, `/admin/statistics`
- **Error pages**: `/unauthorized`, `/waiting`, `/not-found`
- First-time visitors start at `/intro` (splash → intro flow)
- Protected routes redirect to `/unauthorized` if not authenticated
- Admin routes require `isAdminLoggedIn` from `adminAuthStore`

### Community System

- **Cohort-based feed**: Shows unified feed from all 5 themed rooms for user's cohort
- **Room themes**: Celebration, Gratitude, Anxiety, Tiredness, Anger
- **Database storage**: Posts in `community_posts`, comments in `community_comments`
- **RLS filtering**: Automatically filters by `cohort_id` based on authenticated user
- **Quote recommendations**: AI-recommended quotes stored as `recommended_quote` field, appear as system comment
- **Statistics dashboard**: Virtual stats generated via `generateCohortStats()` utility
- **Anonymous posting**: Auto-generated anonymous usernames (e.g., "따뜻한마음123")

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
├── onboarding/      # Onboarding steps (Step0-6)
└── admin/           # Admin components (AdminLayout, etc.)
```

### Design System

**Cloud-Based Theme**: Clean, sky-inspired color palette defined in `tailwind.config.js`:

- Primary colors: `cloud.blue` (#4A90E2), `cloud.sunshine` (#FFD93D), `cloud.rose` (#F2A6B8)
- Sky backgrounds: `cloud.sky.light`, `cloud.sky.main`, `cloud.sky.deep`
- Soft pastels: `cloud.soft.blue`, `cloud.soft.mint`, `cloud.soft.lavender`, `cloud.soft.rose`, `cloud.soft.cream`
- Emotion colors: Comprehensive palette in `emotion.*` namespace (happy, calm, anxious, etc.)
- Backward compatible `headspace.*` colors

Use Tailwind utility classes. All shadcn/ui components are pre-configured with the cloud theme.

### Path Aliases

TypeScript path alias configured in `vite.config.ts` and `tsconfig.json`:
- `@/*` maps to `./src/*`
- Always use `@/` imports: `import { Button } from '@/components/ui/button'`

### Build Optimization

Vite config includes manual chunk splitting in `vite.config.ts`:
- `react-vendor`: React core libraries
- `router`: React Router DOM
- `ui-vendor`: All Radix UI components
- `animation-vendor`: Framer Motion
- `chart-vendor`: Recharts
- `utils-vendor`: Utility libraries (Zustand, lucide-react, clsx, etc.)

## Important Patterns

### Working with Supabase in Stores

```typescript
// Pattern: Get current user, then query with RLS
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id);
```

### Date Handling with Supabase

Supabase returns ISO strings for timestamps. Convert to Date objects when loading:

```typescript
const records = (data || []).map(row => ({
  ...row,
  createdAt: new Date(row.created_at),
  updatedAt: row.updated_at ? new Date(row.updated_at) : null
}));
```

### Challenge Day Calculation

Current day is **always** `completedDays.length + 1`, never based on calendar dates. This allows flexible pacing:

```typescript
calculateCurrentDay: (cohortId) => {
  const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
  if (!challenge || challenge.status !== 'active') return 0;
  return Math.min(challenge.completedDays.length + 1, 30);
}
```

### Community Posts with RLS

Posts are automatically filtered by cohort based on RLS policies:

```typescript
// Load all posts for user's cohort (RLS handles filtering)
const { data } = await supabase
  .from('community_posts')
  .select('*, community_comments(*)')
  .eq('cohort_id', cohortId)
  .order('created_at', { ascending: false });
```

### Atomic Updates with RPC

Use RPC functions for operations requiring atomicity:

```typescript
// Increment likes using stored procedure
await supabase.rpc('increment_post_likes', { post_id: postId });
```

## Supabase Migrations

Migrations located in `supabase/migrations/`:
- `001_initial_schema.sql`: Core tables and RLS policies
- `002_fix_cohorts_rls.sql`: Cohorts RLS adjustments
- `003_fix_users_insert_rls.sql`: Users insert policy fix
- `004_add_code_used_at.sql`: Application code tracking (adds `code_used_at` field)
- `005_add_applications_rls_and_code_used_at.sql`: Applications RLS policies
- `007_add_admin_role.sql`: Adds `is_admin` column to users table with admin-only RLS policies
- `008_fix_surveys_schema.sql`: Survey schema fixes
- `009_admin_community_rls.sql`: Admin access to community posts/comments

Apply migrations via Supabase CLI or dashboard.

**Migration History Context**: The codebase recently completed a full migration from localStorage to Supabase (completed Nov 30, 2025). All stores (challengeStore, dailyRecordStore, surveyStore, applicationStore, communityStore) now persist data in Supabase tables with proper RLS policies.

## Admin System

- **Admin authentication**: Uses Supabase Auth with `is_admin` column in `users` table
- **Admin dashboard**: `/admin/*` routes (dashboard, users, cohorts, applications, surveys, records, community, statistics)
- **Features**: User management, cohort management, application approval, survey data, daily records, community moderation, statistics
- **Code generation**: Automatic 6-character code generation for application approval
- **RLS policies**: Admin-only access to applications table enforced by `is_admin` flag
- **Admin setup**: After creating admin account, manually set `is_admin = true` in Supabase Dashboard

## Common Tasks

### Adding a new page

1. Create in `src/pages/`
2. Add route in `App.tsx` (protected or public)
3. Add navigation in `BottomNav.tsx` or `DesktopHeader.tsx` if needed

### Adding a new Supabase table

1. Create migration file in `supabase/migrations/`
2. Define table schema with RLS policies
3. Create corresponding TypeScript types in store
4. Add store methods for CRUD operations

### Modifying challenge logic

- Challenge progression: `challengeStore.ts` (Supabase `challenges` table)
- Stamp display: `StampBoard.tsx`
- Daily record submission: `DailyRecord.tsx` + `dailyRecordStore.ts` (Supabase `daily_records` table)

### Working with cohorts

- Cohort data: `cohortStore.ts` (Supabase `cohorts` table)
- User-cohort relationship: `authStore.ts` (Supabase `user_cohorts` table)
- Always filter community content by user's `currentCohortId`

## Deployment

- Production deployment on Vercel (config in `vercel.json`)
- Environment variables set in Vercel dashboard
- Build command: `npm run build`
- Output directory: `dist/`
