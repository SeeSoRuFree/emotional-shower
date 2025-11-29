-- ==========================================
-- 정서샤워 (Emotional Shower) Database Schema
-- ==========================================

-- ==========================================
-- Enum Types
-- ==========================================

CREATE TYPE cohort_status AS ENUM ('recruiting', 'active', 'completed');
CREATE TYPE record_type_enum AS ENUM ('both', 'self_care_only', 'kindness_only');
CREATE TYPE participation_status AS ENUM ('active', 'completed', 'failed');
CREATE TYPE challenge_status AS ENUM ('waiting', 'approved', 'active', 'completed', 'failed');
CREATE TYPE survey_type AS ENUM ('pre', 'post');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- ==========================================
-- 1. users 테이블 (Supabase Auth 확장)
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  current_cohort_id UUID,
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
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  status cohort_status DEFAULT 'recruiting',
  record_type record_type_enum DEFAULT 'both',
  max_participants INTEGER,
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
-- 3. user_cohorts 테이블 (사용자-기수 참여)
-- ==========================================
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

CREATE POLICY "Users can insert own cohort participation"
  ON user_cohorts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. challenges 테이블 (챌린지 진행)
-- ==========================================
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

CREATE POLICY "Users can insert own challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 5. daily_records 테이블 (일일 기록)
-- ==========================================
CREATE TABLE daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 30),
  self_care_actions JSONB DEFAULT '[]',
  kindness_actions JSONB DEFAULT '[]',
  quote TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
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
-- 6. surveys 테이블 (사전/사후 설문)
-- ==========================================
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

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
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

CREATE POLICY "Users can delete own comments"
  ON community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 9. applications 테이블 (신청서)
-- ==========================================
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
  TO anon, authenticated
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
-- Triggers
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

-- ==========================================
-- RPC Functions
-- ==========================================

-- Increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts
  SET likes = likes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment comment likes
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_comments
  SET likes = likes + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add foreign key constraint after cohorts table is created
ALTER TABLE users
  ADD CONSTRAINT fk_users_current_cohort
  FOREIGN KEY (current_cohort_id)
  REFERENCES cohorts(id)
  ON DELETE SET NULL;
